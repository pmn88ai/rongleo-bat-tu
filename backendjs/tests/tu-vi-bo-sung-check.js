/**
 * Đối chiếu bộ ca Tử vi BỔ SUNG (giờ Tý 23:00, tháng nhuận, lịch Việt).
 *
 * Kỳ vọng sinh từ iztro 2.6.3 — xem `fixtures/cases-tu-vi-bo-sung.json`.
 * Chạy:
 *   cd backendjs && node tests/tu-vi-bo-sung-check.js
 * Exit 0 nếu PASS hết, 1 nếu có ca lệch.
 */

const fs = require('node:fs');
const path = require('node:path');

const {
    lapLaSoTuDuongLich,
    lapLaSoTuAmTrungHoa,
    lapLaSoTuAmViet
} = require('../src/bazi/tu_vi');

const CASES_PATH = path.join(__dirname, 'fixtures', 'cases-tu-vi-bo-sung.json');
const CHINH_TINH = [
    'Tử Vi', 'Liêm Trinh', 'Thiên Đồng', 'Vũ Khúc', 'Thái Dương', 'Thiên Cơ', 'Thiên Phủ',
    'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'
];
const TU_HOA = ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'];

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

function compare(testCase, result) {
    const { expected, loai } = testCase;
    const diffs = [];
    if (result.menh.chi !== expected.menh) diffs.push(`Mệnh: code=${result.menh.chi}, kỳ vọng=${expected.menh}`);
    if (result.than.chi !== expected.than) diffs.push(`Thân: code=${result.than.chi}, kỳ vọng=${expected.than}`);
    if (result.cuc.so !== expected.cuc) diffs.push(`Cục: code=${result.cuc.so}, kỳ vọng=${expected.cuc}`);
    for (const sao of CHINH_TINH) {
        if (result.sao[sao] !== expected.sao[sao]) {
            diffs.push(`${sao}: code=${result.sao[sao]}, kỳ vọng=${expected.sao[sao]}`);
        }
    }
    for (const hoa of TU_HOA) {
        if (result.tu_hoa[hoa] !== expected.tu_hoa[hoa]) {
            diffs.push(`${hoa}: code=${result.tu_hoa[hoa]}, kỳ vọng=${expected.tu_hoa[hoa]}`);
        }
    }
    if (loai === 'gio_ty') {
        if (result.tru_ngay.can_chi !== expected.tru_ngay.can_chi) {
            diffs.push(`Trụ ngày: code=${result.tru_ngay.can_chi}, kỳ vọng=${expected.tru_ngay.can_chi}`);
        }
        if (result.tru_gio.can_chi !== expected.tru_gio.can_chi) {
            diffs.push(`Trụ giờ: code=${result.tru_gio.can_chi}, kỳ vọng=${expected.tru_gio.can_chi}`);
        }
    }
    return diffs;
}

const doc = JSON.parse(fs.readFileSync(CASES_PATH, 'utf8'));
const cases = doc.cases;
let pass = 0;
const lechs = [];

cases.forEach((testCase) => {
    const diffs = compare(testCase, runCase(testCase));
    if (diffs.length === 0) {
        pass += 1;
    } else {
        lechs.push({ label: testCase.id, diffs });
    }
});

console.log(`Bộ ca: ${CASES_PATH}`);
console.log(`KẾT QUẢ: ${pass}/${cases.length} ca PASS`);
if (lechs.length > 0) {
    console.log(`\nCÁC CA LỆCH (${lechs.length}):`);
    for (const { label, diffs } of lechs) {
        console.log(`\n- ${label}`);
        for (const d of diffs) console.log(`    ${d}`);
    }
}

process.exitCode = lechs.length === 0 ? 0 : 1;
