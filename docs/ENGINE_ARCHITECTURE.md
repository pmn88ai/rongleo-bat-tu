# ENGINE ARCHITECTURE — RongLeo Bát Tự

> **Version**: 1.0.0  
> **Last updated**: 2026-05-14  
> **Engine source**: `backendjs/src/bazi/` (JavaScript, Node.js >= 18)  
> **See also**: [PROJECT MAP](./PROJECT_MAP.md) | [INTERPRETATION SYSTEM](./INTERPRETATION_SYSTEM.md) | [SECURITY REPORT](./SECURITY_REPORT.md)

---

## 1. Purpose

The BaZi engine converts a person's birth date/time into a Tứ Trụ (Four Pillars) chart, then produces structured analysis across multiple traditional Chinese metaphysics dimensions.

**It is NOT a general-purpose astrology engine.** It specifically implements:
- Vietnamese BaZi (Tứ Trụ / Bát Tự) methodology
- Ngũ Hành (Five Elements) scoring and balance
- Thập Thần (Ten Gods / 十神) relationships
- Thần Sát (40+ Divine Stars / 神煞) detection
- Đại Vận (10-year Luck Cycles / 大运)
- Lưu Niên (Annual / 流年) analysis
- Classic text citations (Tử Bình Chân Thuyên, Trích Thiên Tùy, etc.)
- AI-assisted interpretation (via Groq/OpenRouter APIs)

---

## 2. Canonical Engine Source

| Path | Role | Status |
|------|------|:------:|
| `backendjs/src/bazi/` | **Primary engine** (source of truth) | Active, all calculations |
| `frontend/lib/bazi/` | Full copy of `backendjs/src/bazi/` for Vercel serverless | ⚠️ Duplicate, synced manually |
| `frontend/src/` | UI rendering only, no engine logic | Clean separation |

**Rule**: All BaZi calculations happen on the backend. The frontend only:
- Renders chart data received from API
- Formats text output in UI components
- Exports images/PDFs using `html2canvas` + `jsPDF`

The `frontend/lib/bazi/` duplicate exists only because Vercel serverless functions need bundled engine code. It must be kept in sync with `backendjs/src/bazi/`.

---

## 3. Input Flow

### Required Parameters

| Param | Type | Default | Notes |
|-------|------|:-------:|-------|
| `year` | number | — | Birth year (solar calendar). Negative years accepted. |
| `month` | number | — | 1-12. Invalid values (0, 13+) throw. |
| `day` | number | — | 1-31. Invalid values (0, 32+) throw. |
| `hour` | number | 12 | 0-23. 0 = midnight, 12 = noon. |
| `gender` | string | `Nam` | `Nam` / `Nữ` (female check: `nữ`, `nu`, `female`) |
| `calendar` | string | `solar` | `solar` or `lunar`. Input is converted if lunar. |
| `minute` | number | 0 | Used for hour accuracy. |

### Entry Points

```
HTTP Request → routes/bazi.routes.js → services/bazi.service.js → bazi/calculator.js
                                  ↕
                         services/cache.service.js (LRU, 24h TTL)
```

All `GET /api/*` endpoints accept query parameters. The main flow:

```
/api/analyze?year=1990&month=6&day=15&hour=12&gender=Nam
```

---

## 4. Calculation Pipeline

