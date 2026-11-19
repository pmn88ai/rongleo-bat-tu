const express = require('express');
const router = express.Router();
const { computeVanHomNay } = require('../bazi/van_hom_nay');

/**
 * GET /api/van-hom-nay
 * Query: ngay_sinh=YYYY-MM-DD (bắt buộc), gio_sinh=0..23 (tùy chọn), gioi_tinh=Nam|Nữ
 *
 * Không lưu hồ sơ. Không ghi database. Không gọi dịch vụ ngoài.
 */
router.get('/van-hom-nay', (req, res) => {
    try {
        const { ngay_sinh, gio_sinh, gioi_tinh } = req.query;
        if (!ngay_sinh) {
            return res.status(400).json({ error: 'Thiếu ngày sinh: ngay_sinh=YYYY-MM-DD' });
        }
        const result = computeVanHomNay({ ngay_sinh, gio_sinh, gioi_tinh });
        res.json(result);
    } catch (error) {
        if (error.code === 'INVALID_DATE') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
