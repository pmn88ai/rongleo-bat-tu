# BÁO CÁO — Gieo quẻ theo giờ gieo + mệnh (bỏ random)
Ngày: 2026-11-20. Repo: `D:\WORK\projects\rongleo-bat-tu`.
Phạm vi: `backendjs` + `frontend` (kể cả bản serverless `frontend/api/`).

## 1. Cách tính mới

Gieo quẻ nhanh giờ dùng đúng đường deterministic có sẵn: `calculateHexagram(baziContext, timeInfo, type, topic)` trong `backendjs/src/bazi/que_data/mapping.js`.

- **Thời điểm gieo** = Can Chi của **giờ hiện tại theo giờ Việt Nam**:
  `Solar.fromDate(vnNow).getLunar().getTimeInGanZhi()` → tách Can / Chi.
- **Hồ sơ mệnh** = đúng hồ sơ dùng chung (`MenhProfileContext` → `profileParams`): backend gọi `baziService.analyzeComplete({year, month, day, hour, minute, gender})` để lấy Nhật chủ. Không có hồ sơ → `baziContext = {}`, mapping tự mặc định Nhật chủ **Giáp**, Nhật chi **Tý**.
- **Công thức quẻ** (không đổi mapping):
  - **Nội quái (dưới)** = `DAY_MASTER_TO_TRIGRAM[nhật chủ]`.
  - **Ngoại quái (trên)** = `(STEM_NUMBERS[can giờ] + BRANCH_NUMBERS[chi giờ] + TOPIC_NUMBERS[chủ đề]) % 8`; nếu bằng `0` thì lấy `8`.
  - **Quẻ** = `HEXAGRAM_LOOKUP["<ngoại>,<nội>"]` (bảng `gua_64`).
  - Chủ đề legacy của widget trang chủ (`love` / `wealth` / `safety`) được quy về `Tình duyên` / `Tài lộc` / `Sức khỏe` trước khi tính.
- **Hệ quả:** cùng người + cùng giờ gieo (cùng Can Chi giờ) + cùng chủ đề ⇒ cùng `hexagramId`. Sang giờ khác (Can/Chi giờ đổi) ⇒ quẻ đổi. Không còn `Math.random` trong đường gieo quẻ.

Lưu ý thiết kế: cả 3 ô **Quẻ Ngày / Quẻ Tháng / Quẻ Năm** trên `/xinque` đều là "lần gieo tại thời điểm hiện tại" theo đúng yêu cầu, nên tại cùng một giờ + cùng chủ đề chúng cho cùng một quẻ; khác nhau ở `type` và `displayPeriod` trả về.

## 2. File đã sửa

### Backend
- `backendjs/src/routes/que.routes.js`
  - dòng 18: import `calculateHexagram`, `ELEMENTS`.
  - dòng 217–251: thêm `LEGACY_TOPIC_TO_VI`, `QUALITY_FROM_SCORE`, `getCastTimeInfo` (Can Chi giờ VN), `getDisplayPeriod`.
  - dòng 257–347: viết lại `GET /api/que/quick-random` — nhận thêm `type`, `year/month/day/hour/minute/gender`; gọi `analyzeComplete` khi có hồ sơ; gọi `calculateHexagram`; trả `hexagramId`, `upperTrigram`, `lowerTrigram`, `interaction`, `qualityScore`, `cast_time`, `has_profile`; disclaimer mới (dòng 340) bỏ chữ "ngẫu nhiên".
  - Giữ nguyên `/daily`, `/monthly`, `/yearly` và phần luận can chi ngày (`generateRichAnalysis`).

### Frontend
- `frontend/src/features/Que/QuePage.jsx`
  - dòng 53–99 (`handleRequest`) và 106–150 (`handleReroll`): bỏ chặn khi chưa có hồ sơ; chỉ gửi birth params khi có; gửi thêm `type`.
  - dòng 190–198: dòng chú thích khi chưa có hồ sơ: "Chưa có hồ sơ mệnh nên quẻ chỉ tính theo giờ gieo — điền hồ sơ để tính theo mệnh."
  - dòng 227 / 241 / 255: nút gieo chỉ disable khi đang tải (`disabled={isAnyLoading}`), không còn phụ thuộc hồ sơ.
- `frontend/src/App.jsx`
  - dòng 249: `/xinque` không còn `requireProfile(...)`, để người chưa có hồ sơ vẫn vào gieo được (điều kiện của mục 2b).
