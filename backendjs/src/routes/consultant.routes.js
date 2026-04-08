const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { THEMES, QUESTIONS } = require('../bazi/questions/data');
const { solveQuestion } = require('../bazi/questions/engine');
const baziCalculator = require('../bazi/calculator');
const baziService = require('../services/bazi.service');
const openRouterService = require('../services/groq.service');
const dbService = require('../services/database.service');
const { formatOutput } = require('../bazi/output');
const { calculateDaiVan } = require('../bazi/dayun');
const authRoutes = require('./auth.routes');

// NO-AUTH: lấy userId từ x-user-id header, fallback "anonymous"
const getUserId = (req) => req.headers['x-user-id'] || 'anonymous';

// AI Rate Limiter
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    message: { error: 'Quá nhiều request AI, vui lòng chờ 1 phút' },
    standardHeaders: true,
    legacyHeaders: false,
});

// GET /api/consultant/themes
router.get('/themes', async (req, res) => {
    try {
        const dbCategories = await dbService.getAllCategories();
        if (dbCategories.length > 0) {
            const themes = dbCategories.map(cat => ({
                id: String(cat.id),
                name: cat.name,
                icon: cat.icon,
                isFromDB: true
            }));
            return res.json(themes);
        }
        res.json(THEMES);
    } catch (error) {
        res.json(THEMES);
    }
});

// GET /api/consultant/questions/:themeId
router.get('/questions/:themeId', async (req, res) => {
    const themeId = req.params.themeId;
    try {
        const categoryId = parseInt(themeId);
        if (!isNaN(categoryId)) {
            const dbQuestions = await dbService.getAllQuestions(categoryId);
            if (dbQuestions.length > 0) {
                const questions = dbQuestions.map(q => ({
                    id: String(q.id),
                    text: q.text,
                    logic: 'DB_QUESTION',
                    isFromDB: true
                }));
                return res.json(questions);
            }
        }
        const questions = QUESTIONS[themeId] || [];
        res.json(questions);
    } catch (error) {
        const questions = QUESTIONS[themeId] || [];
        res.json(questions);
    }
});

