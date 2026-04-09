/**
 * Groq AI Service — Vercel serverless compatible
 * Same interface as backendjs/src/services/groq.service.js
 */

'use strict';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-70b-8192';

async function callGroq(prompt, options) {
    options = options || {};
    const systemPrompt = options.systemPrompt || null;
    const maxTokens = options.maxTokens || 2000;
    const temperature = options.temperature || 0.7;
    const jsonMode = options.jsonMode || false;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not configured');

    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const body = { model: GROQ_MODEL, messages, temperature, max_tokens: maxTokens };
    if (jsonMode) body.response_format = { type: 'json_object' };

    const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error('Groq API error ' + res.status + ': ' + errText);
    }

    const data = await res.json();
    return data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content || ''
        : '';
}

async function callGroqWithRetry(prompt, options, maxRetries) {
    options = options || {};
    maxRetries = maxRetries || 3;
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await callGroq(prompt, options);
            return result;
        } catch (err) {
            lastError = err;
            if (attempt < maxRetries) {
                const wait = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise(function(r) { setTimeout(r, wait); });
            }
        }
    }
    console.error('[Groq] All attempts failed:', lastError);
    throw lastError;
}

function buildSystemPrompt(personaId) {
    const huyen_co = [
        'Bạn là Thầy Huyền Cơ Bát Tự - một bậc thầy uyên bác về Tử Vi và Bát Tự (Tứ Trụ) với hơn 35 năm tu luyện và hành nghề.',
        'THẺ TÍNH CÁCH:',
        '- Uyên bác, thâm sâu nhưng gần gũi, dễ hiểu',
        '- Nhân văn, từ tốn, luôn hướng thiện cho người xem',
        '- Đạo đức nghề nghiệp cao, không hù dọa hay đưa thông tin tiêu cực không cần thiết',
        '- Xưng hô "Thầy" và gọi người hỏi là "con" hoặc "bạn" một cách thân mật',
        '',
        'PHONG CÁCH TƯ VẤN:',
        '- Phân tích lá số theo trường phái chính thống Việt Nam',
        '- Luận giải CỤ THỂ dựa trên lá số được cung cấp, KHÔNG trả lời chung chung',
        '- Đưa ra lời khuyên thực tế, có thể thực hiện được trong cuộc sống'
    ].join('\n');

    const menh_meo = [
        'Bạn là Thầy Mệnh Mèo GenZ - một thiên tài Bát Tự ẩn danh dưới hình hài một chú mèo vibe GenZ "mỏ hỗn" nhưng cực kỳ giỏi chuyên môn.',
        'THẺ TÍNH CÁCH:',
        '- Giỏi Bát Tự thực thụ nhưng nói chuyện cực kỳ GenZ, hài hước, viral, đôi khi hơi "xéo sắc" nhưng tâm tốt.',
        '- Sử dụng slang GenZ linh hoạt (flex, ét ô ét, đỉnh nóc kịch trần, bay màu, khét lẹt, pressing...).',
        '- Xưng hô "Thầy" (hoặc "Ta") và gọi người hỏi là "con" hoặc "mệnh chủ" một cách hài hước.',
        '',
        'PHONG CÁCH TƯ VẤN:',
        '- Luận giải Bát Tự chính xác nhưng dùng ngôn ngữ của giới trẻ.',
        '- Ví von các khái niệm tử vi với đời sống hiện đại.'
    ].join('\n');

    const base = personaId === 'menh_meo' ? menh_meo : huyen_co;

    return base + '\n\n' + [
        'QUY TẮC TRẢ LỜI:',
        '1. Bắt đầu bằng lời chào nhân vật (Huyền Cơ: từ tốn; Mệnh Mèo: hài hước, chất chơi).',
        '2. Phân tích 3-5 điểm chính dựa trên lá số, mỗi điểm 2-3 câu.',
        '3. KHÔNG dùng cụm từ "AI", "máy móc".',
        '4. Ở cuối cùng, luôn cung cấp một phần có tiêu đề [FOLLOW_UP] chứa 3-5 câu hỏi gợi mở dựa trên lá số và đại vận của người dùng.',
        '5. Mỗi câu hỏi gợi mở phải là một dòng bắt đầu bằng dấu "-". Những câu hỏi này phải thực sự liên quan đến rủi ro hoặc cơ hội sắp tới của chủ mệnh, trong đấy có 1 câu liên quan đến ngày, tháng sắp tới.'
    ].join('\n');
}

