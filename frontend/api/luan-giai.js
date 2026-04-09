'use strict';

const { withHandler, parseIntParam } = require('./_helpers');
const baziService = require('../lib/services/bazi.service');

module.exports = withHandler(async function(req, res) {
    const q = req.query;

    if (!q.year || !q.month || !q.day) {
        return res.status(400).json({ error: 'Missing required parameters: year, month, day' });
    }

    const result = await baziService.getLuanGiai({
        year:     parseIntParam(q.year),
        month:    parseIntParam(q.month),
        day:      parseIntParam(q.day),
        hour:     parseIntParam(q.hour, 12),
        minute:   parseIntParam(q.minute, 0),
        gender:   q.gender   || 'Nam',
        calendar: q.calendar || 'solar'
    });

    return res.status(200).json(result);
});
