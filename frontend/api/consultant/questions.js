'use strict';

const { withHandler } = require('../_helpers');
const { QUESTIONS } = require('../../lib/bazi/questions/data');

// GET /api/consultant/questions?themeId=xxx
// Chấp nhận cả ?themeId= và ?theme_id= (anti-bug shield)
module.exports = withHandler(async function(req, res) {
    const themeId = req.query.themeId || req.query.theme_id || '';

    const questions = QUESTIONS[themeId] || [];

    return res.status(200).json(questions);
});
