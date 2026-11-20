'use strict';

const test = require('node:test');
const assert = require('node:assert');

const {
    PYTHAGOREAN_VALUES,
    VOWEL_LETTERS,
    stripDiacritics,
    normalizeName,
    reduceNumber,
    lifePath,
    destinyNumber,
    soulNumber,
    personalityNumber,
    birthdayNumber,
    computeNumerology
} = require('../src/bazi/than_so');
const { describeNumbers } = require('../src/bazi/than_so_meaning');

test('Bảng Pythagore chuẩn A=1 … Z=8', () => {
    const expected = {
        A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
        J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
        S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
    };
    assert.deepEqual(PYTHAGOREAN_VALUES, expected);
    assert.deepEqual(VOWEL_LETTERS, ['A', 'E', 'I', 'O', 'U']);
});

test('Bỏ dấu tiếng Việt đúng trước khi tính', () => {
    assert.equal(stripDiacritics('Phạm Minh Nhật'), 'Pham Minh Nhat');
    assert.equal(stripDiacritics('Đặng Thị Hồng'), 'Dang Thi Hong');
    assert.equal(normalizeName('  phạm   minh nhật '), 'PHAM MINH NHAT');
});

test('Hồ sơ Leo 7/4/1988 — Phạm Minh Nhật', () => {
    assert.equal(lifePath({ day: 7, month: 4, year: 1988 }), 1);
    assert.equal(destinyNumber('Phạm Minh Nhật'), 8);
    assert.equal(soulNumber('Phạm Minh Nhật'), 11);
    assert.equal(personalityNumber('Phạm Minh Nhật'), 6);
    assert.equal(birthdayNumber(7), 7);

    const result = computeNumerology({
        name: 'Phạm Minh Nhật',
        day: 7,
        month: 4,
        year: 1988,
        currentYear: 2026
    });
    assert.equal(result.ho_ten_chuan_hoa, 'PHAM MINH NHAT');
    assert.deepEqual(result.cac_so, {
        duong_doi: 1,
        su_menh: 8,
        linh_hon: 11,
        nhan_cach: 6,
        ngay_sinh: 7,
        nam_ca_nhan: 3
    });
});

test('Ca số chủ 11 — sinh 29/9/1989, Nguyễn Văn An không bị rút gọn', () => {
    assert.equal(reduceNumber(29), 11);
    assert.equal(lifePath({ day: 29, month: 9, year: 1989 }), 11);
    assert.equal(birthdayNumber(29), 11);

    const result = computeNumerology({
        name: 'Nguyễn Văn An',
        day: 29,
        month: 9,
        year: 1989,
        currentYear: 2026
    });
    assert.equal(result.cac_so.duong_doi, 11);
    assert.equal(result.cac_so.ngay_sinh, 11);
    assert.equal(result.cac_so.su_menh, 3);
    assert.equal(result.cac_so.linh_hon, 1);
    assert.equal(result.cac_so.nhan_cach, 2);
    assert.equal(result.cac_so.nam_ca_nhan, 3);
});

test('Hồ sơ thứ ba 9/6/1971 — Trần Thị Bích', () => {
    assert.equal(lifePath({ day: 9, month: 6, year: 1971 }), 6);
    assert.equal(destinyNumber('Trần Thị Bích'), 4);
    assert.equal(soulNumber('Trần Thị Bích'), 1);
    assert.equal(personalityNumber('Trần Thị Bích'), 3);

    const result = computeNumerology({
        name: 'Trần Thị Bích',
        day: 9,
        month: 6,
        year: 1971,
        currentYear: 2026
    });
    assert.deepEqual(result.cac_so, {
        duong_doi: 6,
        su_menh: 4,
        linh_hon: 1,
        nhan_cach: 3,
        ngay_sinh: 9,
        nam_ca_nhan: 7
    });
});

test('describeNumbers trả đủ 6 mục, số và nghĩa tiếng Việt', () => {
    const numbers = computeNumerology({
        name: 'Phạm Minh Nhật',
        day: 7,
        month: 4,
        year: 1988,
        currentYear: 2026
    }).cac_so;

    const described = describeNumbers(numbers);
    assert.equal(described.length, 6);
    const keys = described.map((item) => item.key);
    assert.deepEqual(keys, ['duong_doi', 'su_menh', 'linh_hon', 'nhan_cach', 'ngay_sinh', 'nam_ca_nhan']);
    for (const item of described) {
        assert.ok(Number.isInteger(item.so), `${item.key} phải có số`);
        assert.ok(item.y_nghia && item.y_nghia.length > 10, `${item.key} phải có nghĩa tiếng Việt`);
    }
});
