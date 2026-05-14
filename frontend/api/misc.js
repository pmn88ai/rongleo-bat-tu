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

    // Transform raw result into sections[] expected by PersonalizedDate.jsx
    const typeLabel = result.type === 'day' ? 'Ngày' : result.type === 'month' ? 'Tháng' : 'Năm';
    const icon      = result.type === 'day' ? '📅'  : result.type === 'month' ? '🗓️'  : '📆';

    // evaluations values may be { status, desc } objects — flatten to string
    const fmtEval = (v) => {
        if (!v) return null;
        if (typeof v === 'string') return v;
        if (v.status && v.desc) return `${v.status} — ${v.desc}`;
        return JSON.stringify(v);
    };

    const evalLines = [];
    const ev = result.evaluations || {};
    if (fmtEval(ev.career))  evalLines.push(`**Sự nghiệp**: ${fmtEval(ev.career)}`);
    if (fmtEval(ev.wealth))  evalLines.push(`**Tài lộc**: ${fmtEval(ev.wealth)}`);
    if (fmtEval(ev.love))    evalLines.push(`**Tình cảm**: ${fmtEval(ev.love)}`);
    if (fmtEval(ev.health))  evalLines.push(`**Sức khỏe**: ${fmtEval(ev.health)}`);
    if (result.interpretation) evalLines.push(`Luận giải tổng quan: ${result.interpretation}`);

    const sections = [
        {
            icon,
            title: `Phân Tích ${typeLabel} — ${result.ganzhiVN || ''} (${result.shishen || ''})`,
            content: evalLines
        }
    ];

    if (Array.isArray(result.relationships) && result.relationships.length > 0) {
        sections.push({ icon: '🔗', title: 'Tương Tác Can Chi', content: result.relationships });
    }

    const stars = result.special_stars || {};
    const starLines = Object.entries(stars)
        .filter(([, v]) => v)
        .map(([k, v]) => `**${k}**: ${v}`);
    if (starLines.length > 0) {
        sections.push({ icon: '⭐', title: 'Thần Sát Ngày', content: starLines });
    }

    return res.status(200).json({ sections });
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
