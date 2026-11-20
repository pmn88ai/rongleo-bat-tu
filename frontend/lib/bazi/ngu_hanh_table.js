'use strict';

/**
 * Nguồn thật DUY NHẤT cho ngũ hành của Thiên Can / Địa Chi.
 *
 * Bảng Can→hành và Chi→hành lấy trực tiếp từ engine Bát tự (ganzhi.ELEMENTS /
 * ganzhi.ZHI_ELEMENTS), KHÔNG hardcode chuỗi ngũ hành trong prompt luận giải.
 * File này được copy đồng bộ sang frontend/lib/bazi/ngu_hanh_table.js.
 */
const ganzhi = require('./ganzhi');

const PILLAR_LABELS = ['Năm', 'Tháng', 'Ngày', 'Giờ'];

const GAN_HANH = {};
ganzhi.GANS.forEach((gan, i) => {
    GAN_HANH[ganzhi.ganToVN(gan)] = ganzhi.ELEMENTS[i];
    GAN_HANH[gan] = ganzhi.ELEMENTS[i];
});

const ZHI_HANH = {};
ganzhi.ZHIS.forEach((zhi, i) => {
    ZHI_HANH[ganzhi.zhiToVN(zhi)] = ganzhi.ZHI_ELEMENTS[i];
    ZHI_HANH[zhi] = ganzhi.ZHI_ELEMENTS[i];
});

function getCanHanh(can) {
    if (!can) return 'Chưa rõ';
    return GAN_HANH[can] || ganzhi.ganToElement(can);
}

function getChiHanh(chi) {
    if (!chi) return 'Chưa rõ';
    return ZHI_HANH[chi] || ganzhi.zhiToElement(chi);
}

const CAN_LOOKUP = 'Bảng Can: ' +
    ganzhi.GANS_VN.map((can, i) => `${can} ${ganzhi.ELEMENTS[i]}`).join(', ') + '.';

const CHI_LOOKUP = 'Bảng Chi: ' +
    ganzhi.ZHIS_VN.map((chi, i) => `${chi} ${ganzhi.ZHI_ELEMENTS[i]}`).join(', ') + '.';

function formatPillarHanh(pillar, index) {
    const can = pillar && pillar.can ? pillar.can : '';
    const chi = pillar && pillar.chi ? pillar.chi : '';
    if (!can && !chi) return null;

    const label = (pillar && pillar.label) || PILLAR_LABELS[index] || `Trụ ${index + 1}`;
    const canPart = can ? `${can} (${getCanHanh(can)})` : 'Chưa rõ';
    const chiPart = chi ? `${chi} (${getChiHanh(chi)})` : 'Chưa rõ';
    const canChi = [can, chi].filter(Boolean).join(' ');

    return `- ${label}${canChi ? ' ' + canChi : ''}: ${canPart}, ${chiPart}`;
}

/**
 * Khối dữ kiện chèn vào prompt luận giải.
 * @param {Array<{can?:string, chi?:string, label?:string}>} pillars
 * @returns {string} Chuỗi rỗng nếu không có trụ nào.
 */
function buildNguHanhTuTruBlock(pillars) {
    if (!Array.isArray(pillars) || pillars.length === 0) return '';

    const lines = pillars
        .slice(0, 4)
        .map((p, i) => formatPillarHanh(p, i))
        .filter(Boolean);

    if (lines.length === 0) return '';

    return [
        '## DỮ KIỆN ĐÃ TÍNH — NGŨ HÀNH 4 TRỤ (KHÔNG ĐƯỢC TỰ SUY)',
        ...lines,
        CAN_LOOKUP,
        CHI_LOOKUP,
        'CHỈ dùng đúng các giá trị ngũ hành của từng Can và từng Chi ở trên. KHÔNG tự suy ngũ hành của Can/Chi, KHÔNG gán lại hành khác.'
    ].join('\n');
}

module.exports = {
    GAN_HANH,
    ZHI_HANH,
    CAN_LOOKUP,
    CHI_LOOKUP,
    getCanHanh,
    getChiHanh,
    buildNguHanhTuTruBlock
};
