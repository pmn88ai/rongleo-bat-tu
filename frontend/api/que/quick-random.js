'use strict';

const { withHandler } = require('../_helpers');
const { Solar } = require('lunar-javascript');
const BaZiCalculator = require('../../lib/bazi/calculator');
const ganzhi = require('../../lib/bazi/ganzhi');
const { calculateHexagram, ELEMENTS } = require('../../lib/bazi/que_data/mapping');
const { HEXAGRAMS } = require('../../lib/bazi/que_data/gua_64');
const { INTERPRETATIONS } = require('../../lib/bazi/que_data/interpretations');

// Map topic string → key trong interpretation.aspects
const TOPIC_MAP = {
    love:        { key: 'love',    label: 'Tình Duyên' },
    wealth:      { key: 'finance', label: 'Tài Lộc' },
    safety:      { key: 'safety',  label: 'Tai Tinh & Bình An' },
    // Topic tiếng Việt từ trang /xinque
    'Chung':      { key: 'career', label: 'Tổng Quan' },
    'Công danh':  { key: 'career', label: 'Công Danh' },
    'Tài lộc':    { key: 'finance', label: 'Tài Lộc' },
    'Tình duyên': { key: 'love',   label: 'Tình Duyên' },
    'Gia đạo':    { key: 'love',   label: 'Gia Đạo' },
    'Học hành':   { key: 'career', label: 'Học Hành' },
    'Sức khỏe':   { key: 'safety', label: 'Sức Khỏe' },
    'Thi cử':     { key: 'career', label: 'Thi Cử' },
    'Giao dịch':  { key: 'finance', label: 'Giao Dịch' },
    'Xuất hành':  { key: 'safety', label: 'Xuất Hành' }
};

// Topic gốc dùng cho calculateHexagram (TOPIC_NUMBERS trong mapping.js)
const CALC_TOPIC = {
    love: 'Tình duyên',
    wealth: 'Tài lộc',
    safety: 'Sức khỏe'
};

const GAN_NAMES = { '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh', '戊': 'Mậu', '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân', '壬': 'Nhâm', '癸': 'Quý' };
const ZHI_NAMES = { '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão', '辰': 'Thìn', '巳': 'Tỵ', '午': 'Ngọ', '未': 'Mùi', '申': 'Thân', '酉': 'Dậu', '戌': 'Tuất', '亥': 'Hợi' };

const qualityFromScore = (score) => {
    if (score >= 6) return 'Đại Cát';
    if (score >= 3) return 'Tiểu Cát';
    if (score >= 0) return 'Bình';
    if (score <= -4) return 'Hung';
    return 'Tiểu Hung';
};

const buildBaziContext = (q) => {
    const calc = new BaZiCalculator({
        year: parseInt(q.year),
        month: parseInt(q.month),
        day: parseInt(q.day),
        hour: parseInt(q.hour || 12),
        minute: parseInt(q.minute || 0),
        isFemale: (q.gender || 'Nam') === 'Nữ'
    }).calculate();

    const balance = calc.balance || {};
    return {
        thong_tin_co_ban: {
            bat_tu: {
                ngay: [ganzhi.ganToVN(calc.gans[2]), ganzhi.zhiToVN(calc.zhis[2])]
            }
        },
        phan_tich: {
            can_bang_ngu_hanh: {
                dung_than: { ngu_hanh: balance.favorable || [] },
                ky_than: { ngu_hanh: balance.unfavorable || [] }
            }
        }
    };
};

// GET /api/que/quick-random?topic=...&type=daily|monthly|yearly&[birth params]
// Gieo quẻ DETERMINISTIC theo giờ gieo (giờ Việt Nam) + Nhật chủ từ hồ sơ mệnh + chủ đề.
module.exports = withHandler(async function(req, res) {
    const q = req.query || {};
    const topicParam = q.topic || '';
    const topicInfo = TOPIC_MAP[topicParam] || { key: 'career', label: 'Tổng Quan' };
    const type = ['daily', 'monthly', 'yearly'].includes(q.type) ? q.type : 'daily';

    // 1. Hồ sơ mệnh (nếu có) — không có thì mapping dùng Nhật chủ mặc định Giáp
    let baziContext = {};
    let hasProfile = false;
    if (q.year && q.month && q.day) {
        try {
            baziContext = buildBaziContext(q);
            hasProfile = true;
        } catch (err) {
            console.error('[QuickQue] bazi build failed, fallback to cast-time only:', err.message);
        }
    }

    // 2. Can Chi giờ gieo (hiện tại, giờ Việt Nam)
    const vnNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const solar = Solar.fromDate(vnNow);
    const lunar = solar.getLunar();
    const hourGanZhi = lunar.getTimeInGanZhi();
    const timeInfo = {
        gan: GAN_NAMES[hourGanZhi.charAt(0)] || hourGanZhi.charAt(0),
        zhi: ZHI_NAMES[hourGanZhi.charAt(1)] || hourGanZhi.charAt(1)
    };

    // 3. Tính quẻ
    const calcTopic = CALC_TOPIC[topicParam] || topicParam || 'Chung';
    const guaResult = calculateHexagram(baziContext, timeInfo, type, calcTopic);
    const hexId = guaResult.hexagramId;
    const hexInfo = HEXAGRAMS[hexId];
    const interpretation = INTERPRETATIONS[hexId];

    if (!hexInfo || !interpretation) {
        return res.status(500).json({ error: 'Failed to generate hexagram' });
    }

    const rawInterpretation =
        (interpretation.aspects && interpretation.aspects[topicInfo.key]) ||
        interpretation.overview ||
        '';

    const y = vnNow.getFullYear();
    const m = vnNow.getMonth() + 1;
    const d = vnNow.getDate();
    const displayPeriod = type === 'monthly'
        ? `Tháng ${m}/${y}`
        : type === 'yearly'
            ? `Năm ${y}`
            : `Ngày ${d}/${m}/${y}`;

    return res.status(200).json({
        id:             hexId,
        hexagramId:     hexId,
        name:           hexInfo.name,
        symbol:         hexInfo.symbol,
        meaning:        hexInfo.meaning,
        quality:        qualityFromScore(guaResult.qualityScore),
        qualityScore:   guaResult.qualityScore,
        upperTrigram:   guaResult.upperTrigram,
        lowerTrigram:   guaResult.lowerTrigram,
        interaction: {
            dayMaster:            guaResult.interaction.dayMaster,
            dayMasterElement:     ELEMENTS[guaResult.interaction.dayMaster],
            timeGan:              guaResult.interaction.timeGan,
            timeZhi:              guaResult.interaction.timeZhi,
            timeElement:          ELEMENTS[guaResult.interaction.timeGan],
            activatedShiShen:     guaResult.interaction.activatedShiShen
        },
        topic:          topicInfo.label,
        overview:       interpretation.overview,
        interpretation: rawInterpretation,
        advice:         interpretation.advice || [],
        type:           type,
        displayPeriod:  displayPeriod,
        cast_time:      vnNow.toISOString(),
        has_profile:    hasProfile,
        disclaimer:     'Quẻ được tính theo giờ gieo (giờ Việt Nam) và Nhật chủ lấy từ hồ sơ mệnh. Cùng người, cùng giờ gieo, cùng chủ đề sẽ cho cùng một quẻ.'
            + (hasProfile ? '' : ' Chưa có hồ sơ mệnh nên quẻ chỉ tính theo giờ gieo — điền hồ sơ để tính theo mệnh.')
    });
});