```
                    ┌─────────────────────────────────────────┐
                    │            HTTP Request                 │
                    │  /api/analyze?year=...&month=...&...    │
                    └────────────────┬────────────────────────┘
                                     │
                    ┌────────────────▼────────────────────────┐
                    │       bazi.service.js                   │
                    │   (orchestration + caching)             │
                    └────────────────┬────────────────────────┘
                                     │
                    ┌────────────────▼────────────────────────┐
                    │       calculator.js                     │
                    │   BaZiCalculator.calculate()            │
                    └────────────────┬────────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
    ┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐
    │  lunar-javascript│   │    ganzhi.js     │   │     core.js      │
    │  Solar/Lunar     │   │  Can Chi data +  │   │  Element balance │
    │  → getEightChar()│   │  conversion utils│   │  + helpers       │
    └────────┬─────────┘   └────────┬─────────┘   └──────────────────┘
             │                      │
             ▼                      ▼
    ┌──────────────────────────────────────────────────────────┐
    │  calculator._buildContext(solar, lunar, bazi)            │
    │  returns ctx object with:                                │
    │    gans, zhis, pillars, elements, scores,                │
    │    solar, lunar, ganShens, zhiShens, nayin, etc.        │
    └──────────────┬───────────────────────────────────────────┘
                   │
    ┌──────────────▼───────────────────────────────────────────┐
    │                    output.js — formatOutput(ctx)         │
    │  (synthesizes everything into the API response)          │
    │                                                          │
    │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
    │  │ buildCauTruc│  │buildThapThan │  │ buildThanSatSao  │  │
    │  │ +can_bang   │  │ (5 groups)   │  │ (star analysis)  │  │
    │  └─────────────┘  └──────────────┘  └─────────────────┘  │
    │                                                          │
    │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
    │  │phan_tich/   │  │  luan_giai/  │  │  calculateDaiVan │  │
    │  │ 13 modules  │  │  synthesis   │  │  (dayun.js)      │  │
    │  └─────────────┘  └──────────────┘  └─────────────────┘  │
    └──────────────────────────┬───────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │     API Response    │
                    │  JSON object        │
                    └─────────────────────┘
```

### Detailed Steps

1. **Parse input** → `calculator.js:30-70` — convert to `Solar` (via `lunar-javascript`), get `Lunar` and `Bazi` objects.

2. **Extract Gans/Zhis** → `calculator.js:44-57` — `getYearGan()`, `getMonthGan()`, `getDayGan()`, `getTimeGan()` from `lunar-javascript`'s `getEightChar()`.

3. **Build pillars** → `calculator.js:75-111` — 4 pillars with: Can, Chi, Nạp Âm, Tàng Can, Thập Thần Can/Chi.

4. **Calculate elements** → `calculator.js:118-146` — scores each Gan +5, scores hidden stems from ZHI5 (month counted twice), producing `{ Kim, Mộc, Thủy, Hỏa, Thổ }`.

5. **Calculate scores** → `calculator.js:152-233` — strength analysis via Thập Thần + Vòng Tràng Sinh.

6. **Build context** → `calculator.js:254-403` — `_buildContext()` adds `basicInfo`, `pillars`, `elements`, `scores`, `ganShens`, `zhiShens`, `nayin`, `menhCung`, `thaiNguyen`, etc.

7. **Format output** → `output.js:16-384` — `formatOutput()` orchestrates:
   - `buildCauTruc()` — Thiên Can, Địa Chi, Âm-Dương, Ngũ Hành distribution
   - `buildThanSatSao()` — celestial star groupings
   - `buildThapThanAnalysis()` — 5-group Thập Thần with sub-module analysis
   - `determineCach()` — Cách Cục (pattern) recognition
   - `analyzeNguHanh()` — Dụng/Hỷ/Kỵ Thần determination
   - `calculateDaiVan()` — Đại Vận (10-year cycles)
   - `runAllAnalyses()` — 13 analysis modules
   - `analyzeLuanGiai()` — comprehensive interpretation synthesis

8. **Return structured response** — the final object includes `metadata`, `thong_tin_co_ban`, `diem_so`, `chi_tiet_tru`, `phan_tich`, `luan_giai`, `dai_van`, and (new) `structured_interpretations`.

---

## 5. Core Modules

### 5.1 `calculator.js` (432 lines)

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Core BaZi calculation. Converts birth params → chart context. |
| **Input** | `options: { year, month, day, hour, minute, isFemale, isSolar }` |
| **Output** | `ctx` object with: `gans`, `zhis`, `pillars[]`, `elements{}`, `scores{}`, `solar`, `lunar`, `ganShens[]`, `zhiShens[]`, `nayin[]`, `pillarStages[]`, `menhCung`, `thaiNguyen`, `thanCung` |
| **Dependencies** | `lunar-javascript` (Solar/Lunar conversion), `ganzhi.js`, `core.js`, `dayun.js` |
| **Caveats** | Hour 0 (00:00) maps to Ngọ (午) hour, not Tý (子) — see §9. |

