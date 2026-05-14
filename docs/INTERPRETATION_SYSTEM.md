# Interpretation System

## Current Architecture

The interpretation system is the text-generation layer of the BaZi engine. It takes calculated chart data (gans, zhis, elements, scores, etc.) and produces human-readable Vietnamese analysis text.

### Flow

```
BaZiCalculator.calculate()
    → ctx (raw chart data)
    → formatOutput(ctx, options)
        → buildCauTruc()           — Structural analysis (Thiên Can, Địa Chi, Âm-Dương, Ngũ Hành)
        → buildThanSatSao()         — Thần Sát star analysis
        → buildThapThanAnalysis()   — Thập Thần (Ten Gods) analysis
        → determineCach()           — Cách Cục pattern recognition
        → analyzeNguHanh()          — Ngũ Hành balance (Dụng/Hỷ/Kỵ Thần)
        → calculateDaiVan()         — Đại Vận (Luck Cycles)
        → runAllAnalyses()          — 13 analysis modules
            → benh_duoc
            → dich_thien_tuy
            → tu_binh_chan_thuyen
            → nap_am_chuyen_sau
            → hinh_hai_pha
            → vong_trang_sinh
            → dong_tinh_luan
            → kim_bat_hoan
            → cung_thong_bao_giam
            → tam_menh_thong_hoi
            → luan_tinh             — Personality/Career/Marriage (structured + text)
            → luan_dong             — Dynamic analysis
            → shishen               — Full Thập Thần analysis
        → analyzeLuanGiai()     — Synthesis report (luan_giai/core.js)
            → uses data from luan_giai/data/* (20+ data files)
        → buildVanBanCoDien()   — Classic text citations
    → Full API response object
```

### Interpretation Sources

| Source | Location | Format | Content |
|--------|----------|--------|---------|
| `phan_tich/*.js` | `bazi/phan_tich/` | Array of strings | 12 analysis modules |
| `luan_giai/core.js` | `bazi/luan_giai/core.js` | Object `{title, icon, content[]}` | Synthesis report sections |
| `luan_giai/data/*.js` | `bazi/luan_giai/data/` | Exported data objects | 20+ data files (career, health, relationships, etc.) |
| `output.js` | `bazi/output.js` | Structured object | Full API response |
| `shishen/*.js` | `bazi/shishen/` | Array of strings | 6 Thập Thần sub-modules |
| `ganzhi.js` | `bazi/ganzhi.js` | Functions | Data lookups for descriptions |

### Categories

| Category | Source Module | Output Shape | Description |
|----------|-------------|:------------:|-------------|
| Personality | `phan_tich/luan_tinh.js` | `{personality: string[]}` | Day master analysis, traits |
| Career | `phan_tich/luan_tinh.js` + `luan_giai/core.js` | `{career: string[]}` + sections | Career advice, industries |
| Finance | `phan_tich/shishen/cai.js` | `string[]` | Wealth analysis |
| Relationship | `phan_tich/luan_tinh.js` + `luan_giai/core.js` | `{marriage: string[]}` + sections | Marriage, family, relationships |
| Health | `luan_giai/core.js` | sections | Health risks, prevention |
| Timing | `luan_giai/core.js` | sections | Life stage, seasonal advice |
| Shen Sha | `output.js` + `phan_tich/luan_tinh.js` | `{stars: object}` | 40+ star types |
| Element Balance | `output.js` | `{can_bang_ngu_hanh: object}` | Dụng/Hỷ/Kỵ Thần |
| Classic Texts | `output.js` | `{van_ban_co_dien: object}` | Traditional citations |

### Current Output Shape (API Response)

```js
{
  metadata: { phien_ban, thoi_gian_tao },
  tham_so_dau_vao: { gioi_tinh, ngay_gio },
  thong_tin_co_ban: { ten, gioi_tinh, tuoi, bat_tu, ... },
  diem_so: { ngu_hanh, ngu_hanh_vn, suc_manh, nhiet_do },
  chi_tiet_tru: [ { tru, can, chi, nap_am, thap_than, tang_can, moi_quan_he, than_sat, truong_sinh } ],
  phan_tich: {
    cau_truc: { thien_can, dia_chi, am_duong, ngu_hanh },
    than_sat_sao: { thien_at, dao_hoa, dich_ma, ... },
    thap_than: { ty_kiep, thuc_thuong, tai_tinh, quan_sat, an_tinh, commentary },
    ket_luan: { cuc, cach, van_ban },
    quan_he_can_chi: { thien_can, dia_chi, luan_giai_chi_tiet },
    can_bang_ngu_hanh: { dung_than, hy_than, ky_than },
    luan_tinh: { personality: string[], career: string[], marriage: string[], stars, metadata },
    luan_dong: string[],
    vong_trang_sinh: { stages, pillar_details, analysis },
    kinh_dien: { nhat_chu, cung_phu_the, nam_tru },
    suc_khoe: { ngu_hanh_nhat_chu, loi_khuyen, huong_tot, mau_may_man },
    quan_he_mo_rong: { can_hop, can_xung, chi_hop, chi_xung, chi_hinh, chi_hai, chi_pha },
    phan_tich_nang_cao: { benh_duoc, dich_thien_tuy, ... 12 modules }
  },
  luan_giai: { sections: [{ title, icon, content }] },
  van_ban_co_dien: { nam, thang, ngay, gio },
  dai_van: [ { can_chi, nam, thap_than, ... } ]
}
```

