/**
 * Test cho 3 chỗ tồn sau đợt F1–F8 (19/11/2026).
 *
 * Chạy:
 *   cd backendjs && node --test tests/ton-fixes.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { analyzeLuanDong } = require('../src/bazi/phan_tich/luan_dong');
const { analyzeLuanTinh } = require('../src/bazi/phan_tich/luan_tinh');

const makeCtx = (nguHanhResult) => ({
    gans: ['丙', '庚', '甲', '戊'],
    zhis: ['寅', '酉', '午', '巳'],
    elements: {},
    isFemale: false,
    luck_pillars: [{ start: 2020, end: 2030, startAge: 30, endAge: 40, gan: 'Giáp', zhi: 'Tý' }],
    nguHanhResult
});

describe('luan_dong đọc đúng nhan_dinh.cuong_do', () => {
    it('có cường độ thật → hiện Thân Vượng', () => {
        const ctx = makeCtx({
            nhan_dinh: { cuong_do: 'Thân Vượng (Nội cách)' },
            dung_than: { ngu_hanh: ['Kim'] },
            ky_than: { ngu_hanh: ['Thổ'] }
        });
        const result = analyzeLuanDong(ctx, null);
        assert.ok(result !== null);
        assert.ok(result.dai_van.variables.some(v => v.includes('Thân Vượng')));
    });

    it('thiếu dữ liệu → "chưa xác định được", không mặc định "Trung Hòa"', () => {
        const result = analyzeLuanDong(makeCtx({}), null);
        const theCuc = result.dai_van.variables.find(v => v.startsWith('Thế cục'));
        assert.ok(theCuc.includes('chưa xác định được'));
        assert.ok(!theCuc.includes('Trung Hòa'));
    });
});

describe('getHealthAnalysis nối dữ liệu thật của analyzeNguHanh', () => {
    it('có diem_tho + kỵ thần → lời khuyên chăm sóc + khuyên khám thật', () => {
        const ctx = makeCtx({
            nhan_dinh: {
                cuong_do: 'Thân Vượng (Nội cách)',
                diem_tho: { 'Mộc': 30, 'Hỏa': 20, 'Thổ': 20, 'Kim': 20, 'Thủy': 10 }
            },
            dung_than: { ngu_hanh: ['Kim'] },
            ky_than: { ngu_hanh: ['Thổ'] }
        });
        const result = analyzeLuanTinh(ctx);
        const health = result.personality.conclusion;
        assert.ok(health.includes('Hành Thổ (kỵ thần)'));
        assert.ok(health.includes('khám bác sĩ'));
        assert.ok(health.includes('không phải chẩn đoán bệnh'));
    });

    it('thiếu dữ liệu ngũ hành → giữ "chưa đủ căn cứ"', () => {
        const result = analyzeLuanTinh(makeCtx({}));
        assert.ok(result.personality.conclusion.includes('chưa đủ căn cứ'));
    });
});
