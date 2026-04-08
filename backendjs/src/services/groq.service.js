/**
 * Groq AI Service — replaces OpenRouter
 * Model: llama3-70b-8192
 * Drop-in replacement: same method signatures as openrouter.service.js
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-70b-8192';

// ─── Low-level call ────────────────────────────────────────────────────────────

async function callGroq(prompt, { systemPrompt = null, maxTokens = 2000, temperature = 0.7, jsonMode = false } = {}) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not configured');

    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const body = {
        model: GROQ_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
    };

    // Groq supports JSON mode via response_format
    if (jsonMode) body.response_format = { type: 'json_object' };

    const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
}

// ─── Retry wrapper ─────────────────────────────────────────────────────────────

async function callGroqWithRetry(prompt, options = {}, maxRetries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[Groq] Attempt ${attempt}/${maxRetries}...`);
            const result = await callGroq(prompt, options);
            console.log(`[Groq] Success on attempt ${attempt}`);
            return result;
        } catch (err) {
            lastError = err;
            console.error(`[Groq] Attempt ${attempt} failed:`, err.message);
            if (attempt < maxRetries) {
                const wait = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise(r => setTimeout(r, wait));
            }
        }
    }
    console.error('[Groq] All attempts failed:', lastError?.message);
    return null; // caller handles fallback
}

// ─── Persona system prompts (carried over from openrouter.service.js) ──────────

function buildSystemPrompt(personaId) {
    const personas = {
        huyen_co: `Bạn là Thầy Huyền Cơ Bát Tự - một bậc thầy uyên bác về Tử Vi và Bát Tự (Tứ Trụ) với hơn 35 năm tu luyện và hành nghề.
THẺ TÍNH CÁCH:
- Uyên bác, thâm sâu nhưng gần gũi, dễ hiểu
- Nhân văn, từ tốn, luôn hướng thiện cho người xem
- Đạo đức nghề nghiệp cao, không hù dọa hay đưa thông tin tiêu cực không cần thiết
- Xưng hô "Thầy" và gọi người hỏi là "con" hoặc "bạn" một cách thân mật

PHONG CÁCH TƯ VẤN:
- Phân tích lá số theo trường phái chính thống Việt Nam
- Luận giải CỤ THỂ dựa trên lá số được cung cấp, KHÔNG trả lời chung chung
- Đưa ra lời khuyên thực tế, có thể thực hiện được trong cuộc sống`,

        menh_meo: `Bạn là Thầy Mệnh Mèo GenZ - một thiên tài Bát Tự ẩn danh dưới hình hài một chú mèo vibe GenZ "mỏ hỗn" nhưng cực kỳ giỏi chuyên môn.
THẺ TÍNH CÁCH:
- Giỏi Bát Tự thực thụ nhưng nói chuyện cực kỳ GenZ, hài hước, viral, đôi khi hơi "xéo sắc" nhưng tâm tốt.
- Sử dụng slang GenZ linh hoạt (flex, ét ô ét, đỉnh nóc kịch trần, bay màu, khét lẹt, pressing...).
- Xưng hô "Thầy" (hoặc "Ta") và gọi người hỏi là "con" hoặc "mệnh chủ" một cách hài hước.
- Ghét sự sướt mướt, thích sự thực tế, đánh thẳng vào vấn đề.

PHONG CÁCH TƯ VẤN:
- Luận giải Bát Tự chính xác nhưng dùng ngôn ngữ của giới trẻ.
- Ví von các khái niệm tử vi với đời sống hiện đại.
- Luôn giữ vững chuyên môn Bát Tự kiến thức thâm sâu đằng sau lớp vỏ hài hước.`
    };

    const base = personas[personaId] || personas.huyen_co;

    return `${base}

QUY TẮC TRẢ LỜI:
1. Bắt đầu bằng lời chào nhân vật (Huyền Cơ: từ tốn; Mệnh Mèo: hài hước, chất chơi).
2. Phân tích 3-5 điểm chính dựa trên lá số, mỗi điểm 2-3 câu.
3. KHÔNG dùng cụm từ "AI", "máy móc".
4. Ở cuối cùng, luôn cung cấp một phần có tiêu đề [FOLLOW_UP] chứa 3-5 câu hỏi gợi mở dựa trên lá số và đại vận của người dùng.
5. Mỗi câu hỏi gợi mở phải là một dòng bắt đầu bằng dấu "-". Những câu hỏi này phải thực sự liên quan đến rủi ro hoặc cơ hội sắp tới của chủ mệnh, trong đấy có 1 câu liên quan đến ngày, tháng sắp tới.`;
}

// ─── formatResponse (tách paragraphs + follow-ups) ────────────────────────────

function formatResponse(content) {
    if (!content) return { answer: ['Xin lỗi, thầy đang bận chút việc...'], followUps: [] };

    let answerText = content;
    let followUps = [];

    const followUpMatch = content.match(/\[FOLLOW_UP\]([\s\S]*)$/i);
    if (followUpMatch) {
        answerText = content.split(/\[FOLLOW_UP\]/i)[0].trim();
        followUps = followUpMatch[1].trim()
            .split('\n')
            .map(line => line.replace(/^[\-\*•\s\d\.]+/, '').trim())
            .filter(line => line.length > 5 && line.endsWith('?'));
    }

    answerText = answerText.replace(/[\s\*\-\_\#\=\+]+$/, '').trim();

    const paragraphs = answerText.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);

    return {
        answer: paragraphs.length > 0 ? paragraphs : [answerText],
        followUps: followUps.length > 0 ? followUps : [
            'Con có muốn thầy xem kỹ hơn về đường tài lộc trong năm tới không?',
            'Vấn đề tình cảm của con có gì cần thầy gỡ rối thêm không?',
            'Con có muốn biết mình hợp với ngành nghề nào để phát tài nhanh nhất không?'
        ]
    };
}

// ─── Fallbacks ─────────────────────────────────────────────────────────────────

function getFallbackResponse(questionText) {
    return {
        answer: [
            `Con ơi, Thầy đang gặp chút trở ngại trong việc kết nối nguồn năng lượng để luận giải câu hỏi "${questionText}" của con.`,
            'Con hãy kiên nhẫn chờ ít phút rồi thử lại nhé. Duyên đến thì mọi sự sẽ sáng tỏ.',
        ],
        followUps: [
            'Con có muốn thầy xem kỹ hơn về đường tài lộc trong năm tới không?',
            'Vấn đề tình cảm của con có gì cần thầy gỡ rối thêm không?',
            'Con có muốn biết mình hợp với ngành nghề nào để phát tài nhanh nhất không?'
        ]
    };
}

function getComprehensiveFallback(personaId) {
    if (personaId === 'menh_meo') {
        return `🐱 Ối dồi ôi, server đang bận lắm nè con ơi!\n\nThầy Mèo đang chill một chút, con thử lại sau nha! 😸`;
    }
    return `Kính thưa Mệnh chủ,\n\nHệ thống đang gặp một chút trở ngại. Xin Mệnh chủ vui lòng thử lại sau ít phút.\n\nThầy kính bút.`;
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

// ─── buildUserPrompt (same as openrouter.service.js) ──────────────────────────

function buildUserPrompt(baziContext, luckCyclesData, questionText, personaId, partnerContext = null) {
    const now = new Date();
    const currentDateTime = now.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'long'
    });

    const basicInfo = baziContext.thong_tin_co_ban || {};
    const pillars = baziContext.chi_tiet_tru || [];
    const analysis = baziContext.phan_tich || {};
    const pillarsLabels = ['Năm', 'Tháng', 'Ngày', 'Giờ'];

    let pillarsDetailedInfo = '';
    pillars.forEach((p, i) => {
        const tangCanStr = p.tang_can ? p.tang_can.join(', ') : 'N/A';
        pillarsDetailedInfo += `
### Trụ ${pillarsLabels[i]}:
- Thiên Can: ${p.can || 'N/A'} (${p.hanh_can || ''})
- Địa Chi: ${p.chi || 'N/A'} (${p.hanh_chi || ''})
- Tàng Can: ${tangCanStr}
- Thập Thần Can: ${p.thap_than_can || (i === 2 ? 'Nhật Chủ' : 'N/A')}
- Thập Thần Chi: ${p.thap_than_chi || 'N/A'}
`;
    });

    const pillarsSimple = pillars.map((p, i) => `Trụ ${pillarsLabels[i]}: ${p.can} ${p.chi}`).join(' | ');

    let luckInfo = '';
    const currentYear = now.getFullYear();
    if (luckCyclesData?.dai_van?.length > 0) {
        const currentDaiVan = luckCyclesData.dai_van.find(dv => currentYear >= dv.nam && currentYear <= dv.nam + 9);
        if (currentDaiVan) {
            luckInfo = `
- Đại Vận hiện tại: ${currentDaiVan.can_chi} (${currentDaiVan.nam} - ${currentDaiVan.nam + 9})
- Thập Thần Đại Vận: ${currentDaiVan.thap_than}
- Năm hiện tại (Lưu Niên): ${currentYear}`;
        }
    }

    let godInfo = '';
    if (analysis.can_bang_ngu_hanh) {
        const cb = analysis.can_bang_ngu_hanh;
        godInfo = `
- Dụng Thần: ${cb.dung_than?.ngu_hanh?.join(', ') || 'Chưa xác định'}
- Hỷ Thần: ${cb.hy_than?.ngu_hanh?.join(', ') || 'Chưa xác định'}
- Kỵ Thần: ${cb.ky_than?.ngu_hanh?.join(', ') || 'Chưa xác định'}
- Cường độ Nhật Chủ: ${cb.nhan_dinh?.cuong_do || 'Chưa xác định'}`;
    }

    return `
## THỜI GIAN HIỆN TẠI
${currentDateTime} (Năm ${currentYear})

${partnerContext ? `
## THÔNG TIN ĐỐI PHƯƠNG
- Tên: ${partnerContext.name || 'Đối phương'}
- Bát Tự: ${partnerContext.gans?.[0]} ${partnerContext.zhis?.[0]} | ${partnerContext.gans?.[1]} ${partnerContext.zhis?.[1]} | ${partnerContext.gans?.[2]} ${partnerContext.zhis?.[2]} | ${partnerContext.gans?.[3]} ${partnerContext.zhis?.[3]}
- Nhật Chủ: ${partnerContext.gans?.[2]}
` : ''}

## THÔNG TIN LÁ SỐ BÁT TỰ
- Tên: ${basicInfo.ten || 'Mệnh chủ'}
- Giới tính: ${basicInfo.gioi_tinh || 'Nam'}
- Ngày sinh DL: ${basicInfo.ngay_sinh_duong || 'N/A'}
- Ngày sinh ÂL: ${basicInfo.ngay_sinh_am || 'N/A'}
- Giờ sinh: ${basicInfo.gio_sinh || 'N/A'}
- Mệnh: ${basicInfo.menh || 'N/A'}

Bát Tự tóm tắt: ${pillarsSimple}
${pillarsDetailedInfo}

Phân tích Cách Cục: ${godInfo}
Vận hạn hiện tại: ${luckInfo}

---
## CÂU HỎI
"${questionText}"

Hãy trả lời theo phong cách ${personaId === 'menh_meo' ? 'Thầy Mệnh Mèo GenZ' : 'Thầy Huyền Cơ Bát Tự'}.
Đưa ra 3-5 đoạn ngắn gọn, súc tích. CUỐI CÙNG thêm phần [FOLLOW_UP] với 3-5 câu hỏi gợi mở.`;
}

// ─── Public API (same interface as openrouter.service.js) ──────────────────────

const groqService = {

    async generateAnswer(baziContext, luckCyclesData, questionText, personaId = 'huyen_co', partnerContext = null) {
        const systemPrompt = buildSystemPrompt(personaId);
        const userPrompt = buildUserPrompt(baziContext, luckCyclesData, questionText, personaId, partnerContext);

        const content = await callGroqWithRetry(userPrompt, { systemPrompt, maxTokens: 2000 });
        if (!content) return getFallbackResponse(questionText);
        return formatResponse(content);
    },

    async generateCompletion(prompt, personaId = 'huyen_co') {
        const content = await callGroqWithRetry(prompt, { maxTokens: 3000, temperature: 0.75 });
        if (!content) return getComprehensiveFallback(personaId);

        let finalContent = content.trim();
        if (finalContent.startsWith('```')) {
            const lines = finalContent.split('\n');
            if (lines[0].startsWith('```')) lines.shift();
            if (lines[lines.length - 1].startsWith('```')) lines.pop();
            finalContent = lines.join('\n').trim();
        }
        return finalContent;
    },

    async generateMatchingAnswer(person1Ctx, person2Ctx, relationshipType = 'romance', personaId = 'huyen_co') {
        const { getCurrentDaiVan } = require('../bazi/dayun');
        const now = new Date();
        const currentYear = now.getFullYear();
        const age1 = currentYear - person1Ctx.solar?.getYear?.() + 1;
        const age2 = currentYear - person2Ctx.solar?.getYear?.() + 1;
        const dv1 = getCurrentDaiVan(person1Ctx.dai_van || [], age1);
        const dv2 = getCurrentDaiVan(person2Ctx.dai_van || [], age2);

        const relMapping = {
            romance: 'Tình duyên / Hôn nhân', friendship: 'Bạn bè',
            parent_child: 'Cha mẹ - Con cái', siblings: 'Anh chị em',
            business: 'Đối tác kinh doanh', colleague: 'Đồng nghiệp',
            teacher_student: 'Thầy trò', spiritual: 'Đạo hữu / Tâm linh',
            rival: 'Đối thủ / Cạnh tranh', boss_employee: 'Cấp trên - Cấp dưới'
        };
        const relationshipVN = relMapping[relationshipType] || relationshipType;

        const systemPrompt = `Bạn là chuyên gia Bát Tự phân tích độ tương hợp giữa hai người.
BẠN PHẢI TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON (không kèm văn bản khác) theo cấu trúc:
{
  "totalScore": number (0-100),
  "assessment": { "level": "excellent"|"good"|"neutral"|"challenging"|"difficult", "title": string, "summary": string, "icon": string },
  "breakdown": {
    "element": { "score": number (max 30), "maxScore": 30, "description": string, "quality": string },
    "ganzhi": { "score": number (max 25), "maxScore": 25, "details": [{ "type": "positive"|"negative", "text": string }], "quality": string },
    "shishen": { "score": number (max 25), "maxScore": 25, "details": [{ "type": "positive"|"negative", "text": string }], "quality": string },
    "star": { "score": number (max 20), "maxScore": 20, "details": [{ "type": "positive"|"negative", "text": string }], "quality": string }
  },
  "aspects": [
    { "type": string, "icon": string, "title": string, "score": number (0-100), "description": string }
  ],
  "advice": [{ "type": "positive"|"neutral"|"warning"|"tip", "text": string }],
  "suggestedQuestions": [string]
}`;

        const userPrompt = `Phân tích mối quan hệ "${relationshipVN}" giữa:

NGƯỜI 1 (${person1Ctx.isFemale ? 'Nữ' : 'Nam'}):
- Bát Tự: ${person1Ctx.gans?.[0]} ${person1Ctx.zhis?.[0]} | ${person1Ctx.gans?.[1]} ${person1Ctx.zhis?.[1]} | ${person1Ctx.gans?.[2]} ${person1Ctx.zhis?.[2]} | ${person1Ctx.gans?.[3]} ${person1Ctx.zhis?.[3]}
- Nhật Chủ: ${person1Ctx.gans?.[2]}
- Thập Thần: ${person1Ctx.ganShens?.join(', ')}
- Đại Vận: ${dv1 ? `${dv1.can_chi} (${dv1.thap_than})` : 'N/A'}

NGƯỜI 2 (${person2Ctx.isFemale ? 'Nữ' : 'Nam'}):
- Bát Tự: ${person2Ctx.gans?.[0]} ${person2Ctx.zhis?.[0]} | ${person2Ctx.gans?.[1]} ${person2Ctx.zhis?.[1]} | ${person2Ctx.gans?.[2]} ${person2Ctx.zhis?.[2]} | ${person2Ctx.gans?.[3]} ${person2Ctx.zhis?.[3]}
- Nhật Chủ: ${person2Ctx.gans?.[2]}
- Thập Thần: ${person2Ctx.ganShens?.join(', ')}
- Đại Vận: ${dv2 ? `${dv2.can_chi} (${dv2.thap_than})` : 'N/A'}

Trả về JSON hợp lệ duy nhất, không thêm bất kỳ văn bản nào ngoài JSON.`;

        const content = await callGroqWithRetry(userPrompt, { systemPrompt, maxTokens: 2000, jsonMode: true });
        if (!content) return getMatchingFallback();

        try {
            // Strip possible markdown fences
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

module.exports = groqService;
