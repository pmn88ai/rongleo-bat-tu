# PROJECT MAP — RongLeo Bát Tự

> File này được tạo tự động bởi Codebase Auditor.
> Audit date: 2026-05-14

---

## 1. PROJECT OVERVIEW

**App**: Huyền Cơ Bát Tự (RongLeo) — Nền tảng phân tích Tứ Trụ (Bát Tự/BaZi) chuyên sâu, tích hợp AI tư vấn.

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 19.2 |
| Build tool | Vite | 7.3 |
| Routing | React Router DOM | 7.1 |
| Backend | Express.js | 4.18 |
| Database | SQLite (sql.js + sqlite3) | 1.10 / 5.1 |
| AI Integration | Groq / OpenRouter API | - |
| Lunar calendar | lunar-javascript | 1.6 |
| Western Astrology | Custom (no external lib) | 1.0 (basic) |
| CSS | Plain CSS (index.css + App.css + patches) | - |
| Package manager | npm workspaces | - |
| Deployment | Vercel (frontend) + standalone Node (backend) | - |

### Database
- **SQLite** (`backendjs/data/bazi_consultant.db`)
- WAL mode enabled
- Tables: `customers`, `consultations`, `users`, `sessions`, `articles`, `que_history`, `credit_transactions`, `access_logs`, `credit_requests`, `question_categories`, `custom_questions`, `article_categories`

---

## 2. FOLDER STRUCTURE

```
rongleo-bat-tu/
├── package.json                 # Root monorepo (workspaces: frontend + backendjs)
├── README.md                    # Tài liệu chính (tiếng Việt)
├── README.en.md                 # Tài liệu tiếng Anh
├── docs/
│   └── PROJECT_MAP.md           # File này
│
├── frontend/                    # React 19 + Vite 7
│   ├── index.html               # Entry HTML (title bị lỗi font)
│   ├── vite.config.js           # Port 3005, proxy /api → localhost:3000
│   ├── vercel.json              # Vercel deployment config + rewrites
│   ├── eslint.config.js         # ESLint flat config
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              # Root component, routing
│       ├── index.css            # Global styles (~200KB)
│       ├── App.css
│       ├── scroll-fix.css       # Mobile scroll fixes
│       ├── _mobile_shell_patch.css
│       │
│       ├── features/
│       │   ├── Homepage/        # BirthInput, DatePicker, QuickDivination
│       │   ├── BaziChart/       # BaziChart, ChartDetails, RelationshipRadar
│       │   ├── LuckCycles/      # LuckCycles page
│       │   ├── Interpretation/  # MatrixAnalysis, ClassicTexts, LuanGiai
│       │   ├── Consultant/      # ConsultantPage, TypewriterEffect
│       │   ├── Matching/        # MatchingPage
│       │   ├── DateSelection/   # PersonalizedDate, AuspiciousDatePicker, DateSelection
│       │   ├── Que/             # QuePage, QueCard, QueTimeline, QueShareCard, GuaSymbol
│       │   ├── Articles/        # ArticlePage
│       │   ├── Admin/           # AdminPage (~55K+ dòng)
│       │   └── ConsultationHistory/ # HistoryPage, HistoryCard, HistoryDetailView
│       │
│       ├── components/
│       │   ├── common/SEO.jsx
│       │   ├── DesktopShell.jsx
│       │   ├── MobileShell.jsx
│       │   ├── AuthModal.jsx
│       │   ├── ComprehensiveInterpretation.jsx
│       │   ├── ImageExportButton.jsx
│       │   ├── PDFExportButton.jsx
│       │   ├── Toast.jsx
│       │   ├── SuggestedQuestions.jsx
│       │   ├── SampleShowcase.jsx
│       │   ├── RecentCustomers.jsx
│       │   └── ArticlesSection.jsx
│       │
│       ├── hooks/
│       │   ├── useBaziApi.js    # API hook + sessionStorage + URL recovery
│       │   └── useWindowSize.js
│       │
│       ├── context/AuthContext.jsx
│       ├── config/api.js
│       ├── services/
│       │   ├── apiClient.js     # Fetch-based API client
│       │   ├── imageExport.js   # html2canvas
│       │   └── pdfExport.js     # jsPDF
│       ├── utils/
│       │   ├── lunarCalendar.js
│       │   ├── dateUtils.js
│       │   └── getUserId.js
│       └── data/
│           ├── sampleQA.js      # 100+ câu hỏi mẫu
│           └── baziTerms.js     # 500+ thuật ngữ Bát Tự
│
│   # ⚠️ DUPLICATE: bazi engine copy cho Vercel serverless
│   └── lib/
│       ├── bazi/                  # Copy đồng bộ của backendjs/src/bazi/
│       ├── services/              # Copy của backend services
│       └── utils/                 # Copy của backend utils
│
├── backendjs/                  # Express.js API
│   ├── server.js                # Entry point (port 8888)
│   ├── package.json
│   ├── nodemon.json
│   ├── .env.example             # Template env
│   ├── seed_manual.js           # Manual seed script
│   ├── seed-questions.js        # Question seed script
│   ├── data/                    # SQLite DB files (gitignored)
│   └── src/
│       ├── bazi/                # 🧮 Core engine (~100+ files)
│       │   ├── calculator.js    # Core calculator
│       │   ├── ganzhi.js        # Can Chi core data + utils (292 lines)
│       │   ├── ganzhi_data.js   # Extended ganzhi data (1106 lines)
│       │   ├── core.js          # Core functions
│       │   ├── output.js        # Output formatting (771 lines)
│       │   ├── shensha.js       # Thần Sát
│       │   ├── dayun.js         # Đại Vận
│       │   ├── liunian.js       # Lưu Niên
│       │   ├── geju.js          # Cách Cục
│       │   ├── scoring_data.js  # Scoring data
│       │   ├── phan_tich/       # 16 analysis modules
│       │   ├── luan_giai/       # 20+ interpretation data files
│       │   ├── shishen/         # 6 Thập Thần modules
│       │   ├── hop_hon/         # Marriage matching
│       │   ├── thoi_gian_luan/  # Time analysis + 16 data files
│       │   ├── questions/       # 7 question engine files
│       │   ├── que_data/        # 3 hexagram data files
│       │   └── data/            # Shared data
│       │
│       ├── routes/              # 6 route files
│       │   ├── bazi.routes.js       # 584 lines (19 endpoints)
│       │   ├── consultant.routes.js
│       │   ├── auth.routes.js
│       │   ├── admin.routes.js
│       │   ├── articles.routes.js
│       │   └── que.routes.js
│       │
│       ├── services/
│       │   ├── bazi.service.js       # 402 lines
│       │   ├── database.service.js   # ~1400 lines (largest file)
│       │   ├── cache.service.js
│       │   ├── groq.service.js
│       │   ├── openrouter.service.js
│       │   └── que.service.js
│       │
│       ├── middleware/auth.js
│       └── utils/
│           ├── random.js
│           ├── dateUtils.js
│           └── seed-articles.js
```

