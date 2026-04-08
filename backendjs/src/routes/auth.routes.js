/**
 * Auth Routes - NO-AUTH MODE
 * Toàn bộ login/register/captcha/credits đã bị vô hiệu hóa.
 * authMiddleware và adminMiddleware được export để các route khác dùng,
 * nhưng chúng chỉ bypass với user mặc định từ x-user-id header.
 */

const express = require('express');
const router = express.Router();

// Middleware bypass - đọc x-user-id từ header
const authMiddleware = (req, res, next) => {
    req.user = {
        id: req.headers['x-user-id'] || 'anonymous',
        role: 'user'
    };
    next();
};

const adminMiddleware = (req, res, next) => {
    return res.status(403).json({ error: 'Admin access disabled in no-auth mode' });
};

// GET /api/auth/me - trả về user mặc định dựa vào x-user-id
router.get('/me', authMiddleware, (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            name: 'Mệnh chủ',
            credits: 9999,
            is_admin: false
        }
    });
});

// Tất cả routes auth cũ đều trả 200 để không break frontend cũ (nếu còn gọi)
router.post('/login', (req, res) => res.json({ message: 'No-auth mode: login disabled', token: null }));
router.post('/register', (req, res) => res.json({ message: 'No-auth mode: register disabled', token: null }));
router.post('/logout', (req, res) => res.json({ message: 'OK' }));
router.get('/captcha', (req, res) => res.json({ token: 'noop', question: '0 + 0 = ?' }));
router.post('/request-credits', (req, res) => res.json({ message: 'No credit system in no-auth mode' }));
router.get('/pending-request', (req, res) => res.json({ hasPending: false }));
router.get('/suggestions', authMiddleware, (req, res) => res.json({ suggestions: [] }));
router.post('/profile', authMiddleware, (req, res) => res.json({ message: 'OK' }));

// Export middleware cho các route khác import
router.authMiddleware = authMiddleware;
router.adminMiddleware = adminMiddleware;

module.exports = router;
