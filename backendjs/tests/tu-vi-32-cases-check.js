/**
 * Đối chiếu bộ 32 ca Tử vi đóng băng (kỳ vọng sinh từ iztro 2.6.3) với code an sao.
 *
 * Chạy:
 *   cd backendjs && node tests/tu-vi-32-cases-check.js
 *
 * Chỉ đọc, không sửa dữ liệu ca. Exit 0 nếu 32/32 PASS, 1 nếu có ca lệch.
 */

const fs = require('node:fs');
const path = require('node:path');

const { canNamFromYear, lapLaSo } = require('../src/bazi/tu_vi');

const CASES_PATH = path.join(__dirname, 'fixtures', 'cases-tu-vi-32.json');
const CHINH_TINH = [
    'Tử Vi', 'Liêm Trinh', 'Thiên Đồng', 'Vũ Khúc', 'Thái Dương', 'Thiên Cơ', 'Thiên Phủ',
    'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'
];
const TU_HOA = ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'];

const doc = JSON.parse(fs.readFileSync(CASES_PATH, 'utf8'));
const cases = doc.cases;

let pass = 0;
const lechs = [];

cases.forEach((testCase, index) => {
    const { input, expected } = testCase;
    const soThuTu = index + 1;
    const label = `ca ${soThuTu}: ${input.nam_am}-${input.thang_am}-${input.ngay_am} âm, giờ ${input.gio}, ${input.gioi_tinh}`;
    const result = lapLaSo({
        ngay_am: input.ngay_am,
        thang_am: input.thang_am,
        gio_chi: input.gio,
        can_nam: canNamFromYear(input.nam_am),
        gioi_tinh: input.gioi_tinh
    });

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

    if (diffs.length === 0) {
        pass += 1;
    } else {
        lechs.push({ label, diffs });
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
