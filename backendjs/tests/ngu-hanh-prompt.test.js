'use strict';

const test = require('node:test');
const assert = require('node:assert');

const BaZiCalculator = require('../src/bazi/calculator');
const { formatOutput } = require('../src/bazi/output');
const { buildUserPrompt } = require('../src/services/groq.service');
const { GAN_HANH, ZHI_HANH, buildNguHanhTuTruBlock } = require('../src/bazi/ngu_hanh_table');

function buildContext({ year, month, day, hour = 12, minute = 0, isFemale = false }) {
    const calc = new BaZiCalculator({ year, month, day, hour, minute, isFemale, isSolar: true });
    const fullOutput = formatOutput(calc.calculate());
    return {
        thong_tin_co_ban: fullOutput.thong_tin_co_ban,
        chi_tiet_tru: fullOutput.chi_tiet_tru,
        phan_tich: fullOutput.phan_tich
    };
}

test('Bảng ngũ hành Can/Chi dùng chung đúng chuẩn', () => {
    const expectedCan = {
        'Giáp': 'Mộc', 'Ất': 'Mộc', 'Bính': 'Hỏa', 'Đinh': 'Hỏa', 'Mậu': 'Thổ',
        'Kỷ': 'Thổ', 'Canh': 'Kim', 'Tân': 'Kim', 'Nhâm': 'Thủy', 'Quý': 'Thủy'
    };
    const expectedChi = {
        'Tý': 'Thủy', 'Sửu': 'Thổ', 'Dần': 'Mộc', 'Mão': 'Mộc', 'Thìn': 'Thổ', 'Tỵ': 'Hỏa',
        'Ngọ': 'Hỏa', 'Mùi': 'Thổ', 'Thân': 'Kim', 'Dậu': 'Kim', 'Tuất': 'Thổ', 'Hợi': 'Thủy'
    };
    for (const [can, hanh] of Object.entries(expectedCan)) {
        assert.equal(GAN_HANH[can], hanh, `Can ${can} phải là ${hanh}`);
    }
    for (const [chi, hanh] of Object.entries(expectedChi)) {
        assert.equal(ZHI_HANH[chi], hanh, `Chi ${chi} phải là ${hanh}`);
    }
});

test('Prompt luận giải 7/4/1988 11:30 nam chèn đúng ngũ hành 4 trụ', () => {
    const baziContext = buildContext({ year: 1988, month: 4, day: 7, hour: 11, minute: 30 });
    const prompt = buildUserPrompt(baziContext, { dai_van: [] }, 'Kiểm tra ngũ hành', 'huyen_co', null);

    assert.ok(prompt.includes('Mậu (Thổ)'), 'Prompt phải chứa "Mậu (Thổ)"');
    assert.ok(prompt.includes('Thìn (Thổ)'), 'Prompt phải chứa "Thìn (Thổ)"');
    assert.ok(prompt.includes('Bính (Hỏa)'), 'Prompt phải chứa "Bính (Hỏa)"');
    assert.ok(prompt.includes('Nhâm (Thủy)'), 'Prompt phải chứa "Nhâm (Thủy)"');

    const wrong = ['Mậu là kim loại', 'Thìn là gỗ', 'Thìn (Mộc)', 'Mậu (Kim)'];
    for (const bad of wrong) {
        assert.ok(!prompt.includes(bad), `Prompt không được chứa chuỗi sai: ${bad}`);
    }
});

test('Prompt luận giải hồ sơ năm Canh Thân dùng đúng bảng dùng chung', () => {
    const baziContext = buildContext({ year: 1980, month: 6, day: 1, hour: 10, minute: 0 });
    const prompt = buildUserPrompt(baziContext, { dai_van: [] }, 'Kiểm tra bảng Canh Thân', 'huyen_co', null);

    assert.ok(prompt.includes('Canh (Kim)'), 'Prompt phải chứa "Canh (Kim)"');
    assert.ok(prompt.includes('Thân (Kim)'), 'Prompt phải chứa "Thân (Kim)"');
    assert.ok(prompt.includes('Tân (Kim)'), 'Prompt phải chứa "Tân (Kim)"');
    assert.ok(prompt.includes('Tỵ (Hỏa)'), 'Prompt phải chứa "Tỵ (Hỏa)"');
});

test('Khối dữ kiện ngũ hành có bảng tra cứu 10 Can + 12 Chi', () => {
    const block = buildNguHanhTuTruBlock([{ can: 'Mậu', chi: 'Thìn' }]);
    assert.ok(block.includes('Bảng Can:'));
    assert.ok(block.includes('Bảng Chi:'));
    assert.ok(block.includes('Mậu Thổ'));
    assert.ok(block.includes('Thìn Thổ'));
});
