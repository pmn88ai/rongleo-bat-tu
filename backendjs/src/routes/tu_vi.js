const express = require('express');
const router = express.Router();
const { lapLaSo } = require('../bazi/tu_vi');

/**
 * GET /api/tu-vi
 * Query: ngay_am=1..30, thang_am=1..12, gio_chi=Tý..Hợi, can_nam=Giáp..Quý,
 *        gioi_tinh=Nam|Nữ (nhận nhưng không dùng — giống script Python gốc).
 *
 * Chỉ an sao (Mệnh/Thân, Cục, 14 chính tinh, Tứ Hóa), không luận giải.
 * Không lưu hồ sơ. Không ghi database. Không gọi dịch vụ ngoài.
 */
router.get('/tu-vi', (req, res) => {
    try {
        const { ngay_am, thang_am, gio_chi, can_nam, gioi_tinh } = req.query;
        if (ngay_am === undefined || thang_am === undefined || !gio_chi || !can_nam) {
            return res.status(400).json({
                error: 'Thiếu dữ liệu: cần ngay_am, thang_am, gio_chi, can_nam'
            });
        }
        const result = lapLaSo({ ngay_am, thang_am, gio_chi, can_nam, gioi_tinh });
        res.json(result);
    } catch (error) {
        if (error.code === 'INVALID_INPUT') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
