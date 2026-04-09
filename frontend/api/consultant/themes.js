'use strict';

const { withHandler } = require('../_helpers');
const { THEMES } = require('../../lib/bazi/questions/data');

module.exports = withHandler(async function(req, res) {
    return res.status(200).json(THEMES);
});