---

## 3. ROUTE MAP

### Frontend Routes (React Router DOM)

| Path | Component | Auth Required | Description |
|------|-----------|:---:|---|
| `/` | BirthInput | No | Trang chủ - nhập thông tin sinh |
| `/input` | Redirect → `/` | No | Alias |
| `/laso` | BaziChart + ChartDetails + Radar | No | Lá số Bát Tự |
| `/vanhan` | LuckCycles | No | Đại Vận & Lưu Niên |
| `/phantich` | MatrixAnalysis | No | Ma trận phân tích |
| `/dientich` | ClassicTexts | No | Điển tích cổ văn |
| `/tuvan` | ConsultantPage | No | Tư vấn AI |
| `/duyenso` | MatchingPage | No | Hợp duyên |
| `/xemngay` | PersonalizedDate | No | Xem ngày cá nhân |
| `/chonngay` | AuspiciousDatePicker | No | Chọn ngày hoàng đạo |
| `/xinque` | QuePage | No | Gieo quẻ Kinh Dịch |
| `/lich-su` | HistoryPage | No | Lịch sử tư vấn |
| `/bai-viet/:slug` | ArticlePage | No | Bài viết |
| `/tuviphuongtay` | WesternPage | No | Tử Vi Tây (sun/moon/rising signs) |
| `/admin/*` | AdminPage | Yes (JWT) | Quản trị |
| `*` | Redirect → `/` | No | Catch-all |

