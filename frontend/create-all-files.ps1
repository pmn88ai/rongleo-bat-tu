# create-all-files.ps1
# Script tạo TOÀN BỘ files cho migration Vercel
# Chạy từ: tinix-bazi-main\tinix-bazi-main\frontend\
# PowerShell 5+ required

param([string]$base = $PSScriptRoot)

function Write-FileContent($relativePath, $content) {
    $fullPath = Join-Path $base $relativePath
    $dir = Split-Path $fullPath -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "  [OK] $relativePath" -ForegroundColor Green
}

Write-Host "=== Step 1: Copy bazi engine ===" -ForegroundColor Cyan
$baziSrc = Join-Path $base "..\backendjs\src\bazi"
$baziDst = Join-Path $base "lib\bazi"
if (Test-Path $baziSrc) {
    Copy-Item -Recurse -Force $baziSrc $baziDst
    Write-Host "  [OK] lib/bazi/ copied" -ForegroundColor Green
} else {
    Write-Host "  [WARN] backendjs/src/bazi not found at $baziSrc" -ForegroundColor Yellow
}

$utilsSrc = Join-Path $base "..\backendjs\src\utils"
$utilsDst = Join-Path $base "lib\utils"
if (Test-Path $utilsSrc) {
    if (-not (Test-Path $utilsDst)) { New-Item -ItemType Directory -Path $utilsDst -Force | Out-Null }
    Copy-Item -Force (Join-Path $utilsSrc "dateUtils.js") $utilsDst
    $randomPath = Join-Path $utilsSrc "random.js"
    if (Test-Path $randomPath) { Copy-Item -Force $randomPath $utilsDst }
    Write-Host "  [OK] lib/utils/ copied" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Step 2: Writing service files ===" -ForegroundColor Cyan

# ─── lib/services/groq.service.js ─────────────────────────────────────────────
Write-FileContent "lib\services\groq.service.js" @'
/**
 * Groq AI Service — Vercel-compatible (no Express dependency)
 * Same function signatures as original backendjs/src/services/groq.service.js
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama3-70b-8192";

async function callGroq(prompt, { systemPrompt = null, maxTokens = 2000, temperature = 0.7, jsonMode = false } = {}) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });

    const body = { model: GROQ_MODEL, messages, temperature, max_tokens: maxTokens };
    if (jsonMode) body.response_format = { type: "json_object" };

    const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
}

async function callGroqWithRetry(prompt, options = {}, maxRetries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await callGroq(prompt, options);
        } catch (err) {
            lastError = err;
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, Math.min(1000 * Math.pow(2, attempt - 1), 5000)));
            }
        }
    }
    console.error("[Groq] All attempts failed:", lastError?.message);
    return null;
}

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

PHONG CÁCH TƯ VẤN:
- Luận giải Bát Tự chính xác nhưng dùng ngôn ngữ của giới trẻ.
- Ví von các khái niệm tử vi với đời sống hiện đại.`
    };

    const base = personas[personaId] || personas.huyen_co;
    return `${base}

QUY TẮC TRẢ LỜI:
1. Bắt đầu bằng lời chào nhân vật.
2. Phân tích 3-5 điểm chính dựa trên lá số, mỗi điểm 2-3 câu.
3. KHÔNG dùng cụm từ "AI", "máy móc".
4. Ở cuối cùng, luôn cung cấp một phần có tiêu đề [FOLLOW_UP] chứa 3-5 câu hỏi gợi mở dựa trên lá số và đại vận của người dùng.
5. Mỗi câu hỏi gợi mở phải là một dòng bắt đầu bằng dấu "-". Những câu hỏi này phải thực sự liên quan đến rủi ro hoặc cơ hội sắp tới của chủ mệnh.`;
}

function formatResponse(content) {
    if (!content) return { answer: ["Xin lỗi, thầy đang bận chút việc..."], followUps: [] };

    let answerText = content;
    let followUps = [];

    const followUpMatch = content.match(/\[FOLLOW_UP\]([\s\S]*)$/i);
    if (followUpMatch) {
        answerText = content.split(/\[FOLLOW_UP\]/i)[0].trim();
        followUps = followUpMatch[1].trim()
            .split("\n")
            .map(line => line.replace(/^[\-\*•\s\d\.]+/, "").trim())
            .filter(line => line.length > 5 && line.endsWith("?"));
    }

    answerText = answerText.replace(/[\s\*\-\_\#\=\+]+$/, "").trim();
    const paragraphs = answerText.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);

    return {
        answer: paragraphs.length > 0 ? paragraphs : [answerText],
        followUps: followUps.length > 0 ? followUps : [
            "Con có muốn thầy xem kỹ hơn về đường tài lộc trong năm tới không?",
            "Vấn đề tình cảm của con có gì cần thầy gỡ rối thêm không?",
            "Con có muốn biết mình hợp với ngành nghề nào để phát tài nhanh nhất không?"
        ]
    };
}

function getFallbackResponse(questionText) {
    return {
        answer: [
            `Con ơi, Thầy đang gặp chút trở ngại trong việc kết nối nguồn năng lượng để luận giải câu hỏi "${questionText}" của con.`,
            "Con hãy kiên nhẫn chờ ít phút rồi thử lại nhé. Duyên đến thì mọi sự sẽ sáng tỏ.",
        ],
        followUps: [
            "Con có muốn thầy xem kỹ hơn về đường tài lộc trong năm tới không?",
            "Vấn đề tình cảm của con có gì cần thầy gỡ rối thêm không?",
        ]
    };
}

function getComprehensiveFallback(personaId) {
    if (personaId === "menh_meo") {
        return "🐱 Ối dồi ôi, server đang bận lắm nè con ơi!\n\nThầy Mèo đang chill một chút, con thử lại sau nha! 😸";
    }
    return "Kính thưa Mệnh chủ,\n\nHệ thống đang gặp một chút trở ngại. Xin Mệnh chủ vui lòng thử lại sau ít phút.\n\nThầy kính bút.";
}

function getMatchingFallback() {
    return {
        totalScore: 50,
        assessment: { level: "neutral", title: "Lỗi kết nối", summary: "Vui lòng thử lại sau.", icon: "⚠️" },
        breakdown: {
            element: { score: 15, maxScore: 30, description: "Không thể phân tích", quality: "neutral" },
            ganzhi: { score: 12, maxScore: 25, details: [], quality: "neutral" },
            shishen: { score: 12, maxScore: 25, details: [], quality: "neutral" },
            star: { score: 10, maxScore: 20, details: [], quality: "neutral" }
        },
        aspects: [],
        advice: [{ type: "warning", text: "Hệ thống đang gặp sự cố. Vui lòng thử lại." }],
        suggestedQuestions: []
    };
}

function buildUserPrompt(baziContext, luckCyclesData, questionText, personaId, partnerContext = null) {
    const now = new Date();
    const currentDateTime = now.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", weekday: "long"
    });

    const basicInfo = baziContext.thong_tin_co_ban || {};
    const pillars = baziContext.chi_tiet_tru || [];
    const analysis = baziContext.phan_tich || {};
    const pillarsLabels = ["Năm", "Tháng", "Ngày", "Giờ"];

    let pillarsDetailedInfo = "";
    pillars.forEach((p, i) => {
        const tangCanStr = p.tang_can ? p.tang_can.join(", ") : "N/A";
        pillarsDetailedInfo += `
### Trụ ${pillarsLabels[i]}:
- Thiên Can: ${p.can || "N/A"} (${p.hanh_can || ""})
- Địa Chi: ${p.chi || "N/A"} (${p.hanh_chi || ""})
- Tàng Can: ${tangCanStr}
- Thập Thần Can: ${p.thap_than_can || (i === 2 ? "Nhật Chủ" : "N/A")}
- Thập Thần Chi: ${p.thap_than_chi || "N/A"}
`;
    });

    const pillarsSimple = pillars.map((p, i) => `Trụ ${pillarsLabels[i]}: ${p.can} ${p.chi}`).join(" | ");

    let luckInfo = "";
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

    let godInfo = "";
    if (analysis.can_bang_ngu_hanh) {
        const cb = analysis.can_bang_ngu_hanh;
        godInfo = `
- Dụng Thần: ${cb.dung_than?.ngu_hanh?.join(", ") || "Chưa xác định"}
- Hỷ Thần: ${cb.hy_than?.ngu_hanh?.join(", ") || "Chưa xác định"}
- Kỵ Thần: ${cb.ky_than?.ngu_hanh?.join(", ") || "Chưa xác định"}
- Cường độ Nhật Chủ: ${cb.nhan_dinh?.cuong_do || "Chưa xác định"}`;
    }

    return `
## THỜI GIAN HIỆN TẠI
${currentDateTime} (Năm ${currentYear})

${partnerContext ? `
## THÔNG TIN ĐỐI PHƯƠNG
- Tên: ${partnerContext.name || "Đối phương"}
- Bát Tự: ${partnerContext.gans?.[0]} ${partnerContext.zhis?.[0]} | ${partnerContext.gans?.[1]} ${partnerContext.zhis?.[1]} | ${partnerContext.gans?.[2]} ${partnerContext.zhis?.[2]} | ${partnerContext.gans?.[3]} ${partnerContext.zhis?.[3]}
` : ""}

## THÔNG TIN LÁ SỐ BÁT TỰ
- Tên: ${basicInfo.ten || "Mệnh chủ"}
- Giới tính: ${basicInfo.gioi_tinh || "Nam"}
- Ngày sinh DL: ${basicInfo.ngay_sinh_duong || "N/A"}
- Ngày sinh ÂL: ${basicInfo.ngay_sinh_am || "N/A"}
- Mệnh: ${basicInfo.menh || "N/A"}

Bát Tự tóm tắt: ${pillarsSimple}
${pillarsDetailedInfo}

Phân tích Cách Cục: ${godInfo}
Vận hạn hiện tại: ${luckInfo}

---
## CÂU HỎI
"${questionText}"

Hãy trả lời theo phong cách ${personaId === "menh_meo" ? "Thầy Mệnh Mèo GenZ" : "Thầy Huyền Cơ Bát Tự"}.
Đưa ra 3-5 đoạn ngắn gọn, súc tích. CUỐI CÙNG thêm phần [FOLLOW_UP] với 3-5 câu hỏi gợi mở.`;
}

const groqService = {
    async generateAnswer(baziContext, luckCyclesData, questionText, personaId = "huyen_co", partnerContext = null) {
        const systemPrompt = buildSystemPrompt(personaId);
        const userPrompt = buildUserPrompt(baziContext, luckCyclesData, questionText, personaId, partnerContext);
        const content = await callGroqWithRetry(userPrompt, { systemPrompt, maxTokens: 2000 });
        if (!content) return getFallbackResponse(questionText);
        return formatResponse(content);
    },

    async generateCompletion(prompt, personaId = "huyen_co") {
        const content = await callGroqWithRetry(prompt, { maxTokens: 3000, temperature: 0.75 });
        if (!content) return getComprehensiveFallback(personaId);
        let finalContent = content.trim();
        if (finalContent.startsWith("```")) {
            const lines = finalContent.split("\n");
            if (lines[0].startsWith("```")) lines.shift();
            if (lines[lines.length - 1].startsWith("```")) lines.pop();
            finalContent = lines.join("\n").trim();
        }
        return finalContent;
    },

    async generateMatchingAnswer(person1Ctx, person2Ctx, relationshipType = "romance", personaId = "huyen_co") {
        const relMapping = {
            romance: "Tình duyên / Hôn nhân", friendship: "Bạn bè",
            parent_child: "Cha mẹ - Con cái", siblings: "Anh chị em",
            business: "Đối tác kinh doanh", colleague: "Đồng nghiệp",
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
  "aspects": [{ "type": string, "icon": string, "title": string, "score": number (0-100), "description": string }],
  "advice": [{ "type": "positive"|"neutral"|"warning"|"tip", "text": string }],
  "suggestedQuestions": [string]
}`;

        const userPrompt = `Phân tích mối quan hệ "${relationshipVN}" giữa:

NGƯỜI 1 (${person1Ctx.isFemale ? "Nữ" : "Nam"}):
- Bát Tự: ${person1Ctx.gans?.[0]} ${person1Ctx.zhis?.[0]} | ${person1Ctx.gans?.[1]} ${person1Ctx.zhis?.[1]} | ${person1Ctx.gans?.[2]} ${person1Ctx.zhis?.[2]} | ${person1Ctx.gans?.[3]} ${person1Ctx.zhis?.[3]}
- Nhật Chủ: ${person1Ctx.gans?.[2]}
- Thập Thần: ${person1Ctx.ganShens?.join(", ")}

NGƯỜI 2 (${person2Ctx.isFemale ? "Nữ" : "Nam"}):
- Bát Tự: ${person2Ctx.gans?.[0]} ${person2Ctx.zhis?.[0]} | ${person2Ctx.gans?.[1]} ${person2Ctx.zhis?.[1]} | ${person2Ctx.gans?.[2]} ${person2Ctx.zhis?.[2]} | ${person2Ctx.gans?.[3]} ${person2Ctx.zhis?.[3]}
- Nhật Chủ: ${person2Ctx.gans?.[2]}
- Thập Thần: ${person2Ctx.ganShens?.join(", ")}

Trả về JSON hợp lệ duy nhất, không thêm bất kỳ văn bản nào ngoài JSON.`;

        const content = await callGroqWithRetry(userPrompt, { systemPrompt, maxTokens: 2000, jsonMode: true });
        if (!content) return getMatchingFallback();

        try {
            let cleaned = content.trim();
            const fence = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/m);
            if (fence) cleaned = fence[1].trim();
            return JSON.parse(cleaned);
        } catch (e) {
            console.error("[Groq/Matching] JSON parse failed:", e.message);
            return getMatchingFallback();
        }
    }
};

module.exports = groqService;
'@

# ─── lib/services/database.service.js ────────────────────────────────────────
Write-FileContent "lib\services\database.service.js" @'
/**
 * Supabase Database Service
 * Replaces SQLite database.service.js — same method signatures
 */

const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set");
    return createClient(url, key);
}

