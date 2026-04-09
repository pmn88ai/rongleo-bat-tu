'use strict';

const { withHandler, parseIntParam } = require('./_helpers');
const baziService = require('../lib/services/bazi.service');

// ── Shared param parser ────────────────────────────────────────────────────────

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

async function handleAnalyze(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.analyzeComplete(
        Object.assign(parseBirthParams(q), { name: q.name || '' })
    );
    return res.status(200).json(result);
}

async function handleChart(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.getBasicChart(parseBirthParams(q));
    return res.status(200).json(result);
}

async function handleElements(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.getElements(parseBirthParams(q));
    return res.status(200).json(result);
}

// /api/scores is an alias for elements
async function handleScores(req, res) {
    return handleElements(req, res);
}

async function handlePillars(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.getPillars(parseBirthParams(q));
    return res.status(200).json(result);
}

async function handleAnalysis(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.getAnalysis(parseBirthParams(q));
    return res.status(200).json(result);
}

async function handleAdvanced(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.getAdvanced(parseBirthParams(q));
    return res.status(200).json(result);
}

async function handleBasicInfo(req, res) {
    const q = req.query;
    if (!requireBirthParams(q, res)) return;
    const result = await baziService.getBasicInfo(parseBirthParams(q));
    return res.status(200).json(result);
}

// ── Router ─────────────────────────────────────────────────────────────────────

module.exports = withHandler(async function(req, res) {
    const url  = new URL(req.url, 'http://' + req.headers.host);
    const path = url.pathname;

    if (path === '/api/analyze')    return handleAnalyze(req, res);
    if (path === '/api/chart')      return handleChart(req, res);
    if (path === '/api/elements')   return handleElements(req, res);
    if (path === '/api/scores')     return handleScores(req, res);
    if (path === '/api/pillars')    return handlePillars(req, res);
    if (path === '/api/analysis')   return handleAnalysis(req, res);
    if (path === '/api/advanced')   return handleAdvanced(req, res);
    if (path === '/api/basic-info') return handleBasicInfo(req, res);

    return res.status(404).json({ error: 'Not found' });
});