### Backend API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/api/analyze` | Full BaZi analysis (main) |
| GET | `/api/chart` | Basic chart |
| GET | `/api/elements` | Ngũ Hành analysis |
| GET | `/api/scores` | Alias for elements |
| GET | `/api/stars` | Thần Sát analysis |
| GET | `/api/luck-cycles` | Đại Vận |
| GET | `/api/dayun` | Alias for luck-cycles |
| GET | `/api/year-analysis` | Lưu Niên |
| GET | `/api/analyze-time` | Time status analysis |
| GET | `/api/auspicious-dates` | Auspicious dates |
| GET | `/api/select-dates` | Alias for auspicious-dates |
| GET | `/api/basic-info` | Basic birth info |
| GET | `/api/pillars` | Detailed pillars |
| GET | `/api/analysis` | Structural analysis |
| GET | `/api/advanced` | Advanced analysis |
| GET | `/api/classic-texts` | Classic texts |
| GET | `/api/luan-giai` | Comprehensive interpretation |
| POST | `/api/matching` | Compatibility analysis |
| POST | `/api/matching/ai` | AI matching analysis |
| POST | `/api/consultant/ask` | AI consultant |
| GET | `/api/consultant/stats` | Consultant stats |
| GET | `/api/consultant/customers` | Customer list |
| GET | `/api/consultant/history/:id` | Consultation history |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Current user |
| GET/POST/PUT/DELETE | `/api/admin/*` | Admin CRUD |
| GET | `/api/articles` | Articles list |
| GET | `/api/articles/:slug` | Article detail |
| POST | `/api/que/ask` | Hexagram consultation |

---

## 4. BUSINESS LOGIC MAP

### BaZi Engine (`backendjs/src/bazi/`)

| Module | File | Chức năng | Lines (est.) |
|--------|------|-----------|:---:|
| Calculator | `calculator.js` | Tính toán các trụ (Năm/Tháng/Ngày/Giờ) | ~500 |
| Ganzhi | `ganzhi.js` | Can Chi data + conversion utilities | 292 |
| Ganzhi Data | `ganzhi_data.js` | Mở rộng: TEMP, ZHI_TIME, TEN_DEITIES (60 Hoa Giáp) | 1106 |
| Core | `core.js` | Gong/palace, element balance | 49 |
| Output | `output.js` | Format kết quả API | 771 |
| Shensha | `shensha.js` | 40+ loại Thần Sát | ~800 |
| Dayun | `dayun.js` | Đại Vận calculator | ~300 |
| Liunian | `liunian.js` | Lưu Niên calculator | ~200 |
| Geju | `geju.js` | Cách Cục recognition | ~200 |
| Scoring | `scoring_data.js` | Element scoring data | ~200 |

### Analysis Modules (`phan_tich/`)

| Module | File | Chức năng |
|--------|------|-----------|
| Quan hệ | `quan_he.js` | Hợp/Xung/Hình/Hại/Phá giữa Can Chi |
| Ngũ Hành | `ngu_hanh.js` | Phân tích element balance |
| Vòng Tràng Sinh | `vong_trang_sinh.js` | 12 life stages |
| Luận tính | `luan_tinh.js` | Personality analysis |
| Luận động | `luan_dong.js` | Dynamic analysis |
| Luận giải quan hệ | `luan_giai_quan_he.js` | Relationship interpretation |
| Tử Bình | `tu_binh_chan_thuyen.js` | Classic text analysis |
| Bệnh Dược | `benh_duoc.js` | Disease/remedy analysis |
| Kim Bất Hoán | `kim_bat_hoan.js` | Noble character analysis |
| Đồng Tình Luận | `dong_tinh_luan.js` | Same-energy analysis |
| Trích Thiên Tùy | `dich_thien_tuy.js` | Classic citation |
| Nạp Âm | `nap_am_chuyen_sau.js` | Nayin depth |
| Hình Hại Phá | `hinh_hai_pha.js` | Harm/penalty analysis |
| Cung Thông | `cung_thong_bao_giam.js` | Palace analysis |

### Thập Thần Modules (`shishen/`)
- `index.js`, `bijie.js` (Tỷ Kiếp), `cai.js` (Tài), `guansha.js` (Quan Sát), `shishang.js` (Thực Thương), `yinxiao.js` (Ấn Kiêu)

### Hardcoded Data Locations
- `ganzhi_data.js` — 60 Hoa Giáp data (1106 lines)
- `thoi_gian_luan/data/` — 16 files (mega_career, mega_love, mega_wealth, etc.)
- `luan_giai/data/` — 20+ files (personality, career_detail, health_detail, etc.)
- `phan_tich/data/` — 15+ data files
- `que_data/gua_64.js` — 64 hexagrams
- `questions/data.js` — Question templates
- `frontend/src/data/sampleQA.js` — 100+ sample Q&A
- `frontend/src/data/baziTerms.js` — 500+ terms dictionary