class DatabaseService {
    // ─── Customers ─────────────────────────────────────────────────────────────

    async findOrCreateCustomer({ name, year, month, day, hour, minute, gender, calendar }) {
        const sb = getSupabase();
        const h = hour ?? 12, m = minute ?? 0;

        const { data: existing } = await sb.from("customers").select("id")
            .eq("year", year).eq("month", month).eq("day", day).eq("hour", h).eq("minute", m)
            .limit(1).maybeSingle();

        if (existing) {
            if (name) await sb.from("customers").update({ name, updated_at: new Date().toISOString() }).eq("id", existing.id);
            return existing.id;
        }

        const { data, error } = await sb.from("customers").insert({
            name: name || "Mệnh chủ", year, month, day, hour: h, minute: m,
            gender: gender || "Nam", calendar: calendar || "solar"
        }).select("id").single();

        if (error) throw error;
        return data.id;
    }

    async createNewCustomer({ name, year, month, day, hour, minute, gender, calendar }) {
        const sb = getSupabase();
        const { data, error } = await sb.from("customers").insert({
            name: name || "Mệnh chủ", year, month, day,
            hour: hour ?? 12, minute: minute ?? 0,
            gender: gender || "Nam", calendar: calendar || "solar"
        }).select("id").single();
        if (error) throw error;
        return data.id;
    }

    async getCustomer(customerId) {
        const sb = getSupabase();
        const { data } = await sb.from("customers").select("*").eq("id", customerId).maybeSingle();
        return data;
    }

    async getAllCustomers(limit = 100) {
        const sb = getSupabase();
        const { data } = await sb.from("customers").select("*").order("updated_at", { ascending: false }).limit(limit);
        return data || [];
    }

    async getRecentCustomersWithQuestions(limit = 10) {
        const sb = getSupabase();
        const { data } = await sb.from("consultations").select(`
            customer_id, question_text, created_at,
            customers(id, name, year, month, day, hour, minute, gender)
        `).order("created_at", { ascending: false }).limit(limit * 3);

        if (!data) return [];
        const seen = new Set();
        const result = [];
        for (const row of data) {
            if (!row.customers || seen.has(row.customer_id)) continue;
            seen.add(row.customer_id);
            result.push({
                ...row.customers,
                last_question: row.question_text,
                consultation_time: row.created_at,
                last_activity: row.created_at
            });
            if (result.length >= limit) break;
        }
        return result;
    }

    async getCustomersWithPagination(page = 1, limit = 20, search = "") {
        const sb = getSupabase();
        const offset = (page - 1) * limit;
        let query = sb.from("customers").select("*", { count: "exact" });
        if (search) query = query.ilike("name", `%${search}%`);
        const { data, count } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
        return { customers: data || [], total: count || 0, page, limit };
    }

    async getCustomerWithConsultations(customerId) {
        const customer = await this.getCustomer(customerId);
        if (!customer) return null;
        const history = await this.getCustomerHistory(customerId);
        return { ...customer, consultations: history };
    }

    // ─── Consultations ──────────────────────────────────────────────────────────

    async saveConsultation(customerId, themeId, questionId, questionText, answer, useAI = true, creditsUsed = 0, userId = null, persona = "huyen_co", followUps = [], extraData = {}) {
        const sb = getSupabase();
        const answerJson = (typeof answer === "object" && answer !== null) ? JSON.stringify(answer) : answer;
        const { data, error } = await sb.from("consultations").insert({
            customer_id: customerId,
            theme_id: themeId || "",
            question_id: questionId,
            question_text: questionText || "",
            answer: answerJson || "",
            use_ai: useAI,
            credits_used: creditsUsed,
            user_id: userId,
            persona,
            follow_ups: JSON.stringify(followUps),
            person1_data: extraData.person1 ? JSON.stringify(extraData.person1) : null,
            person2_data: extraData.person2 ? JSON.stringify(extraData.person2) : null,
            metadata: extraData.metadata ? JSON.stringify(extraData.metadata) : null
        }).select("id").single();
        if (error) throw error;
        return data.id;
    }

    async getUserHistory(userId, limit = 20) {
        const sb = getSupabase();
        const { data } = await sb.from("consultations")
            .select("id, question_id, question_text, answer, use_ai, credits_used, created_at, persona, follow_ups, person1_data, person2_data, metadata")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(limit);

        return (data || []).map(row => {
            try { row.answer = JSON.parse(row.answer || "[]"); } catch {}
            try { row.follow_ups = JSON.parse(row.follow_ups || "[]"); } catch {}
            try { row.person1_data = JSON.parse(row.person1_data || "null"); } catch {}
            try { row.person2_data = JSON.parse(row.person2_data || "null"); } catch {}
            try { row.metadata = JSON.parse(row.metadata || "null"); } catch {}
            return row;
        });
    }

    async getCustomerHistory(customerId, limit = 50) {
        const sb = getSupabase();
        const { data } = await sb.from("consultations")
            .select("id, question_id, question_text, answer, use_ai, created_at, persona, follow_ups")
            .eq("customer_id", customerId)
            .order("created_at", { ascending: false })
            .limit(limit);

        return (data || []).map(row => {
            try { row.answer = JSON.parse(row.answer || "[]"); } catch { row.answer = []; }
            return row;
        });
    }

    // ─── Categories & Questions ─────────────────────────────────────────────────

    async getAllCategories() {
        const sb = getSupabase();
        const { data } = await sb.from("question_categories").select("*").order("order_index", { ascending: true });
        return data || [];
    }

    async createCategory({ name, icon, order_index }) {
        const sb = getSupabase();
        const { data, error } = await sb.from("question_categories").insert({ name, icon: icon || "📋", order_index: order_index || 0 }).select("id").single();
        if (error) throw error;
        return data.id;
    }

    async updateCategory(id, { name, icon, order_index, is_active }) {
        const sb = getSupabase();
        await sb.from("question_categories").update({ name, icon: icon || "📋", order_index: order_index || 0, is_active: !!is_active }).eq("id", id);
    }

    async deleteCategory(id) {
        const sb = getSupabase();
        await sb.from("custom_questions").delete().eq("category_id", id);
        await sb.from("question_categories").delete().eq("id", id);
    }

    async getAllQuestions(categoryId = null) {
        const sb = getSupabase();
        let query = sb.from("custom_questions").select("*, question_categories(name)").order("order_index", { ascending: true });
        if (categoryId) query = query.eq("category_id", categoryId);
        const { data } = await query;
        return (data || []).map(q => ({ ...q, category_name: q.question_categories?.name }));
    }

    async createQuestion({ category_id, text, order_index }) {
        const sb = getSupabase();
        const { data, error } = await sb.from("custom_questions").insert({ category_id, text, order_index: order_index || 0 }).select("id").single();
        if (error) throw error;
        return data.id;
    }

    async updateQuestion(id, { category_id, text, order_index, is_active }) {
        const sb = getSupabase();
        await sb.from("custom_questions").update({ category_id, text, order_index: order_index || 0, is_active: !!is_active }).eq("id", id);
    }

    async deleteQuestion(id) {
        const sb = getSupabase();
        await sb.from("custom_questions").delete().eq("id", id);
    }

    // ─── Stats ──────────────────────────────────────────────────────────────────

    async getStats() {
        const sb = getSupabase();
        const today = new Date().toISOString().slice(0, 10);
        const [r1, r2, r3, r4] = await Promise.all([
            sb.from("customers").select("*", { count: "exact", head: true }),
            sb.from("consultations").select("*", { count: "exact", head: true }),
            sb.from("consultations").select("*", { count: "exact", head: true }).eq("use_ai", true),
            sb.from("consultations").select("*", { count: "exact", head: true }).gte("created_at", today)
        ]);
        return { totalCustomers: r1.count || 0, totalConsultations: r2.count || 0, aiConsultations: r3.count || 0, todayConsultations: r4.count || 0 };
    }

