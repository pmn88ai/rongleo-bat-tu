'use strict';

const { withHandler, parseIntParam } = require('./_helpers');
const baziService = require('../lib/services/bazi.service');

module.exports = withHandler(async function(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { person1, person2, relationship } = req.body;

    if (!person1 || !person2) {
        return res.status(400).json({ error: 'Missing person1 or person2 data' });
    }
    if (!person1.year || !person1.month || !person1.day) {
        return res.status(400).json({ error: 'Missing required fields for person1' });
    }
    if (!person2.year || !person2.month || !person2.day) {
        return res.status(400).json({ error: 'Missing required fields for person2' });
    }

    const p1 = {
        year:   parseIntParam(person1.year),
        month:  parseIntParam(person1.month),
        day:    parseIntParam(person1.day),
        hour:   parseIntParam(person1.hour, 12),
        minute: parseIntParam(person1.minute, 0),
        gender: person1.gender || 'Nam',
        name:   person1.name   || 'Người 1'
    };

    const p2 = {
        year:   parseIntParam(person2.year),
        month:  parseIntParam(person2.month),
        day:    parseIntParam(person2.day),
        hour:   parseIntParam(person2.hour, 12),
        minute: parseIntParam(person2.minute, 0),
        gender: person2.gender || 'Nữ',
        name:   person2.name   || 'Người 2'
    };

    const result = await baziService.match(p1, p2, relationship || 'romance');

    return res.status(200).json(result);
});