---

## 5. COMPONENT MAP

### Feature Components

| Component | Path | Role |
|-----------|------|------|
| BirthInput | `Homepage/BirthInput.jsx` | Main data entry form |
| DatePicker | `Homepage/DatePicker.jsx` | Calendar date picker |
| QuickDivination | `Homepage/QuickDivination.jsx` | Quick divination on homepage |
| BaziChart | `BaziChart/BaziChart.jsx` | Four pillars chart display |
| ChartDetails | `BaziChart/ChartDetails.jsx` | Detailed pillar info |
| RelationshipRadar | `BaziChart/RelationshipRadar.jsx` | Five elements radar chart |
| LuckCycles | `LuckCycles/LuckCycles.jsx` | Luck cycles timeline |
| MatrixAnalysis | `Interpretation/MatrixAnalysis.jsx` | Analysis matrix |
| ClassicTexts | `Interpretation/ClassicTexts.jsx` | Classic text citations |
| ConsultantPage | `Consultant/ConsultantPage.jsx` | AI chat interface |
| TypewriterEffect | `Consultant/TypewriterEffect.jsx` | AI typing animation |
| MatchingPage | `Matching/MatchingPage.jsx` | Compatibility matching |
| PersonalizedDate | `DateSelection/PersonalizedDate.jsx` | Personalized date viewing |
| AuspiciousDatePicker | `DateSelection/AuspiciousDatePicker.jsx` | Date picker calendar |
| QuePage | `Que/QuePage.jsx` | Hexagram divination |
| QueCard | `Que/components/QueCard.jsx` | Hexagram display card |
| GuaSymbol | `Que/components/GuaSymbol.jsx` | Hexagram symbol (unicode) |
| QueTimeline | `Que/components/QueTimeline.jsx` | Hexagram history timeline |
| QueShareCard | `Que/components/QueShareCard.jsx` | Shareable hexagram card |
| ArticlePage | `Articles/ArticlePage.jsx` | Article display |
| AdminPage | `Admin/AdminPage.jsx` | Admin dashboard |
| HistoryPage | `ConsultationHistory/HistoryPage.jsx` | History list |
| HistoryCard | `ConsultationHistory/HistoryCard.jsx` | History item card |

### Shared Components

| Component | File | Role |
|-----------|------|------|
| DesktopShell | `components/DesktopShell.jsx` | Desktop layout + nav tabs |
| MobileShell | `components/MobileShell.jsx` | Mobile layout + bottom nav |
| SEO | `components/common/SEO.jsx` | Meta tags, OG, Twitter, JSON-LD |
| AuthModal | `components/AuthModal.jsx` | Login/register modal |
| ComprehensiveInterpretation | `components/ComprehensiveInterpretation.jsx` | Full interpretation button |
| ImageExportButton | `components/ImageExportButton.jsx` | PNG export |
| PDFExportButton | `components/PDFExportButton.jsx` | PDF export |
| Toast | `components/Toast.jsx` | Toast notifications |
| SuggestedQuestions | `components/SuggestedQuestions.jsx` | Suggested AI questions |
| SampleShowcase | `components/SampleShowcase.jsx` | Sample Q&A showcase |
| RecentCustomers | `components/RecentCustomers.jsx` | Recent customers widget |
| ArticlesSection | `components/ArticlesSection.jsx` | Articles list section |

---

## 6. DATA SOURCES

### Constants / JSON / Hardcoded Data

| File | Type | Size | Description |
|------|------|:---:|---|
| `backendjs/src/bazi/ganzhi_data.js` | JS module | 1106 lines | Extended Can Chi data |
| `backendjs/src/bazi/shensha.js` | JS module | ~800 lines | 40+ Shen Sha |
| `backendjs/src/bazi/scoring_data.js` | JS module | ~200 lines | Scoring algorithms |
| `backendjs/src/bazi/phan_tich/data/*.js` | 15+ data files | - | Analysis data |
| `backendjs/src/bazi/thoi_gian_luan/data/*.js` | 16 data files | - | Time analysis + mega data |
| `backendjs/src/bazi/luan_giai/data/*.js` | 20+ data files | - | Interpretation data |
| `backendjs/src/bazi/que_data/` | 3 files | - | 64 hexagrams |
| `backendjs/src/bazi/questions/data.js` | JS module | - | Question templates |
| `backendjs/src/bazi/hop_hon/data/` | 1 file | - | Marriage matching data |
| `backendjs/src/bazi/data/shensha_list.js` | JS module | - | Shen Sha master list |
| `frontend/src/data/sampleQA.js` | JS module | 119 lines | Sample Q&A |
| `frontend/src/data/baziTerms.js` | JS module | 363 lines | 500+ BaZi terms |