## Current Problems

| # | Problem | Location | Severity |
|---|---------|----------|:--------:|
| 1 | **Hardcoded text** — Text strings embedded in logic, no separation | All `phan_tich/*.js`, `output.js` | High |
| 2 | **Duplication** — Same interpretation text repeated across modules | `luan_tinh.js`, `shishen/*.js`, `luan_giai/core.js` | Medium |
| 3 | **No metadata** — No confidence score, source tracking, version | All output | High |
| 4 | **No structured categories** — All text is flat string arrays | `phan_tich/*.js` returns `string[]` | Medium |
| 5 | **Non-deterministic output** — `luan_giai/core.js` uses `createSeededRandom()` for variety | `luan_giai/core.js:64-66` | Low (seeded) |
| 6 | **Untraceable conditions** — Logic chains for text selection undocumented | `luan_tinh.js` complex conditionals | Medium |
| 7 | **Mixed concerns** — Data, logic, and presentation in same file | `output.js` (771 lines), `luan_tinh.js` (362 lines) | Medium |
| 8 | **No i18n support** — All text hardcoded in Vietnamese | All files | Low |
| 9 | **Duplicate engine code** — `frontend/lib/` copies bazi engine | `frontend/lib/bazi/` | High |

## Proposed Metadata Model

### Interpretation Object Shape

```js
{
  // Core identification
  id: "personality_day_master_summary",
  category: "personality",
  subcategory: "day_master_traits",

  // Content
  title: "Tổng Quan Bản Mệnh",
  summary: "Nhật chủ Giáp Mộc...",
  content: ["Đoạn văn 1", "Đoạn văn 2"],
  keywords: ["Nhật chủ", "Giáp Mộc", "tính cách"],

  // Quality
  severity: "info",           // "info" | "warning" | "positive" | "negative" | "neutral"
  confidence: "high",         // "high" | "medium" | "low" | "calculated"
  certainty: {
    score: 0.85,              // 0-1
    basis: "exact_match"      // "exact_match" | "rule_based" | "ai_generated" | "fallback"
  },

  // Traceability
  sourceRules: [
    "day_master = Giáp AND month_zhi = Dần → personality_trait_x"
  ],
  sourceData: {
    module: "luan_tinh",
    version: "1.0",
    dataFiles: ["phan_tich/data/luan_tinh_data.js"]
  },

  // Timing
  generatedAt: "2026-05-14T10:00:00.000Z",
  version: "1.0.0"
}
```

### Category Taxonomy

```js
INTERPRETATION_CATEGORIES = {
  PERSONALITY:     { id: "personality",     label: "Tính cách",       icon: "👤" },
  CAREER:          { id: "career",          label: "Sự nghiệp",       icon: "💼" },
  FINANCE:         { id: "finance",         label: "Tài lộc",         icon: "💰" },
  RELATIONSHIP:    { id: "relationship",    label: "Tình cảm",        icon: "❤️" },
  HEALTH:          { id: "health",          label: "Sức khỏe",        icon: "🏥" },
  FAMILY:          { id: "family",          label: "Gia đình",        icon: "👨‍👩‍👧‍👦" },
  EDUCATION:       { id: "education",       label: "Học vấn",         icon: "📚" },
  SPIRITUAL:       { id: "spiritual",       label: "Tâm linh",        icon: "🕯️" },
  TIMING:          { id: "timing",          label: "Thời vận",        icon: "📅" },
  SHEN_SHA:        { id: "shen_sha",        label: "Thần sát",        icon: "⭐" },
  ELEMENT:         { id: "element",         label: "Ngũ hành",        icon: "🔥" },
  CLASSIC:         { id: "classic",         label: "Cổ văn",          icon: "📜" },
}
```