- `frontend/src/features/Homepage/QuickDivination.jsx` (widget "Gieo Quẻ Nhanh" ở trang nhập hồ sơ)
  - dòng 5, 15: dùng `useMenhProfile`.
  - dòng 32–41: gửi kèm birth params nếu có hồ sơ.
  - dòng 92: phụ đề đổi thành "Quẻ tính theo giờ gieo và hồ sơ mệnh".

### Bản serverless (Vercel)
- `frontend/api/que/quick-random.js`: viết lại toàn bộ, bỏ `Math.random`.
  - dùng `lib/bazi/que_data/mapping.calculateHexagram` + `lib/bazi/calculator` để dựng `baziContext` từ hồ sơ (Nhật chủ + dụng/kỵ thần).
  - Can Chi giờ lấy từ `lunar-javascript` theo giờ VN; cùng công thức quẻ như backend.
  - trả cùng bộ field chính (`hexagramId`, `upperTrigram`, `lowerTrigram`, `interaction`, `cast_time`, `has_profile`) và disclaimer mới.

## 3. Kết quả kiểm chứng (số liệu thật)

- **Grep `Math.random`** trong `frontend/src/features/Que/QuePage.jsx`, `backendjs/src/routes/que.routes.js`, `backendjs/src/services/que.service.js`, `backendjs/src/bazi/que_data/mapping.js`, `frontend/api/que/quick-random.js`: **0 kết quả** (chỉ còn `Math.random` ở `auth.routes.js`, không thuộc đường quẻ).
- **Test backend** (`npm test` = `node --test "tests/*.test.js"`): **224 pass / 0 fail / 0 skipped** (44 suites).
- **Build frontend** (`npm run build`): pass, 293 modules, build 4.89s, ra `dist/assets/index-BckDgGuP.js`.
- **API qua backend/Vite proxy** (hồ sơ 1990-06-15 12:00 Nam, chủ đề Chung, giờ gieo Canh Thân):
  - gọi 2 lần cùng tham số → `hexagramId = 19` và `19` → **giống nhau** (upper Khôn, lower Đoài).
  - không hồ sơ → `hexagramId = 24`, `has_profile = false`, `interaction.dayMaster = Giáp`; disclaimer **không còn** chữ "ngẫu nhiên".
  - disclaimer khi có hồ sơ: "Quẻ được tính theo giờ gieo (giờ Việt Nam) và Nhật chủ lấy từ hồ sơ mệnh. Cùng người, cùng giờ gieo, cùng chủ đề sẽ cho cùng một quẻ."
- **Đổi giờ gieo (mô phỏng trực tiếp `calculateHexagram`, hồ sơ 1990-06-15, Nhật chủ Tân, chủ đề Chung)**:
  `Giáp Tý=58, Ất Sửu=54, Bính Dần=60, Đinh Mão=19, Mậu Thìn=58, Kỷ Tỵ=54, Canh Ngọ=60, Tân Mùi=19, Nhâm Thân=58, Quý Dậu=54`.
  Mỗi bước sang giờ kế tiếp đều đổi quẻ (chu kỳ lặp 4 giờ do công thức modulo).
- **Dev server**: `http://localhost:3005/xinque` trả **200**; gọi API quẻ qua proxy Vite trả đúng dữ liệu mới.
- **Đối chiếu backend ↔ serverless**: cùng tham số (1990-06-15 12:00 Nam, Tài lộc, giờ Canh Thân) cả hai đều trả `hexagramId = 58`, upper/lower Đoài, Nhật chủ Tân → khớp.

## 4. Những gì chưa chắc / chưa làm được

- **Chưa bấm thử UI bằng trình duyệt thật**: môi trường hiện tại không có công cụ điều khiển trình duyệt (không có Playwright/Puppeteer/browser tool). Đã kiểm chứng thay bằng: dev server trả 200 cho `/xinque`, API qua proxy trả đúng, và `npm run build` pass. Cần một lần mở `/xinque` bằng mắt để xác nhận dòng chú thích hiển thị đúng vị trí.
- **Quẻ Ngày / Tháng / Năm trên cùng một màn hình cho cùng một quẻ** khi cùng giờ + cùng chủ đề (đúng hệ quả của yêu cầu "cùng giờ + cùng chủ đề = cùng quẻ"). Nếu muốn 3 ô khác nhau thì cần thêm khóa phân biệt `type` vào công thức — việc này sẽ làm khác đặc tả hiện tại nên chưa làm.
- Phần `generateRichAnalysis` vẫn luận theo **Can Chi ngày** (giữ nguyên theo mục 2e), trong khi quẻ lấy **Can Chi giờ**; đây là chủ ý, không phải lỗi.
- Không push, không deploy. Chỉ commit local.

## 5. Commit

Commit local gồm 5 file code + báo cáo này. Không push, không deploy.
