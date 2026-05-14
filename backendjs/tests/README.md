# Backend Tests — RongLeo BaZi Engine

## Mục đích

Folder `tests/` chứa test runner và fixtures để validate các tính toán của BaZi engine (`backendjs/src/bazi/`).

Kiểm tra:
- Tính toán Tứ Trụ (4 pillars)
- Nạp Âm (Nayin)
- Thập Thần (Shishen / Ten Gods)
- Đại Vận (Luck Cycles)
- Tính deterministic (cùng input → cùng output)
- Fixed golden cases (fixtures)
- **Edge cases: boundaries, leap year, solar term, invalid input, gender direction**

## Cách chạy

### Core tests (68 tests — BaZi engine core)

```bash
# Từ thư mục root:
node --test backendjs/tests/core.test.js

# Hoặc từ thư mục backendjs:
cd backendjs
node --test tests/core.test.js

# Hoặc dùng npm script:
npm run test:core
```

Output: 68 tests, 14 suites. Dùng Node.js built-in `node --test` (không cần Jest/Mocha/Vitest).

### Yêu cầu
- Node.js >= 18 (đã có `node --test` built-in)

## Cấu trúc

```
backendjs/tests/
├── fixtures/
│   └── famous_cases.json      — 7 golden test cases (famous people)
├── core.test.js                — BaZi engine core test runner (68 tests)
└── README.md
```

## Test suites

### Core engine (38 tests)

| Suite | Tests | Mô tả |
|-------|:-----:|-------|
| `ganzhi core utilities` | 12 | Unit tests: ganToVN, zhiToVN, ganToElement, getNapAm, getThapThan, getTangCan |
| `BaZiCalculator` | 7 | Calculator: 4 pillars, elements, determinism, gender, no-crash |
| `calculateDaiVan` | 4 | Đại Vận: array, non-empty, required fields, determinism |
| `runAllShishenAnalyses` | 2 | Thập Thần analysis runs without throwing |
| `fixture golden cases` | 8 | 7 golden cases (yearPillar + monthPillar match) + summary |
| `edge cases (year/month)` | 3 | Year 1999/2000 boundaries, Feb 28→Mar 1 |

### Edge case regression (30 tests)

| Suite | Tests | Mô tả |
|-------|:-----:|-------|
| `giờ Tý boundary` | 7 | 23:00→01:00: no crash, determinism, day rollover |
| `leap year handling` | 4 | Leap day (2000, 2024), non-leap Feb 29, determinism |
| `solar term — Lập Xuân` | 4 | Feb 3-5 2024: year+month transition at solar term boundary |
| `solar term — Đông Chí` | 2 | Dec 21 2024, Jan 1 2025: pre-Lập Xuân year consistency |
| `missing hour fallback` | 4 | undefined/null hour defaults to 12, minute defaults to 0 |
| `gender → Đại Vận direction` | 3 | Dương/Âm year × gender direction, determinism per gender |
| `invalid input safety` | 7 | month=13, day=40, hour=99, negative year, month=0, day=0, missing year |
| `edge case summary` | 1 | Coverage report + known limitations documentation |

## Edge Case Findings

### Giờ Tý Boundary
| Input | Hour Pillar | Note |
|-------|:-----------:|------|
| 23:00 (Tý) | Canh Tý | Correct: Tý hour |
| 23:30 (Tý) | Canh Tý | Correct: Tý hour |
| 23:59 (Tý) | Canh Tý | Correct: Tý hour |
| 00:00 | Giáp Ngọ | **⚠️ Ngọ hour — may be inaccurate** |
| 00:30 | Giáp Ngọ | **⚠️ Ngọ hour — may be inaccurate** |
| 01:00 (Sửu) | Kỷ Sửu | Correct: Sửu hour |

**Known limitation**: `lunar-javascript` maps 00:00 to Ngọ (noon) hour instead of Tý (midnight). Traditional Baži maps Tý as 23:00-01:00. This is a known issue with the library.

### Solar Term (Lập Xuân 2024)
| Date | Year | Month | Note |
|------|:----:|:-----:|------|
| Feb 3 | Quý Mão | Ất Sửu | Pre Lập Xuân |
| Feb 4 | Quý Mão | Ất Sửu | Transition day |
| Feb 5 | Giáp Thìn | Bính Dần | Post Lập Xuân |

Year AND month both change at Lập Xuân boundary.

### Invalid Input Safety
| Input | Behavior |
|-------|----------|
| month=13 | Throws (from `lunar-javascript`) |
| day=40 | Throws |
| hour=99 | Throws |
| month=0 | Throws |
| day=0 | Throws |
| year=-500 | **Accepted** (pillars calculated) |
| missing year | Throws (missing required param) |

## Fixtures

### Format

Xem `fixtures/famous_cases.json` cho format chi tiết.

### Golden cases

