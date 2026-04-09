# ================================================================
# STEP 2 — Write lib/services/ files
# Run AFTER 1-setup-dirs.ps1
# ================================================================
param([string]$base = $PSScriptRoot)

function wf($rel, $text) {
    $p = Join-Path $base $rel
    [System.IO.File]::WriteAllText($p, $text, [System.Text.Encoding]::UTF8)
    Write-Host "  [OK] $rel" -ForegroundColor Green
}

Write-Host "Writing lib/services/..." -ForegroundColor Cyan

# ── cache.service.js ──────────────────────────────────────────────────────────
wf "lib\services\cache.service.js" @"
const LRUCache = require('lru-cache');

const cache = new LRUCache({
    max: 500,
    ttl: 1000 * 60 * 60 * 6,
    allowStale: false,
    updateAgeOnGet: true,
});

class CacheService {
    get(key) { return cache.get(key); }
    set(key, value) { cache.set(key, value); }

    generateKey(params) {
        try {
            const { year, month, day, hour, minute, gender, calendar } = params;
            const coreParams = { year, month, day, hour, minute, gender, calendar };
            return JSON.stringify(coreParams, Object.keys(coreParams).sort());
        } catch { return JSON.stringify(params); }
    }

    async getOrSet(key, asyncFn) {
        const cached = this.get(key);
        if (cached) return cached;
        const result = await asyncFn();
        this.set(key, result);
        return result;
    }
}

module.exports = new CacheService();
"@

