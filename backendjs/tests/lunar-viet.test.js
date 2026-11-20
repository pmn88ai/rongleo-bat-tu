/**
 * Test module quy đổi Âm lịch Việt ↔ Dương lịch (thuật toán Hồ Ngọc Đức).
 *
 * Mốc kiểm chứng: các ngày Âm Việt đã biết + các tháng lịch Việt lệch 1 ngày
 * so với lịch Trung Hoa (phát hiện bằng đối chiếu với lunar-javascript).
 *
 * Chạy:
 *   cd backendjs && node --test tests/lunar-viet.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const lunarViet = require('../src/bazi/lunar_viet');

describe('Âm Việt → Dương (mốc đã biết)', () => {
    const cases = [
        { am: [1, 1, 2018], duong: [16, 2, 2018] },
        { am: [1, 1, 2025], duong: [29, 1, 2025] },
        { am: [1, 6, 2006], duong: [25, 6, 2006] },
        { am: [1, 1, 2007], duong: [17, 2, 2007] },
        { am: [1, 10, 2018], duong: [7, 11, 2018] },
        { am: [1, 1, 2030], duong: [2, 2, 2030] },
        { am: [15, 1, 2030], duong: [16, 2, 2030] }
    ];
    for (const { am, duong } of cases) {
        it(`âm ${am[0]}/${am[1]}/${am[2]} → dương ${duong[0]}/${duong[1]}/${duong[2]}`, () => {
            const result = lunarViet.lunarToSolar(am[0], am[1], am[2], false);
            assert.deepEqual(result, { day: duong[0], month: duong[1], year: duong[2] });
        });
    }
});

describe('Dương → Âm Việt (mốc đã biết)', () => {
    const cases = [
        { duong: [16, 2, 2018], am: { day: 1, month: 1, year: 2018, isLeap: false } },
        { duong: [25, 6, 2006], am: { day: 1, month: 6, year: 2006, isLeap: false } },
        { duong: [17, 2, 2007], am: { day: 1, month: 1, year: 2007, isLeap: false } },
        { duong: [7, 11, 2018], am: { day: 1, month: 10, year: 2018, isLeap: false } }
    ];
    for (const { duong, am } of cases) {
        it(`dương ${duong[0]}/${duong[1]}/${duong[2]} → âm ${am.day}/${am.month}/${am.year}`, () => {
            assert.deepEqual(lunarViet.solarToLunar(duong[0], duong[1], duong[2]), am);
        });
    }
});

describe('Tháng nhuận', () => {
    it('tháng 2 nhuận 2023 bắt đầu 22/3/2023, có 29 ngày', () => {
        assert.deepEqual(lunarViet.lunarToSolar(1, 2, 2023, true), { day: 22, month: 3, year: 2023 });
        assert.deepEqual(lunarViet.lunarToSolar(29, 2, 2023, true), { day: 19, month: 4, year: 2023 });
        assert.equal(lunarViet.lunarToSolar(30, 2, 2023, true), null);
        assert.equal(lunarViet.lunarMonthDays(2, 2023, true), 29);
    });

    it('không tồn tại tháng nhuận sai → null', () => {
        assert.equal(lunarViet.lunarToSolar(1, 3, 2023, true), null);
        assert.equal(lunarViet.lunarToSolar(1, 2, 2024, true), null);
    });
});

describe('Khứ hồi dương → âm → dương', () => {
    it('đúng cho toàn bộ năm 2006, 2018, 2030 (mọi ngày)', () => {
        for (const year of [2006, 2018, 2030]) {
            for (let month = 1; month <= 12; month += 1) {
                const days = new Date(year, month, 0).getDate();
                for (let day = 1; day <= days; day += 1) {
                    const am = lunarViet.solarToLunar(day, month, year);
                    const back = lunarViet.lunarToSolar(am.day, am.month, am.year, am.isLeap);
                    assert.deepEqual(back, { day, month, year },
                        `khứ hồi ${day}/${month}/${year} qua ${am.day}/${am.month}/${am.year}${am.isLeap ? ' nhuận' : ''}`);
                }
            }
        }
    });
});

describe('Lịch Việt lệch lịch Trung Hoa 1 ngày (tháng thật)', () => {
    it('tháng 6/2006: âm Việt mùng 1 = 25/6/2006', () => {
        assert.deepEqual(lunarViet.lunarToSolar(1, 6, 2006, false), { day: 25, month: 6, year: 2006 });
    });

    it('tháng 10/2018: âm Việt mùng 1 = 7/11/2018', () => {
        assert.deepEqual(lunarViet.lunarToSolar(1, 10, 2018, false), { day: 7, month: 11, year: 2018 });
    });

    it('tháng 1/2030: âm Việt mùng 1 = 2/2/2030 (lịch Trung Hoa còn 30/12/2029)', () => {
        assert.deepEqual(lunarViet.lunarToSolar(1, 1, 2030, false), { day: 2, month: 2, year: 2030 });
        assert.deepEqual(lunarViet.solarToLunar(1, 2, 2030), { day: 29, month: 12, year: 2029, isLeap: false });
    });
});