| # | Case | Birth | Gender | 4 Pillars (Năm-Tháng-Ngày-Giờ) | DM | Confidence | Hour |
|---|------|-------|:------:|:-------------------------------:|:--------:|:----------:|:----:|
| 1 | **Mao Trạch Đông** | 1893-12-26 07:00 | Nam | Quý Tỵ · Giáp Tý · Đinh Dậu · Giáp Thìn | Đinh (Hỏa) | high | known |
| 2 | **Elon Musk** | 1971-06-28 07:30 | Nam | Tân Hợi · Giáp Ngọ · Giáp Thân · Mậu Thìn | Giáp (Mộc) | high | known |
| 3 | **Steve Jobs** | 1955-02-24 19:15 | Nam | Ất Mùi · Mậu Dần · Bính Thìn · Mậu Tuất | Bính (Hỏa) | high | known |
| 4 | **Taylor Swift** | 1989-12-13 12:00 | Nữ | Kỷ Tỵ · Bính Tý · Đinh Mùi · Bính Ngọ | Đinh (Hỏa) | medium | estimated |
| 5 | **Lý Tiểu Long** | 1940-11-27 07:00 | Nam | Canh Thìn · Đinh Hợi · Giáp Tuất · Mậu Thìn | Giáp (Mộc) | high | known |
| 6 | **Albert Einstein** | 1879-03-14 11:30 | Nam | Kỷ Mão · Đinh Mão · Bính Thân · Giáp Ngọ | Bính (Hỏa) | high | known |
| 7 | **Hồ Chí Minh** | 1890-05-19 07:00 | Nam | Canh Dần · Tân Tỵ · Canh Tý · Canh Thìn | Canh (Kim) | medium | estimated |

### Known Limitations (Edge Cases)

1. **Hour 0 mapping**: `lunar-javascript` maps 00:00 to Ngọ (午) hour instead of Tý (子).
   - Traditional BaZi: Tý hour = 23:00-01:00. Engine follows library behavior.
2. **Non-leap Feb 29**: Accepted silently by `lunar-javascript` (auto-corrects to Mar 1).
3. **Negative years**: Accepted by engine (cross-epoch accuracy not guaranteed).
4. **Hour default = 12**: When hour is undefined/null, engine defaults to 12:00 (noon).
5. **Đại Vận direction**: Dương year + Nam = forward, Dương year + Nữ = backward. Verified.
6. **Lập Xuân 2024**: Transition occurs between Feb 4 and Feb 5 (year + month switch).

## API Contract Tests

File: `api-contract.test.js` (43 tests)

Validates live HTTP responses from the Express server:

| Suite | Tests | What it checks |
|-------|:-----:|----------------|
| Health check | 2 | `GET /` returns name/status/version |
| BaZi analysis | 14 | Full response shape: metadata, pillars, scores, wuxing, phan_tich, luan_giai, dai_van |
| Basic chart | 4 | `GET /api/chart` pillars, elements, basicInfo |
| Luck cycles | 3 | `GET /api/dayun` array, entries, required fields |
| Ngũ Hành | 2 | `GET /api/elements` 5-element scores |
| Thần Sát | 2 | `GET /api/stars` star analysis |
| Invalid input | 7 | Missing year/month/day, invalid month, random gender, no params, wrong HTTP method |
| AI consultant | 5 | Themes list, questions, stats, missing params |
| Matching | 3 | Missing person1/2, valid request |
| Articles | 1 | Returns 200, articles array |
| Summary | 1 | Endpoint coverage report |

### Running

```bash
# Individual
npx node --test backendjs/tests/api-contract.test.js

# All backend tests
npx node --test backendjs/tests/
```

### API Contract Philosophy

1. **Shape tests** — ensure all required JSON fields exist with correct types
2. **Safety tests** — invalid inputs don't crash the server
3. **Determinism tests** — same input → same response
4. **Regression safety** — any future refactor that removes/renames a field will be caught

These tests start a real HTTP server on a random port, make actual `fetch()` requests, and validate the JSON response structure. No external dependencies (no supertest, no chai).

## All Tests

```bash
# Run everything
npx node --test backendjs/tests/

# Run specific suite
npx node --test backendjs/tests/core.test.js
npx node --test backendjs/tests/api-contract.test.js

# Via npm
npm run test:core
npm run test:api
```

## Current Test Coverage

| File | Tests | Type | Purpose |
|------|:-----:|------|---------|
| `core.test.js` | 68 | Engine unit tests | Ganzhi, calculator, dayun, shishen, fixtures, edge cases |
| `api-contract.test.js` | 43 | API integration | HTTP responses, field shapes, invalid input safety |
| **Total** | **111** | | |

## Future phases

- [ ] Validate wuxing scores (element scores) against fixtures
- [ ] Validate dayun (luck cycles) against fixtures
- [ ] Validate hour pillar (Ngũ Thử Độn) with known test cases
- [ ] Add leap month tests (lunar calendar intercalary months)
- [ ] Add timezone tests
- [ ] Add que (hexagram) endpoint tests
- [ ] Fix hour 0 mapping if needed
- [ ] CI/CD integration