### 5.2 `ganzhi.js` (292 lines + `ganzhi_data.js` 1106 lines)

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Can Chi data definitions and conversion utilities. |
| **Key data** | `GANS[10]`, `ZHIS[12]`, `ELEMENTS[10]`, `ZHI_ELEMENTS[12]`, `NAP_AM{}` (60 pairs), `TANG_CAN{}`, `ZHI5{}` (weighted hidden stems), `GAN5{}`, `GAN_YIN_YANG{}` |
| **Key functions** | `ganToVN()`, `zhiToVN()`, `ganToElement()`, `zhiToElement()`, `getNapAm()`, `getThapThan()`, `getVongTrangSinh()`, `getTangCan()` |
| **Data file** | `ganzhi_data.js` — extended: temperature, TEN_DEITIES (complete intersection tables for all 10 Gans), TRANG_SINH lifecycle tables |
| **Caveats** | Functions accept both Chinese (甲) and Vietnamese (Giáp) inputs |

### 5.3 `dayun.js` (625 lines)

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Calculate Đại Vận (10-year luck cycles). |
| **Key function** | `calculateDaiVan(ctx)` → `[{ can_chi, nam, thap_than, tuoi_bat_dau, luan_giai, ... }]` |
| **Direction logic** | Yang year + Male → forward; Yang year + Female → backward. Opposite for Yin years. |
| **Note** | Rewritten to match Python output exactly. Bypasses `lunar-javascript`'s built-in Yun. |

### 5.4 `shensha.js` (~800 lines)

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Detect 40+ divine stars (Thần Sát) in the chart. |
| **Output** | `{ summary[], year[], month[], day[], hour[] }` — each star with name + pillar location. |

### 5.5 `geju.js` (~200 lines)

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Pattern recognition (Cách Cục) — identifies special chart configurations. |

### 5.6 `shishen/` (6 modules)

| Module | File | Content |
|--------|------|---------|
| Tỷ Kiếp | `bijie.js` | Same-element relationships |
| Tài | `cai.js` | Wealth element analysis |
| Quan Sát | `guansha.js` | Officer/authority analysis |
| Thực Thương | `shishang.js` | Output/skill analysis |
| Ấn Kiêu | `yinxiao.js` | Seal/imprint analysis |
| Index | `index.js` | `runAllShishenAnalyses()` — runs all 5 with unified context |

### 5.7 `phan_tich/` (13 modules)

| Module | File | Focus |
|--------|------|-------|
| Bệnh Dược | `benh_duoc.js` | Disease/remedy diagnosis |
| Dịch Thiên Tùy | `dich_thien_tuy.js` | Classic text: Trích Thiên Tùy |
| Tử Bình Chân Thuyên | `tu_binh_chan_thuyen.js` | Classic text: Tử Bình |
| Nạp Âm | `nap_am_chuyen_sau.js` | Deep Nayin analysis |
| Hình Hại Phá | `hinh_hai_pha.js` | Harm/penalty relationships |
| Vòng Tràng Sinh | `vong_trang_sinh.js` | 12 life stages |
| Đồng Tình Luận | `dong_tinh_luan.js` | Same-energy resonance |
| Kim Bất Hoán | `kim_bat_hoan.js` | Noble character analysis |
| Cùng Thông Bảo Giám | `cung_thong_bao_giam.js` | Palace/path analysis |
| Tam Mệnh Thông Hội | (in `phan_tich/index.js`) | Hour pillar life stage |
| Luận Tĩnh | `luan_tinh.js` | Personality + Career + Marriage |
| Luận Động | `luan_dong.js` | Dynamic/change analysis |
| Thập Thần | `shishen/index.js` | Full Ten Gods analysis |

Each module returns `string[]` (text lines) or structured objects with text content.

