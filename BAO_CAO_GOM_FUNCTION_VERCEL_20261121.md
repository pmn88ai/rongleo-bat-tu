# BÁO CÁO — GOM 4 FUNCTION QUẺ THÀNH 1 (Vercel Hobby ≤ 12 function)

**Ngày:** 21/11/2026
**Phạm vi:** chỉ làm LOCAL — không push, không deploy.
**Lý do:** Deploy `dpl_97gbSUPt1kbbP9V11iyJHHdnJ3Bk` (commit `c146969`) fail vì vượt giới hạn 12 Serverless Functions của gói Vercel Hobby. Build Vite vẫn PASS, lỗi chỉ ở số lượng function.

## Kết quả tổng quan

| | Trước | Sau |
|---|---|---|
| Số Serverless Function dưới `frontend/api/` | **13** | **10** |
| File function quẻ | 4 (`daily`, `monthly`, `yearly`, `quick-random`) | 1 (`api/que.js`) |

Đích đặt ra là 10 function → **đạt** (còn dư 2 slot so với giới hạn 12).

## File đã thay đổi

### Thêm mới
- `frontend/api/que.js` — dispatcher duy nhất cho cả 4 endpoint quẻ. Đọc `period` từ query (`daily|monthly|yearly|quick-random`), forward toàn bộ query params gốc (năm/tháng/ngày/giờ/phút/giới tính/topic/type…) sang logic cũ. Có fallback parse `req.url` (cả `?period=` lẫn path `/api/que/<period>`) khi `req.query` thiếu. Trả 400 `{ error: 'Invalid or missing period' }` khi không xác định được period.

### Xóa
- `frontend/api/que/daily.js`
- `frontend/api/que/monthly.js`
- `frontend/api/que/yearly.js`
- `frontend/api/que/quick-random.js`

### Giữ nguyên (helper, không tính là function)
- `frontend/api/que/_period.js` — logic `buildPeriodQue` cho daily/monthly/yearly, dùng lại nguyên vẹn.
- `frontend/api/_helpers.js` — `withHandler` (CORS, error catch).

### Sửa
- `frontend/vercel.json` — thêm 4 rewrite, đặt **trước** catch-all `/(.*)`; không đụng rule nào khác:
  - `/api/que/daily` → `/api/que?period=daily`
  - `/api/que/monthly` → `/api/que?period=monthly`
  - `/api/que/yearly` → `/api/que?period=yearly`
  - `/api/que/quick-random` → `/api/que?period=quick-random`

Nhờ rewrite, URL mà `frontend/src` đang gọi (`/api/que/daily|monthly|yearly` trong `QuePage.jsx`, `/que/quick-random` qua `API_CONFIG.BASE_URL` trong `QuickDivination.jsx`) giữ nguyên — **không sửa frontend src**.

### Không đụng
Các file api khác, `frontend/src`, `backendjs/`, và phần còn lại của `vercel.json`.

## Kiểm chứng (đã chạy local)

1. **Đếm function** dưới `frontend/api/` (bỏ file `_*`): **10**
   `consultant.js`, `core.js`, `matching.js`, `misc.js`, `que.js`, `than-so-hoc.js`, `tu-vi.js`, `articles/index.js`, `articles/slug.js`, `matching/ai.js`.
2. **`node --check`**: PASS cho `frontend/api/que.js` và `frontend/api/que/_period.js`.
3. **`npm run build`** trong `frontend/`: **PASS** (vite 7.3.0, 303 modules, built in ~5.04s; `dist/assets/index-BD_pxtkt.js` 1.404,89 kB — chỉ còn warning cũ về chunk size / html2canvas, không phải lỗi).
4. **Test handler bằng node (mock req/res)** — script tạm dùng `withHandler` thật:
   - `daily`, `monthly`, `yearly`: gọi qua kiểu rewrite (`/api/que?period=…`) và kiểu path cũ (`/api/que/<period>`) đều **200** và **body trùng khớp tuyệt đối** với `buildPeriodQue(base, type)` (logic của 4 file cũ). Thiếu dữ liệu sinh → **400 `{ error: 'Missing birth data' }`** trùng khớp.
   - `quick-random`: **200**, đủ toàn bộ key hợp đồng cũ (`id, hexagramId, name, symbol, meaning, quality, qualityScore, upperTrigram, lowerTrigram, interaction, topic, overview, interpretation, advice, type, displayPeriod, cast_time, has_profile, disclaimer`); shape key trùng với đường path cũ.
   - Không truyền `period`: **400**.
   - Kết quả: **ALL TESTS PASSED**.
5. **JSON `vercel.json`** hợp lệ (26 rewrite), 4 rule quẻ nằm ngay trước catch-all.
6. **Commit local** trên branch `main`:
   `Gom 4 function que thanh 1 de duoi gioi han 12 function Vercel Hobby (21/11/2026)`

## Việc còn lại của Leo (báo cáo KHÔNG tự làm)

- **Push** commit lên remote.
- **Deploy** lại Vercel và xác nhận build không còn lỗi "tối đa 12 Serverless Functions".
- Kiểm tra nhanh 4 URL `/api/que/daily|monthly|yearly|quick-random` sau deploy.

> Ghi chú: giới hạn Vercel Hobby đếm function theo file dưới `api/` (file bắt đầu bằng `_` không tính). Sau thay đổi này tổng là 10 → còn dư 2 slot cho endpoint mới.
