'use strict';

const { withHandler } = require('../_helpers');
const { buildPeriodQue } = require('./_period');

// GET /api/que/yearly?year=...&month=...&day=...&topic=...
module.exports = withHandler(async function(req, res) {
    const result = buildPeriodQue(req.query || {}, 'yearly');
    return res.status(result.status).json(result.body);
});
