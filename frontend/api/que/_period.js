'use strict';

/**
 * Shared logic cho 3 endpoint kỳ: /api/que/daily, /monthly, /yearly (bản serverless).
 * Bản mỏng tương đương 3 route tương ứng trong backendjs/src/routes/que.routes.js,
 * dùng engine trong frontend/lib/bazi (đã đồng bộ với backendjs).
 */

const { Solar } = require('lunar-javascript');
const BaZiCalculator = require('../../lib/bazi/calculator');
const ganzhi = require('../../lib/bazi/ganzhi');
const { calculateHexagram, ELEMENTS } = require('../../lib/bazi/que_data/mapping');
const { HEXAGRAMS } = require('../../lib/bazi/que_data/gua_64');
const { getFullInterpretation, generateOfflineAnalysis } = require('../../lib/bazi/que_data/interpretations');

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

const pad2 = (n) => String(n).padStart(2, '0');

const getPeriodInfo = (type, vnNow) => {
    const year = vnNow.getFullYear();
    const month = vnNow.getMonth() + 1;
    const day = vnNow.getDate();

    if (type === 'monthly') {
        const targetDate = new Date(year, month - 1, 15);
        const solar = Solar.fromDate(targetDate);
        const lunar = solar.getLunar();
        const monthGanZhi = lunar.getMonthInGanZhi();
        return {
            periodKey: `${year}-${pad2(month)}`,
            displayPeriod: `Tháng ${month}/${year} (Âm lịch: Tháng ${pad2(lunar.getMonth())} - ${monthGanZhi} ${lunar.getYearInGanZhi()})`,
            timeInfo: { gan: monthGanZhi.charAt(0), zhi: monthGanZhi.charAt(1) },
            solar,
            lunar
        };
    }

    if (type === 'yearly') {
        const targetDate = new Date(year, 5, 15);
        const solar = Solar.fromDate(targetDate);
        const lunar = solar.getLunar();
        const yearGanZhi = lunar.getYearInGanZhi();
        return {
            periodKey: `${year}`,
            displayPeriod: `Năm ${year}`,
            timeInfo: { gan: yearGanZhi.charAt(0), zhi: yearGanZhi.charAt(1) },
            solar,
            lunar
        };
    }

    const targetDate = new Date(year, month - 1, day);
    const solar = Solar.fromDate(targetDate);
    const lunar = solar.getLunar();
    const dayGanZhi = lunar.getDayInGanZhi();
    return {
        periodKey: `${year}-${pad2(month)}-${pad2(day)}`,
        displayPeriod: `Ngày ${day}/${month}/${year}`,
        timeInfo: { gan: dayGanZhi.charAt(0), zhi: dayGanZhi.charAt(1) },
        solar,
        lunar
    };
};

/**
 * buildPeriodQue(query, type) -> { status, body }
 * Deterministic theo kỳ (Can Chi ngày/tháng/năm) + Nhật chủ + topic,
 * nên gọi lại trong cùng kỳ luôn ra cùng quẻ (tương đương cache theo kỳ).
 */
const buildPeriodQue = (q, type) => {
    if (!q.year || !q.month || !q.day) {
        return { status: 400, body: { error: 'Missing birth data' } };
    }

    const baziContext = buildBaziContext(q);
    const vnNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const period = getPeriodInfo(type, vnNow);

    const topic = q.topic || 'Chung';
    const guaResult = calculateHexagram(baziContext, period.timeInfo, type, topic);
    const hexagramDef = HEXAGRAMS[guaResult.hexagramId];
    const fullInterpretation = getFullInterpretation(guaResult.hexagramId, guaResult.interaction, type);

    if (!hexagramDef) {
        return { status: 500, body: { error: 'Failed to generate hexagram' } };
    }

    const quality = qualityFromScore(guaResult.qualityScore);
    const aiAnalysis = generateOfflineAnalysis(
        guaResult.hexagramId,
        hexagramDef,
        topic,
        guaResult.interaction,
        type,
        quality
    );

    return {
        status: 200,
        body: {
            id: guaResult.hexagramId,
            hexagramId: guaResult.hexagramId,
            name: hexagramDef.name,
            symbol: hexagramDef.symbol,
            meaning: hexagramDef.meaning,
            quality,
            qualityScore: guaResult.qualityScore,

            upperTrigram: guaResult.upperTrigram,
            lowerTrigram: guaResult.lowerTrigram,

            interaction: {
                dayMaster: guaResult.interaction.dayMaster,
                dayMasterElement: ELEMENTS[guaResult.interaction.dayMaster],
                timeGan: guaResult.interaction.timeGan,
                timeZhi: guaResult.interaction.timeZhi,
                timeElement: ELEMENTS[guaResult.interaction.timeGan],
                relation: guaResult.interaction.ganInteraction.relation,
                relationType: guaResult.interaction.ganInteraction.relationType,
                activatedShiShen: guaResult.interaction.activatedShiShen
            },

            interpretation: {
                overview: fullInterpretation.overview,
                advice: fullInterpretation.advice,
                aspects: fullInterpretation.aspects
            },

            ai_analysis: aiAnalysis,

            period: period.periodKey,
            displayPeriod: period.displayPeriod,
            type,
            topic,
            credits_used: 0,
            created_at: vnNow.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
            has_profile: true,
            is_history: false,
            disclaimer: 'Quẻ được tính theo Can Chi của kỳ (ngày/tháng/năm, giờ Việt Nam) và Nhật chủ từ hồ sơ mệnh. Cùng hồ sơ, cùng kỳ, cùng chủ đề sẽ cho cùng một quẻ.'
        }
    };
};

module.exports = { buildPeriodQue, buildBaziContext, getPeriodInfo, qualityFromScore };