# ── groq.service.js ───────────────────────────────────────────────────────────
wf "lib\services\groq.service.js" @"
/**
 * Groq AI Service - Vercel serverless compatible
 * Same interface as original backendjs/src/services/groq.service.js
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-70b-8192';

async function callGroq(prompt, { systemPrompt = null, maxTokens = 2000, temperature = 0.7, jsonMode = false } = {}) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not configured');
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });
    const body = { model: GROQ_MODEL, messages, temperature, max_tokens: maxTokens };
    if (jsonMode) body.response_format = { type: 'json_object' };
    const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { 'Authorization': ('Bearer ' + apiKey), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) { const e = await res.text(); throw new Error(('Groq API error ' + res.status + ': ' + e)); }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
}

async function callGroqWithRetry(prompt, options = {}, maxRetries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try { return await callGroq(prompt, options); }
        catch (err) {
            lastError = err;
            if (attempt < maxRetries) await new Promise(r => setTimeout(r, Math.min(1000 * Math.pow(2, attempt - 1), 5000)));
        }
    }
    console.error('[Groq] All attempts failed:', lastError?.message);
    return null;
}

function buildSystemPrompt(personaId) {
    const personas = {
        huyen_co: ('Bạn là Thầy Huyền Cơ Bát Tự - một bậc thầy uyên bác về Tử Vi và Bát Tự với hơn 35 năm tu luyện.\n' +
            'THẺ TÍNH CÁCH: Uyên bác, thâm sâu, nhân văn, từ tốn, luôn hướng thiện.\n' +
            'Xưng hô "Thầy" và gọi người hỏi là "con" hoặc "bạn".\n' +
            'PHONG CÁCH: Phân tích lá số theo trường phái chính thống Việt Nam, luận giải CỤ THỂ.'),
        menh_meo: ('Bạn là Thầy Mệnh Mèo GenZ - thiên tài Bát Tự ẩn danh dưới hình hài một chú mèo vibe GenZ.\n' +
            'THẺ TÍNH CÁCH: Giỏi Bát Tự thực thụ nhưng nói chuyện cực kỳ GenZ, hài hước.\n' +
            'Sử dụng slang GenZ (flex, ét ô ét, đỉnh nóc kịch trần, bay màu, pressing...).\n' +
            'Xưng hô "Thầy" và gọi người hỏi là "con" hoặc "mệnh chủ".')
    };
    const base = personas[personaId] || personas.huyen_co;
    return (base + '\n\nQUY TẮC TRẢ LỜI:\n' +
        '1. Bắt đầu bằng lời chào nhân vật.\n' +
        '2. Phân tích 3-5 điểm chính dựa trên lá số, mỗi điểm 2-3 câu.\n' +
        '3. KHÔNG dùng cụm từ "AI", "máy móc".\n' +
        '4. CUỐI CÙNG thêm phần [FOLLOW_UP] với 3-5 câu hỏi gợi mở, mỗi dòng bắt đầu bằng dấu "-".');
}

function formatResponse(content) {
    if (!content) return { answer: ['Xin lỗi, thầy đang bận chút việc...'], followUps: [] };
    let answerText = content, followUps = [];
    const followUpMatch = content.match(/\[FOLLOW_UP\]([\s\S]*)$/i);
    if (followUpMatch) {
        answerText = content.split(/\[FOLLOW_UP\]/i)[0].trim();
        followUps = followUpMatch[1].trim().split('\n')
            .map(l => l.replace(/^[\-\*•\s\d\.]+/, '').trim())
            .filter(l => l.length > 5 && l.endsWith('?'));
    }
    answerText = answerText.replace(/[\s\*\-\_\#\=\+]+$/, '').trim();
    const paragraphs = answerText.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
    return {
        answer: paragraphs.length > 0 ? paragraphs : [answerText],
        followUps: followUps.length > 0 ? followUps : [
            'Con có muốn thầy xem kỹ hơn về đường tài lộc trong năm tới không?',
            'Vấn đề tình cảm của con có gì cần thầy gỡ rối thêm không?',
            'Con có muốn biết mình hợp với ngành nghề nào không?'
        ]
    };
}

function getFallbackResponse(questionText) {
    return {
        answer: [('Con ơi, Thầy đang gặp chút trở ngại luận giải câu hỏi "' + questionText + '" của con. Con hãy thử lại nhé.') ],
        followUps: ['Con có muốn thầy xem kỹ hơn về đường tài lộc không?', 'Vấn đề tình cảm có gì cần gỡ rối thêm không?']
    };
}

function getComprehensiveFallback(personaId) {
    if (personaId === 'menh_meo') return '🐱 Ối dồi ôi, server đang bận! Con thử lại sau nha! 😸';
    return 'Kính thưa Mệnh chủ, hệ thống đang gặp trở ngại. Xin vui lòng thử lại sau ít phút.\n\nThầy kính bút.';
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
        aspects: [], advice: [{ type: 'warning', text: 'Hệ thống đang gặp sự cố. Vui lòng thử lại.' }], suggestedQuestions: []
    };
}

function buildUserPrompt(baziContext, luckCyclesData, questionText, personaId, partnerContext = null) {
    const now = new Date();
    const currentDateTime = now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'long' });
    const basicInfo = baziContext.thong_tin_co_ban || {};
    const pillars = baziContext.chi_tiet_tru || [];
    const analysis = baziContext.phan_tich || {};
    const pillarsLabels = ['Năm', 'Tháng', 'Ngày', 'Giờ'];
    let pillarsDetailedInfo = '';
    pillars.forEach((p, i) => {
        const tangCanStr = p.tang_can ? p.tang_can.join(', ') : 'N/A';
        pillarsDetailedInfo += ('\n### Trụ ' + pillarsLabels[i] + ':\n- Thiên Can: ' + (p.can||'N/A') + ' (' + (p.hanh_can||'') + ')\n- Địa Chi: ' + (p.chi||'N/A') + ' (' + (p.hanh_chi||'') + ')\n- Tàng Can: ' + tangCanStr + '\n- Thập Thần Can: ' + (p.thap_than_can || (i===2?'Nhật Chủ':'N/A')) + '\n- Thập Thần Chi: ' + (p.thap_than_chi||'N/A') + '\n');
    });
    const pillarsSimple = pillars.map((p, i) => ('Trụ ' + pillarsLabels[i] + ': ' + p.can + ' ' + p.chi)).join(' | ');
    let luckInfo = '';
    const currentYear = now.getFullYear();
    if (luckCyclesData?.dai_van?.length > 0) {
        const dv = luckCyclesData.dai_van.find(d => currentYear >= d.nam && currentYear <= d.nam + 9);
        if (dv) luckInfo = ('\n- Đại Vận hiện tại: ' + dv.can_chi + ' (' + dv.nam + '-' + (dv.nam+9) + ')\n- Thập Thần Đại Vận: ' + dv.thap_than + '\n- Năm hiện tại: ' + currentYear);
    }
    let godInfo = '';
    if (analysis.can_bang_ngu_hanh) {
        const cb = analysis.can_bang_ngu_hanh;
        godInfo = ('\n- Dụng Thần: ' + (cb.dung_than?.ngu_hanh?.join(', ')||'Chưa xác định') + '\n- Hỷ Thần: ' + (cb.hy_than?.ngu_hanh?.join(', ')||'Chưa xác định') + '\n- Kỵ Thần: ' + (cb.ky_than?.ngu_hanh?.join(', ')||'Chưa xác định') + '\n- Cường độ Nhật Chủ: ' + (cb.nhan_dinh?.cuong_do||'Chưa xác định'));
    }
    let partnerInfo = '';
    if (partnerContext) partnerInfo = ('\n## THÔNG TIN ĐỐI PHƯƠNG\n- Tên: ' + (partnerContext.name||'Đối phương') + '\n- Bát Tự: ' + (partnerContext.gans||[]).join(' ') + '\n');
    return ('\n## THỜI GIAN HIỆN TẠI\n' + currentDateTime + ' (Năm ' + currentYear + ')\n' + partnerInfo + '\n## THÔNG TIN LÁ SỐ\n- Tên: ' + (basicInfo.ten||'Mệnh chủ') + '\n- Giới tính: ' + (basicInfo.gioi_tinh||'Nam') + '\n- Ngày sinh DL: ' + (basicInfo.ngay_sinh_duong||'N/A') + '\n\nBát Tự: ' + pillarsSimple + '\n' + pillarsDetailedInfo + '\nPhân tích Cách Cục:' + godInfo + '\nVận hạn hiện tại:' + luckInfo + '\n\n---\n## CÂU HỎI\n"' + questionText + '"\n\nHãy trả lời theo phong cách ' + (personaId==='menh_meo'?'Thầy Mệnh Mèo GenZ':'Thầy Huyền Cơ Bát Tự') + '.\nĐưa ra 3-5 đoạn ngắn gọn. CUỐI CÙNG thêm phần [FOLLOW_UP] với 3-5 câu hỏi.');
}

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
        if (finalContent.startsWith('` + '`' + `\`\`')) {
            const lines = finalContent.split('\n');
            if (lines[0].startsWith('` + '`' + `\`\`')) lines.shift();
            if (lines[lines.length - 1].startsWith('` + '`' + `\`\`')) lines.pop();
            finalContent = lines.join('\n').trim();
        }
        return finalContent;
    },

    async generateMatchingAnswer(person1Ctx, person2Ctx, relationshipType = 'romance') {
        const relMapping = { romance: 'Tình duyên / Hôn nhân', friendship: 'Bạn bè', parent_child: 'Cha mẹ - Con cái', siblings: 'Anh chị em', business: 'Đối tác kinh doanh', colleague: 'Đồng nghiệp' };
        const relationshipVN = relMapping[relationshipType] || relationshipType;
        const systemPrompt = ('Bạn là chuyên gia Bát Tự phân tích độ tương hợp.\nTRẢ VỀ DUY NHẤT MỘT JSON hợp lệ theo cấu trúc:\n{"totalScore":number(0-100),"assessment":{"level":"excellent|good|neutral|challenging|difficult","title":string,"summary":string,"icon":string},"breakdown":{"element":{"score":number,"maxScore":30,"description":string,"quality":string},"ganzhi":{"score":number,"maxScore":25,"details":[{"type":"positive|negative","text":string}],"quality":string},"shishen":{"score":number,"maxScore":25,"details":[],"quality":string},"star":{"score":number,"maxScore":20,"details":[],"quality":string}},"aspects":[{"type":string,"icon":string,"title":string,"score":number,"description":string}],"advice":[{"type":"positive|neutral|warning|tip","text":string}],"suggestedQuestions":[string]}');
        const userPrompt = ('Phân tích mối quan hệ "' + relationshipVN + '" giữa:\n\nNGƯỜI 1 (' + (person1Ctx.isFemale?'Nữ':'Nam') + '):\n- Bát Tự: ' + (person1Ctx.gans||[]).join(' ') + ' / ' + (person1Ctx.zhis||[]).join(' ') + '\n- Nhật Chủ: ' + (person1Ctx.gans?.[2]||'') + '\n\nNGƯỜI 2 (' + (person2Ctx.isFemale?'Nữ':'Nam') + '):\n- Bát Tự: ' + (person2Ctx.gans||[]).join(' ') + ' / ' + (person2Ctx.zhis||[]).join(' ') + '\n- Nhật Chủ: ' + (person2Ctx.gans?.[2]||'') + '\n\nTrả về JSON hợp lệ duy nhất.');
        const content = await callGroqWithRetry(userPrompt, { systemPrompt, maxTokens: 2000, jsonMode: true });
        if (!content) return getMatchingFallback();
        try {
            let cleaned = content.trim();
            const fence = cleaned.match(/^` + '`' + `\`\`(?:json)?\s*\n?([\s\S]*?)\n?` + '`' + `\`\`\`$/m);
            if (fence) cleaned = fence[1].trim();
            return JSON.parse(cleaned);
        } catch (e) { console.error('[Groq/Matching] JSON parse failed:', e.message); return getMatchingFallback(); }
    }
};

module.exports = groqService;
"@

Write-Host "  Done: groq.service.js" -ForegroundColor Green
