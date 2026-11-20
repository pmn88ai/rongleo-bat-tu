/**
 * Auth Routes
 * Dùng lại hạ tầng đã có: bảng users (database.service), jsonwebtoken.
 * Hỗ trợ cả JWT (người đã đăng nhập) và x-user-id (khách anonymous) để
 * không làm hỏng các route cũ.
 */

const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dbService = require('../services/database.service');

const JWT_SECRET = process.env.JWT_SECRET || 'rongleo-dev-secret-change-me';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '30d';

// CAPTCHA đơn giản, lưu trong bộ nhớ (đủ dùng cho form đăng ký)
const captchas = new Map();
const CAPTCHA_TTL = 10 * 60 * 1000;

const hashPassword = (password) =>
    crypto.createHash('sha256').update(String(password)).digest('hex');

const signToken = (user) =>
    jwt.sign(
        { id: user.id, email: user.email, is_admin: !!user.is_admin },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );

const serializeUser = (row) => {
    if (!row) return null;
    let baziData = null;
    try {
        baziData = row.bazi_data ? JSON.parse(row.bazi_data) : null;
    } catch (e) {
        baziData = null;
    }
    return {
        id: row.id,
        email: row.email,
        name: row.name || '',
        credits: row.credits,
        is_admin: !!row.is_admin,
        bazi_data: baziData
    };
};

const getJwtPayload = (req) => {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return null;
    try {
        return jwt.verify(header.slice(7), JWT_SECRET);
    } catch (e) {
        return null;
    }
};

// Middleware: ưu tiên JWT, fallback x-user-id cho khách
const authMiddleware = (req, res, next) => {
    const payload = getJwtPayload(req);
    if (payload) {
        req.user = {
            id: payload.id,
            email: payload.email,
            role: payload.is_admin ? 'admin' : 'user'
        };
    } else {
        req.user = {
            id: req.headers['x-user-id'] || 'anonymous',
            role: 'user'
        };
    }
    next();
};

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') return next();
    return res.status(403).json({ error: 'Admin access required' });
};

const resolveDbUserId = async (req) => {
    const payload = getJwtPayload(req);
    if (payload && payload.id) return payload.id;

    const rawId = req.headers['x-user-id'];
    const numericId = parseInt(rawId, 10);
    if (!Number.isNaN(numericId)) {
        const user = await dbService.getUserById(numericId);
        if (user) return numericId;
    }
    return null;
};

// GET /api/auth/captcha
router.get('/captcha', (req, res) => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const token = crypto.randomBytes(16).toString('hex');
    captchas.set(token, { answer: a + b, expires: Date.now() + CAPTCHA_TTL });
    res.json({ token, question: `${a} + ${b} = ?` });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name = '', captchaToken, captchaAnswer } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
        }
        if (String(password).length < 6) {
            return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        const captcha = captchas.get(captchaToken);
        if (!captcha || captcha.expires < Date.now()) {
            return res.status(400).json({ error: 'Mã xác thực đã hết hạn, vui lòng lấy lại' });
        }
        if (parseInt(captchaAnswer, 10) !== captcha.answer) {
            return res.status(400).json({ error: 'Đáp án xác thực không đúng' });
        }
        captchas.delete(captchaToken);

        const normalizedEmail = String(email).toLowerCase().trim();
        const userId = await dbService.createUser(
            normalizedEmail,
            hashPassword(password),
            String(name || '').trim()
        );

        const row = await dbService.getUserById(userId);
        const user = serializeUser(row);
        res.json({ token: signToken(user), user });
    } catch (err) {
        res.status(400).json({ error: err.message || 'Không thể đăng ký' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const row = await dbService.getUserByEmail(normalizedEmail);

        if (!row || row.password_hash !== hashPassword(password)) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        await dbService.updateLastLogin(row.id);
        const user = serializeUser(row);
        res.json({ token: signToken(user), user });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Không thể đăng nhập' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.json({ message: 'OK' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const dbUserId = await resolveDbUserId(req);
        if (dbUserId) {
            const row = await dbService.getUserById(dbUserId);
            if (row) return res.json({ user: serializeUser(row) });
        }
        res.json({
            user: {
                id: req.user.id,
                name: 'Mệnh chủ',
                credits: 9999,
                is_admin: false,
                bazi_data: null
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Không thể tải hồ sơ' });
    }
});

// POST /api/auth/profile
router.post('/profile', authMiddleware, async (req, res) => {
    try {
        const dbUserId = await resolveDbUserId(req);
        if (!dbUserId) {
            return res.status(401).json({ error: 'Bạn cần đăng nhập để lưu hồ sơ' });
        }

        const { name, baziData } = req.body || {};
        if (name !== undefined) {
            await dbService.updateUserProfile(dbUserId, { name });
        }
        if (baziData) {
            await dbService.updateUserBaziData(dbUserId, baziData);
        }

        const row = await dbService.getUserById(dbUserId);
        res.json({ message: 'OK', user: serializeUser(row) });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Không thể lưu hồ sơ' });
    }
});

// Các route cũ giữ lại để không break frontend
router.post('/request-credits', (req, res) => res.json({ message: 'No credit system in no-auth mode' }));
router.get('/pending-request', (req, res) => res.json({ hasPending: false }));
router.get('/suggestions', authMiddleware, (req, res) => res.json({ suggestions: [] }));

// Export middleware cho các route khác import
router.authMiddleware = authMiddleware;
router.adminMiddleware = adminMiddleware;

module.exports = router;
