'use strict';

/**
 * GET /api/than-so-hoc — bản serverless (Vercel) của route
 * backendjs/src/routes/bazi.routes.js (GET /api/than-so-hoc).
 *
 * Dùng engine trong frontend/lib/bazi (đồng bộ từ backendjs), không require
 * từ backendjs. Không kiểm Linh Thạch/credit.
 *
 * Params: name, year, month, day, current_year (tuỳ chọn).
 * Trả về: bộ số Pythagore + mô tả ý nghĩa từng số.
 */

const { withHandler } = require('./_helpers');
const { computeNumerology } = require('../lib/bazi/than_so');
const { describeNumbers } = require('../lib/bazi/than_so_meaning');

module.exports = withHandler(async function(req, res) {
    const { name, year, month, day, current_year } = req.query || {};

    try {
        if (!name || !String(name).trim()) {
            return res.status(400).json({ error: 'Thiếu họ tên để tính thần số học' });
        }
        if (!year || !month || !day) {
            return res.status(400).json({ error: 'Thiếu ngày, tháng, năm sinh' });
        }

        const numerology = computeNumerology({
            name: String(name),
            day: parseInt(day),
            month: parseInt(month),
            year: parseInt(year),
            currentYear: current_year ? parseInt(current_year) : new Date().getFullYear()
        });

        return res.status(200).json({
            ...numerology,
            cac_so: describeNumbers(numerology.cac_so)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
