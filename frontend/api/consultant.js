'use strict';

const { withHandler, parseIntParam } = require('./_helpers');
const BaZiCalculator = require('../lib/bazi/calculator');
const { formatOutput } = require('../lib/bazi/output');
const { calculateDaiVan } = require('../lib/bazi/dayun');
const { solveQuestion } = require('../lib/bazi/questions/engine');
const { THEMES, QUESTIONS } = require('../lib/bazi/questions/data');
const groqService = require('../lib/services/groq.service');

// ── Handlers ───────────────────────────────────────────────────────────────────

async function handleThemes(req, res) {
    return res.status(200).json(THEMES);
}

async function handleQuestions(req, res) {
    // Anti-bug shield: chấp nhận cả ?themeId= và ?theme_id=
    const themeId = req.query.themeId || req.query.theme_id || '';
    const questions = QUESTIONS[themeId] || [];
    return res.status(200).json(questions);
}

async function handleAsk(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body;
    const { year, month, day, hour, minute, gender, calendar, questionId, questionText, useAI, persona } = body;

    if (!year || !month || !day || !questionId) {
        return res.status(400).json({ error: 'Missing required parameters: year, month, day, questionId' });
    }

    const g = (gender || '').toLowerCase();
    const isFemale = g === 'nữ' || g === 'nu' || g === 'female';

    const calc = new BaZiCalculator({
        year:     parseIntParam(year),
        month:    parseIntParam(month),
        day:      parseIntParam(day),
        hour:     parseIntParam(hour, 12),
        minute:   parseIntParam(minute, 0),
        isFemale: isFemale,
        isSolar:  (calendar || 'solar').toLowerCase() === 'solar'
    });
    const ctx = calc.calculate();

    let finalQuestionText = questionText || questionId;
    let themeId = null;

    if (!questionText || questionText === questionId) {
        for (const tid of Object.keys(QUESTIONS)) {
            const found = QUESTIONS[tid].find(function(q) {
                return q.id === questionId || q.logic === questionId || q.text === questionId;
            });
            if (found) {
                finalQuestionText = found.text;
                themeId = tid;
                break;
            }
        }
    }

    let answer, followUps;

    if (useAI) {
        const fullOutput = formatOutput(ctx);
        const daiVanData = calculateDaiVan(ctx);
        const baziContext = {
            thong_tin_co_ban: fullOutput.thong_tin_co_ban,
            chi_tiet_tru:     fullOutput.chi_tiet_tru,
            phan_tich:        fullOutput.phan_tich
        };
        const aiResult = await groqService.generateAnswer(
            baziContext,
            { dai_van: daiVanData },
            finalQuestionText,
            persona || 'huyen_co',
            null
        );
        answer    = aiResult.answer;
        followUps = aiResult.followUps;
    } else {
        const paragraphs = await solveQuestion(ctx, questionId);
        answer    = paragraphs;
        followUps = [];
    }

    return res.status(200).json({
        questionId:   questionId,
        questionText: finalQuestionText,
        themeId:      themeId,
        answer:       answer,
        followUps:    followUps,
        useAI:        !!useAI,
        persona:      persona || 'huyen_co',
        timestamp:    new Date().toISOString()
    });
}

