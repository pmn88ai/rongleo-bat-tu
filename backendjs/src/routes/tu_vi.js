const express = require('express');
const router = express.Router();
const {
    lapLaSo,
    lapLaSoTuDuongLich,
    lapLaSoTuAmTrungHoa,
    lapLaSoTuAmViet
} = require('../bazi/tu_vi');

function truthy(value) {
    if (value === undefined || value === null) return false;
    return value === true || value === 'true' || value === '1' || value === 1;
}

function parseSolarDate(value) {
    if (typeof value !== 'string') return null;
    const match = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!match) return null;
    return { nam: Number(match[1]), thang: Number(match[2]), ngay: Number(match[3]) };
}

/**
 * GET /api/tu-vi
 *
 * Các đường nhập:
 *  1. Ngày âm Trung Hoa đầy đủ (có nam_am):
 *     nam_am=2023, thang_am=2, ngay_am=10, thang_nhuan=true,
 *     gio=14:30 (hoặc gio=14&phut=30), gioi_tinh=Nam|Nữ
 *  2. Ngày âm Việt Nam (có lich=viet):
 *     nam_am=2006, thang_am=6, ngay_am=10, thang_nhuan=false,
 *     gio=09:00, gioi_tinh=Nam|Nữ
 *  3. Ngày dương lịch (có duong_lich=YYYY-MM-DD):
 *     duong_lich=1990-05-15, gio=23:00, gioi_tinh=Nam|Nữ
 *  4. Đường cũ (không có nam_am/duong_lich):
 *     ngay_am=21, thang_am=2, gio_chi=Ngọ, can_nam=Mậu, gioi_tinh=Nam|Nữ
 *
 * Chỉ an sao (Mệnh/Thân, Cục, 14 chính tinh, Tứ Hóa), không luận giải.
 * Không lưu hồ sơ. Không ghi database. Không gọi dịch vụ ngoài.
 */
router.get('/tu-vi', (req, res) => {
    try {
        const {
            ngay_am, thang_am, gio_chi, can_nam, gioi_tinh,
            nam_am, thang_nhuan, lich, duong_lich, gio, phut
        } = req.query;

        if (duong_lich !== undefined) {
            const solar = parseSolarDate(duong_lich);
            if (!solar) {
                return res.status(400).json({ error: 'duong_lich không hợp lệ: cần YYYY-MM-DD' });
            }
            const result = lapLaSoTuDuongLich({
                ...solar,
                gio,
                phut,
                gioi_tinh
            });
            return res.json(result);
        }

        if (nam_am !== undefined) {
            if (thang_am === undefined || ngay_am === undefined) {
                return res.status(400).json({
                    error: 'Thiếu dữ liệu: cần nam_am, thang_am, ngay_am'
                });
            }
            const payload = {
                nam_am,
                thang_am,
                ngay_am,
                thang_nhuan: truthy(thang_nhuan),
                gio,
                phut,
                gioi_tinh
            };
            const result = (lich === 'viet' || lich === 'am_viet')
                ? lapLaSoTuAmViet(payload)
                : lapLaSoTuAmTrungHoa(payload);
            return res.json(result);
        }

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
