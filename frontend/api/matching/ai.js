'use strict';

const { withHandler, parseIntParam } = require('../_helpers');
const baziService = require('../../lib/services/bazi.service');
const groqService = require('../../lib/services/groq.service');
const BaZiCalculator = require('../../lib/bazi/calculator');

function buildCtx(person) {
    const g = (person.gender || '').toLowerCase();
    const isFemale = g === 'nữ' || g === 'nu' || g === 'female';
    const calc = new BaZiCalculator({
        year:     parseIntParam(person.year),
        month:    parseIntParam(person.month),
        day:      parseIntParam(person.day),
        hour:     parseIntParam(person.hour, 12),
        minute:   parseIntParam(person.minute, 0),
        isFemale: isFemale,
        isSolar:  true
    });
    const ctx = calc.calculate();
    const { calculateDaiVan } = require('../../lib/bazi/dayun');
    ctx.dai_van = calculateDaiVan(ctx);
    return ctx;
}

module.exports = withHandler(async function(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { person1, person2, relationship, persona } = req.body;

    if (!person1 || !person2) {
        return res.status(400).json({ error: 'Missing person1 or person2 data' });
    }
    if (!person1.year || !person1.month || !person1.day) {
        return res.status(400).json({ error: 'Missing required fields for person1' });
    }
    if (!person2.year || !person2.month || !person2.day) {
        return res.status(400).json({ error: 'Missing required fields for person2' });
    }

    const ctx1 = buildCtx(person1);
    const ctx2 = buildCtx(person2);

    const result = await groqService.generateMatchingAnswer(
        ctx1,
        ctx2,
        relationship || 'romance',
        persona      || 'huyen_co'
    );

    return res.status(200).json(Object.assign({}, result, {
        person1: Object.assign({}, person1, { chart: baziService.mapToChart(ctx1) }),
        person2: Object.assign({}, person2, { chart: baziService.mapToChart(ctx2) })
    }));
});