async function handleComprehensive(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const body = req.body;
    const { chartData, persona } = body || {};

    if (!chartData) return res.status(400).json({ error: 'Thiếu dữ liệu lá số' });

    const calc = null; // not needed — we use chartData directly
    const { formatOutput } = require('../lib/bazi/output');

    const personaId = persona || 'huyen_co';
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const monthNames = ['','Tháng Giêng','Tháng Hai','Tháng Ba','Tháng Tư','Tháng Năm','Tháng Sáu','Tháng Bảy','Tháng Tám','Tháng Chín','Tháng Mười','Tháng Mười Một','Tháng Chạp'];

    const personaName = personaId === 'menh_meo' ? 'Thầy Mệnh Mèo GenZ' : 'Thầy Huyền Cơ Bát Tự';
    const personaStyle = personaId === 'menh_meo'
        ? 'Dùng ngôn ngữ Gen Z, hài hước, nhiều emoji. Gọi người hỏi là "con" hoặc "bồ". Dùng từ lóng: chill, vibe, flex, slay.'
        : 'Ngôn ngữ trang trọng, uyên thâm Đông phương. Gọi là "Mệnh chủ". Trích dẫn cổ nhân khi phù hợp.';

    const basicInfo = chartData.thong_tin_co_ban || chartData.thong_tin || {};
    const chiTietTru = chartData.chi_tiet_tru || [];
    const [yearP, monthP, dayP, hourP] = [chiTietTru[0]||{}, chiTietTru[1]||{}, chiTietTru[2]||{}, chiTietTru[3]||{}];

    const pillarStr = (p) => (p.can && p.chi) ? `${p.can} ${p.chi} (Nạp Âm: ${p.nap_am||''})` : 'Chưa có';
    const daiVan = chartData.dai_van || [];
    const daiVanStr = daiVan.slice(0,5).map(d => `- Tuổi ${d.tuoi_bat_dau||'?'}+: ${d.can_chi||''} (năm ${d.nam||''})`).join('\n') || '- Chưa có dữ liệu';

    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate()+1);
    const tomorrowStr = `${tomorrow.getDate()}/${tomorrow.getMonth()+1}/${tomorrow.getFullYear()}`;
    const nextMonth = currentMonth===12 ? 1 : currentMonth+1;
    const nextMonthYear = currentMonth===12 ? currentYear+1 : currentYear;

    const prompt = `Bạn là ${personaName}, chuyên gia Bát Tự. ${personaStyle}

HÔM NAY: ${currentDay}/${currentMonth}/${currentYear}. NGÀY MAI: ${tomorrowStr}. THÁNG SAU: ${monthNames[nextMonth]} ${nextMonthYear}.

Luận giải đầy đủ lá số Bát Tự sau đây gồm các phần:
**PHẦN 1 — BẢN MỆNH**: tính cách, sự nghiệp, tài lộc, tình duyên, sức khỏe.
**PHẦN 2 — VẬN HẠN**: ngày mai, tháng này, tháng sau, năm ${currentYear}.
**PHẦN 3 — HƯỚNG DẪN**: màu may mắn, hướng tốt, lời khuyên thực tế.

Trình bày rõ ràng, ngắn gọn, dùng đoạn văn thay vì bullet quá nhiều.

THÔNG TIN:
- Họ tên: ${basicInfo.ten||basicInfo.name||'Mệnh chủ'}
- Ngày sinh: ${basicInfo.ngay_sinh||basicInfo.birth_date||'Không rõ'}
- Giới tính: ${basicInfo.gioi_tinh||basicInfo.gender||'Nam/Nữ'}
TỨ TRỤ:
- Năm: ${pillarStr(yearP)}
- Tháng: ${pillarStr(monthP)}
- Ngày: ${pillarStr(dayP)} ← NHẬT CHỦ
- Giờ: ${pillarStr(hourP)}
NHẬT CHỦ: ${dayP.can||'?'} (${dayP.hanh_can||'?'})
CƯỜNG NHƯỢC: ${chartData.phan_tich?.can_bang_ngu_hanh?.nhan_dinh?.cuong_do||'Cần phân tích'}
DỤNG THẦN: ${(chartData.phan_tich?.can_bang_ngu_hanh?.dung_than?.ngu_hanh||[]).join(', ')||'Cần phân tích'}
ĐẠI VẬN:
${daiVanStr}`;

    const aiResult = await groqService.generateAnswer(
        { thong_tin_co_ban: basicInfo, chi_tiet_tru: chiTietTru, phan_tich: chartData.phan_tich },
        { dai_van: daiVan },
        prompt,
        personaId,
        null
    );

    return res.status(200).json({
        interpretation: aiResult.answer,
        followUpQuestions: aiResult.followUps || []
    });
}

// ── Router ─────────────────────────────────────────────────────────────────────

module.exports = withHandler(async function(req, res) {
    const url  = new URL(req.url, 'http://' + req.headers.host);
    const path = url.pathname;

    if (path === '/api/consultant/themes')        return handleThemes(req, res);
    if (path === '/api/consultant/questions')     return handleQuestions(req, res);
    if (path === '/api/consultant/ask')           return handleAsk(req, res);
    if (path === '/api/consultant/comprehensive') return handleComprehensive(req, res);

    return res.status(404).json({ error: 'Not found' });
});
