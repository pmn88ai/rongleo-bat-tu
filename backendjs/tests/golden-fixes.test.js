/**
 * Golden tests cho đợt sửa 19/11/2026 (F1–F5, F8).
 *
 * Chạy:
 *   cd backendjs && node --test tests/golden-fixes.test.js
 *
 * Các ca giờ Tý cần `lunar-javascript` (dependency của repo). Theo brief không
 * cài package, nên nếu dependency chưa có thì các ca đó được skip kèm lý do.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { analyzeNguHanh } = require('../src/bazi/phan_tich/ngu_hanh');
const { determineCach } = require('../src/bazi/geju');
const {
    analyzeLuanTinh,
    countGods,
    getDominantGod,
    getGodCode
} = require('../src/bazi/phan_tich/luan_tinh');

let BaZiCalculator = null;
let calculatorLoadError = '';
try {
    BaZiCalculator = require('../src/bazi/calculator');
} catch (err) {
    calculatorLoadError = err.message;
}

const SKIP_NO_DEPS = calculatorLoadError
    ? `Thiếu lunar-javascript (không cài package theo brief): ${calculatorLoadError}`
    : false;

const createCalculator = (opts) => new BaZiCalculator(opts);

const makeCtx = (gans, zhis) => ({
    gans,
    zhis,
    elements: {},
    scores: { ngu_hanh_vn: {} },
    isFemale: false,
    nguHanhResult: {}
});

// ─── F1: Giờ Tý ─────────────────────────────────────────────────────────────

describe('F1 — giờ 0 không bị đổi thành 12', () => {
    it('00:30 → trụ giờ Tý', { skip: SKIP_NO_DEPS }, () => {
        const ctx = createCalculator({ year: 1990, month: 6, day: 15, hour: 0, minute: 30, isFemale: false }).calculate();
        assert.equal(ctx.zhis[3], '子');
        assert.equal(ctx.pillars[3].chi, 'Tý');
        assert.equal(ctx.basicInfo.gio_chi, 'Tý');
    });

    it('23:30 → trụ giờ Tý', { skip: SKIP_NO_DEPS }, () => {
        const ctx = createCalculator({ year: 1990, month: 6, day: 15, hour: 23, minute: 30, isFemale: false }).calculate();
        assert.equal(ctx.zhis[3], '子');
        assert.equal(ctx.pillars[3].chi, 'Tý');
    });

    it('12:30 → trụ giờ Ngọ', { skip: SKIP_NO_DEPS }, () => {
        const ctx = createCalculator({ year: 1990, month: 6, day: 15, hour: 12, minute: 30, isFemale: false }).calculate();
        assert.equal(ctx.zhis[3], '午');
        assert.equal(ctx.pillars[3].chi, 'Ngọ');
    });

    it('hour không truyền → mặc định 12', { skip: SKIP_NO_DEPS }, () => {
        const calc = createCalculator({ year: 1990, month: 6, day: 15, isFemale: false });
        assert.equal(calc.hour, 12);
        const ctx = calc.calculate();
        assert.equal(ctx.zhis[3], '午');
    });
});

// ─── F2: Cách cục không khớp mẫu ───────────────────────────────────────────

describe('F2 — geju không mặc định Sát', () => {
    it('can tháng Tỷ Kiên + không Kiến Lộc → chưa xác định được', () => {
        const ctx = makeCtx(['甲', '甲', '甲', '丙'], ['子', '子', '午', '卯']);
        const cach = determineCach(ctx);
        assert.ok(Array.isArray(cach));
        assert.ok(cach[0].toLowerCase().includes('chưa xác định được'));
        assert.ok(!cach.includes('Sát'));
        assert.ok(!cach.includes('Thất Sát'));
    });
});

// ─── F3: Luận tĩnh — nhãn thập thần + field strength ──────────────────────

describe('F3 — luan_tinh đọc đúng nhãn và đúng field', () => {
    it('đếm Tài đúng với nhãn đầy đủ Chính Tài/Thiên Tài', () => {
        const ctx = makeCtx(['戊', '己', '甲', '丙'], ['午', '戌', '寅', '卯']);
        const wealth = countGods(ctx, '甲', ['Chính Tài', 'Thiên Tài']);
        assert.ok(wealth > 0);
        assert.equal(wealth, 2);
    });

    it('getDominantGod trả tên đầy đủ và getGodCode map đúng (không rơi Thuc_Than)', () => {
        const ctx = makeCtx(['戊', '己', '甲', '丙'], ['午', '戌', '寅', '卯']);
        const god = getDominantGod(ctx, '甲');
        assert.equal(god, 'Thiên Tài');
        assert.equal(getGodCode(god), 'Thien_Tai');
    });

    it('strength đọc từ nguHanhResult.nhan_dinh.cuong_do', () => {
        const ctx = makeCtx(['戊', '己', '甲', '丙'], ['午', '戌', '寅', '卯']);
        ctx.nguHanhResult = {
            nhan_dinh: { cuong_do: 'Thân Vượng (Nội cách)' },
            dung_than: { ngu_hanh: ['Thổ'] }
        };
        const result = analyzeLuanTinh(ctx);
        assert.equal(result.metadata.strength, 'Thân Vượng (Nội cách)');
    });

    it('luận tĩnh nhận "Tài tinh vượng" khi có 2 Tài', () => {
        const ctx = makeCtx(['戊', '己', '甲', '丙'], ['午', '戌', '寅', '卯']);
        ctx.nguHanhResult = {
            nhan_dinh: { cuong_do: 'Thân Vượng (Nội cách)' },
            dung_than: { ngu_hanh: ['Thổ'] }
        };
        const result = analyzeLuanTinh(ctx);
        assert.ok(result.career.convergence.some(x => x.includes('Tài tinh vượng')));
    });
});

// ─── F5/F8: Tòng cách theo quy tắc tủ ──────────────────────────────────────

describe('F5 — Tòng Sát theo hành khắc Nhật Chủ', () => {
    it('Nhật Chủ Thủy, đủ điều kiện tòng → dụng thần Thổ', () => {
        // 壬 (Thủy), tháng 戌 (Thổ), không có 根 Thủy, không có Kim/Thủy ở thiên can.
        const ctx = makeCtx(['丙', '戊', '壬', '甲'], ['午', '戌', '寅', '卯']);
        const result = analyzeNguHanh(ctx);
        assert.equal(result.nhan_dinh.ngoai_cach, true);
        assert.equal(result.nhan_dinh.cach_cuc, 'Tòng Sát Cách');
        assert.deepEqual(result.dung_than.ngu_hanh, ['Thổ']);
    });

    it('Nhật Chủ Mộc, đủ điều kiện tòng → dụng thần Kim (không phải Thổ)', () => {
        // 甲 (Mộc), tháng 酉 (Kim), không có 根 Mộc, không có Thủy/Mộc ở thiên can.
        const ctx = makeCtx(['丙', '庚', '甲', '戊'], ['午', '酉', '戌', '巳']);
        const result = analyzeNguHanh(ctx);
        assert.equal(result.nhan_dinh.ngoai_cach, true);
        assert.equal(result.nhan_dinh.cach_cuc, 'Tòng Sát Cách');
        assert.deepEqual(result.dung_than.ngu_hanh, ['Kim']);
        assert.notDeepEqual(result.dung_than.ngu_hanh, ['Thổ']);
    });

    it('còn căn (tàng can 寅 có 甲) → KHÔNG tòng', () => {
        const ctx = makeCtx(['丙', '庚', '甲', '戊'], ['寅', '酉', '午', '巳']);
        const result = analyzeNguHanh(ctx);
        assert.equal(result.nhan_dinh.ngoai_cach, false);
        assert.notEqual(result.nhan_dinh.cach_cuc, 'Tòng Sát Cách');
    });
});