    async getDailyConsultationStats() {
        const sb = getSupabase();
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            days.push(d.toISOString().slice(0, 10));
        }
        const results = await Promise.all(days.map(async (date) => {
            const { count } = await sb.from("consultations").select("*", { count: "exact", head: true })
                .gte("created_at", date).lt("created_at", date + "T23:59:59");
            return { date, count: count || 0 };
        }));
        return results;
    }

    async getConsultationByCategoryStats() {
        const sb = getSupabase();
        const { data } = await sb.from("question_categories").select("id, name, icon");
        if (!data) return [];
        const results = await Promise.all(data.map(async cat => {
            const { count } = await sb.from("consultations")
                .select("*", { count: "exact", head: true })
                .eq("theme_id", String(cat.id));
            return { label: cat.name, icon: cat.icon, value: count || 0 };
        }));
        return results;
    }

    // ─── Que ───────────────────────────────────────────────────────────────────

    async getQue(user_id, customer_id, context_id, que_type, period_key) {
        const sb = getSupabase();
        let query = sb.from("consultations").select("*")
            .eq("theme_id", "xin_que")
            .ilike("metadata", `%"contextId":"${context_id}"%`)
            .ilike("metadata", `%"queType":"${que_type}"%`)
            .ilike("metadata", `%"periodKey":"${period_key}"%`);

        if (user_id) query = query.eq("user_id", user_id);
        const { data } = await query.limit(1).maybeSingle();
        if (!data) return null;

        try {
            const meta = JSON.parse(data.metadata || "{}");
            const guaData = meta.gua_data || {};
            if (!guaData.ai_analysis && data.answer) {
                try {
                    const answers = JSON.parse(data.answer);
                    guaData.ai_analysis = Array.isArray(answers) ? answers.join("\n\n") : data.answer;
                } catch { guaData.ai_analysis = data.answer; }
            }
            return { gua_data: guaData, user_note: meta.user_note || "", is_verified: meta.is_verified || false };
        } catch { return null; }
    }

    async getQueHistory(userId, page = 1, limit = 10) {
        const sb = getSupabase();
        const offset = (page - 1) * limit;
        const { count } = await sb.from("consultations").select("*", { count: "exact", head: true })
            .eq("user_id", userId).eq("theme_id", "xin_que");
        const { data } = await sb.from("consultations").select("*")
            .eq("user_id", userId).eq("theme_id", "xin_que")
            .order("created_at", { ascending: false }).range(offset, offset + limit - 1);

        const items = (data || []).map(r => {
            let meta = {};
            try { meta = JSON.parse(r.metadata || "{}"); } catch {}
            return { id: r.id, que_type: meta.queType || r.question_id, period_key: meta.periodKey, gua_name: meta.guaName, gua_number: meta.guaNumber, gua_data: meta.gua_data || {}, created_at: r.created_at, is_verified: meta.is_verified || false, user_note: meta.user_note || "" };
        });

        return { items, meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) } };
    }

    async updateQueNote(id, note, isVerified) {
        const sb = getSupabase();
        const { data } = await sb.from("consultations").select("metadata").eq("id", id).maybeSingle();
        if (!data) return;
        try {
            const meta = JSON.parse(data.metadata || "{}");
            meta.user_note = note;
            meta.is_verified = isVerified;
            await sb.from("consultations").update({ metadata: JSON.stringify(meta) }).eq("id", id);
        } catch (e) { console.error("[DB] updateQueNote error:", e.message); }
    }

    async getQueTimeline(userId, type, limit) {
        const sb = getSupabase();
        const { data } = await sb.from("consultations")
            .select("id, answer, metadata, created_at")
            .eq("user_id", userId).eq("theme_id", "xin_que")
            .ilike("metadata", `%"queType":"${type}"%`)
            .order("created_at", { ascending: false }).limit(limit);
        return data || [];
    }

    // ─── Access Logs ────────────────────────────────────────────────────────────

    saveAccessLog({ ip, method, path, statusCode, userAgent, userId, userEmail, responseTime }) {
        const sb = getSupabase();
        sb.from("access_logs").insert({
            ip, method, path, status_code: statusCode, user_agent: userAgent || "",
            user_id: userId || null, user_email: userEmail || null, response_time: responseTime || 0
        }).then(({ error }) => { if (error) console.error("[DB] saveAccessLog:", error.message); });
    }

    async getAccessLogs(page = 1, limit = 50, filters = {}) {
        const sb = getSupabase();
        const offset = (page - 1) * limit;
        let query = sb.from("access_logs").select("*", { count: "exact" });
        if (filters.ip) query = query.ilike("ip", `%${filters.ip}%`);
        if (filters.path) query = query.ilike("path", `%${filters.path}%`);
        if (filters.method) query = query.eq("method", filters.method);
        if (filters.date) query = query.gte("created_at", filters.date).lt("created_at", filters.date + "T23:59:59");
        const { data, count } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
        return { items: data || [], meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) } };
    }

    async getAccessStats() {
        const sb = getSupabase();
        const today = new Date().toISOString().slice(0, 10);
        const { count } = await sb.from("access_logs").select("*", { count: "exact", head: true }).gte("created_at", today);
        return { today: { totalRequests: count || 0 } };
    }

    // ─── Compat shims ───────────────────────────────────────────────────────────

    async get(sql) {
        // Used by que.service for credits check — return unlimited in no-auth mode
        if (sql && sql.includes("credits FROM users")) return { credits: 9999 };
        return null;
    }

    async deductCredits() { return true; } // No-auth: unlimited credits
}

module.exports = new DatabaseService();
'@

# ─── lib/services/cache.service.js ────────────────────────────────────────────
Write-FileContent "lib\services\cache.service.js" @'
const LRUCache = require("lru-cache");

const cache = new LRUCache({
    max: 500,
    ttl: 1000 * 60 * 60 * 6, // 6h TTL (shorter than original for serverless)
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
'@

# ─── lib/services/bazi.service.js ─────────────────────────────────────────────
Write-FileContent "lib\services\bazi.service.js" @'
/**
 * BaZi Service — Vercel-compatible
 * Identical logic to backendjs/src/services/bazi.service.js
 * Only change: require paths updated to lib/
 */

const BaZiCalculator = require("../bazi/calculator");
const { calculateDaiVan } = require("../bazi/dayun");
const { formatOutput } = require("../bazi/output");
const thoiGianLuan = require("../bazi/thoi_gian_luan");
const ganzhi = require("../bazi/ganzhi");
const cacheService = require("./cache.service");

class BaZiService {
    async analyzeComplete(params) {
        return cacheService.getOrSet(
            cacheService.generateKey({ method: "analyzeComplete", ...params }),
            async () => {
                const { year, month, day, hour, minute, gender, calendar, name } = params;
                const calc = new BaZiCalculator({
                    year, month, day, hour, minute,
                    isFemale: (gender || "Nam").toLowerCase() === "nữ",
                    isSolar: (calendar || "solar").toLowerCase() === "solar"
                });
                const ctx = calc.calculate();
                return formatOutput(ctx, { name, includeAll: true });
            }
        );
    }

    async getBasicChart(params) {
        const { year, month, day, hour, minute, gender, calendar } = params;
        const calc = new BaZiCalculator({ year, month, day, hour, minute, isFemale: (gender || "Nam").toLowerCase() === "nữ", isSolar: (calendar || "solar").toLowerCase() === "solar" });
        const ctx = calc.calculate();
        const fullData = formatOutput(ctx);
        return { pillars: fullData.chi_tiet_tru, elements: fullData.diem_so.ngu_hanh_vn, strength: fullData.diem_so.suc_manh, basicInfo: fullData.thong_tin_co_ban };
    }

    async getBasicInfo(params) {
        const { year, month, day, hour, minute, gender, calendar } = params;
        const calc = new BaZiCalculator({ year, month, day, hour, minute, isFemale: (gender || "Nam").toLowerCase() === "nữ", isSolar: (calendar || "solar").toLowerCase() === "solar" });
        const ctx = calc.calculate();
        const fullData = formatOutput(ctx);
        return { thong_tin_co_ban: fullData.thong_tin_co_ban, tham_so_dau_vao: params };
    }

    async getPillars(params) {
        const { year, month, day, hour, minute, gender, calendar } = params;
        const calc = new BaZiCalculator({ year, month, day, hour, minute, isFemale: (gender || "Nam").toLowerCase() === "nữ", isSolar: (calendar || "solar").toLowerCase() === "solar" });
        const ctx = calc.calculate();
        const fullData = formatOutput(ctx);
        return { chi_tiet_tru: fullData.chi_tiet_tru };
    }

    async getAnalysis(params) {
        return cacheService.getOrSet(cacheService.generateKey({ method: "getAnalysis", ...params }), async () => {
            const { year, month, day, hour, minute, gender, calendar } = params;
            const calc = new BaZiCalculator({ year, month, day, hour, minute, isFemale: (gender || "Nam").toLowerCase() === "nữ", isSolar: (calendar || "solar").toLowerCase() === "solar" });
            const ctx = calc.calculate();
            const fullData = formatOutput(ctx);
            return { phan_tich: fullData.phan_tich };
        });
    }

    async getAdvanced(params) {
        return cacheService.getOrSet(cacheService.generateKey({ method: "getAdvanced", ...params }), async () => {
            const { year, month, day, hour, minute, gender, calendar } = params;
            const calc = new BaZiCalculator({ year, month, day, hour, minute, isFemale: (gender || "Nam").toLowerCase() === "nữ", isSolar: (calendar || "solar").toLowerCase() === "solar" });
            const ctx = calc.calculate();
            const fullData = formatOutput(ctx);
            return { phan_tich_nang_cao: fullData.phan_tich.phan_tich_nang_cao };
        });
    }

    async getClassicTexts(params) {
        const { year, month, day, hour, minute, gender, calendar } = params;
        const calc = new BaZiCalculator({ year, month, day, hour, minute, isFemale: (gender || "Nam").toLowerCase() === "nữ", isSolar: (calendar || "solar").toLowerCase() === "solar" });
        const ctx = calc.calculate();
        const fullData = formatOutput(ctx);
        return { van_ban_co_dien: fullData.van_ban_co_dien };
    }

    async getLuanGiai(params) {
        return cacheService.getOrSet(cacheService.generateKey({ method: "getLuanGiai", ...params }), async () => {
            const { year, month, day, hour, minute, gender, calendar } = params;
            const calc = new BaZiCalculator({ year, month, day, hour, minute, isFemale: (gender || "Nam").toLowerCase() === "nữ", isSolar: (calendar || "solar").toLowerCase() === "solar" });
            const ctx = calc.calculate();
            const fullData = formatOutput(ctx);
            return { luan_giai: fullData.luan_giai };
        });
    }

    async getElements(params) {
        const { year, month, day, hour, gender, calendar } = params;
        const calc = new BaZiCalculator({ year, month, day, hour, isFemale: (gender || "Nam").toLowerCase() === "nữ", isSolar: (calendar || "solar").toLowerCase() === "solar" });
        const ctx = calc.calculate();
        const fullData = formatOutput(ctx);
        return { diem_so: fullData.diem_so };
    }

    async getStars(params) {
        const { year, month, day, hour, gender, calendar } = params;
        const calc = new BaZiCalculator({ year, month, day, hour, isFemale: (gender || "Nam").toLowerCase() === "nữ", isSolar: (calendar || "solar").toLowerCase() === "solar" });
        const ctx = calc.calculate();
        const fullData = formatOutput(ctx);
        return { sao_dac_biet: fullData.phan_tich.than_sat_sao };
    }

    async getLuckCycles(params) {
        const { year, month, day, hour, gender, calendar } = params;
        const calc = new BaZiCalculator({ year, month, day, hour, isFemale: (gender || "Nam").toLowerCase() === "nữ", isSolar: (calendar || "solar").toLowerCase() === "solar" });
        const ctx = calc.calculate();
        const fullData = formatOutput(ctx);
        return { dai_van: fullData.dai_van };
    }

    async getYearAnalysis(params) {
        return cacheService.getOrSet(cacheService.generateKey({ method: "getYearAnalysis", ...params }), async () => {
            const { year, month, day, hour, gender, calendar, targetYear } = params;
            const calc = new BaZiCalculator({ year, month, day, hour, isFemale: gender ? (gender.toLowerCase() === "nữ") : false, isSolar: calendar ? calendar.toLowerCase() === "solar" : true });
            const ctx = calc.calculate();
            const luuNien = thoiGianLuan.analyzeLiuNian(ctx, targetYear || new Date().getFullYear());
            return { nam_xem: targetYear, ganzhiVN: `${ganzhi.ganToVN(ctx.gans[0])} ${ganzhi.zhiToVN(ctx.zhis[0])}`, ...luuNien };
        });
    }

    async getAuspiciousDates(params) {
        return cacheService.getOrSet(cacheService.generateKey({ method: "getAuspiciousDates", ...params }), async () => {
            const { year, month, day, hour, gender, calendar, targetYear, targetMonth } = params;
            const calc = new BaZiCalculator({ year, month, day, hour: hour || 12, isFemale: gender ? (gender.toLowerCase() === "nữ") : false, isSolar: calendar ? calendar.toLowerCase() === "solar" : true });
            const ctx = calc.calculate();
            const result = thoiGianLuan.analyzeAuspiciousDates(ctx, targetYear, targetMonth, params.activity || "general");
            return { nam: targetYear, thang: targetMonth, lich_thang: result, activity: params.activity };
        });
    }

    async analyzeTimeStatus(params) {
        return cacheService.getOrSet(cacheService.generateKey({ method: "analyzeTimeStatus", ...params }), async () => {
            const { year, month, day, hour, gender, calendar, targetYear, targetMonth, targetDay } = params;
            const calc = new BaZiCalculator({ year, month, day, hour: hour || 12, isFemale: gender ? (gender.toLowerCase() === "nữ") : false, isSolar: calendar ? calendar.toLowerCase() === "solar" : true });
            const ctx = calc.calculate();
            if (targetDay) return thoiGianLuan.analyzeLiuRi(ctx, targetYear, targetMonth, targetDay);
            if (targetMonth) return thoiGianLuan.analyzeLiuYue(ctx, targetYear, targetMonth);
            return thoiGianLuan.analyzeLiuNian(ctx, targetYear || new Date().getFullYear());
        });
    }

    mapToChart(ctx) {
        if (!ctx) return null;
        const gans = ctx.gans || [], zhis = ctx.zhis || [], naYin = ctx.naYin || [], shenSha = ctx.shenSha || [], ganShens = ctx.ganShens || [];
        const safeGanToVN = (gan) => gan ? ganzhi.ganToVN(gan) : "";
        const safeZhiToVN = (zhi) => zhi ? ganzhi.zhiToVN(zhi) : "";
        return {
            nam_sinh: ctx.year, gioi_tinh: ctx.isFemale ? "Nữ" : "Nam",
            tru_nam: { can: safeGanToVN(gans[0]), chi: safeZhiToVN(zhis[0]), nap_am: naYin[0] || "", than_sat: shenSha[0] || [] },
            tru_thang: { can: safeGanToVN(gans[1]), chi: safeZhiToVN(zhis[1]), nap_am: naYin[1] || "", than_sat: shenSha[1] || [] },
            tru_ngay: { can: safeGanToVN(gans[2]), chi: safeZhiToVN(zhis[2]), nap_am: naYin[2] || "", than_sat: shenSha[2] || [], chu: safeGanToVN(ctx.dayGan) },
            tru_gio: { can: safeGanToVN(gans[3]), chi: safeZhiToVN(zhis[3]), nap_am: naYin[3] || "", than_sat: shenSha[3] || [] },
            menh: naYin[0] || "", dai_van: ctx.dai_van || [],
            diem_so: { ngu_hanh_vn: ctx.nguHanhResult?.scores || {}, ngu_hanh: ctx.elements || {} },
            pillars: {
                year: { gan: safeGanToVN(gans[0]), zhi: safeZhiToVN(zhis[0]) },
                month: { gan: safeGanToVN(gans[1]), zhi: safeZhiToVN(zhis[1]) },
                day: { gan: safeGanToVN(gans[2]), zhi: safeZhiToVN(zhis[2]) },
                hour: { gan: safeGanToVN(gans[3]), zhi: safeZhiToVN(zhis[3]) }
            },
            elements: ctx.elements || {},
            shishen: { year: ganShens[0] || "", month: ganShens[1] || "", day: ganShens[2] || "", hour: ganShens[3] || "" }
        };
    }
}

module.exports = new BaZiService();
'@

Write-Host ""
Write-Host "=== Step 3: Writing API route handlers ===" -ForegroundColor Cyan

# ─── api/_helpers.js — shared handler utilities ───────────────────────────────
Write-FileContent "api\_helpers.js" @'
/**
 * Shared helpers for Vercel API route handlers
 * Replaces Express middleware patterns
 */

process.env.TZ = "Asia/Ho_Chi_Minh";

/**
 * CORS headers for all API responses
 */
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-user-id",
};

/**
 * Wrap a handler with CORS + error handling
 * Usage: module.exports = withHandler(async (req, res) => { ... })
 */
function withHandler(fn) {
    return async (req, res) => {
        // Handle CORS preflight
        if (req.method === "OPTIONS") {
            res.writeHead(204, CORS_HEADERS);
            res.end();
            return;
        }

        // Attach CORS headers to all responses
        Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));

        // Inject user identity (no-auth mode: read from header)
        req.userId = req.headers["x-user-id"] || "anonymous";

        try {
            await fn(req, res);
        } catch (error) {
            console.error("[Handler Error]", error);
            if (!res.headersSent) {
                res.status(500).json({ error: "Internal server error", message: error.message });
            }
        }
    };
}