### Database (SQLite)
- `backendjs/data/bazi_consultant.db` — SQLite file (auto-created)
- Tables: `customers`, `consultations`, `users`, `sessions`, `articles`, `que_history`, `access_logs`, `credit_transactions`, `credit_requests`, `question_categories`, `custom_questions`, `article_categories`

### Seed Data
- `backendjs/src/utils/seed-articles.js` — Seed articles
- `backendjs/seed_manual.js` — Manual seed script
- `backendjs/seed-questions.js` — Question seed script
- `database.service.js` auto-seeds on first run:
  - Default admin accounts (2 admins)
  - Default question categories (8 categories)
  - Default article categories (6 categories)
  - Default articles from `seed-articles.js`

---

## 7. SEO AUDIT

| Item | Status | Notes |
|------|--------|-------|
| `<title>` | ⚠️ FAIL | `index.html` has garbled title: `M???nh LA� AI - Lu??n Gi���i BA�t T���` (encoding issue) |
| `<meta description>` | ✅ | Dynamic via `SEO.jsx` component |
| `<meta keywords>` | ✅ | Dynamic via `SEO.jsx` |
| Open Graph | ✅ | `SEO.jsx` sets og:title, og:description, og:image, og:url |
| Twitter Cards | ✅ | `SEO.jsx` sets twitter:card (summary_large_image) |
| Canonical | ⚠️ Partial | `SEO.jsx` supports canonical but `siteUrl` is empty string (`""`) |
| Structured Data | ⚠️ Partial | `SEO.jsx` supports JSON-LD but no default structured data implemented |
| Sitemap | ❌ MISSING | No `sitemap.xml` |
| Robots.txt | ❌ MISSING | No `robots.txt` |
| Favicon | ✅ | `/vite.svg` configured |
| Font preconnect | ✅ | Google Fonts preconnect configured |
| Viewport | ✅ | With `viewport-fit=cover` |
| Language | ✅ | `<html lang="vi">` |
| Hreflang | ❌ MISSING | No hreflang tags (despite having EN/VN versions) |

### SEO Fixes Needed
1. **Fix garbled title** in `frontend/index.html` — ✅ Already correct (terminal display issue only)
2. **Add sitemap.xml** (dynamic or static)
3. **Add robots.txt** (allow all)
4. **Configure siteUrl** in SEO.jsx (currently empty)
5. **Add default structured data** (WebSite schema + local business)

---

## 6b. WESTERN ASTROLOGY MODULE

**Source**: `backendjs/src/western/` (completely independent from BaZi engine)

**Scope**:
| Feature | Accuracy | Confidence |
|---------|:--------:|:----------:|
| Sun sign (12 signs, cusp-safe) | ✅ Accurate | high |
| Moon sign (simplified cycle) | ⚠️ ±1 sign | low |
| Rising sign | ❌ Not implemented | — |
| Personality traits (5/sign, VN/EN) | ✅ Static map | high |
| Element distribution (Fire/Earth/Air/Water) | ✅ From signs | medium |

**API Integration**:
- Field `western_astrology` added to `/api/analyze` response
- Completely additive — does not affect BaZi fields
- No cross-referencing between BaZi and Western data

**Frontend Page**:
- Route: `/tuviphuongtay`
- Component: `frontend/src/features/WesternAstrology/WesternPage.jsx`
- Reads `bazi_data` from sessionStorage, extracts `western_astrology`
- 3 cards: Three Stars, Element Distribution, Personality

**Limitations Displayed in UI**:
- Moon sign ⚠️ "gần đúng"
- Rising sign ⚠️ "cần nơi sinh"
- Full disclaimer in page header
6. **Add hreflang tags** for EN/VN versions

---

## 8. UX AUDIT

### Mobile Readability