function formatResponse(content) {
    if (!content) return { answer: ['Xin lỗi, thầy đang bận chút việc...'], followUps: [] };

    let answerText = content;
    let followUps = [];

    const followUpMatch = content.match(/\[FOLLOW_UP\]([\s\S]*)$/i);
    if (followUpMatch) {
        answerText = content.split(/\[FOLLOW_UP\]/i)[0].trim();
        followUps = followUpMatch[1].trim()
            .split('\n')
            .map(function(line) { return line.replace(/^[-*•\s\d.]+/, '').trim(); })
            .filter(function(line) { return line.length > 5 && line.endsWith('?'); });
    }

    answerText = answerText.replace(/[\s*\-_#=+]+$/, '').trim();
    const paragraphs = answerText.split(/\n\n+/)
        .map(function(p) { return p.trim(); })
        .filter(function(p) { return p.length > 0; });

    return {
        answer: paragraphs.length > 0 ? paragraphs : [answerText],
        followUps: followUps.length > 0 ? followUps : [
            'Con có muốn thầy xem kỹ hơn về đường tài lộc trong năm tới không?',
            'Vấn đề tình cảm của con có gì cần thầy gỡ rối thêm không?',
            'Con có muốn biết mình hợp với ngành nghề nào để phát tài nhanh nhất không?'
        ]
    };
}

function getFallbackResponse(questionText) {
    return {
        answer: [
            'Con ơi, Thầy đang gặp chút trở ngại trong việc kết nối nguồn năng lượng để luận giải câu hỏi "' + questionText + '" của con.',
            'Con hãy kiên nhẫn chờ ít phút rồi thử lại nhé. Duyên đến thì mọi sự sẽ sáng tỏ.'
        ],
        followUps: [
            'Con có muốn thầy xem kỹ hơn về đường tài lộc trong năm tới không?',
            'Vấn đề tình cảm của con có gì cần thầy gỡ rối thêm không?'
        ]
    };
}

function getComprehensiveFallback(personaId) {
    if (personaId === 'menh_meo') {
        return '🐱 Ối dồi ôi, server đang bận lắm nè con ơi!\n\nThầy Mèo đang chill một chút, con thử lại sau nha! 😸';
    }
    return 'Kính thưa Mệnh chủ,\n\nHệ thống đang gặp một chút trở ngại. Xin Mệnh chủ vui lòng thử lại sau ít phút.\n\nThầy kính bút.';
}

function getMatchingFallback() {
    return {
        totalScore: 50,
        assessment: { level: 'neutral', title: 'Lỗi kết nối', summary: 'Vui lòng thử lại sau.', icon: '⚠️' },
        breakdown: {
            element: { score: 15, maxScore: 30, description: 'Không thể phân tích', quality: 'neutral' },
            ganzhi: { score: 12, maxScore: 25, details: [], quality: 'neutral' },
            shishen: { score: 12, maxScore: 25, details: [], quality: 'neutral' },
            star: { score: 10, maxScore: 20, details: [], quality: 'neutral' }
        },
        aspects: [],
        advice: [{ type: 'warning', text: 'Hệ thống đang gặp sự cố. Vui lòng thử lại.' }],
        suggestedQuestions: []
    };
}

function buildUserPrompt(baziContext, luckCyclesData, questionText, personaId, partnerContext) {
    const now = new Date();
    const currentDateTime = now.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', weekday: 'long'
    });
    const currentYear = now.getFullYear();

    const basicInfo = baziContext.thong_tin_co_ban || {};
    const pillars = baziContext.chi_tiet_tru || [];
    const analysis = baziContext.phan_tich || {};
    const labels = ['Năm', 'Tháng', 'Ngày', 'Giờ'];

    let pillarsDetail = '';
    pillars.forEach(function(p, i) {
        const tangCan = p.tang_can ? p.tang_can.join(', ') : 'N/A';
        pillarsDetail += '\n### Trụ ' + labels[i] + ':\n' +
            '- Thiên Can: ' + (p.can || 'N/A') + ' (' + (p.hanh_can || '') + ')\n' +
            '- Địa Chi: ' + (p.chi || 'N/A') + ' (' + (p.hanh_chi || '') + ')\n' +
            '- Tàng Can: ' + tangCan + '\n' +
            '- Thập Thần Can: ' + (p.thap_than_can || (i === 2 ? 'Nhật Chủ' : 'N/A')) + '\n' +
            '- Thập Thần Chi: ' + (p.thap_than_chi || 'N/A') + '\n';
    });

    const pillarsSimple = pillars.map(function(p, i) {
        return 'Trụ ' + labels[i] + ': ' + p.can + ' ' + p.chi;
    }).join(' | ');

    let luckInfo = '';
    if (luckCyclesData && luckCyclesData.dai_van && luckCyclesData.dai_van.length > 0) {
        const dv = luckCyclesData.dai_van.find(function(d) {
            return currentYear >= d.nam && currentYear <= d.nam + 9;
        });
        if (dv) {
            luckInfo = '\n- Đại Vận hiện tại: ' + dv.can_chi + ' (' + dv.nam + ' - ' + (dv.nam + 9) + ')' +
                '\n- Thập Thần Đại Vận: ' + dv.thap_than +
                '\n- Năm hiện tại (Lưu Niên): ' + currentYear;
        }
    }

    let godInfo = '';
    if (analysis.can_bang_ngu_hanh) {
        const cb = analysis.can_bang_ngu_hanh;
        const dungThan = cb.dung_than && cb.dung_than.ngu_hanh ? cb.dung_than.ngu_hanh.join(', ') : 'Chưa xác định';
        const hyThan = cb.hy_than && cb.hy_than.ngu_hanh ? cb.hy_than.ngu_hanh.join(', ') : 'Chưa xác định';
        const kyThan = cb.ky_than && cb.ky_than.ngu_hanh ? cb.ky_than.ngu_hanh.join(', ') : 'Chưa xác định';
        const cuongDo = cb.nhan_dinh && cb.nhan_dinh.cuong_do ? cb.nhan_dinh.cuong_do : 'Chưa xác định';
        godInfo = '\n- Dụng Thần: ' + dungThan +
            '\n- Hỷ Thần: ' + hyThan +
            '\n- Kỵ Thần: ' + kyThan +
            '\n- Cường độ Nhật Chủ: ' + cuongDo;
    }

    let partnerInfo = '';
    if (partnerContext) {
        const g = partnerContext.gans || [];
        const z = partnerContext.zhis || [];
        partnerInfo = '\n## THÔNG TIN ĐỐI PHƯƠNG\n' +
            '- Tên: ' + (partnerContext.name || 'Đối phương') + '\n' +
            '- Bát Tự: ' + g[0] + ' ' + z[0] + ' | ' + g[1] + ' ' + z[1] + ' | ' + g[2] + ' ' + z[2] + ' | ' + g[3] + ' ' + z[3] + '\n' +
            '- Nhật Chủ: ' + g[2] + '\n';
    }

    return '\n## THỜI GIAN HIỆN TẠI\n' + currentDateTime + ' (Năm ' + currentYear + ')\n' +
        partnerInfo +
        '\n## THÔNG TIN LÁ SỐ BÁT TỰ\n' +
        '- Tên: ' + (basicInfo.ten || 'Mệnh chủ') + '\n' +
        '- Giới tính: ' + (basicInfo.gioi_tinh || 'Nam') + '\n' +
        '- Ngày sinh DL: ' + (basicInfo.ngay_sinh_duong || 'N/A') + '\n' +
        '- Ngày sinh ÂL: ' + (basicInfo.ngay_sinh_am || 'N/A') + '\n' +
        '- Mệnh: ' + (basicInfo.menh || 'N/A') + '\n\n' +
        'Bát Tự tóm tắt: ' + pillarsSimple + '\n' +
        pillarsDetail + '\n' +
        'Phân tích Cách Cục:' + godInfo + '\n' +
        'Vận hạn hiện tại:' + luckInfo + '\n\n' +
        '---\n## CÂU HỎI\n"' + questionText + '"\n\n' +
        'Hãy trả lời theo phong cách ' + (personaId === 'menh_meo' ? 'Thầy Mệnh Mèo GenZ' : 'Thầy Huyền Cơ Bát Tự') + '.\n' +
        'Đưa ra 3-5 đoạn ngắn gọn, súc tích. CUỐI CÙNG thêm phần [FOLLOW_UP] với 3-5 câu hỏi gợi mở.';
}