/**
 * Parse query params as integers with defaults
 */
function parseIntParam(val, defaultVal = undefined) {
    const parsed = parseInt(val);
    return isNaN(parsed) ? defaultVal : parsed;
}

module.exports = { withHandler, parseIntParam, CORS_HEADERS };
'@

# ─── api/analyze.js ────────────────────────────────────────────────────────────
Write-FileContent "api\analyze.js" @'
const { withHandler, parseIntParam } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");
const dbService = require("../lib/services/database.service");

module.exports = withHandler(async (req, res) => {
    const { year, month, day, hour = 12, minute = 0, gender = "Nam", calendar = "solar", name = "" } = req.query;

    if (!year || !month || !day) {
        return res.status(400).json({ error: "Missing required parameters: year, month, day" });
    }

    let customerId = null;
    try {
        customerId = await dbService.createNewCustomer({
            name: name || "Mệnh chủ",
            year: parseIntParam(year), month: parseIntParam(month), day: parseIntParam(day),
            hour: parseIntParam(hour, 12), minute: parseIntParam(minute, 0),
            gender, calendar
        });
    } catch (dbError) {
        console.error("[DB] Failed to save customer:", dbError.message);
    }

    const result = await baziService.analyzeComplete({
        year: parseIntParam(year), month: parseIntParam(month), day: parseIntParam(day),
        hour: parseIntParam(hour, 12), minute: parseIntParam(minute, 0),
        gender, calendar, name
    });

    result.customerId = customerId;
    res.json(result);
});
'@

# ─── api/chart.js ─────────────────────────────────────────────────────────────
Write-FileContent "api\chart.js" @'
const { withHandler, parseIntParam } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");

module.exports = withHandler(async (req, res) => {
    const { year, month, day, hour = 12, minute = 0, gender = "Nam", calendar = "solar" } = req.query;
    if (!year || !month || !day) return res.status(400).json({ error: "Missing required parameters" });
    const result = await baziService.getBasicChart({ year: +year, month: +month, day: +day, hour: +hour, minute: +minute, gender, calendar });
    res.json(result);
});
'@

# ─── api/elements.js ──────────────────────────────────────────────────────────
Write-FileContent "api\elements.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");

module.exports = withHandler(async (req, res) => {
    const { year, month, day, hour = 12, gender = "Nam", calendar = "solar" } = req.query;
    if (!year || !month || !day) return res.status(400).json({ error: "Missing required parameters" });
    res.json(await baziService.getElements({ year: +year, month: +month, day: +day, hour: +hour, gender, calendar }));
});
'@

# ─── api/stars.js ─────────────────────────────────────────────────────────────
Write-FileContent "api\stars.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");

module.exports = withHandler(async (req, res) => {
    const { year, month, day, hour = 12, gender = "Nam", calendar = "solar" } = req.query;
    if (!year || !month || !day) return res.status(400).json({ error: "Missing required parameters" });
    res.json(await baziService.getStars({ year: +year, month: +month, day: +day, hour: +hour, gender, calendar }));
});
'@

# ─── api/luck-cycles.js ───────────────────────────────────────────────────────
Write-FileContent "api\luck-cycles.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");

module.exports = withHandler(async (req, res) => {
    const { year, month, day, hour = 12, gender = "Nam", calendar = "solar" } = req.query;
    if (!year || !month || !day) return res.status(400).json({ error: "Missing required parameters" });
    res.json(await baziService.getLuckCycles({ year: +year, month: +month, day: +day, hour: +hour, gender, calendar }));
});
'@

# ─── api/year-analysis.js ─────────────────────────────────────────────────────
Write-FileContent "api\year-analysis.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");

module.exports = withHandler(async (req, res) => {
    const { year, month, day, hour = 12, gender = "Nam", calendar = "solar", targetYear } = req.query;
    if (!year || !month || !day) return res.status(400).json({ error: "Missing required parameters" });
    res.json(await baziService.getYearAnalysis({
        year: +year, month: +month, day: +day, hour: +hour, gender, calendar,
        targetYear: targetYear ? +targetYear : new Date().getFullYear()
    }));
});
'@

# ─── api/analyze-time.js ──────────────────────────────────────────────────────
Write-FileContent "api\analyze-time.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");
const ganzhi = require("../lib/bazi/ganzhi");

module.exports = withHandler(async (req, res) => {
    const { year, month, day, hour = 12, gender = "Nam", target_year, target_month, target_day } = req.query;

    const result = await baziService.analyzeTimeStatus({
        year: +year, month: +month, day: +(day || 1), hour: +hour, gender,
        targetYear: +target_year,
        targetMonth: target_month ? +target_month : null,
        targetDay: target_day ? +target_day : null
    });

    const timeLabel = result.type === "day" ? `ngay ${result.value}/${result.month}/${result.year}` :
        result.type === "month" ? `thang ${result.value}/${result.year}` : `nam ${result.value}`;

    const theCucContent = [`**Trạng thái khí**: ${result.life_stage}`];
    if (result.luck_interaction?.length > 0) result.luck_interaction.forEach(li => theCucContent.push(`➤ ${li}`));
    if (result.special_stars?.length > 0) result.special_stars.forEach(ss => theCucContent.push(`✨ **Thần sát**: ${ss}`));
    theCucContent.push(`➤ Điểm đánh giá tổng thể: ${result.score >= 0 ? "Thuận lợi" : "Cần cẩn thận"} (${result.score >= 0 ? "+" : ""}${result.score})`);

    const tuongTacContent = result.relationships?.length > 0
        ? result.relationships.map(r => `• ${r}`)
        : [`• Không có xung khắc đặc biệt với tứ trụ bản mệnh.`, `• Can ${result.ganzhiVN?.split(" ")[0]} tương tác với Nhật Chủ theo quan hệ ${result.shishen}.`];

    const sections = [
        {
            title: `PHÂN TÍCH ${timeLabel.toUpperCase()}: ${result.ganzhiVN}`,
            icon: result.type === "day" ? "☀️" : result.type === "month" ? "🌙" : "🌟",
            content: [
                `**Thập Thần**: ${result.shishen}`,
                result.type === "day" ? `**Âm lịch**: ${result.lunarDay} | **Trực**: ${result.jianchu}` : null,
                `**Sự nghiệp**: ${result.evaluations?.career?.desc}`,
                `**Tài lộc**: ${result.evaluations?.wealth?.desc}`,
                `**Tình cảm**: ${result.evaluations?.love?.desc}`,
                `**Sức khỏe**: ${result.evaluations?.health?.desc}`,
                result.interpretation ? `**Luận giải tổng quan**: ${result.interpretation}` : null
            ].filter(Boolean)
        },
        { title: "THẾ CỤC & THỜI VẬN", icon: "☯️", content: theCucContent },
        { title: "TƯƠNG TÁC VỚI TỨ TRỤ", icon: "🔗", content: tuongTacContent }
    ];

    res.json({ results: [], sections });
});
'@

# ─── api/select-dates.js ──────────────────────────────────────────────────────
Write-FileContent "api\select-dates.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");
const ganzhi = require("../lib/bazi/ganzhi");

module.exports = withHandler(async (req, res) => {
    const { year, month, day, hour = 12, gender = "Nam", target_year, target_month, activity } = req.query;

    const result = await baziService.getAuspiciousDates({
        year: +year, month: +month, day: +day, hour: +hour, gender,
        targetYear: +target_year, targetMonth: +target_month, activity
    });

    const activityLabel = activity ? activity.toUpperCase() : "BẤT KỲ";
    const dates = [`PHÂN TÍCH CHỌN NGÀY CHO: ${activityLabel}`, "=========================================", ""];

    const excellent = result.lich_thang.filter(d => d.quality === "Đại Cát");
    const good = result.lich_thang.filter(d => d.quality === "Tốt");
    const avoid = result.lich_thang.filter(d => d.quality === "Đại Hung" || d.quality === "Xấu");

    if (excellent.length > 0) {
        dates.push("🌟🌟🌟 NGÀY ĐẠI CÁT 🌟🌟🌟");
        excellent.forEach(d => {
            const vnGanzhi = d.ganzhi.split("").map((c, i) => i === 0 ? ganzhi.ganToVN(c) : ganzhi.zhiToVN(c)).join(" ");
            dates.push(`📅 Ngày ${d.date} - ${vnGanzhi} | Âm lịch: ${d.lunarDate} | Kiến trừ: ${d.jianchu} | ✅ ${d.summary}`);
        });
        dates.push("");
    }
    if (good.length > 0) {
        dates.push("✨✨✨ NGÀY TỐT ✨✨✨");
        good.forEach(d => {
            const vnGanzhi = d.ganzhi.split("").map((c, i) => i === 0 ? ganzhi.ganToVN(c) : ganzhi.zhiToVN(c)).join(" ");
            dates.push(`📅 Ngày ${d.date} - ${vnGanzhi} | Âm lịch: ${d.lunarDate} | Kiến trừ: ${d.jianchu} | ✅ ${d.summary}`);
        });
        dates.push("");
    }
    if (avoid.length > 0) {
        dates.push("⛔⛔⛔ NGÀY NÊN TRÁNH ⛔⛔⛔");
        avoid.forEach(d => {
            const vnGanzhi = d.ganzhi.split("").map((c, i) => i === 0 ? ganzhi.ganToVN(c) : ganzhi.zhiToVN(c)).join(" ");
            dates.push(`❌ Ngày ${d.date} - ${vnGanzhi} | Âm lịch: ${d.lunarDate} | Kiến trừ: ${d.jianchu} | ⚠️ ${d.summary}`);
        });
    }

    res.json({ dates });
});
'@

