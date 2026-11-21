'use strict';

/**
 * Dispatcher gom 4 endpoint quẻ vào 1 Serverless Function duy nhất để giữ
 * tổng số function dưới giới hạn 12 của Vercel Hobby.
 *
 * URL cũ (giữ nguyên nhờ rewrite trong vercel.json):
 *   /api/que/daily        -> /api/que?period=daily
 *   /api/que/monthly      -> /api/que?period=monthly
 *   /api/que/yearly       -> /api/que?period=yearly
 *   /api/que/quick-random -> /api/que?period=quick-random
 *
 * Response shape (status + JSON) giống hệt 4 file cũ cho cùng input.
 */

const { withHandler } = require('./_helpers');
const { buildPeriodQue } = require('./que/_period');

const { Solar } = require('lunar-javascript');
const BaZiCalculator = require('../lib/bazi/calculator');
const ganzhi = require('../lib/bazi/ganzhi');
const { calculateHexagram, ELEMENTS } = require('../lib/bazi/que_data/mapping');
const { HEXAGRAMS } = require('../lib/bazi/que_data/gua_64');
const { INTERPRETATIONS } = require('../lib/bazi/que_data/interpretations');

const PERIODS = ['daily', 'monthly', 'yearly', 'quick-random'];

// ---------------------------------------------------------------------------
// Query parsing (fallback khi Vercel/req.query không sẵn hoặc khi test bằng node)
// ---------------------------------------------------------------------------

const parseQuery = (url) => {
    const out = {};
    const qs = (url || '').split('?')[1] || '';
    if (!qs) return out;
    qs.split('&').forEach((pair) => {
        if (!pair) return;
        const idx = pair.indexOf('=');
        const rawKey = idx === -1 ? pair : pair.slice(0, idx);
        const rawVal = idx === -1 ? '' : pair.slice(idx + 1);
        try {
            out[decodeURIComponent(rawKey)] = decodeURIComponent(rawVal.replace(/\+/g, ' '));
        } catch (e) {
            out[rawKey] = rawVal;
        }
    });
    return out;
};

const periodFromUrl = (url) => {
    const match = String(url || '').match(/\/api\/que\/(daily|monthly|yearly|quick-random)(?:[\/?#]|$)/);
    return match ? match[1] : null;
};

// ---------------------------------------------------------------------------
// Logic quick-random (nguyên bản từ api/que/quick-random.js)
// ---------------------------------------------------------------------------

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

const buildQuickBaziContext = (q) => {
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
const handleQuickRandom = (q, res) => {
    const topicParam = q.topic || '';
    const topicInfo = TOPIC_MAP[topicParam] || { key: 'career', label: 'Tổng Quan' };
    const type = ['daily', 'monthly', 'yearly'].includes(q.type) ? q.type : 'daily';

    let baziContext = {};
    let hasProfile = false;
    if (q.year && q.month && q.day) {
        try {
            baziContext = buildQuickBaziContext(q);
            hasProfile = true;
        } catch (err) {
            console.error('[QuickQue] bazi build failed, fallback to cast-time only:', err.message);
        }
    }

    const vnNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const solar = Solar.fromDate(vnNow);
    const lunar = solar.getLunar();
    const hourGanZhi = lunar.getTimeInGanZhi();
    const timeInfo = {
        gan: GAN_NAMES[hourGanZhi.charAt(0)] || hourGanZhi.charAt(0),
        zhi: ZHI_NAMES[hourGanZhi.charAt(1)] || hourGanZhi.charAt(1)
    };

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
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

module.exports = withHandler(async function(req, res) {
    const urlQuery = parseQuery(req.url);
    const q = Object.assign({}, urlQuery, req.query || {});

    const period = q.period || periodFromUrl(req.url);

    if (period === 'quick-random') {
        return handleQuickRandom(q, res);
    }

    if (period === 'daily' || period === 'monthly' || period === 'yearly') {
        const result = buildPeriodQue(q, period);
        return res.status(result.status).json(result.body);
    }

    return res.status(400).json({
        error: 'Invalid or missing period',
        allowed: PERIODS
    });
});