module.exports = {
    generateAnswer: async function(baziContext, luckCyclesData, questionText, personaId, partnerContext) {
        personaId = personaId || 'huyen_co';
        const systemPrompt = buildSystemPrompt(personaId);
        const userPrompt = buildUserPrompt(baziContext, luckCyclesData, questionText, personaId, partnerContext || null);
        const content = await callGroqWithRetry(userPrompt, { systemPrompt: systemPrompt, maxTokens: 2000 });
        if (!content) return getFallbackResponse(questionText);
        return formatResponse(content);
    },

    generateCompletion: async function(prompt, personaId) {
        personaId = personaId || 'huyen_co';
        const content = await callGroqWithRetry(prompt, { maxTokens: 3000, temperature: 0.75 });
        if (!content) return getComprehensiveFallback(personaId);
        let result = content.trim();
        if (result.indexOf('```') === 0) {
            const lines = result.split('\n');
            if (lines[0].indexOf('```') === 0) lines.shift();
            if (lines.length > 0 && lines[lines.length - 1].indexOf('```') === 0) lines.pop();
            result = lines.join('\n').trim();
        }
        return result;
    },

    generateMatchingAnswer: async function(person1Ctx, person2Ctx, relationshipType, personaId) {
        relationshipType = relationshipType || 'romance';
        personaId = personaId || 'huyen_co';

        const relMap = {
            romance: 'Tình duyên / Hôn nhân',
            friendship: 'Bạn bè',
            parent_child: 'Cha mẹ - Con cái',
            siblings: 'Anh chị em',
            business: 'Đối tác kinh doanh',
            colleague: 'Đồng nghiệp',
            teacher_student: 'Thầy trò',
            boss_employee: 'Cấp trên - Cấp dưới'
        };
        const relVN = relMap[relationshipType] || relationshipType;

        const systemPrompt = 'Bạn là chuyên gia Bát Tự phân tích độ tương hợp giữa hai người.\n' +
            'BẠN PHẢI TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON (không kèm văn bản khác) theo cấu trúc:\n' +
            '{"totalScore":number(0-100),"assessment":{"level":"excellent|good|neutral|challenging|difficult","title":string,"summary":string,"icon":string},' +
            '"breakdown":{"element":{"score":number,"maxScore":30,"description":string,"quality":string},' +
            '"ganzhi":{"score":number,"maxScore":25,"details":[{"type":"positive|negative","text":string}],"quality":string},' +
            '"shishen":{"score":number,"maxScore":25,"details":[{"type":"positive|negative","text":string}],"quality":string},' +
            '"star":{"score":number,"maxScore":20,"details":[{"type":"positive|negative","text":string}],"quality":string}},' +
            '"aspects":[{"type":string,"icon":string,"title":string,"score":number,"description":string}],' +
            '"advice":[{"type":"positive|neutral|warning|tip","text":string}],' +
            '"suggestedQuestions":[string]}';

        const p1g = person1Ctx.gans || [];
        const p1z = person1Ctx.zhis || [];
        const p2g = person2Ctx.gans || [];
        const p2z = person2Ctx.zhis || [];

        const userPrompt = 'Phân tích mối quan hệ "' + relVN + '" giữa:\n\n' +
            'NGƯỜI 1 (' + (person1Ctx.isFemale ? 'Nữ' : 'Nam') + '):\n' +
            '- Bát Tự: ' + p1g[0] + ' ' + p1z[0] + ' | ' + p1g[1] + ' ' + p1z[1] + ' | ' + p1g[2] + ' ' + p1z[2] + ' | ' + p1g[3] + ' ' + p1z[3] + '\n' +
            '- Nhật Chủ: ' + p1g[2] + '\n' +
            '- Thập Thần: ' + (person1Ctx.ganShens ? person1Ctx.ganShens.join(', ') : '') + '\n\n' +
            'NGƯỜI 2 (' + (person2Ctx.isFemale ? 'Nữ' : 'Nam') + '):\n' +
            '- Bát Tự: ' + p2g[0] + ' ' + p2z[0] + ' | ' + p2g[1] + ' ' + p2z[1] + ' | ' + p2g[2] + ' ' + p2z[2] + ' | ' + p2g[3] + ' ' + p2z[3] + '\n' +
            '- Nhật Chủ: ' + p2g[2] + '\n' +
            '- Thập Thần: ' + (person2Ctx.ganShens ? person2Ctx.ganShens.join(', ') : '') + '\n\n' +
            'Trả về JSON hợp lệ duy nhất, không thêm bất kỳ văn bản nào ngoài JSON.';

        const content = await callGroqWithRetry(userPrompt, { systemPrompt: systemPrompt, maxTokens: 2000, jsonMode: true });
        if (!content) return getMatchingFallback();

        try {
            let cleaned = content.trim();
            const fence = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/m);
            if (fence) cleaned = fence[1].trim();
            return JSON.parse(cleaned);
        } catch (e) {
            console.error('[Groq/Matching] JSON parse failed:', e.message);
            return getMatchingFallback();
        }
    }
};