# ─── api/basic-info.js / scores.js / pillars.js / analysis.js / advanced.js ──
Write-FileContent "api\basic-info.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");
module.exports = withHandler(async (req, res) => { res.json(await baziService.getBasicInfo(req.query)); });
'@

Write-FileContent "api\scores.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");
module.exports = withHandler(async (req, res) => { res.json(await baziService.getElements(req.query)); });
'@

Write-FileContent "api\pillars.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");
module.exports = withHandler(async (req, res) => { res.json(await baziService.getPillars(req.query)); });
'@

Write-FileContent "api\analysis.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");
module.exports = withHandler(async (req, res) => { res.json(await baziService.getAnalysis(req.query)); });
'@

Write-FileContent "api\advanced.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");
module.exports = withHandler(async (req, res) => { res.json(await baziService.getAdvanced(req.query)); });
'@

Write-FileContent "api\dayun.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");
module.exports = withHandler(async (req, res) => { res.json(await baziService.getLuckCycles(req.query)); });
'@

Write-FileContent "api\classic-texts.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");
module.exports = withHandler(async (req, res) => { res.json(await baziService.getClassicTexts(req.query)); });
'@

Write-FileContent "api\luan-giai.js" @'
const { withHandler } = require("./_helpers");
const baziService = require("../lib/services/bazi.service");
module.exports = withHandler(async (req, res) => { res.json(await baziService.getLuanGiai(req.query)); });
'@

# ─── api/matching.js ──────────────────────────────────────────────────────────
Write-FileContent "api\matching.js" @'
const { withHandler } = require("./_helpers");
const hopHon = require("../lib/bazi/hop_hon");

module.exports = withHandler(async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { person1, person2, relationship = "romance" } = req.body;
    if (!person1 || !person2) return res.status(400).json({ error: "Missing person1 or person2 data" });
    if (!person1.year || !person1.month || !person1.day) return res.status(400).json({ error: "Missing required fields for person1" });
    if (!person2.year || !person2.month || !person2.day) return res.status(400).json({ error: "Missing required fields for person2" });

    const result = hopHon.analyzeCompatibility(
        { year: +person1.year, month: +person1.month, day: +person1.day, hour: +(person1.hour || 12), gender: person1.gender || "Nam", name: person1.name || "Người 1" },
        { year: +person2.year, month: +person2.month, day: +person2.day, hour: +(person2.hour || 12), gender: person2.gender || "Nữ", name: person2.name || "Người 2" },
        relationship
    );
    res.json(result);
});
'@

# ─── api/matching/ai.js ───────────────────────────────────────────────────────
Write-FileContent "api\matching\ai.js" @'
const { withHandler } = require("../_helpers");
const baziService = require("../../lib/services/bazi.service");
const groqService = require("../../lib/services/groq.service");
const dbService = require("../../lib/services/database.service");
const BaZiCalculator = require("../../lib/bazi/calculator");
const { analyzeNguHanh } = require("../../lib/bazi/phan_tich/ngu_hanh");
const { calculateDaiVan } = require("../../lib/bazi/dayun");

function getBaziContext(person) {
    const g = (person.gender || "").toLowerCase();
    const isFemale = (g.startsWith("n") && !g.includes("am")) || g.includes("female") || g.includes("nữ");
    const calc = new BaZiCalculator({
        year: +person.year, month: +person.month, day: +person.day,
        hour: +(person.hour || 12), minute: +(person.minute || 0),
        isFemale, isSolar: true
    });
    const ctx = calc.calculate();
    ctx.nguHanhResult = analyzeNguHanh(ctx);
    ctx.dai_van = calculateDaiVan(ctx);
    return ctx;
}

module.exports = withHandler(async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { person1, person2, relationship = "romance", persona = "huyen_co" } = req.body;
    const userId = req.userId;

    if (!person1 || !person2) return res.status(400).json({ error: "Missing person1 or person2 data" });

    const ctx1 = getBaziContext(person1);
    const ctx2 = getBaziContext(person2);

    const result = await groqService.generateMatchingAnswer(ctx1, ctx2, relationship, persona);

    const person1FullData = { ...person1, chart: baziService.mapToChart(ctx1) };
    const person2FullData = { ...person2, chart: baziService.mapToChart(ctx2) };

    try {
        const customerId = await dbService.findOrCreateCustomer(person1);
        await dbService.saveConsultation(
            customerId, "matching", "matching_ai",
            `Luận giải Duyên Số với ${person2.name || "Đối phương"}`,
            result, true, 0, userId, persona,
            result.suggestedQuestions || [],
            { person1: person1FullData, person2: person2FullData, metadata: { relationship } }
        );
    } catch (dbError) { console.error("[DB] Failed to save AI matching:", dbError.message); }

    res.json({ ...result, creditsUsed: 0, person1: person1FullData, person2: person2FullData });
});
'@

# ─── api/consultant/ask.js ────────────────────────────────────────────────────
Write-FileContent "api\consultant\ask.js" @'
const { withHandler } = require("../_helpers");
const BaZiCalculator = require("../../lib/bazi/calculator");
const baziService = require("../../lib/services/bazi.service");
const groqService = require("../../lib/services/groq.service");
const dbService = require("../../lib/services/database.service");
const { formatOutput } = require("../../lib/bazi/output");
const { calculateDaiVan } = require("../../lib/bazi/dayun");
const { solveQuestion } = require("../../lib/bazi/questions/engine");
const { THEMES, QUESTIONS } = require("../../lib/bazi/questions/data");

module.exports = withHandler(async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { year, month, day, hour, minute, gender, calendar, questionId, questionText, useAI, persona } = req.body;
    const userId = req.userId;

    if (!year || !month || !day || !questionId) return res.status(400).json({ error: "Missing required parameters" });

    const isCustomQuestion = questionText && questionText === questionId;

    const g = (gender || "").toLowerCase();
    const isFemale = (g.startsWith("n") && !g.includes("am")) || g.includes("female") || g.includes("nữ");

    const calc = new BaZiCalculator({
        name: req.body.name || "Mệnh chủ",
        year: +year, month: +month, day: +day,
        hour: +(hour || 12), minute: +(minute || 0),
        isFemale, isSolar: (calendar || "solar").toLowerCase() === "solar"
    });
    const ctx = calc.calculate();
    ctx.name = req.body.name || "Mệnh chủ";

    let partnerCtx = null;
    if (req.body.partnerData) {
        const p = req.body.partnerData;
        const pg = (p.gender || "").toLowerCase();
        const pIsFemale = (pg.startsWith("n") && !pg.includes("am")) || pg.includes("female") || pg.includes("nữ");
        const pCalc = new BaZiCalculator({
            name: p.name || "Đối phương",
            year: +p.year, month: +p.month, day: +p.day,
            hour: +(p.hour || 12), minute: +(p.minute || 0),
            isFemale: pIsFemale, isSolar: true
        });
        partnerCtx = pCalc.calculate();
        partnerCtx.name = p.name || "Đối phương";
    }

    let answerData;
    let finalQuestionText = questionText || questionId;
    let themeId = null;

    // Try to find question text from DB
    const numericId = parseInt(questionId);
    if (!isNaN(numericId) && !isCustomQuestion) {
        const allDbQuestions = await dbService.getAllQuestions();
        const dbQuestion = allDbQuestions.find(q => q.id === numericId);
        if (dbQuestion) { finalQuestionText = dbQuestion.text; themeId = String(dbQuestion.category_id); }
    }

    // Fallback to QUESTIONS data
    if (finalQuestionText === questionId && !isCustomQuestion) {
        for (const tid of Object.keys(QUESTIONS)) {
            const found = QUESTIONS[tid].find(q => q.id === questionId || q.logic === questionId || q.text === questionId);
            if (found) { finalQuestionText = found.text; themeId = tid; break; }
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
        answerData = await groqService.generateAnswer(baziContext, { dai_van: daiVanData }, finalQuestionText, persona || "huyen_co", partnerCtx);
    } else {
        const paragraphs = await solveQuestion(ctx, questionId);
        answerData = {
            answer: paragraphs,
            followUps: ["Con có muốn thầy luận giải sâu hơn không?", "Vấn đề tài lộc năm nay có gì cần gỡ rối thêm không?"]
        };
    }

    let customerId = null, consultationId = null;
    try {
        customerId = await dbService.findOrCreateCustomer({
            name: req.body.name, year: +year, month: +month, day: +day,
            hour: +(hour || 12), minute: +(minute || 0), gender: gender || "Nam", calendar: calendar || "solar"
        });

        const person1FullData = {
            name: req.body.name || "Mệnh chủ",
            year: +year, month: +month, day: +day, hour: +(hour || 12), minute: +(minute || 0),
            gender: gender || "Nam", calendar: calendar || "solar",
            chart: baziService.mapToChart(ctx)
        };

        let person2FullData = null;
        if (partnerCtx && req.body.partnerData) {
            const p = req.body.partnerData;
            person2FullData = { name: p.name || "Đối phương", year: +p.year, month: +p.month, day: +p.day, hour: +(p.hour || 12), gender: p.gender || "Nam", chart: baziService.mapToChart(partnerCtx) };
        }

        consultationId = await dbService.saveConsultation(
            customerId, themeId, questionId, finalQuestionText, answerData.answer,
            !!useAI, 0, userId, persona || "huyen_co", answerData.followUps || [],
            { person1: person1FullData, person2: person2FullData, metadata: { themeId, isCustom: isCustomQuestion } }
        );
    } catch (dbError) { console.error("[DB] Failed to save consultation:", dbError.message); }

    res.json({
        questionId, answer: answerData.answer, followUps: answerData.followUps,
        useAI: !!useAI, persona: persona || "huyen_co",
        customerId, consultationId, creditsUsed: 0,
        timestamp: new Date().toISOString()
    });
});
'@

# ─── api/consultant/themes.js ─────────────────────────────────────────────────
Write-FileContent "api\consultant\themes.js" @'
const { withHandler } = require("../_helpers");
const dbService = require("../../lib/services/database.service");
const { THEMES } = require("../../lib/bazi/questions/data");

module.exports = withHandler(async (req, res) => {
    try {
        const dbCategories = await dbService.getAllCategories();
        if (dbCategories.length > 0) {
            return res.json(dbCategories.map(cat => ({ id: String(cat.id), name: cat.name, icon: cat.icon, isFromDB: true })));
        }
    } catch {}
    res.json(THEMES);
});
'@

# ─── api/consultant/questions.js (dynamic [themeId] via query param) ──────────
Write-FileContent "api\consultant\questions.js" @'
const { withHandler } = require("../_helpers");
const dbService = require("../../lib/services/database.service");
const { QUESTIONS } = require("../../lib/bazi/questions/data");

// Route: /api/consultant/questions?themeId=xxx
module.exports = withHandler(async (req, res) => {
    const themeId = req.query.themeId || "";
    try {
        const categoryId = parseInt(themeId);
        if (!isNaN(categoryId)) {
            const dbQuestions = await dbService.getAllQuestions(categoryId);
            if (dbQuestions.length > 0) {
                return res.json(dbQuestions.map(q => ({ id: String(q.id), text: q.text, logic: "DB_QUESTION", isFromDB: true })));
            }
        }
    } catch {}
    res.json(QUESTIONS[themeId] || []);
});
'@

# ─── api/consultant/history.js ────────────────────────────────────────────────
Write-FileContent "api\consultant\history.js" @'
const { withHandler } = require("../_helpers");
const dbService = require("../../lib/services/database.service");

