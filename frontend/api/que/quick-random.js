'use strict';

const { withHandler } = require('../_helpers');
const { HEXAGRAMS } = require('../../lib/bazi/que_data/gua_64');
const { INTERPRETATIONS } = require('../../lib/bazi/que_data/interpretations');

// Map topic string → key trong interpretation.aspects
const TOPIC_MAP = {
    love:   { key: 'love',    label: 'Tình Duyên' },
    wealth: { key: 'finance', label: 'Tài Lộc' },
    safety: { key: 'safety',  label: 'Tai Tinh & Bình An' }
};

// GET /api/que/quick-random?topic=love|wealth|safety
module.exports = withHandler(async function(req, res) {
    const topicParam = req.query.topic || '';
    const topicInfo  = TOPIC_MAP[topicParam] || { key: 'career', label: 'Tổng Quan' };

    // Random quẻ 1-64
    const hexId = Math.floor(Math.random() * 64) + 1;

    const hexInfo      = HEXAGRAMS[hexId];
    const interpretation = INTERPRETATIONS[hexId];

    if (!hexInfo || !interpretation) {
        return res.status(500).json({ error: 'Failed to generate hexagram' });
    }

    const rawInterpretation =
        (interpretation.aspects && interpretation.aspects[topicInfo.key]) ||
        interpretation.overview ||
        '';

    return res.status(200).json({
        id:             hexId,
        name:           hexInfo.name,
        symbol:         hexInfo.symbol,
        meaning:        hexInfo.meaning,
        quality:        hexInfo.quality,
        topic:          topicInfo.label,
        overview:       interpretation.overview,
        interpretation: rawInterpretation,
        advice:         interpretation.advice || [],
        disclaimer:     'Kết quả gieo quẻ ngẫu nhiên mang tính chất tham khảo.'
    });
});