| Aspect | Status | Notes |
|--------|--------|-------|
| Responsive shell | ✅ | `MobileShell` vs `DesktopShell` auto-detect |
| Touch targets | ⚠️ Adequate | Tab navigation, buttons generally ≥44px |
| Font sizes | ⚠️ Adequate | Vietnamese with diacritics supported |
| Scroll fixes | ✅ | `scroll-fix.css` + `_mobile_shell_patch.css` |
| Viewport | ✅ | `viewport-fit=cover` |
| Bottom navigation | ✅ | MobileShell has bottom nav bar |

### Form UX

| Aspect | Status | Notes |
|--------|--------|-------|
| Birth input form | ✅ | Date picker + manual entry |
| Validation | ⚠️ Basic | Checks year/month/day exist but no range validation |
| Gender selection | ✅ | Dropdown Nam/Nữ |
| Hour input | ✅ | Dropdown |
| Calendar toggle | ✅ | Solar/Lunar toggle |
| URL recovery | ✅ | Restores state from URL params on F5 |

### Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| Semantic HTML | ⚠️ Partial | Uses `<nav>`, `<main>` but missing ARIA labels |
| Alt text | ❌ Not verified | Image export uses canvas, not img tags |
| Keyboard navigation | ⚠️ Basic | Tab navigation works for forms |
| Color contrast | ❌ Not audited | Dark theme may have contrast issues |
| Screen reader | ❌ Not audited | No explicit ARIA support |

### Performance

| Aspect | Status | Notes |
|--------|--------|-------|
| JS bundle | ⚠️ 1.29MB (uncompressed) | Vite build = 376KB gzipped |
| CSS bundle | ✅ 219KB (39KB gzipped) | Acceptable |
| Chunk size | ⚠️ Warning | >500KB chunk warning during build |
| Lazy loading | ❌ Not used | All components eagerly loaded |
| Code splitting | ❌ Not used | Single bundle |
| API caching | ✅ | LRU cache on backend (24h TTL) |
| Image optimization | ✅ | Minimal images, mostly CSS/HTML |
| Font loading | ✅ | Preconnect + `font-display` likely default |

---

## 9. TEST MAP

| Test File | Count | Type | What It Protects |
|-----------|:-----:|------|------------------|
| `backendjs/tests/core.test.js` | 68 | Engine unit + edge case | Ganzhi, calculator, 4 pillars, elements, dayun, shishen, 7 fixtures, 6 edge case suites |
| `backendjs/tests/api-contract.test.js` | 43 | HTTP integration | 12 endpoints: shape, required fields, invalid input, determinism |
| `backendjs/tests/western.test.js` | 25 | Western astrology | Sun/moon signs, personality, famous people, determinism |
| **Total** | **136** | | |

**Test commands**:
```bash
npm run test:core -w backendjs    # 68 engine tests
npm run test:api -w backendjs     # 43 API contract tests
npm run test:western -w backendjs # 25 Western astrology tests
cd backendjs && node --test tests/  # All 136 tests
```

---

## 10. RISK AUDIT

### Security Risks

| Severity | Issue | Status | Details |
|:---:|-------|:------:|---------|
| 🔴 **CRITICAL** | Exposed admin credentials | ✅ **FIXED** | `database.service.js` — env-driven bootstrap |
| 🟠 **HIGH** | Google Script URL exposed | ⚠️ Open | `useBaziApi.js:8` — hardcoded URL |
| 🟡 **MEDIUM** | No env file | ⚠️ Open | `.env.example` exists, `.env` must be copied |
| 🟡 **MEDIUM** | Hardcoded DB path | ⚠️ Open | `database.service.js:11` — DB_PATH hardcoded |
| 🟢 **LOW** | CORS wide open | ⚠️ Open | `server.js:49` — `app.use(cors())` |

### Build Risks

| Severity | Issue | Details |
|:---:|-------|---------|
| 🟡 **MEDIUM** | Chunk size >500KB | Main JS bundle is 1.29MB uncompressed |
| 🟡 **MEDIUM** | No type-check | `npm run type-check` not available |
| 🟡 **MEDIUM** | No lint script | `npm run lint` not available (ESLint config exists but no script) |
| 🟡 **MEDIUM** | Duplicate engine code | `frontend/lib/` is full copy of `backendjs/src/bazi/` — sync risk |
| ✅ **FIXED** | No tests existed | 136 tests now: 68 core engine + 43 API contract + 25 Western |