### 5.8 `luan_giai/core.js` (306 lines)

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Synthesize all analysis modules into a user-friendly report. |
| **Output** | `Array<{ title, icon, content[] }>` — section-based report. |
| **Data** | 20+ data files in `luan_giai/data/` covering career, health, relationships, etc. |
| **Caveat** | Uses `createSeededRandom()` for variety in text selection (deterministic per input). |

### 5.9 `output.js` (771 lines, after updates ~830)

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Master formatter. Takes `ctx` → full API response. |
| **Output** | `{ metadata, tham_so_dau_vao, thong_tin_co_ban, diem_so, chi_tiet_tru, phan_tich, luan_giai, van_ban_co_dien, dai_van }` |
| **New field** | `structured_interpretations` — metadata-wrapped interpretation objects (see `INTERPRETATION_SYSTEM.md`) |

---

## 6. Interpretation Layer

See full documentation: [INTERPRETATION SYSTEM](./INTERPRETATION_SYSTEM.md)

### Summary

| Layer | File | Format | Structured? |
|-------|------|--------|:-----------:|
| Raw analysis | `phan_tich/*.js` | `string[]` or custom object | ❌ Text blobs |
| Thập Thần | `output.js:buildThapThanAnalysis()` | `{ ty_kiep, thuc_thuong, ... }` with `items[]` + `analysis[]` | ⚠️ Semi |
| Synthesis | `luan_giai/core.js` | `Array<{title, icon, content[]}>` | ⚠️ Sections |
| Metadata | `types/interpretation.types.js` | `{ id, category, confidence, tags, sourceRules, ... }` | ✅ Structured |
| API field | `structured_interpretations` | `{ personality, career, marriage }` each wrapped | ✅ New, additive |

**Backward compatibility**: All old fields remain unchanged. `structured_interpretations` is a new additive field.

---

## 7. API Layer

### Endpoint Reference

All endpoints accept `GET` with query parameters unless marked POST.

| Method | Path | Params/Body | Response Highlights |
|--------|------|-------------|-------------------|
| GET | `/api/analyze` | year, month, day, hour, gender, calendar, name | Full chart: metadata, thong_tin_co_ban, diem_so, chi_tiet_tru (4 pillars), phan_tich (all modules), luan_giai (sections), dai_van (luck cycles), structured_interpretations |
| GET | `/api/chart` | Same params | Simplified: `{ pillars[], elements, strength, basicInfo }` |
| GET | `/api/dayun` | Same params | `{ dai_van: [{ can_chi, nam, thap_than, ... }] }` |
| GET | `/api/elements` | Same params | `{ diem_so: { ngu_hanh_vn: {Kim, Mộc, Thủy, Hỏa, Thổ} } }` |
| GET | `/api/stars` | Same params | `{ sao_dac_biet: { thien_at, dao_hoa, dich_ma, ... } }` |
| GET | `/api/pillars` | Same params | `{ chi_tiet_tru: [...4 pillars] }` |
| GET | `/api/scores` | Same params | Alias for elements |
| GET | `/api/analysis` | Same params | Structural analysis |
| GET | `/api/advanced` | Same params | 13 advanced analysis modules |
| GET | `/api/classic-texts` | Same params | Classic text citations |
| GET | `/api/analyze-time` | +target_year/month/day | Time-based analysis |
| GET | `/api/select-dates` | +target_year/month, activity | Auspicious dates |
| POST | `/api/matching` | `{ person1, person2, relationship }` | `{ totalScore, assessment, breakdown, aspects, advice }` |
| POST | `/api/matching/ai` | `{ person1, person2, relationship, persona }` | AI matching analysis |
| POST | `/api/consultant/ask` | `{ year, month, day, hour, gender, questionId, ... }` | AI consultation answer |
| GET | `/api/consultant/themes` | — | Question categories |
| GET | `/api/consultant/questions/:id` | — | Questions for category |
| GET | `/api/consultant/stats` | — | Consultation statistics |

### Response Contract (shared across BaZi endpoints)

