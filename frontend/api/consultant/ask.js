'use strict';

const { withHandler, parseIntParam } = require('../_helpers');
const BaZiCalculator = require('../../lib/bazi/calculator');
const { formatOutput } = require('../../lib/bazi/output');
const { calculateDaiVan } = require('../../lib/bazi/dayun');
const { solveQuestion } = require('../../lib/bazi/questions/engine');
const { QUESTIONS } = require('../../lib/bazi/questions/data');
const groqService = require('../../lib/services/groq.service');

module.exports = withHandler(async function(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body;
    const { year, month, day, hour, minute, gender, calendar, questionId, questionText, useAI, persona } = body;

    if (!year || !month || !day || !questionId) {
        return res.status(400).json({ error: 'Missing required parameters: year, month, day, questionId' });
    }

    const g = (gender || '').toLowerCase();
    const isFemale = g === 'nữ' || g === 'nu' || g === 'female';

    const calc = new BaZiCalculator({
        year:     parseIntParam(year),
        month:    parseIntParam(month),
        day:      parseIntParam(day),
        hour:     parseIntParam(hour, 12),
        minute:   parseIntParam(minute, 0),
        isFemale: isFemale,
        isSolar:  (calendar || 'solar').toLowerCase() === 'solar'
    });
    const ctx = calc.calculate();

    let finalQuestionText = questionText || questionId;
    let themeId = null;

    if (!questionText || questionText === questionId) {
        for (const tid of Object.keys(QUESTIONS)) {
            const found = QUESTIONS[tid].find(function(q) {
                return q.id === questionId || q.logic === questionId || q.text === questionId;
            });
            if (found) {
                finalQuestionText = found.text;
                themeId = tid;
                break;
            }
        }
    }

    let answer, followUps;

    if (useAI) {
        const fullOutput = formatOutput(ctx);
        const daiVanData = calculateDaiVan(ctx);
        const baziContext = {
            thong_tin_co_ban: fullOutput.thong_tin_co_ban,
            chi_tiet_tru:     fullOutput.chi_tiet_tru,
            phan_tich:        fullOutput.phan_tich
        };
        const aiResult = await groqService.generateAnswer(
            baziContext,
            { dai_van: daiVanData },
            finalQuestionText,
            persona || 'huyen_co',
            null
        );
        answer    = aiResult.answer;
        followUps = aiResult.followUps;
    } else {
        const paragraphs = await solveQuestion(ctx, questionId);
        answer    = paragraphs;
        followUps = [];
    }

    return res.status(200).json({
        questionId:   questionId,
        questionText: finalQuestionText,
        themeId:      themeId,
        answer:       answer,
        followUps:    followUps,
        useAI:        !!useAI,
        persona:      persona || 'huyen_co',
        timestamp:    new Date().toISOString()
    });
});
