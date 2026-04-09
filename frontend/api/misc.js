'use strict';

const { withHandler, parseIntParam } = require('./_helpers');
const baziService = require('../lib/services/bazi.service');

// ── Shared helpers ─────────────────────────────────────────────────────────────

function parseBirthParams(q) {
    return {
        year:     parseIntParam(q.year),
        month:    parseIntParam(q.month),
        day:      parseIntParam(q.day),
        hour:     parseIntParam(q.hour, 12),
        minute:   parseIntParam(q.minute, 0),
        gender:   q.gender   || 'Nam',
        calendar: q.calendar || 'solar'
    };
}

function requireBirthParams(q, res) {
    if (!q.year || !q.month || !q.day) {
        res.status(400).json({ error: 'Missing required parameters: year, month, day' });
        return false;
    }
    return true;
}

// ── Handlers ───────────────────────────────────────────────────────────────────

async function handleStars(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.getStars(parseBirthParams(q));
    return res.status(200).json(result);
}

async function handleLuckCycles(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.getLuckCycles(parseBirthParams(q));
    return res.status(200).json(result);
}

async function handleYearAnalysis(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.getYearAnalysis(
        Object.assign(parseBirthParams(q), {
            targetYear: parseIntParam(q.targetYear, new Date().getFullYear())
        })
    );
    return res.status(200).json(result);
}

async function handleAnalyzeTime(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.analyzeTimeStatus(
        Object.assign(parseBirthParams(q), {
            targetYear:  parseIntParam(q.targetYear  || q.target_year),
            targetMonth: parseIntParam(q.targetMonth || q.target_month, null),
            targetDay:   parseIntParam(q.targetDay   || q.target_day,   null)
        })
    );
    return res.status(200).json(result);
}

async function handleSelectDates(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.getAuspiciousDates(
        Object.assign(parseBirthParams(q), {
            targetYear:  parseIntParam(q.targetYear  || q.target_year),
            targetMonth: parseIntParam(q.targetMonth || q.target_month),
            activity:    q.activity || 'general'
        })
    );
    return res.status(200).json(result);
}

async function handleClassicTexts(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.getClassicTexts(parseBirthParams(q));
    return res.status(200).json(result);
}

async function handleLuanGiai(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.getLuanGiai(parseBirthParams(q));
    return res.status(200).json(result);
}

// /api/dayun is an alias for luck-cycles
async function handleDayun(req, res) {
    return handleLuckCycles(req, res);
}

async function handleAuthMe(req, res) {
    return res.status(200).json({
        user: {
            id:       'local-user',
            name:     'Mệnh chủ',
            credits:  9999,
            is_admin: false
        }
    });
}

// ── Router ─────────────────────────────────────────────────────────────────────

module.exports = withHandler(async function(req, res) {
    const url  = new URL(req.url, 'http://' + req.headers.host);
    const path = url.pathname;

    if (path === '/api/stars')         return handleStars(req, res);
    if (path === '/api/luck-cycles')   return handleLuckCycles(req, res);
    if (path === '/api/year-analysis') return handleYearAnalysis(req, res);
    if (path === '/api/analyze-time')  return handleAnalyzeTime(req, res);
    if (path === '/api/select-dates')  return handleSelectDates(req, res);
    if (path === '/api/classic-texts') return handleClassicTexts(req, res);
    if (path === '/api/luan-giai')     return handleLuanGiai(req, res);
    if (path === '/api/dayun')         return handleDayun(req, res);
    if (path === '/api/auth/me')       return handleAuthMe(req, res);

    return res.status(404).json({ error: 'Not found' });
});