| Field | Type | Always Present | Description |
|-------|------|:--------------:|-------------|
| `metadata` | `{ phien_ban, thoi_gian_tao }` | ✅ | Version + generation timestamp |
| `thong_tin_co_ban` | object | ✅ | Basic info, `bat_tu` (4 pillars summary), age, life stage |
| `diem_so` | `{ ngu_hanh, ngu_hanh_vn, suc_manh, nhiet_do }` | ✅ | Element scores (5 elements + strength + temperature) |
| `chi_tiet_tru` | `[4 pillars]` | ✅ | Detailed pillars: can, chi, nap_am, thap_than, tang_can, moi_quan_he, than_sat, truong_sinh |
| `phan_tich` | object | ✅ | All analysis: cau_truc, than_sat_sao, thap_than, ket_luan, can_bang_ngu_hanh, luan_tinh, luan_dong, vong_trang_sinh, kinh_dien, quan_he_mo_rong |
| `luan_giai` | `[{ title, icon, content[] }]` | ✅ | Synthesis report sections |
| `dai_van` | `[{ can_chi, nam, thap_than, ... }]` | ✅ | 10-year luck cycles |
| `structured_interpretations` | object | ⚠️ (new) | Metadata-wrapped interpretations |
| `western_astrology` | object | ⚠️ (new) | Western sun/moon signs, personality, element distribution |

---

## 8. Validation & Tests

### Current Suite: 136 tests, 0 failures

| Test File | Count | Type | What It Protects |
|-----------|:-----:|------|------------------|
| `core.test.js` | 68 | Engine unit + edge case | ganzhi functions, calculator determinism, 4 pillars, elements, dayun, shishen, 7 golden fixtures, 6 edge case suites |
| `api-contract.test.js` | 43 | HTTP integration | 12 endpoints: response shape, required fields, invalid input safety, determinism |
| `western.test.js` | 25 | Western astrology | sun sign (all 12), moon sign, personality, famous people, determinism |

### Fixtures: `famous_cases.json`

7 golden cases with manually verified birth data:

| Case | 4 Pillars | Confidence |
|------|-----------|:----------:|
| Mao Trạch Đông | Quý Tỵ · Giáp Tý · Đinh Dậu · Giáp Thìn | high |
| Elon Musk | Tân Hợi · Giáp Ngọ · Giáp Thân · Mậu Thìn | high |
| Steve Jobs | Ất Mùi · Mậu Dần · Bính Thìn · Mậu Tuất | high |
| Taylor Swift | Kỷ Tỵ · Bính Tý · Đinh Mùi · Bính Ngọ | medium* |
| Lý Tiểu Long | Canh Thìn · Đinh Hợi · Giáp Tuất · Mậu Thìn | high |
| Albert Einstein | Kỷ Mão · Đinh Mão · Bính Thân · Giáp Ngọ | high |
| Hồ Chí Minh | Canh Dần · Tân Tỵ · Canh Tý · Canh Thìn | medium* |

\* `hourEstimated: true` — birth hour not confirmed by official documents.

---

## 9. Known Undefined Behaviors

These are documented from test findings (core.test.js edge case suites). They represent known discrepancies between the engine and traditional BaZi expectations.