### Hydration Risks (SSR not used — SPA only)
- ✅ React 19 client-side only, no SSR hydration issues

### SEO Risks

| Severity | Issue | Details |
|:---:|-------|---------|
| 🟠 **HIGH** | Garbled `<title>` in index.html | Encoding issue renders Vietnamese text unreadable |
| 🟡 **MEDIUM** | No sitemap.xml | Search engines cannot discover all pages |
| 🟡 **MEDIUM** | No robots.txt | Crawlers have no guidance |
| 🟡 **MEDIUM** | Empty siteUrl | Canonical/OG URLs may be broken |
| 🟢 **LOW** | No hreflang | Bilingual content not marked for language targeting |

### Code Quality Risks

| Severity | Issue | Details |
|:---:|-------|---------|
| 🟡 **MEDIUM** | Dead code | Commented-out redirect logic in App.jsx (L99-109) |
| 🟡 **MEDIUM** | Dead code | Commented-out `/api/daily` route in server.js |
| 🟡 **MEDIUM** | Dead code | Commented-out PDFExportButton in ChartPage |
| 🟡 **MEDIUM** | Duplicated engine | `frontend/lib/bazi/` — same 100+ files as backend |
| 🟢 **LOW** | Silent fail pattern | `saveProfileToSheet` catches all errors silently |
| 🟢 **LOW** | Missing input validation | Birth year/month/day not range-validated |
| 🟢 **LOW** | Missing input validation | Gender not validated against allowed values |

### Analytics
- ❌ No Google Analytics / Plausible / any analytics
- ✅ Basic access logging to SQLite (IP, path, timing)
- ✅ Google Sheet tracking (hardcoded script URL)

---

## 11. IMPROVEMENT OPPORTUNITIES

### Quick Wins

| Priority | Improvement | File | Effort |
|:--------:|-------------|------|:------:|
| 🔴 P0 | Fix garbled `<title>` in index.html | `frontend/index.html` | 1 min |
| 🔴 P0 | Add `npm run lint` script | `package.json` | 1 min |
| 🟠 P1 | Remove hardcoded admin hash (move to env) | `database.service.js` | 10 min |
| 🟠 P1 | Remove hardcoded Google Script URL | `useBaziApi.js` | 5 min |
| 🟠 P1 | Add robots.txt | `frontend/public/robots.txt` | 5 min |
| 🟡 P2 | Copy `.env.example` → `.env` for backend | Init script | 1 min |
| 🟡 P2 | Set `siteUrl` in SEO.jsx | `SEO.jsx` | 1 min |
| 🟡 P2 | Add default JSON-LD structured data | `SEO.jsx` | 10 min |

### Medium Improvements

| Priority | Improvement | Files | Effort |
|:--------:|-------------|-------|:------:|
| 🟠 P1 | Add birth year range validation (1900-2026) | `BirthInput.jsx` | 15 min |
| 🟠 P1 | Add sitemap.xml generation | New file | 30 min |
| 🟠 P1 | Add `<meta name="robots">` to pages | `SEO.jsx` | 5 min |
| 🟡 P2 | Implement code splitting (lazy routes) | `App.jsx` | 30 min |
| 🟡 P2 | Add analytics (GA4 or Plausible) | `main.jsx` | 20 min |
| 🟡 P2 | Clean up dead code | `App.jsx`, `server.js` | 15 min |
| 🟡 P2 | Add ESLint + Prettier config | Root | 15 min |

### Long-Term Improvements

| Priority | Improvement | Rationale |
|:--------:|-------------|-----------|
| 🟡 P2 | Migrate `frontend/lib/` to Vercel serverless functions | Remove duplicating 100+ files |
| 🟡 P2 | Add input validation middleware | Birth date, gender, calendar validation |
| 🟡 P2 | Environment-driven DB path | Use env vars for DB location |
| ✅ **FIXED** | Unit/integration tests | 136 tests using `node --test` |
| 🟢 P3 | CI/CD pipeline | GitHub Actions for lint+build+test |
| 🟢 P3 | TypeScript migration | Large codebase, high risk |
| 🟢 P3 | Add ARIA labels and keyboard a11y | Mobile shell needs work |
| 🟢 P3 | PWA support (manifest, service worker) | Installable app |
| 🟢 P3 | i18n framework | Currently manual EN/VN via separate files |