// Route: /api/consultant/history?customerId=xxx
module.exports = withHandler(async (req, res) => {
    const customerId = parseInt(req.query.customerId);
    if (isNaN(customerId)) return res.status(400).json({ error: "Missing customerId" });
    const [history, customer] = await Promise.all([
        dbService.getCustomerHistory(customerId),
        dbService.getCustomer(customerId)
    ]);
    res.json({ customer, history });
});
'@

# ─── api/consultant/stats.js ──────────────────────────────────────────────────
Write-FileContent "api\consultant\stats.js" @'
const { withHandler } = require("../_helpers");
const dbService = require("../../lib/services/database.service");
module.exports = withHandler(async (req, res) => { res.json(await dbService.getStats()); });
'@

# ─── api/consultant/customers.js ──────────────────────────────────────────────
Write-FileContent "api\consultant\customers.js" @'
const { withHandler } = require("../_helpers");
const dbService = require("../../lib/services/database.service");
module.exports = withHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    res.json(await dbService.getAllCustomers(limit));
});
'@

# ─── api/consultant/recent.js ─────────────────────────────────────────────────
Write-FileContent "api\consultant\recent.js" @'
const { withHandler } = require("../_helpers");
const dbService = require("../../lib/services/database.service");
module.exports = withHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    res.json(await dbService.getRecentCustomersWithQuestions(limit));
});
'@

# ─── api/consultant/my-history.js ─────────────────────────────────────────────
Write-FileContent "api\consultant\my-history.js" @'
const { withHandler } = require("../_helpers");
const dbService = require("../../lib/services/database.service");
module.exports = withHandler(async (req, res) => {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 20;
    const history = await dbService.getUserHistory(userId, limit);
    res.json({ history, count: history.length, userId });
});
'@

# ─── api/consultant/comprehensive.js ─────────────────────────────────────────
Write-FileContent "api\consultant\comprehensive.js" @'
const { withHandler } = require("../_helpers");
const groqService = require("../../lib/services/groq.service");
const dbService = require("../../lib/services/database.service");

module.exports = withHandler(async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { chartData, persona } = req.body;
    const userId = req.userId;

    if (!chartData) return res.status(400).json({ error: "Thiếu dữ liệu lá số" });

    const personaName = persona === "menh_meo" ? "Thầy Mệnh Mèo GenZ" : "Thầy Huyền Cơ Bát Tự";
    const personaStyle = persona === "menh_meo"
        ? `Hãy dùng ngôn ngữ Gen Z, hài hước, vui vẻ, NHIỀU EMOJI. Gọi người hỏi là "con", "bồ", hoặc "cưng". Dùng slang: "chill", "vibe", "flex", "slay", "real".`
        : `Hãy dùng ngôn ngữ trang trọng, uyên thâm. Gọi người hỏi là "con" hoặc "Mệnh chủ". Trích dẫn kinh điển khi phù hợp.`;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const currentTimeStr = `${currentDay}/${currentMonth}/${currentYear}`;

    const basicInfo = chartData.thong_tin_co_ban || chartData.thong_tin || {};
    const chiTietTru = chartData.chi_tiet_tru || [];
    const yearPillar = chiTietTru[0] || {}, monthPillar = chiTietTru[1] || {};
    const dayPillar = chiTietTru[2] || {}, hourPillar = chiTietTru[3] || {};

    const dayMaster = dayPillar.can || "Chưa xác định";
    const dayMasterElement = dayPillar.hanh_can || "Chưa xác định";
    const luckyElements = chartData.phan_tich?.can_bang_ngu_hanh?.dung_than?.ngu_hanh || [];
    const avoidElements = chartData.phan_tich?.can_bang_ngu_hanh?.ky_than?.ngu_hanh || [];
    const daiVan = chartData.dai_van || [];
    const elementScores = chartData.diem_so || {};

    const formatPillar = (p) => (p?.can && p?.chi) ? `${p.can} ${p.chi}` : "Chưa có dữ liệu";

    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()}`;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const monthNames = ["", "Tháng Giêng", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu", "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Chạp"];

    const daiVanStr = Array.isArray(daiVan) && daiVan.length > 0
        ? daiVan.slice(0, 5).map(d => `- Tuổi ${d.tuoi_bat_dau || d.tuoi_start || "?"}+: ${d.can_chi || `${d.can || ""} ${d.chi || ""}`} (từ năm ${d.nam || ""})`).join("\n")
        : "- Đại vận đang được tính toán";

    const prompt = `Bạn là ${personaName}, một chuyên gia Bát Tự (Tử Vi).
${personaStyle}

THỜI ĐIỂM HIỆN TẠI: ${currentTimeStr} (Năm ${currentYear}, ${monthNames[currentMonth]})
NGÀY MAI: ${tomorrowStr}
THÁNG SAU: ${monthNames[nextMonth]} năm ${nextMonthYear}

Hãy tổng hợp và luận giải đầy đủ lá số Bát Tự sau đây:

**PHẦN 1: PHÂN TÍCH BẢN MỆNH**
1. Tổng quan về Nhật chủ - giải thích chi tiết Tứ Trụ
2. Phân tích tính cách, ưu điểm, nhược điểm
3. Phân tích sự nghiệp và tài lộc
4. Phân tích tình duyên và gia đạo
5. Phân tích sức khỏe cần lưu ý

**PHẦN 2: DỰ BÁO THEO THỜI GIAN**
7. Vận hạn NGÀY MAI (${tomorrowStr})
8. Vận hạn THÁNG NÀY (${monthNames[currentMonth]} ${currentYear})
9. Vận hạn THÁNG SAU (${monthNames[nextMonth]} ${nextMonthYear})
10. Tổng quan NĂM ${currentYear}

**PHẦN 3: HƯỚNG DẪN THỰC HÀNH**
11. Vật phẩm phong thủy, màu sắc may mắn, hướng tốt

THÔNG TIN LÁ SỐ:
- Họ tên: ${basicInfo.ten || basicInfo.name || "Mệnh chủ"}
- Ngày sinh: ${basicInfo.ngay_sinh || basicInfo.birth_date || "Theo lá số"}
- Giới tính: ${basicInfo.gioi_tinh || basicInfo.gender || "Nam/Nữ"}

TỨ TRỤ:
- Năm: ${formatPillar(yearPillar)} (Nạp Âm: ${yearPillar.nap_am || ""})
- Tháng: ${formatPillar(monthPillar)} (Nạp Âm: ${monthPillar.nap_am || ""})
- Ngày: ${formatPillar(dayPillar)} ← NHẬT CHỦ
- Giờ: ${formatPillar(hourPillar)}

NHẬT CHỦ: ${dayMaster} (Hành ${dayMasterElement})
DỤNG THẦN: ${luckyElements.join(", ") || "Cần phân tích"}
KỴ THẦN: ${avoidElements.join(", ") || "Cần phân tích"}

ĐẠI VẬN:
${daiVanStr}

