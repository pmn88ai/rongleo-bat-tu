/**
 * Que Service — Vercel serverless compatible
 * Identical logic to backendjs/src/services/que.service.js
 * Changes: require paths → lib/, QUE_CREDIT_COST = 0 (no-auth mode)
 */

'use strict';

const { calculateHexagram, ELEMENTS } = require('../bazi/que_data/mapping');
const { HEXAGRAMS } = require('../bazi/que_data/gua_64');
const { getFullInterpretation, generateOfflineAnalysis } = require('../bazi/que_data/interpretations');
const database = require('./database.service');
const groqService = require('./groq.service');
const dateUtils = require('../utils/dateUtils');

const QUE_CREDIT_COST = 0; // No-auth mode: free

class QueService {

    async generateDailyQue(baziContext, userInfo, dateStr, contextId, topic, forceNew) {
        topic = topic || 'Chung';
        forceNew = forceNew || false;
        return this._generateQue(baziContext, userInfo, 'daily', dateStr, contextId, topic, forceNew);
    }

    async generateMonthlyQue(baziContext, userInfo, monthStr, contextId, topic, forceNew) {
        topic = topic || 'Chung';
        forceNew = forceNew || false;
        return this._generateQue(baziContext, userInfo, 'monthly', monthStr, contextId, topic, forceNew);
    }

    async generateYearlyQue(baziContext, userInfo, yearStr, contextId, topic, forceNew) {
        topic = topic || 'Chung';
        forceNew = forceNew || false;
        return this._generateQue(baziContext, userInfo, 'yearly', yearStr, contextId, topic, forceNew);
    }

    async _generateQue(baziContext, userInfo, type, periodKey, contextId, topic, forceNew) {
        const userId = userInfo.userId || null;
        const customerId = userInfo.customerId || null;
        const effectiveContextId = topic === 'Chung' ? contextId : contextId + '_' + topic;

        if (!forceNew) {
            const existing = await database.getQue(userId, customerId, effectiveContextId, type, periodKey);
            if (existing) {
                return Object.assign({}, existing.gua_data, {
                    is_history: true,
                    user_note: existing.user_note,
                    is_verified: existing.is_verified
                });
            }
        }

        const { Solar } = require('lunar-javascript');
        let targetDate;
        if (type === 'daily') {
            targetDate = new Date(periodKey);
        } else if (type === 'monthly') {
            const parts = periodKey.split('-');
            targetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 15);
        } else {
            targetDate = new Date(parseInt(periodKey), 5, 15);
        }

        const solar = Solar.fromDate(targetDate);
        const lunar = solar.getLunar();

        let timeInfo = { gan: '', zhi: '' };
        if (type === 'daily') {
            const dayGZ = lunar.getDayInGanZhi();
            timeInfo = { gan: dayGZ.charAt(0), zhi: dayGZ.charAt(1) };
        } else if (type === 'monthly') {
            const monthGZ = lunar.getMonthInGanZhi();
            timeInfo = { gan: monthGZ.charAt(0), zhi: monthGZ.charAt(1) };
        } else {
            const yearGZ = lunar.getYearInGanZhi();
            timeInfo = { gan: yearGZ.charAt(0), zhi: yearGZ.charAt(1) };
        }

        const guaResult = calculateHexagram(baziContext, timeInfo, type, topic);
        const hexagramDef = HEXAGRAMS[guaResult.hexagramId];
        const interpretation = getFullInterpretation(guaResult.hexagramId, guaResult.interaction, type);

        let qualityText = 'Bình';
        const score = guaResult.qualityScore;
        if (score >= 6) qualityText = 'Đại Cát';
        else if (score >= 3) qualityText = 'Tiểu Cát';
        else if (score >= 0) qualityText = 'Bình';
        else if (score >= -3) qualityText = 'Tiểu Hung';
        else qualityText = 'Hung';

        let llmInterpretation = '';
        try {
            llmInterpretation = await this._generateLLMInterpretation(
                baziContext, hexagramDef, guaResult, type, periodKey, solar, lunar, topic
            );
        } catch(e) {
            console.error('[QueService] LLM error:', e.message);
        }

        if (!llmInterpretation) {
            llmInterpretation = generateOfflineAnalysis(
                guaResult.hexagramId, hexagramDef, topic, guaResult.interaction, type, qualityText
            );
        }