| # | Behavior | Source | Impact |
|:-:|----------|--------|:------:|
| 1 | **Hour 0→12 mapping**: `hour=0` (midnight) and `hour=12` (noon) produce **identical hour pillar** (`Giáp Ngọ`). Traditional BaZi maps 0:00 to Tý (子) hour. | `lunar-javascript` library hour handling | Medium — midnight births get wrong hour pillar |
| 2 | **Non-leap Feb 29**: Accepted silently by `lunar-javascript` (auto-corrects to Mar 1 instead of throwing). | `lunar-javascript` | Low — edge case |
| 3 | **Negative years**: Accepted by engine. Year `-500` = Kỷ Hợi (pillar calculated). Cross-epoch calendar accuracy not guaranteed. | `lunar-javascript` | Low — ancient dates |
| 4 | **Hour default = 12**: When `hour` is undefined/null, fallback is 12 (noon). This is arbitrary — traditional BaZi has no default hour. | `calculator.js:15` | Medium — affects accuracy for unknown-hour charts |
| 5 | **Non-deterministic luan_giai**: `luan_giai/core.js` uses `createSeededRandom()` for variety. Deterministic per unique input (seed uses solar date + gender), but structurally not guaranteed stable across engine versions. | `luan_giai/core.js:64` | Low — seeded pseudo-random |
| 6 | **Timezone assumption**: All calculations use `Asia/Ho_Chi_Minh` (UTC+7). Input birth times are assumed to be in this timezone. No timezone conversion is performed. | `server.js:2` | Medium — non-VN births may be off by hours |
| 7 | **Month pillar = solar term (Jié Qì)**, not calendar month. E.g., Dec 26 has month pillar "Giáp Tý" (month 11), not "Ất Sửu" (month 12) because Dec 26 falls before Tiểu Hàn (Jan 6). | `calculator.js` via `lunar-javascript` | Expected behavior, but must not be confused with calendar months |

---

## 10. Security Notes

See full report: [SECURITY REPORT](./SECURITY_REPORT.md)

### Completed Fixes

| Issue | Status |
|-------|:------:|
| SQL Injection — `que.routes.js:349` | ✅ Fixed: allowlist validation |
| Gender parsing bug — `consultant.routes.js:83`, `bazi.routes.js:516` | ✅ Fixed: `parseGender()` exact match |
| Hardcoded admin credentials — `database.service.js:345-362` | ✅ Fixed: env-driven bootstrap |
| No-auth bypass — `middleware/auth.js` | ✅ Fixed: production-locked |
| x-user-id header spoofing in production | ✅ Rejects with 401 in `NODE_ENV=production` |

### Production Checklist

- Set `NODE_ENV=production` to disable x-user-id bypass
- Set `ADMIN_USERNAME` + `ADMIN_PASSWORD_HASH` if admin access needed
- Ensure `GROQ_API_KEY` is set for AI features
- Restrict CORS to production domain
- Reduce `express.json({ limit: '5mb' })` to 1MB if appropriate

---

## 11. Extension Points

These are areas where the architecture naturally supports future extension:

### 11.1 Western Astrology Integration
- `calculator.js` already receives solar date/time
- Western zodiac signs could be added alongside BaZi pillars
- No architectural barrier — purely additive

### 11.2 Cross-System Interpretation
- `phan_tich/` modules are independent; new modules can be added by creating a file and registering in `runAllAnalyses()`
- `luan_giai/data/` has 20+ data files — new topics can add new files

### 11.3 AI Interpretation Layer
- `openrouter.service.js` and `groq.service.js` already handle AI calls
- `structured_interpretations` field provides metadata for AI to target specific sections
- New personas can be added to the persona map in `groq.service.js`

### 11.4 SEO Content
- `luan_giai` sections have `{title, icon, content}` — could be used for meta descriptions
- `structured_interpretations` has `tags[]` — ready for keyword extraction
- `SEO.jsx` component already exists for frontend meta tags (see project map)

### 11.5 New Calculation Modules
- Add new file in `phan_tich/`
- Export a function `analyzeXxx(ctx) → string[]`
- Register in `phan_tich/index.js:runAllAnalyses()`
- Automatically included in API response under `phan_tich_nang_cao`

---

## 12. Non-Goals

The engine is designed as an **assistive tool** for BaZi practitioners. It is NOT:

- **A replacement for a human master**: All interpretations are generated by rules and AI, not by a trained practitioner.
- **A universal calendar library**: `lunar-javascript` handles calendar conversion. We do not maintain our own lunisolar calendar.
- **An astrology comparison engine**: Only Vietnamese BaZi methodology is implemented. Japanese (Shichu), Korean (Saju), or Western astrology are not supported.
- **A "fortune telling" device with guaranteed accuracy**: All outputs are for reference only. Ritual accuracy depends on correct birth time, which is often uncertain.
- **A timezone-aware system**: UTC+7 is assumed for all calculations. No timezone conversion is performed on input.