Viết 800-1200 từ. CUỐI CÙNG, gợi ý 3-5 câu hỏi theo format:
---GỢI Ý CÂU HỎI---
1. [Câu hỏi 1]
2. [Câu hỏi 2]
3. [Câu hỏi 3]`;

    const rawResponse = await groqService.generateCompletion(prompt, persona);

    let interpretation = rawResponse;
    let followUpQuestions = [];

    const marker = "---GỢI Ý CÂU HỎI---";
    if (rawResponse.includes(marker)) {
        const parts = rawResponse.split(marker);
        interpretation = parts[0].trim();
        followUpQuestions = (parts[1] || "").split("\n")
            .map(line => line.replace(/^\d+\.\s*/, "").replace(/^\[|\]$/g, "").trim())
            .filter(q => q.length > 5);
    }

    try {
        let customerId = chartData.customerId;
        if (!customerId) {
            const ci = {
                name: basicInfo.name || basicInfo.ten || "Mệnh chủ",
                year: +(basicInfo.year || basicInfo.nam_sinh), month: +(basicInfo.month || basicInfo.thang_sinh),
                day: +(basicInfo.day || basicInfo.ngay_sinh), hour: +(basicInfo.hour || basicInfo.gio_sinh || 12),
                minute: +(basicInfo.minute || basicInfo.phut_sinh || 0),
                gender: basicInfo.gender || basicInfo.gioi_tinh || "Nam", calendar: basicInfo.calendar || "solar"
            };
            if (!isNaN(ci.year)) customerId = await dbService.findOrCreateCustomer(ci);
        }
        if (customerId) {
            await dbService.saveConsultation(
                customerId, "comprehensive", "comprehensive",
                `Tổng hợp luận giải phong cách ${personaName}`,
                interpretation.split("\n\n").filter(p => p.trim()),
                true, 0, userId, persona, followUpQuestions
            );
        }
    } catch (dbError) { console.error("[DB] comprehensive save error:", dbError.message); }

    res.json({ interpretation, followUpQuestions, persona: personaName, creditsUsed: 0 });
});
'@

Write-Host ""
Write-Host "=== Step 4: Que routes ===" -ForegroundColor Cyan

# ─── api/que/quick-random.js ──────────────────────────────────────────────────
Write-FileContent "api\que\quick-random.js" @'
const { withHandler } = require("../_helpers");
const { HEXAGRAMS } = require("../../lib/bazi/que_data/gua_64");
const { INTERPRETATIONS } = require("../../lib/bazi/que_data/interpretations");
const { Solar, Lunar } = require("lunar-javascript");

const GAN_NAMES = { "甲":"Giáp","乙":"Ất","丙":"Bính","丁":"Đinh","戊":"Mậu","己":"Kỷ","庚":"Canh","辛":"Tân","壬":"Nhâm","癸":"Quý" };
const ZHI_NAMES = { "子":"Tý","丑":"Sửu","寅":"Dần","卯":"Mão","辰":"Thìn","巳":"Tỵ","午":"Ngọ","未":"Mùi","申":"Thân","酉":"Dậu","戌":"Tuất","亥":"Hợi" };

const getElement = (char) => {
    const elements = { "Giáp":"Mộc","Ất":"Mộc","Dần":"Mộc","Mão":"Mộc","Bính":"Hỏa","Đinh":"Hỏa","Tỵ":"Hỏa","Ngọ":"Hỏa","Mậu":"Thổ","Kỷ":"Thổ","Thìn":"Thổ","Tuất":"Thổ","Sửu":"Thổ","Mùi":"Thổ","Canh":"Kim","Tân":"Kim","Thân":"Kim","Dậu":"Kim","Nhâm":"Thủy","Quý":"Thủy","Hợi":"Thủy","Tý":"Thủy" };
    return elements[char] || "Thổ";
};

module.exports = withHandler(async (req, res) => {
    const { topic } = req.query;
    const hexId = Math.floor(Math.random() * 64) + 1;
    const hexInfo = HEXAGRAMS[hexId];
    const interpretation = INTERPRETATIONS[hexId];
    if (!hexInfo || !interpretation) return res.status(500).json({ error: "Failed to generate hexagram" });

    let mappingKey = "career", topicLabel = "Tổng Quan";
    if (topic === "love") { mappingKey = "love"; topicLabel = "Tình Duyên"; }
    else if (topic === "wealth") { mappingKey = "finance"; topicLabel = "Tài Lộc"; }
    else if (topic === "safety") { mappingKey = "safety"; topicLabel = "Tai Tinh & Bình An"; }

    const rawInterpretation = interpretation.aspects[mappingKey] || interpretation.overview;

    const vnNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const solar = Solar.fromDate(vnNow);
    const lunar = Lunar.fromSolar(solar);
    const dayGan = GAN_NAMES[lunar.getDayGan()] || lunar.getDayGan();
    const dayZhi = ZHI_NAMES[lunar.getDayZhi()] || lunar.getDayZhi();

    res.json({
        id: hexId, name: hexInfo.name, symbol: hexInfo.symbol, meaning: hexInfo.meaning,
        quality: hexInfo.quality, topic: topicLabel,
        overview: interpretation.overview, interpretation: rawInterpretation,
        ai_analysis: rawInterpretation,
        advice: interpretation.advice,
        disclaimer: "Kết quả gieo quẻ ngẫu nhiên mang tính chất tham khảo."
    });
});
'@

# ─── api/que/daily.js / monthly.js / yearly.js ───────────────────────────────
$queTemplate = @'
const { withHandler } = require("../_helpers");
const baziService = require("../../lib/services/bazi.service");
const queService = require("../../lib/services/que.service");
const dateUtils = require("../../lib/utils/dateUtils");

module.exports = withHandler(async (req, res) => {
    const { year, month, day, hour, minute, gender, topic, forceNew } = req.query;
    if (!year || !month || !day) return res.status(400).json({ error: "Missing birth data" });

    const baziContext = await baziService.analyzeComplete({
        year: +year, month: +month, day: +day,
        hour: +(hour || 12), minute: +(minute || 0), gender: gender || "Nam"
    });

    const userId = req.userId;
    const contextId = `${year}${String(month).padStart(2,"0")}${String(day).padStart(2,"0")}${hour||12}${minute||0}${gender==="Nữ"?"F":"M"}`;
    const userInfo = { userId, customerId: req.query.customerId ? +req.query.customerId : null };

    const periodKey = PERIOD_KEY_FN();
    const result = await queService.GENERATE_FN(baziContext, userInfo, periodKey, contextId, topic, forceNew === "true");
    res.json(result);
});
'@

Write-FileContent "api\que\daily.js" @'
const { withHandler } = require("../_helpers");
const baziService = require("../../lib/services/bazi.service");
const queService = require("../../lib/services/que.service");
const dateUtils = require("../../lib/utils/dateUtils");

module.exports = withHandler(async (req, res) => {
    const { year, month, day, hour, minute, gender, topic, forceNew } = req.query;
    if (!year || !month || !day) return res.status(400).json({ error: "Missing birth data" });
    const baziContext = await baziService.analyzeComplete({ year: +year, month: +month, day: +day, hour: +(hour||12), minute: +(minute||0), gender: gender || "Nam" });
    const userId = req.userId;
    const contextId = `${year}${String(month).padStart(2,"0")}${String(day).padStart(2,"0")}${hour||12}${minute||0}${gender==="Nữ"?"F":"M"}`;
    const userInfo = { userId, customerId: req.query.customerId ? +req.query.customerId : null };
    res.json(await queService.generateDailyQue(baziContext, userInfo, dateUtils.getVNDateString(), contextId, topic, forceNew === "true"));
});
'@

Write-FileContent "api\que\monthly.js" @'
const { withHandler } = require("../_helpers");
const baziService = require("../../lib/services/bazi.service");
const queService = require("../../lib/services/que.service");
const dateUtils = require("../../lib/utils/dateUtils");

module.exports = withHandler(async (req, res) => {
    const { year, month, day, hour, minute, gender, topic, forceNew } = req.query;
    if (!year || !month || !day) return res.status(400).json({ error: "Missing birth data" });
    const baziContext = await baziService.analyzeComplete({ year: +year, month: +month, day: +day, hour: +(hour||12), minute: +(minute||0), gender: gender || "Nam" });
    const userId = req.userId;
    const contextId = `${year}${String(month).padStart(2,"0")}${String(day).padStart(2,"0")}${hour||12}${minute||0}${gender==="Nữ"?"F":"M"}`;
    const userInfo = { userId, customerId: req.query.customerId ? +req.query.customerId : null };
    res.json(await queService.generateMonthlyQue(baziContext, userInfo, dateUtils.getVNMonthString(), contextId, topic, forceNew === "true"));
});
'@

Write-FileContent "api\que\yearly.js" @'
const { withHandler } = require("../_helpers");
const baziService = require("../../lib/services/bazi.service");
const queService = require("../../lib/services/que.service");
const dateUtils = require("../../lib/utils/dateUtils");

module.exports = withHandler(async (req, res) => {
    const { year, month, day, hour, minute, gender, topic, forceNew } = req.query;
    if (!year || !month || !day) return res.status(400).json({ error: "Missing birth data" });
    const baziContext = await baziService.analyzeComplete({ year: +year, month: +month, day: +day, hour: +(hour||12), minute: +(minute||0), gender: gender || "Nam" });
    const userId = req.userId;
    const contextId = `${year}${String(month).padStart(2,"0")}${String(day).padStart(2,"0")}${hour||12}${minute||0}${gender==="Nữ"?"F":"M"}`;
    const userInfo = { userId, customerId: req.query.customerId ? +req.query.customerId : null };
    res.json(await queService.generateYearlyQue(baziContext, userInfo, dateUtils.getVNYearString(), contextId, topic, forceNew === "true"));
});
'@

Write-FileContent "api\que\history.js" @'
const { withHandler } = require("../_helpers");
const queService = require("../../lib/services/que.service");

module.exports = withHandler(async (req, res) => {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    res.json(await queService.getHistory(userId, page, limit));
});
'@

Write-FileContent "api\que\timeline.js" @'
const { withHandler } = require("../_helpers");
const dbService = require("../../lib/services/database.service");

module.exports = withHandler(async (req, res) => {
    const userId = req.userId;
    const { type = "daily", limit = 7 } = req.query;
    const results = await dbService.getQueTimeline(userId, type, parseInt(limit));

    const timeline = results.map(r => {
        try {
            const meta = JSON.parse(r.metadata || "{}");
            const guaData = meta.gua_data || {};
            return { id: r.id, name: guaData.name || "Unknown", symbol: guaData.symbol || "☰☰", quality: guaData.quality || "Bình", hexagramId: guaData.hexagramId, created_at: r.created_at };
        } catch { return null; }
    }).filter(Boolean).reverse();

    res.json({ timeline, type });
});
'@

Write-FileContent "api\que\note.js" @'
const { withHandler } = require("../_helpers");
const queService = require("../../lib/services/que.service");

module.exports = withHandler(async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const { id, note, isVerified } = req.body;
    if (!id) return res.status(400).json({ error: "Missing id" });
    await queService.updateNote(id, note, isVerified);
    res.json({ success: true });
});
'@

Write-Host ""
Write-Host "=== Step 5: Articles (static JSON) ===" -ForegroundColor Cyan

Write-FileContent "api\articles\index.js" @'
const { withHandler } = require("../_helpers");
const articlesData = require("../../lib/data/articles.json");

module.exports = withHandler(async (req, res) => {
    const { category, page = 1, limit = 10 } = req.query;
    const pageInt = parseInt(page), limitInt = parseInt(limit);
    const offset = (pageInt - 1) * limitInt;

    let filtered = articlesData.articles.filter(a => a.is_published !== false);
    if (category && category !== "all") {
        filtered = filtered.filter(a => a.category_slug === category);
    }

    const total = filtered.length;
    const articles = filtered.slice(offset, offset + limitInt);

    res.json({
        success: true,
        articles,
        pagination: { page: pageInt, limit: limitInt, total, totalPages: Math.ceil(total / limitInt) }
    });
});
'@

Write-FileContent "api\articles\categories.js" @'
const { withHandler } = require("../_helpers");

const CATEGORIES = [
    { id: 1, name: "Tất cả", slug: "all" },
    { id: 2, name: "Khái niệm cơ bản", slug: "khai-niem" },
    { id: 3, name: "Cách luận giải", slug: "cach-luan" },
    { id: 4, name: "Ngũ Hành", slug: "ngu-hanh" },
    { id: 5, name: "Thiên Can - Địa Chi", slug: "can-chi" },
    { id: 6, name: "Ứng dụng thực tế", slug: "ung-dung" }
];

module.exports = withHandler(async (req, res) => {
    res.json({ success: true, categories: CATEGORIES });
});
'@

Write-FileContent "api\articles\slug.js" @'
const { withHandler } = require("../_helpers");
const articlesData = require("../../lib/data/articles.json");

// Route: /api/articles/slug?slug=xxx
module.exports = withHandler(async (req, res) => {
    const slug = req.query.slug;
    if (!slug) return res.status(400).json({ success: false, error: "Missing slug" });

    const article = articlesData.articles.find(a => a.slug === slug);
    if (!article) return res.status(404).json({ success: false, error: "Article not found" });

    const related = articlesData.articles
        .filter(a => a.category_slug === article.category_slug && a.slug !== slug && a.is_published !== false)
        .slice(0, 3);

    res.json({ success: true, article, related });
});
'@

# ─── api/auth/me.js ───────────────────────────────────────────────────────────
Write-FileContent "api\auth\me.js" @'
const { withHandler } = require("../_helpers");

module.exports = withHandler(async (req, res) => {
    res.json({
        user: {
            id: req.userId,
            name: "Mệnh chủ",
            credits: 9999,
            is_admin: false
        }
    });
});
'@

Write-Host ""
Write-Host "=== Step 6: que.service.js (lib) ===" -ForegroundColor Cyan

Write-FileContent "lib\services\que.service.js" @'
/**
 * Que Service — Vercel-compatible
 * Identical logic to backendjs/src/services/que.service.js
 * Only change: require paths updated to lib/
 */

const { calculateHexagram, ELEMENTS } = require("../bazi/que_data/mapping");
const { HEXAGRAMS } = require("../bazi/que_data/gua_64");
const { getFullInterpretation, generateOfflineAnalysis } = require("../bazi/que_data/interpretations");
const database = require("./database.service");
const groqService = require("./groq.service");
const dateUtils = require("../utils/dateUtils");

const QUE_CREDIT_COST = 0; // No-auth mode: free

class QueService {
    async generateDailyQue(baziContext, userInfo, dateStr, contextId, topic = "Chung", forceNew = false) {
        return this._generateQue(baziContext, userInfo, "daily", dateStr, contextId, topic, forceNew);
    }
    async generateMonthlyQue(baziContext, userInfo, monthStr, contextId, topic = "Chung", forceNew = false) {
        return this._generateQue(baziContext, userInfo, "monthly", monthStr, contextId, topic, forceNew);
    }
    async generateYearlyQue(baziContext, userInfo, yearStr, contextId, topic = "Chung", forceNew = false) {
        return this._generateQue(baziContext, userInfo, "yearly", yearStr, contextId, topic, forceNew);
    }

    async _generateQue(baziContext, userInfo, type, periodKey, contextId, topic = "Chung", forceNew = false) {
        const userId = userInfo.userId || null;
        const customerId = userInfo.customerId || null;
        const effectiveContextId = topic === "Chung" ? contextId : `${contextId}_${topic}`;

        if (!forceNew) {
            const existing = await database.getQue(userId, customerId, effectiveContextId, type, periodKey);
            if (existing) return { ...existing.gua_data, is_history: true, user_note: existing.user_note, is_verified: existing.is_verified };
        }

        const { Solar } = require("lunar-javascript");
        let targetDate;
        if (type === "daily") targetDate = new Date(periodKey);
        else if (type === "monthly") { const [y, m] = periodKey.split("-"); targetDate = new Date(+y, +m - 1, 15); }
        else targetDate = new Date(+periodKey, 5, 15);

        const solar = Solar.fromDate(targetDate);
        const lunar = solar.getLunar();

        let timeInfo = { gan: "", zhi: "" };
        if (type === "daily") { const d = lunar.getDayInGanZhi(); timeInfo = { gan: d.charAt(0), zhi: d.charAt(1) }; }
        else if (type === "monthly") { const m = lunar.getMonthInGanZhi(); timeInfo = { gan: m.charAt(0), zhi: m.charAt(1) }; }
        else { const y = lunar.getYearInGanZhi(); timeInfo = { gan: y.charAt(0), zhi: y.charAt(1) }; }

        const guaResult = calculateHexagram(baziContext, timeInfo, type, topic);
        const hexagramDef = HEXAGRAMS[guaResult.hexagramId];
        const interpretation = getFullInterpretation(guaResult.hexagramId, guaResult.interaction, type);

        let qualityText = "Bình";
        const score = guaResult.qualityScore;
        if (score >= 6) qualityText = "Đại Cát";
        else if (score >= 3) qualityText = "Tiểu Cát";
        else if (score >= 0) qualityText = "Bình";
        else if (score >= -3) qualityText = "Tiểu Hung";
        else qualityText = "Hung";

        let llmInterpretation = "";
        try {
            llmInterpretation = await this._generateLLMInterpretation(baziContext, hexagramDef, guaResult, type, periodKey, solar, lunar, topic);
        } catch (e) { console.error("[QueService] LLM error:", e.message); }

        if (!llmInterpretation) {
            llmInterpretation = generateOfflineAnalysis(guaResult.hexagramId, hexagramDef, topic, guaResult.interaction, type, qualityText);
        }

        let displayPeriod = periodKey;
        if (type === "daily") displayPeriod = `Ngày ${solar.getDay()}/${solar.getMonth()}/${solar.getYear()}`;
        else if (type === "monthly") displayPeriod = `Tháng ${solar.getMonth()}/${solar.getYear()} (Âm lịch: Tháng ${String(lunar.getMonth()).padStart(2,"0")} - ${lunar.getMonthInGanZhi()} ${lunar.getYearInGanZhi()})`;
        else displayPeriod = `Năm ${periodKey}`;

        const staticInterpretation = getFullInterpretation(guaResult.hexagramId, guaResult.interaction);
        const fullResult = {
            hexagramId: guaResult.hexagramId, name: hexagramDef.name, symbol: hexagramDef.symbol,
            meaning: hexagramDef.meaning, quality: qualityText, qualityScore: guaResult.qualityScore,
            upperTrigram: guaResult.upperTrigram, lowerTrigram: guaResult.lowerTrigram,
            interaction: {
                dayMaster: guaResult.interaction.dayMaster,
                dayMasterElement: ELEMENTS[guaResult.interaction.dayMaster],
                timeGan: guaResult.interaction.timeGan, timeZhi: guaResult.interaction.timeZhi,
                timeElement: ELEMENTS[guaResult.interaction.timeGan],
                relation: guaResult.interaction.ganInteraction.relation,
                relationType: guaResult.interaction.ganInteraction.relationType,
                activatedShiShen: guaResult.interaction.activatedShiShen
            },
            interpretation: { overview: staticInterpretation.overview, advice: staticInterpretation.advice, aspects: staticInterpretation.aspects },
            ai_analysis: llmInterpretation,
            period: periodKey, displayPeriod, type, topic,
            credits_used: QUE_CREDIT_COST, created_at: dateUtils.getCurrentVNTime()
        };

        let resolvedCustomerId = customerId;
        if (!resolvedCustomerId && baziContext.thong_tin_co_ban) {
            try {
                resolvedCustomerId = await database.findOrCreateCustomer({
                    name: baziContext.thong_tin_co_ban.ten || "Mệnh chủ",
                    year: baziContext.thong_tin_co_ban.nam_sinh, month: baziContext.thong_tin_co_ban.thang_sinh,
                    day: baziContext.thong_tin_co_ban.ngay_sinh, hour: baziContext.thong_tin_co_ban.gio_sinh || 12,
                    minute: 0, gender: baziContext.thong_tin_co_ban.gioi_tinh || "Nam", calendar: "solar"
                });
            } catch (err) { console.error("[QueService] resolve customer error:", err.message); }
        }

        try {
            const paragraphs = llmInterpretation.split("\n\n").filter(p => p.trim());
            const person1Data = {
                name: baziContext.thong_tin_co_ban?.ten || "Mệnh chủ",
                gender: baziContext.thong_tin_co_ban?.gioi_tinh || "Nam",
                year: baziContext.thong_tin_co_ban?.nam_sinh, month: baziContext.thong_tin_co_ban?.thang_sinh, day: baziContext.thong_tin_co_ban?.ngay_sinh,
                chart: { pillars: { year: { gan: baziContext.chi_tiet_tru?.[0]?.can, zhi: baziContext.chi_tiet_tru?.[0]?.chi }, month: { gan: baziContext.chi_tiet_tru?.[1]?.can, zhi: baziContext.chi_tiet_tru?.[1]?.chi }, day: { gan: baziContext.chi_tiet_tru?.[2]?.can, zhi: baziContext.chi_tiet_tru?.[2]?.chi }, hour: { gan: baziContext.chi_tiet_tru?.[3]?.can, zhi: baziContext.chi_tiet_tru?.[3]?.chi } } }
            };
            const guaDataForMeta = { ...fullResult }; delete guaDataForMeta.ai_analysis;
            await database.saveConsultation(resolvedCustomerId, "xin_que", type, `Xin quẻ ${topic !== "Chung" ? topic : ""} ${type === "daily" ? "Ngày" : type === "monthly" ? "Tháng" : "Năm"} - ${displayPeriod}`, paragraphs, true, QUE_CREDIT_COST, userId, "huyen_co", [], { person1: person1Data, metadata: { isQue: true, queType: type, topic, periodKey, contextId: effectiveContextId, guaName: hexagramDef.name, guaNumber: guaResult.hexagramId, quality: qualityText, symbol: hexagramDef.symbol, gua_data: guaDataForMeta } });
        } catch (e) { console.error("[QueService] save history error:", e.message); }

        return fullResult;
    }

    async _generateLLMInterpretation(baziContext, hexagramDef, guaResult, type, periodKey, solar, lunar, topic = "Chung") {
        const periodLabel = type === "daily" ? "NGÀY" : type === "monthly" ? "THÁNG" : "NĂM";
        const topicLabel = topic !== "Chung" ? `về chủ đề ${topic.toUpperCase()}` : "";
        const dm = baziContext.thong_tin_co_ban?.nhap_chu || guaResult.interaction.dayMaster;
        const dmEle = ELEMENTS[dm];
        const dungThan = baziContext.phan_tich?.can_bang_ngu_hanh?.dung_than?.ngu_hanh || [];
        const kyThan = baziContext.phan_tich?.can_bang_ngu_hanh?.ky_than?.ngu_hanh || [];
        const timeElement = ELEMENTS[guaResult.interaction.timeGan];
        const periodYang = ["Giáp","Bính","Mậu","Canh","Nhâm"].includes(guaResult.interaction.timeGan);
        const age = baziContext.thong_tin_co_ban?.tuoi || "không rõ";
        const gender = baziContext.thong_tin_co_ban?.gioi_tinh || "Nam";

        const prompt = `Bạn là bậc thầy ẩn sĩ "Huyền Cơ", chuyên gia tối cao về Kinh Dịch và Bát Tự.