// POST /api/consultant/ask - NO auth, NO credit check
router.post('/ask', aiLimiter, async (req, res) => {
    try {
        const { year, month, day, hour, minute, gender, calendar, questionId, questionText, useAI, persona } = req.body;
        const userId = getUserId(req);

        if (!year || !month || !day || !questionId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const isCustomQuestion = questionText && questionText === questionId;

        const g = (gender || '').toLowerCase();
        const isFemale = g.startsWith('n') && !g.includes('am') || g.includes('female') || g.includes('nữ') || g.includes('nư');

        const calc = new baziCalculator({
            name: req.body.name || 'Mệnh chủ',
            year: parseInt(year),
            month: parseInt(month),
            day: parseInt(day),
            hour: parseInt(hour || 12),
            minute: parseInt(minute || 0),
            isFemale: isFemale,
            isSolar: (calendar || 'solar').toLowerCase() === 'solar'
        });
        const ctx = calc.calculate();
        ctx.name = req.body.name || 'Mệnh chủ';

        // Partner context (nếu có)
        let partnerCtx = null;
        if (req.body.partnerData) {
            const p = req.body.partnerData;
            const pg = (p.gender || '').toLowerCase();
            const pIsFemale = pg.startsWith('n') && !pg.includes('am') || pg.includes('female') || pg.includes('nữ') || pg.includes('nư');
            const pCalc = new baziCalculator({
                name: p.name || 'Đối phương',
                year: parseInt(p.year),
                month: parseInt(p.month),
                day: parseInt(p.day),
                hour: parseInt(p.hour || 12),
                minute: parseInt(p.minute || 0),
                isFemale: pIsFemale,
                isSolar: true
            });
            partnerCtx = pCalc.calculate();
            partnerCtx.name = p.name || 'Đối phương';
        }

        let answerData;
        let finalQuestionText = questionText || questionId;
        let themeId = null;

        const numericId = parseInt(questionId);
        if (!isNaN(numericId) && !isCustomQuestion) {
            const allDbQuestions = await dbService.getAllQuestions();
            const dbQuestion = allDbQuestions.find(q => q.id === numericId);
            if (dbQuestion) {
                finalQuestionText = dbQuestion.text;
                themeId = String(dbQuestion.category_id);
            }
        }

        if (finalQuestionText === questionId && !isCustomQuestion) {
            for (const tid of Object.keys(QUESTIONS)) {
                const found = QUESTIONS[tid].find(q =>
                    q.id === questionId || q.logic === questionId || q.text === questionId
                );
                if (found) {
                    finalQuestionText = found.text;
                    themeId = tid;
                    break;
                }
            }
        }

        if (useAI) {
            const fullOutput = formatOutput(ctx);
            const daiVanData = calculateDaiVan(ctx);
            const baziContext = {
                thong_tin_co_ban: fullOutput.thong_tin_co_ban,
                chi_tiet_tru: fullOutput.chi_tiet_tru,
                phan_tich: fullOutput.phan_tich
            };
            const luckCyclesData = { dai_van: daiVanData };
            answerData = await openRouterService.generateAnswer(
                baziContext,
                luckCyclesData,
                finalQuestionText,
                persona || 'huyen_co',
                partnerCtx
            );
        } else {
            const paragraphs = await solveQuestion(ctx, questionId);
            answerData = {
                answer: paragraphs,
                followUps: [
                    "Con có muốn thầy luận giải sâu hơn về cung Phu Thê không?",
                    "Vấn đề tài lộc năm nay của con có gì cần gỡ rối thêm không?",
                    "Con có muốn biết mình hợp với ngành nghề nào nhất không?"
                ]
            };
        }

        // Lưu vào DB (không block response nếu lỗi)
        let customerId = null;
        let consultationId = null;
        try {
            customerId = await dbService.findOrCreateCustomer({
                name: req.body.name,
                year: parseInt(year),
                month: parseInt(month),
                day: parseInt(day),
                hour: parseInt(hour || 12),
                minute: parseInt(minute || 0),
                gender: gender || 'Nam',
                calendar: calendar || 'solar'
            });

            const person1FullData = {
                name: req.body.name || 'Mệnh chủ',
                year: parseInt(year),
                month: parseInt(month),
                day: parseInt(day),
                hour: parseInt(hour || 12),
                minute: parseInt(minute || 0),
                gender: gender || 'Nam',
                calendar: calendar || 'solar',
                chart: baziService.mapToChart(ctx)
            };

            let person2FullData = null;
            if (partnerCtx) {
                const p = req.body.partnerData;
                person2FullData = {
                    name: p.name || 'Đối phương',
                    year: parseInt(p.year),
                    month: parseInt(p.month),
                    day: parseInt(p.day),
                    hour: parseInt(p.hour || 12),
                    minute: parseInt(p.minute || 0),
                    gender: p.gender || 'Nam',
                    calendar: 'solar',
                    chart: baziService.mapToChart(partnerCtx)
                };
            }

            consultationId = await dbService.saveConsultation(
                customerId,
                themeId,
                questionId,
                finalQuestionText,
                answerData.answer,
                !!useAI,
                0, // creditCost = 0 (no credit system)
                userId,
                persona || 'huyen_co',
                answerData.followUps || [],
                {
                    person1: person1FullData,
                    person2: person2FullData,
                    metadata: {
                        themeId,
                        isCustom: isCustomQuestion,
                        requestedPersona: persona
                    }
                }
            );

            console.log(`[DB] Saved consultation #${consultationId} for customer #${customerId}, user: ${userId}`);
        } catch (dbError) {
            console.error('[DB] Failed to save consultation:', dbError.message);
        }

        res.json({
            questionId,
            answer: answerData.answer,
            followUps: answerData.followUps,
            useAI: !!useAI,
            persona: persona || 'huyen_co',
            customerId,
            consultationId,
            creditsUsed: 0,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Consultant API Error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// GET /api/consultant/history/:customerId
router.get('/history/:customerId', async (req, res) => {
    try {
        const customerId = parseInt(req.params.customerId);
        const history = await dbService.getCustomerHistory(customerId);
        const customer = await dbService.getCustomer(customerId);
        res.json({ customer, history });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history', message: error.message });
    }
});

// GET /api/consultant/stats
router.get('/stats', async (req, res) => {
    try {
        const stats = await dbService.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats', message: error.message });
    }
});

// GET /api/consultant/customers
router.get('/customers', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const customers = await dbService.getAllCustomers(limit);
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers', message: error.message });
    }
});

// GET /api/consultant/recent
router.get('/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const recentData = await dbService.getRecentCustomersWithQuestions(limit);
        res.json(recentData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recent data', message: error.message });
    }
});

// GET /api/consultant/my-history - Per-user history dựa trên x-user-id
router.get('/my-history', async (req, res) => {
    try {
        const userId = getUserId(req);
        const limit = parseInt(req.query.limit) || 20;
        const history = await dbService.getUserHistory(userId, limit);
        res.json({
            history,
            count: history.length,
            userId
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history', message: error.message });
    }
});

// POST /api/consultant/comprehensive - NO auth, NO credit check
router.post('/comprehensive', aiLimiter, async (req, res) => {
    try {
        const { chartData, persona } = req.body;
        const userId = getUserId(req);

        if (!chartData) {
            return res.status(400).json({ error: 'Thiếu dữ liệu lá số' });
        }

        const personaName = persona === 'menh_meo' ? 'Thầy Mệnh Mèo GenZ' : 'Thầy Huyền Cơ Bát Tự';
        const personaStyle = persona === 'menh_meo'
            ? `Hãy dùng ngôn ngữ Gen Z, hài hước, vui vẻ, NHIỀU EMOJI trong mỗi đoạn văn. 
- Gọi người hỏi là "con", "bồ", hoặc "cưng"
- Dùng các từ lóng như: "chill", "vibe", "flex", "slay", "real", "cap", "no cap", "đu trend", "xịn xò", "đỉnh của chóp"
- Khi nói về bát tự, giải thích đơn giản, dễ hiểu như đang giải thích cho bạn bè
- Mỗi section nên có ít nhất 1-2 emoji phù hợp`
            : `Hãy dùng ngôn ngữ trang trọng, uyên thâm, đầy chiêm nghiệm Đông phương.
- Gọi người hỏi là "con" hoặc "Mệnh chủ"
- Trích dẫn kinh điển khi phù hợp
- Dùng từ ngữ cổ kính: "nghiệm rằng", "xét thấy", "cổ nhân có câu"
- Lời khuyên mang tính triết lý sâu sắc`;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();
        const currentTimeStr = `${currentDay}/${currentMonth}/${currentYear}`;

        const basicInfo = chartData.thong_tin_co_ban || chartData.thong_tin || {};
        const chiTietTru = chartData.chi_tiet_tru || [];
        const yearPillar = chiTietTru[0] || {};
        const monthPillar = chiTietTru[1] || {};
        const dayPillar = chiTietTru[2] || {};
        const hourPillar = chiTietTru[3] || {};

        const dayMaster = dayPillar.can || 'Chưa xác định';
        const dayMasterElement = dayPillar.hanh_can || (chartData.phan_tich?.can_bang_ngu_hanh?.nhat_chu_hanh || 'Chưa xác định');
        const dayMasterStrength = chartData.phan_tich?.can_bang_ngu_hanh?.nhan_dinh?.cuong_do || 'Cần phân tích thêm';

        const shiShen = {
            'Năm (Can)': yearPillar.thap_than_can || '',
            'Năm (Chi)': yearPillar.thap_than_chi || '',
            'Tháng (Can)': monthPillar.thap_than_can || '',
            'Tháng (Chi)': monthPillar.thap_than_chi || '',
            'Giờ (Can)': hourPillar.thap_than_can || '',
            'Giờ (Chi)': hourPillar.thap_than_chi || ''
        };

        const allShenSha = [
            ...(yearPillar.than_sat || []).map(s => `Năm: ${s}`),
            ...(monthPillar.than_sat || []).map(s => `Tháng: ${s}`),
            ...(dayPillar.than_sat || []).map(s => `Ngày: ${s}`),
            ...(hourPillar.than_sat || []).map(s => `Giờ: ${s}`)
        ];

        const luckyElements = chartData.phan_tich?.can_bang_ngu_hanh?.dung_than?.ngu_hanh || [];
        const avoidElements = chartData.phan_tich?.can_bang_ngu_hanh?.ky_than?.ngu_hanh || [];
        const daiVan = chartData.dai_van || [];
        const elementScores = chartData.diem_so || {};

        const formatPillarFromObj = (p) => {
            if (!p || !p.can || !p.chi) return 'Chưa có dữ liệu';
            return `${p.can} ${p.chi}`;
        };

        const elementScoreStr = Object.keys(elementScores).length > 0
            ? Object.entries(elementScores).map(([k, v]) => `- ${k}: ${v}`).join('\n')
            : '- Chưa có dữ liệu điểm ngũ hành';

        const shiShenStr = Object.entries(shiShen)
            .filter(([k, v]) => v)
            .map(([k, v]) => `- ${k}: ${v}`).join('\n') || '- Thập thần đang được tính toán';

        const shenShaStr = allShenSha.length > 0
            ? allShenSha.slice(0, 10).map(s => `- ${s}`).join('\n')
            : '- Chưa có thần sát đặc biệt';

        const daiVanStr = Array.isArray(daiVan) && daiVan.length > 0
            ? daiVan.slice(0, 5).map(d => {
                const startAge = d.tuoi_bat_dau || d.tuoi_start || '?';
                const canChi = d.can_chi || `${d.can || ''} ${d.chi || ''}`;
                const startYear = d.nam || '';
                return `- Tuổi ${startAge}+: ${canChi} (từ năm ${startYear})`;
            }).join('\n')
            : '- Đại vận đang được tính toán';

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = `${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()}`;
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        const monthNames = ['', 'Tháng Giêng', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
            'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Chạp'];

        const prompt = `Bạn là ${personaName}, một chuyên gia Bát Tự (Tử Vi).
${personaStyle}

THỜI ĐIỂM HIỆN TẠI: ${currentTimeStr} (Năm ${currentYear}, ${monthNames[currentMonth]})
NGÀY MAI: ${tomorrowStr}
THÁNG SAU: ${monthNames[nextMonth]} năm ${nextMonthYear}

Hãy tổng hợp và luận giải đầy đủ lá số Bát Tự sau đây. Bao gồm:

**PHẦN 1: PHÂN TÍCH BẢN MỆNH**
1. Tổng quan về Nhật chủ (bản mệnh) - giải thích chi tiết Tứ Trụ
2. Phân tích tính cách, ưu điểm, nhược điểm
3. Phân tích sự nghiệp và tài lộc
4. Phân tích tình duyên và gia đạo
5. Phân tích sức khỏe cần lưu ý
6. Các sao thần sát quan trọng và ý nghĩa

**PHẦN 2: DỰ BÁO THEO THỜI GIAN**
7. Vận hạn NGÀY MAI (${tomorrowStr})
8. Vận hạn THÁNG NÀY (${monthNames[currentMonth]} ${currentYear})
9. Vận hạn THÁNG SAU (${monthNames[nextMonth]} ${nextMonthYear})
10. Tổng quan NĂM ${currentYear}

**PHẦN 3: HƯỚNG DẪN THỰC HÀNH**
11. Vật phẩm phong thủy, màu sắc may mắn, hướng tốt

LƯU Ý QUAN TRỌNG VỀ TRÌNH BÀY:
- Không sử dụng quá nhiều ký tự markdown đặc biệt.
- Sử dụng in đậm (**) một cách tiết chế.
- Trình bày rõ ràng, ngắt đoạn hợp lý.

THÔNG TIN LÁ SỐ:
- Họ tên: ${basicInfo.ten || basicInfo.name || 'Mệnh chủ'}
- Ngày sinh: ${basicInfo.ngay_sinh || basicInfo.birth_date || 'Theo lá số'}
- Giới tính: ${basicInfo.gioi_tinh || basicInfo.gender || 'Nam/Nữ'}

TỨ TRỤ (Năm-Tháng-Ngày-Giờ):
- Năm: ${formatPillarFromObj(yearPillar)} (Nạp Âm: ${yearPillar.nap_am || ''})
- Tháng: ${formatPillarFromObj(monthPillar)} (Nạp Âm: ${monthPillar.nap_am || ''})
- Ngày: ${formatPillarFromObj(dayPillar)} (Nạp Âm: ${dayPillar.nap_am || ''}) ← NHẬT CHỦ
- Giờ: ${formatPillarFromObj(hourPillar)} (Nạp Âm: ${hourPillar.nap_am || ''})

NHẬT CHỦ: ${dayMaster} (Hành ${dayMasterElement})
CƯỜNG NHƯỢC: ${dayMasterStrength}
DỤNG THẦN: ${Array.isArray(luckyElements) && luckyElements.length > 0 ? luckyElements.join(', ') : 'Cần phân tích từ lá số'}
KỴ THẦN: ${Array.isArray(avoidElements) && avoidElements.length > 0 ? avoidElements.join(', ') : 'Cần phân tích từ lá số'}

ĐIỂM NGŨ HÀNH:
${elementScoreStr}

THẬP THẦN:
${shiShenStr}

THẦN SÁT QUAN TRỌNG:
${shenShaStr}

ĐẠI VẬN HIỆN TẠI VÀ SẮP TỚI:
${daiVanStr}

Hãy viết một bản luận giải đầy đủ, chi tiết, dài khoảng 800-1200 từ.

CUỐI CÙNG, gợi ý 3-5 câu hỏi mà người dùng có thể muốn hỏi thêm. Viết theo format:
---GỢI Ý CÂU HỎI---
1. [Câu hỏi 1]
2. [Câu hỏi 2]
3. [Câu hỏi 3]`;

        const rawResponse = await openRouterService.generateCompletion(prompt, persona);

        let interpretation = rawResponse;
        let followUpQuestions = [];

        const followUpMarker = '---GỢI Ý CÂU HỎI---';
        if (rawResponse.includes(followUpMarker)) {
            const parts = rawResponse.split(followUpMarker);
            interpretation = parts[0].trim();
            const questionsText = parts[1] || '';
            const questionLines = questionsText.split('\n').filter(line => line.trim());
            followUpQuestions = questionLines
                .map(line => line.replace(/^\d+\.\s*/, '').replace(/^\[|\]$/g, '').trim())
                .filter(q => q.length > 5);
        }

        // Lưu lịch sử
        try {
            let customerId = chartData.customerId;
            if (!customerId) {
                const customerInfo = {
                    name: basicInfo.name || basicInfo.ho_ten || basicInfo.ten || 'Mệnh chủ',
                    year: parseInt(basicInfo.year || basicInfo.nam_sinh),
                    month: parseInt(basicInfo.month || basicInfo.thang_sinh),
                    day: parseInt(basicInfo.day || basicInfo.ngay_sinh),
                    hour: parseInt(basicInfo.hour || basicInfo.gio_sinh || 12),
                    minute: parseInt(basicInfo.minute || basicInfo.phut_sinh || 0),
                    gender: basicInfo.gender || basicInfo.gioi_tinh || 'Nam',
                    calendar: basicInfo.calendar || 'solar'
                };
                if (isNaN(customerInfo.year) && basicInfo.ngay_duong_lich) {
                    const parts = basicInfo.ngay_duong_lich.split('/');
                    if (parts.length >= 3) {
                        customerInfo.day = parseInt(parts[0]);
                        customerInfo.month = parseInt(parts[1]);
                        customerInfo.year = parseInt(parts[2]);
                    }
                }
                if (!isNaN(customerInfo.year)) {
                    customerId = await dbService.findOrCreateCustomer(customerInfo);
                }
            }

            if (customerId) {
                const paragraphs = interpretation.split('\n\n').filter(p => p.trim());
                await dbService.saveConsultation(
                    customerId,
                    'comprehensive',
                    'comprehensive',
                    `Tổng hợp luận giải phong cách ${personaName}`,
                    paragraphs,
                    true,
                    0, // no credit cost
                    userId,
                    persona,
                    followUpQuestions
                );
            }
        } catch (dbError) {
            console.error('[DB] Failed to save comprehensive consultation:', dbError);
        }

        res.json({
            interpretation,
            followUpQuestions,
            persona: personaName,
            creditsUsed: 0
        });

    } catch (error) {
        console.error('Comprehensive Interpretation Error:', error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi tổng hợp luận giải', message: error.message });
    }
});

module.exports = router;
