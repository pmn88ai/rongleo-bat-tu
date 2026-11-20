/**
 * Test bộ ca Tử vi bổ sung: giờ Tý 23:00–23:59, tháng nhuận, lịch Việt.
 * Kỳ vọng sinh từ iztro 2.6.3 (nguồn độc lập), lưu ở
 * `tests/fixtures/cases-tu-vi-bo-sung.json`.
 *
 * Chạy:
 *   cd backendjs && node --test tests/tu-vi-bo-sung.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
    CHI,
    lapLaSo,
    lapLaSoTuDuongLich,
    lapLaSoTuAmTrungHoa,
    lapLaSoTuAmViet,
    timeIndexFromHour,
    gioChiFromTimeIndex
} = require('../src/bazi/tu_vi');

const CASES_PATH = path.join(__dirname, 'fixtures', 'cases-tu-vi-bo-sung.json');
const CASES = JSON.parse(fs.readFileSync(CASES_PATH, 'utf8')).cases;

const CHINH_TINH = [
    'Tử Vi', 'Liêm Trinh', 'Thiên Đồng', 'Vũ Khúc', 'Thái Dương', 'Thiên Cơ', 'Thiên Phủ',
    'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'
];

function parseSolarDate(value) {
    const [nam, thang, ngay] = value.split('-').map(Number);
    return { nam, thang, ngay };
}

function runCase(testCase) {
    const { input, gioi_tinh, loai } = testCase;
    if (loai === 'gio_ty') {
        return lapLaSoTuDuongLich({
            ...parseSolarDate(input.duong_lich),
            gio: input.gio,
            gioi_tinh
        });
    }
    if (loai === 'thang_nhuan') {
        return lapLaSoTuAmTrungHoa({ ...input, gioi_tinh });
    }
    if (loai === 'lich_viet') {
        return lapLaSoTuAmViet({ ...input, gioi_tinh });
    }
    throw new Error(`Loại ca không hỗ trợ: ${loai}`);
}

describe('Bộ ca Tử vi bổ sung (iztro 2.6.3)', () => {
    it('có đủ ca cho cả 3 nhóm', () => {
        const count = (loai) => CASES.filter((c) => c.loai === loai).length;
        assert.ok(count('gio_ty') >= 3, 'cần ít nhất 3 ca giờ Tý');
        assert.ok(count('thang_nhuan') >= 3, 'cần ít nhất 3 ca tháng nhuận');
        assert.ok(count('lich_viet') >= 3, 'cần ít nhất 3 ca lịch Việt');
    });

    CASES.forEach((testCase) => {
        it(`${testCase.id} (${testCase.loai})`, () => {
            const result = runCase(testCase);
            const { expected } = testCase;

            assert.equal(result.menh.chi, expected.menh, 'Mệnh');
            assert.equal(result.than.chi, expected.than, 'Thân');
            assert.equal(result.cuc.so, expected.cuc, 'Cục');
            for (const sao of CHINH_TINH) {
                assert.equal(result.sao[sao], expected.sao[sao], sao);
            }
            for (const hoa of ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ']) {
                assert.equal(result.tu_hoa[hoa], expected.tu_hoa[hoa], hoa);
            }
            if (testCase.loai === 'gio_ty') {
                assert.equal(result.tru_ngay.can_chi, expected.tru_ngay.can_chi, 'Trụ ngày');
                assert.equal(result.tru_gio.can_chi, expected.tru_gio.can_chi, 'Trụ giờ');
            }
        });
    });
});

describe('Quy ước giờ Tý của iztro', () => {
    it('23:00–23:59 là Tý muộn (timeIndex 12), 00:00–00:59 là Tý sớm (0)', () => {
        assert.equal(timeIndexFromHour(0), 0);
        assert.equal(timeIndexFromHour(23), 12);
        assert.equal(gioChiFromTimeIndex(0), 'Tý');
        assert.equal(gioChiFromTimeIndex(12), 'Tý');
        assert.equal(timeIndexFromHour(1), 1);
        assert.equal(timeIndexFromHour(22), 11);
    });

    it('23:00 tính sang ngày kế tiếp: Tử Vi lệch so với 22:59 cùng ngày', () => {
        const truoc = lapLaSoTuDuongLich({
            nam: 1990, thang: 5, ngay: 15, gio: '22:59', gioi_tinh: 'nam'
        });
        const sau = lapLaSoTuDuongLich({
            nam: 1990, thang: 5, ngay: 15, gio: '23:00', gioi_tinh: 'nam'
        });
        assert.notEqual(sau.tu_vi, truoc.tu_vi);
        assert.equal(sau.nguon.gio_index_iztro, 12);
        assert.equal(sau.nguon.am_trung_hoa.ngay, 21);
        assert.equal(sau.nguon.da_an_sao_bang.ngay_am, 22);
        assert.equal(sau.tru_ngay.can_chi, 'Tân Tỵ');
    });

    it('23:00 ngày cuối tháng âm: ngày an sao về mùng 1, tháng giữ nguyên', () => {
        const result = lapLaSoTuDuongLich({
            nam: 2023, thang: 4, ngay: 19, gio: '23:00', gioi_tinh: 'nam'
        });
        assert.equal(result.nguon.am_trung_hoa.thang, 2);
        assert.equal(result.nguon.am_trung_hoa.ngay, 29);
        assert.equal(result.nguon.am_trung_hoa.nhuan, true);
        assert.equal(result.nguon.da_an_sao_bang.ngay_am, 1);
        assert.equal(result.nguon.da_an_sao_bang.thang_am, 2);
    });
});

describe('Quy ước tháng nhuận của iztro (fixLeap=true)', () => {
    it('nửa đầu tháng nhuận giữ tháng nhuận', () => {
        const result = lapLaSoTuAmTrungHoa({
            nam_am: 2023, thang_am: 2, ngay_am: 6, thang_nhuan: true,
            gio: '09:15', gioi_tinh: 'nam'
        });
        assert.equal(result.nguon.am_trung_hoa.nhuan, true);
        assert.equal(result.nguon.da_an_sao_bang.thang_am, 2);
        assert.equal(result.menh.chi, 'Tuất');
    });

    it('nửa sau tháng nhuận tính sang tháng kế tiếp', () => {
        const result = lapLaSoTuAmTrungHoa({
            nam_am: 2023, thang_am: 2, ngay_am: 22, thang_nhuan: true,
            gio: '14:30', gioi_tinh: 'nữ'
        });
        assert.equal(result.nguon.am_trung_hoa.nhuan, true);
        assert.equal(result.nguon.da_an_sao_bang.thang_am, 3);
        assert.equal(result.menh.chi, 'Dậu');
    });
});

describe('Lịch Việt khác lịch Trung Hoa', () => {
    it('cùng ngày âm Việt, quy đổi sang dương rồi an sao (không dùng lịch Trung Hoa để quy đổi)', () => {
        const result = lapLaSoTuAmViet({
            nam_am: 2007, thang_am: 1, ngay_am: 1,
            gio: '12:00', gioi_tinh: 'nữ'
        });
        assert.equal(result.nguon.lich, 'am_viet');
        assert.equal(result.nguon.duong_lich, '2007-02-17');
        assert.equal(result.nguon.am_trung_hoa.nam, 2006);
        assert.equal(result.nguon.am_trung_hoa.thang, 12);
        assert.equal(result.nguon.am_trung_hoa.ngay, 30);
        assert.equal(result.menh.chi, 'Mùi');
    });

    it('nhập cùng ngày theo lịch Trung Hoa ra lá số khác (chứng minh đường nhập tách biệt)', () => {
        const viet = lapLaSoTuAmViet({
            nam_am: 2007, thang_am: 1, ngay_am: 1,
            gio: '12:00', gioi_tinh: 'nữ'
        });
        const trungHoa = lapLaSoTuAmTrungHoa({
            nam_am: 2007, thang_am: 1, ngay_am: 1,
            gio: '12:00', gioi_tinh: 'nữ'
        });
        assert.notEqual(viet.nguon.duong_lich, trungHoa.nguon.duong_lich);
        assert.notEqual(viet.menh.chi, trungHoa.menh.chi);
    });
});

describe('Đường nhập cũ vẫn giữ nguyên', () => {
    it('lapLaSo(ngày/tháng/giờ Chi/can) không đổi', () => {
        const result = lapLaSo({
            ngay_am: 21, thang_am: 2, gio_chi: 'Ngọ',
            can_nam: 'Mậu', gioi_tinh: 'nam'
        });
        assert.equal(result.menh.chi, 'Dậu');
        assert.equal(result.cuc.so, 3);
        assert.equal(result.tu_vi, 'Thân');
    });

    it('CHI vẫn đủ 12 chi', () => {
        assert.equal(CHI.length, 12);
    });
});
