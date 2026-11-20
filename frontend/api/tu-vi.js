'use strict';

/**
 * GET /api/tu-vi — bản serverless (Vercel) của route backendjs/src/routes/tu_vi.js.
 *
 * Dùng engine trong frontend/lib/bazi (đã đồng bộ từ backendjs), không require
 * từ backendjs. Không kiểm Linh Thạch/credit (giống các hàm quẻ live).
 *
 * Các đường nhập:
 *  1. duong_lich=YYYY-MM-DD&gio=HH:mm (&phut) &gioi_tinh=Nam|Nữ
 *  2. nam_am&thang_am&ngay_am&lich=viet (&thang_nhuan) &gio=&gioi_tinh=
 *  3. nam_am&thang_am&ngay_am&thang_nhuan=true (&gio=) &gioi_tinh=
 *  4. ngay_am&thang_am&gio_chi&can_nam&gioi_tinh (đường cũ)
 */

const { withHandler } = require('./_helpers');
const {
    lapLaSo,
    lapLaSoTuDuongLich,
    lapLaSoTuAmTrungHoa,
    lapLaSoTuAmViet
} = require('../lib/bazi/tu_vi');

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

module.exports = withHandler(async function(req, res) {
    const query = req.query || {};
    const {
        ngay_am, thang_am, gio_chi, can_nam, gioi_tinh,
        nam_am, thang_nhuan, lich, duong_lich, gio, phut
    } = query;

    try {
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
            return res.status(200).json(result);
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
            return res.status(200).json(result);
        }

        if (ngay_am === undefined || thang_am === undefined || !gio_chi || !can_nam) {
            return res.status(400).json({
                error: 'Thiếu dữ liệu: cần ngay_am, thang_am, gio_chi, can_nam'
            });
        }
        const result = lapLaSo({ ngay_am, thang_am, gio_chi, can_nam, gioi_tinh });
        return res.status(200).json(result);
    } catch (error) {
        if (error.code === 'INVALID_INPUT') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
});