        let displayPeriod = periodKey;
        if (type === 'daily') {
            displayPeriod = 'Ngày ' + solar.getDay() + '/' + solar.getMonth() + '/' + solar.getYear();
        } else if (type === 'monthly') {
            displayPeriod = 'Tháng ' + solar.getMonth() + '/' + solar.getYear() +
                ' (Âm lịch: Tháng ' + String(lunar.getMonth()).padStart(2, '0') +
                ' - ' + lunar.getMonthInGanZhi() + ' ' + lunar.getYearInGanZhi() + ')';
        } else {
            displayPeriod = 'Năm ' + periodKey;
        }

        const staticInterp = getFullInterpretation(guaResult.hexagramId, guaResult.interaction);

        const fullResult = {
            hexagramId: guaResult.hexagramId,
            name: hexagramDef.name,
            symbol: hexagramDef.symbol,
            meaning: hexagramDef.meaning,
            quality: qualityText,
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
                overview: staticInterp.overview,
                advice: staticInterp.advice,
                aspects: staticInterp.aspects
            },
            ai_analysis: llmInterpretation,
            period: periodKey,
            displayPeriod: displayPeriod,
            type: type,
            topic: topic,
            credits_used: QUE_CREDIT_COST,
            created_at: dateUtils.getCurrentVNTime()
        };

        // Resolve customer for history linking
        let resolvedCustomerId = customerId;
        if (!resolvedCustomerId && baziContext.thong_tin_co_ban) {
            try {
                const bi = baziContext.thong_tin_co_ban;
                resolvedCustomerId = await database.findOrCreateCustomer({
                    name: bi.ten || 'Mệnh chủ',
                    year: bi.nam_sinh, month: bi.thang_sinh, day: bi.ngay_sinh,
                    hour: bi.gio_sinh || 12, minute: 0,
                    gender: bi.gioi_tinh || 'Nam', calendar: 'solar'
                });
            } catch(e) {
                console.error('[QueService] resolve customer error:', e.message);
            }
        }

        // Save to history
        try {
            const paragraphs = llmInterpretation.split('\n\n').filter(function(p) { return p.trim(); });
            const ct = baziContext.chi_tiet_tru || [];
            const person1Data = {
                name: baziContext.thong_tin_co_ban && baziContext.thong_tin_co_ban.ten || 'Mệnh chủ',
                gender: baziContext.thong_tin_co_ban && baziContext.thong_tin_co_ban.gioi_tinh || 'Nam',
                year: baziContext.thong_tin_co_ban && baziContext.thong_tin_co_ban.nam_sinh,
                chart: {
                    pillars: {
                        year:  { gan: ct[0] && ct[0].can, zhi: ct[0] && ct[0].chi },
                        month: { gan: ct[1] && ct[1].can, zhi: ct[1] && ct[1].chi },
                        day:   { gan: ct[2] && ct[2].can, zhi: ct[2] && ct[2].chi },
                        hour:  { gan: ct[3] && ct[3].can, zhi: ct[3] && ct[3].chi }
                    }
                }
            };
            const guaDataForMeta = Object.assign({}, fullResult);
            delete guaDataForMeta.ai_analysis;

            const typeLabel = type === 'daily' ? 'Ngày' : type === 'monthly' ? 'Tháng' : 'Năm';
            const topicLabel = topic !== 'Chung' ? topic + ' ' : '';
            await database.saveConsultation(
                resolvedCustomerId,
                'xin_que',
                type,
                'Xin quẻ ' + topicLabel + typeLabel + ' - ' + displayPeriod,
                paragraphs,
                true,
                QUE_CREDIT_COST,
                userId,
                'huyen_co',
                [],
                {
                    person1: person1Data,
                    metadata: {
                        isQue: true,
                        queType: type,
                        topic: topic,
                        periodKey: periodKey,
                        contextId: effectiveContextId,
                        guaName: hexagramDef.name,
                        guaNumber: guaResult.hexagramId,
                        quality: qualityText,
                        symbol: hexagramDef.symbol,
                        gua_data: guaDataForMeta
                    }
                }
            );
        } catch(e) {
            console.error('[QueService] save history error:', e.message);
        }

        return fullResult;
    }

    async _generateLLMInterpretation(baziContext, hexagramDef, guaResult, type, periodKey, solar, lunar, topic) {
        topic = topic || 'Chung';
        const periodLabel = type === 'daily' ? 'NGÀY' : type === 'monthly' ? 'THÁNG' : 'NĂM';
        const topicLabel = topic !== 'Chung' ? 'về chủ đề ' + topic.toUpperCase() : '';

        const phan_tich = baziContext.phan_tich || {};
        const cb = phan_tich.can_bang_ngu_hanh || {};
        const dm = (baziContext.thong_tin_co_ban && baziContext.thong_tin_co_ban.nhap_chu) || guaResult.interaction.dayMaster;
        const dmEle = ELEMENTS[dm];
        const dungThan = cb.dung_than && cb.dung_than.ngu_hanh ? cb.dung_than.ngu_hanh : [];
        const kyThan = cb.ky_than && cb.ky_than.ngu_hanh ? cb.ky_than.ngu_hanh : [];
        const timeElement = ELEMENTS[guaResult.interaction.timeGan];
        const periodYang = ['Giáp', 'Bính', 'Mậu', 'Canh', 'Nhâm'].indexOf(guaResult.interaction.timeGan) !== -1;
        const gender = baziContext.thong_tin_co_ban && baziContext.thong_tin_co_ban.gioi_tinh || 'Nam';
        const age = baziContext.thong_tin_co_ban && baziContext.thong_tin_co_ban.tuoi || 'không rõ';

        const prompt = [
            'Bạn là bậc thầy ẩn sĩ "Huyền Cơ", chuyên gia tối cao về Kinh Dịch và Bát Tự.',
            'Hãy thực hiện một bài LUẬN GIẢI CHI TIẾT quẻ ' + periodLabel + ' ' + topicLabel + ' cho mệnh chủ.',
            '',
            '### THÔNG TIN ĐẦU VÀO:',
            '',
            '**1. Trục Mệnh (Cố định):**',
            '- Nhật Chủ: ' + dm + ' (' + dmEle + ')',
            '- Giới tính: ' + gender + ' | Tuổi: ' + age,
            '- Thập thần kích hoạt: ' + guaResult.interaction.activatedShiShen,
            '- Dụng Thần: ' + dungThan.join(', '),
            '- Kỵ Thần: ' + kyThan.join(', '),
            '',
            '**2. Trục Thời (Năng lượng ' + periodLabel + '):**',
            '- Dương lịch: ' + solar.toYmd(),
            '- Âm lịch: ' + lunar.getMonth() + '/' + lunar.getDay() + ' (' + lunar.getMonthInGanZhi() + ' ' + lunar.getDayInGanZhi() + ')',
            '- Can Chi ' + periodLabel + ': ' + guaResult.interaction.timeGan + guaResult.interaction.timeZhi,
            '- Ngũ hành chủ khí: ' + timeElement,
            '- Âm/Dương: ' + (periodYang ? 'Dương' : 'Âm'),
            '',
            '**3. Trục Tương Tác (Sinh quẻ):**',
            '- Quẻ: ' + hexagramDef.name + ' (' + hexagramDef.symbol + ')',
            '- Tính chất: ' + (guaResult.qualityScore >= 0 ? 'Cát/Trung' : 'Cần cẩn trọng/Hung'),
            '- Quan hệ Can Chi: ' + guaResult.interaction.ganInteraction.relation,
            '',
            '### YÊU CẦU CẤU TRÚC BÀI LUẬN:',
            '',
            '**I. Thông tin thời vận** - Phân tích Can Chi của ' + periodLabel + ' tương ứng.',
            '**II. Quẻ chính** - Tên quẻ và hình tượng quẻ. Tính chất tổng quát: Cát/Trung/Cần cẩn trọng.',
            '**III. Giải quẻ theo mệnh (CÁ NHÂN HÓA THEO CHỦ ĐỀ: ' + topic.toUpperCase() + ')** - Phân tích cơ hội và thách thức cụ thể. Dự báo diễn biến. Lời khuyên hành động.',
            '**IV. Cá nhân hóa Bát Tự** - Tác động lên Nhật chủ ' + dm + '. Phân tích xem quẻ có kích hoạt Dụng thần (' + dungThan.join('/') + ') hay đánh vào Kỵ thần (' + kyThan.join('/') + ') không.',
            '',
            'QUY TẮC VĂN PHONG:',
            '1. Viết liền mạch, uyên bác, trang trọng nhưng sâu sắc.',
            '2. Gọi người dùng là "con" hoặc "mệnh chủ".',
            '3. KHÔNG dùng chữ Hán gốc, luôn dùng tên gọi tiếng Việt.',
            '4. KHÔNG bao bọc trong code block.',
            '5. KHÔNG nhắc đến AI, Máy tính.'
        ].join('\n');

        return await groqService.generateCompletion(prompt, 'huyen_co');
    }

    async getHistory(userId, page, limit) {
        return database.getQueHistory(userId, page, limit);
    }

    async updateNote(id, note, isVerified) {
        return database.updateQueNote(id, note, isVerified);
    }
}

module.exports = new QueService();
