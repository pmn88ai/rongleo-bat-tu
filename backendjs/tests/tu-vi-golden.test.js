/**
 * Test vàng "An sao Tử vi" (bước 3, 19/11/2026).
 *
 * Port đủ 32 ca đã đóng băng trong `tu-vi-goc/cases.json` (kỳ vọng sinh từ
 * iztro 2.6.3). Mỗi ca assert: Mệnh, Thân, Cục, 14 chính tinh, Tứ Hóa.
 *
 * Chạy:
 *   cd backendjs && node --test tests/tu-vi-golden.test.js
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const {
    canNamFromYear,
    anMenhThan,
    napAm,
    lapLaSo,
    CHI,
    BANG_TU_VI
} = require('../src/bazi/tu_vi');

const CASES_PATH = path.join(__dirname, '..', '..', 'tu-vi-goc', 'cases.json');
const CASES_DOC = JSON.parse(fs.readFileSync(CASES_PATH, 'utf8'));
const CASES = CASES_DOC.cases;

const CHINH_TINH = [
    'Tử Vi', 'Liêm Trinh', 'Thiên Đồng', 'Vũ Khúc', 'Thái Dương', 'Thiên Cơ', 'Thiên Phủ',
    'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'
];

describe('Bộ ca đóng băng (tu-vi-goc/cases.json)', () => {
    it('có đủ 32 ca', () => {
        assert.equal(CASES.length, 32);
    });

    CASES.forEach((testCase, index) => {
        const { input, expected } = testCase;
        const soThuTu = index + 1;
        const label = `ca ${soThuTu}: ${input.nam_am}-${input.thang_am}-${input.ngay_am} âm, giờ ${input.gio}, ${input.gioi_tinh}`;

        it(label, () => {
            const canNam = canNamFromYear(input.nam_am);
            const result = lapLaSo({
                ngay_am: input.ngay_am,
                thang_am: input.thang_am,
                gio_chi: input.gio,
                can_nam: canNam,
                gioi_tinh: input.gioi_tinh
            });

            assert.equal(result.menh.chi, expected.menh, 'Mệnh');
            assert.equal(result.than.chi, expected.than, 'Thân');
            assert.equal(result.cuc.so, expected.cuc, 'Cục');

            for (const sao of CHINH_TINH) {
                assert.ok(
                    Object.prototype.hasOwnProperty.call(expected.sao, sao),
                    `Ca thiếu kỳ vọng cho ${sao}`
                );
                assert.equal(result.sao[sao], expected.sao[sao], sao);
            }
            assert.equal(Object.keys(result.sao).length, 14, 'Đủ 14 chính tinh');

            for (const hoa of ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ']) {
                assert.equal(result.tu_hoa[hoa], expected.tu_hoa[hoa], hoa);
            }
        });
    });
});

describe('Đơn vị an sao — neo theo script Python', () => {
    it('Can năm tính từ năm: 2024 → Giáp, 2021 → Tân, 2029 → Kỷ', () => {
        assert.equal(canNamFromYear(2024), 'Giáp');
        assert.equal(canNamFromYear(2021), 'Tân');
        assert.equal(canNamFromYear(2029), 'Kỷ');
    });

    it('Mệnh/Thân đồng cung đúng 4 ca công bố', () => {
        const cases = [[2, 'Tý', 'Mão'], [8, 'Ngọ', 'Mão'], [8, 'Tý', 'Dậu'], [1, 'Tý', 'Dần']];
        for (const [thang, gio, kyVong] of cases) {
            const { menh, than } = anMenhThan(thang, gio);
            assert.equal(CHI[menh], kyVong, `Mệnh tháng ${thang} giờ ${gio}`);
            assert.equal(CHI[than], kyVong, `Thân tháng ${thang} giờ ${gio}`);
        }
    });

    it('Bảng Tử Vi giữ đúng các điểm neo', () => {
        assert.equal(BANG_TU_VI[2][0], 'Sửu');
        assert.equal(BANG_TU_VI[6][5], 'Dần');
        assert.equal(BANG_TU_VI[3][20], 'Thân');
        assert.equal(BANG_TU_VI[5][4], 'Dần');
        assert.equal(BANG_TU_VI[4][29], 'Hợi');
        for (const cuc of [2, 3, 4, 5, 6]) {
            assert.equal(BANG_TU_VI[cuc].length, 30, `Cục ${cuc} phải đủ 30 ngày`);
        }
    });

    it('Nạp âm Kỷ Dậu → Đại Trạch Thổ, Giáp Tý → Hải Trung Kim', () => {
        assert.equal(napAm('Kỷ', 'Dậu'), 'Đại Trạch Thổ');
        assert.equal(napAm('Giáp', 'Tý'), 'Hải Trung Kim');
    });

    it('Ca Leo: 21/2 âm, giờ Ngọ, năm Mậu → Mệnh Dậu, Thân Dậu, Mộc tam cục, Tử Vi Thân', () => {
        const result = lapLaSo({
            ngay_am: 21,
            thang_am: 2,
            gio_chi: 'Ngọ',
            can_nam: 'Mậu',
            gioi_tinh: 'nam'
        });
        assert.equal(result.menh.chi, 'Dậu');
        assert.equal(result.than.chi, 'Dậu');
        assert.equal(result.cuc.so, 3);
        assert.equal(result.tu_vi, 'Thân');
        assert.equal(result.sao['Thái Âm'], 'Dậu');
        assert.equal(result.sao['Thiên Phủ'], 'Thân');
    });

    it('12 cung chức năng bắt đầu từ Mệnh và đi ngược chiều địa chi', () => {
        const result = lapLaSo({
            ngay_am: 21,
            thang_am: 2,
            gio_chi: 'Ngọ',
            can_nam: 'Mậu',
            gioi_tinh: 'nam'
        });
        assert.equal(result.cung.length, 12);
        assert.equal(result.cung[0].cung, 'Mệnh');
        assert.equal(result.cung[0].chi, 'Dậu');
        assert.equal(result.cung[1].cung, 'Phụ Mẫu');
        assert.equal(result.cung[1].chi, 'Thân');
        assert.equal(result.cung[11].cung, 'Huynh Đệ');
    });

    it('Tứ Hóa gắn nhãn đúng cho chính tinh trong cung', () => {
        const result = lapLaSo({
            ngay_am: 21,
            thang_am: 2,
            gio_chi: 'Ngọ',
            can_nam: 'Mậu',
            gioi_tinh: 'nam'
        });
        const hoaCuaSao = {};
        for (const cung of result.cung) {
            for (const sao of cung.sao) {
                if (sao.tu_hoa) hoaCuaSao[sao.ten] = sao.tu_hoa;
            }
        }
        assert.equal(hoaCuaSao['Thái Âm'], 'Hóa Quyền');
        assert.equal(hoaCuaSao['Tham Lang'], 'Hóa Lộc');
        assert.equal(hoaCuaSao['Thiên Cơ'], 'Hóa Kỵ');
    });
});

describe('Kiểm tra đầu vào', () => {
    const base = { ngay_am: 1, thang_am: 1, gio_chi: 'Tý', can_nam: 'Giáp' };

    it('ngày âm ngoài 1–30 → lỗi INVALID_INPUT', () => {
        assert.throws(() => lapLaSo({ ...base, ngay_am: 31 }), /Ngày âm/);
        assert.throws(() => lapLaSo({ ...base, ngay_am: 0 }), /Ngày âm/);
    });

    it('tháng âm ngoài 1–12 → lỗi', () => {
        assert.throws(() => lapLaSo({ ...base, thang_am: 13 }), /Tháng âm/);
    });

    it('giờ Chi / Can năm sai → lỗi', () => {
        assert.throws(() => lapLaSo({ ...base, gio_chi: 'Tí' }), /Giờ Chi/);
        assert.throws(() => lapLaSo({ ...base, can_nam: 'Giap' }), /Can năm/);
    });
});

// ─── Endpoint /api/tu-vi ─────────────────────────────────────────────────────

const TEST_PORT = 0;
let server = null;
let baseUrl = '';

before(async () => {
    const origLog = console.log;
    const origWarn = console.warn;
    console.log = () => {};
    console.warn = () => {};

    const app = require('../server');

    console.log = origLog;
    console.warn = origWarn;

    return new Promise((resolve) => {
        server = http.createServer(app);
        server.listen(TEST_PORT, () => {
            const addr = server.address();
            baseUrl = `http://127.0.0.1:${addr.port}`;
            resolve();
        });
    });
});

after(() => {
    if (server) server.close();
});

async function getJson(pathname, params = {}) {
    const url = new URL(pathname, baseUrl);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString());
    let body = null;
    try { body = await res.json(); } catch { body = null; }
    return { status: res.status, body };
}

describe('GET /api/tu-vi', () => {
    it('trả Mệnh/Thân/Cục/14 chính tinh/Tứ Hóa/12 cung', async () => {
        const { status, body } = await getJson('/api/tu-vi', {
            ngay_am: 21,
            thang_am: 2,
            gio_chi: 'Ngọ',
            can_nam: 'Mậu',
            gioi_tinh: 'Nam'
        });
        assert.equal(status, 200);
        assert.equal(body.menh.chi, 'Dậu');
        assert.equal(body.than.chi, 'Dậu');
        assert.equal(body.cuc.so, 3);
        assert.equal(body.tu_vi, 'Thân');
        assert.equal(Object.keys(body.sao).length, 14);
        assert.equal(body.tu_hoa['Hóa Lộc'], 'Tham Lang');
        assert.equal(body.cung.length, 12);
    });

    it('thiếu tham số → 400', async () => {
        const { status, body } = await getJson('/api/tu-vi', { ngay_am: 1 });
        assert.equal(status, 400);
        assert.ok(body.error);
    });

    it('ngày âm sai → 400', async () => {
        const { status, body } = await getJson('/api/tu-vi', {
            ngay_am: 31,
            thang_am: 1,
            gio_chi: 'Tý',
            can_nam: 'Giáp'
        });
        assert.equal(status, 400);
        assert.ok(body.error);
    });
});