Hãy thực hiện một bài LUẬN GIẢI CHI TIẾT quẻ ${periodLabel} ${topicLabel}.

### THÔNG TIN ĐẦU VÀO:

**1. Trục Mệnh:**
- Nhật Chủ: ${dm} (${dmEle}) | Giới tính: ${gender} | Tuổi: ${age}
- Thập thần kích hoạt: ${guaResult.interaction.activatedShiShen}
- Dụng Thần: ${dungThan.join(", ")} | Kỵ Thần: ${kyThan.join(", ")}

**2. Trục Thời (Năng lượng ${periodLabel}):**
- Dương lịch: ${solar.toYmd()}
- Can Chi ${periodLabel}: ${guaResult.interaction.timeGan}${guaResult.interaction.timeZhi}
- Ngũ hành: ${timeElement} | Âm/Dương: ${periodYang ? "Dương" : "Âm"}

**3. Quẻ: ${hexagramDef.name} (${hexagramDef.symbol})**
- Quan hệ Can Chi: ${guaResult.interaction.ganInteraction.relation}

### YÊU CẦU CẤU TRÚC:
**I. Thông tin thời vận** — phân tích Can Chi ${periodLabel}
**II. Quẻ chính** — tên, hình tượng, tính chất Cát/Trung/Hung
**III. Giải quẻ theo mệnh (CÁ NHÂN HÓA theo chủ đề: ${topic.toUpperCase()})** — luận giải sâu về ${topic}, cơ hội và thách thức
**IV. Cá nhân hóa Bát Tự** — tác động lên Nhật chủ ${dm}, Dụng/Kỵ thần, lời khuyên hành động

QUY TẮC: Viết uyên bác, trang trọng. Gọi người dùng là "con" hoặc "mệnh chủ". KHÔNG dùng chữ Hán gốc. KHÔNG nhắc AI.`;

        const response = await groqService.generateCompletion(prompt, "huyen_co");
        return response;
    }

    async getHistory(userId, page = 1, limit = 10) { return database.getQueHistory(userId, page, limit); }
    async updateNote(id, note, isVerified) { return database.updateQueNote(id, note, isVerified); }
}

module.exports = new QueService();
'@

Write-Host ""
Write-Host "=== Step 7: Frontend config update ===" -ForegroundColor Cyan

Write-FileContent "src\config\api.js" @'
// API Configuration — Vercel-compatible
// All API calls use relative /api/ path (no cross-origin needed)

export const API_CONFIG = {
    HOST: "",
    BASE_URL: "/api",
    AUTH: "/api/auth",
    CONSULTANT: "/api/consultant",
    ADMIN: "/api/admin",
    BAZI: "/api",
}

export default API_CONFIG
'@

Write-Host ""
Write-Host "=== Step 8: .env.local template ===" -ForegroundColor Cyan

Write-FileContent ".env.local" @'
# ============================================
# Environment variables for local development
# Copy this to .env.local and fill in values
# ============================================

# Groq AI
GROQ_API_KEY=your_groq_api_key_here

# Supabase (reuse existing RongLeo project)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Timezone
TZ=Asia/Ho_Chi_Minh
'@

Write-Host ""
Write-Host "=== Step 9: Supabase schema SQL ===" -ForegroundColor Cyan

Write-FileContent "lib\supabase-schema.sql" @'
-- ============================================================
-- Supabase Schema for Tinix Bazi
-- Run this in Supabase SQL Editor to create all tables
-- ============================================================

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    name TEXT,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    hour INTEGER DEFAULT 12,
    minute INTEGER DEFAULT 0,
    gender TEXT DEFAULT ''Nam'',
    calendar TEXT DEFAULT ''solar'',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultations
CREATE TABLE IF NOT EXISTS consultations (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    theme_id TEXT,
    question_id TEXT NOT NULL,
    question_text TEXT,
    answer TEXT,
    use_ai BOOLEAN DEFAULT TRUE,
    credits_used INTEGER DEFAULT 0,
    user_id TEXT,
    persona TEXT DEFAULT ''huyen_co'',
    follow_ups TEXT,
    person1_data TEXT,
    person2_data TEXT,
    metadata TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question Categories
CREATE TABLE IF NOT EXISTS question_categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT ''📋'',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Questions
CREATE TABLE IF NOT EXISTS custom_questions (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES question_categories(id),
    text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Access Logs
CREATE TABLE IF NOT EXISTS access_logs (
    id BIGSERIAL PRIMARY KEY,
    ip TEXT,
    method TEXT,
    path TEXT,
    status_code INTEGER,
    user_agent TEXT,
    user_id TEXT,
    user_email TEXT,
    response_time INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_consultations_customer ON consultations(customer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_theme ON consultations(theme_id);
CREATE INDEX IF NOT EXISTS idx_customers_birth ON customers(year, month, day);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON access_logs(created_at);

-- Row Level Security (RLS) — disable for service key usage
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs DISABLE ROW LEVEL SECURITY;

-- Seed default question categories
INSERT INTO question_categories (name, icon, order_index) VALUES
    (''Công danh'', ''🏛️'', 1),
    (''Tình duyên'', ''❤️'', 2),
    (''Tài lộc'', ''💰'', 3),
    (''Sức khỏe'', ''🏥'', 4),
    (''Con cái'', ''👶'', 5),
    (''Đồng nghiệp'', ''👥'', 6),
    (''Hợp tác'', ''🤝'', 7),
    (''Tai họa'', ''🌪️'', 8)
ON CONFLICT DO NOTHING;
'@

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Migration files created successfully!" -ForegroundColor Green  
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Fill in .env.local with real API keys" -ForegroundColor White
Write-Host "2. Run Supabase schema: lib\supabase-schema.sql" -ForegroundColor White
Write-Host "3. Generate articles JSON: run articles-to-json.ps1" -ForegroundColor White
Write-Host "4. cd frontend && npm install && npm run dev" -ForegroundColor White
Write-Host "5. Deploy: vercel --cwd frontend" -ForegroundColor White
