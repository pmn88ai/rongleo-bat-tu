# BÁO CÁO — Nối 3 ô Quẻ Ngày/Tháng/Năm về đúng endpoint kỳ
Ngày: 2026-11-20. Repo: `D:\WORK\projects\rongleo-bat-tu`.
Phạm vi: `frontend/src/features/Que`, `frontend/api/que`. Không sửa `backendjs` (3 route kỳ đã đúng).

## 1. Mỗi ô nối tới endpoint nào

| Ô trên `/xinque` | Endpoint | Can Chi dùng để tính |
|---|---|---|
| Quẻ Ngày | `GET /api/que/daily` | Can Chi **ngày hôm nay** |
| Quẻ Tháng | `GET /api/que/monthly` | Can Chi **tháng này** |
| Quẻ Năm | `GET /api/que/yearly` | Can Chi **năm nay** |

- `frontend/src/features/Que/QuePage.jsx`:
  - thêm hằng `PERIOD_ENDPOINTS` (daily/monthly/yearly).
  - `handleRequest` và `handleReroll` gọi đúng endpoint theo `type`, gửi kèm birth params từ hồ sơ mệnh chung (`year/month/day/hour/minute/gender`) + `topic`.
  - nút "Xin lại" gửi thêm `forceNew=true` tới đúng endpoint kỳ.
  - mỗi ô có thêm `periodLabel` ("Hôm nay d/m/yyyy", "Tháng m/yyyy", "Năm yyyy"); card hiển thị thêm `displayPeriod` do endpoint trả về.
  - chưa có hồ sơ: 3 ô bị disable, hiện ghi chú "Chưa có hồ sơ mệnh..." + link `điền hồ sơ mệnh` về `/ho-so-menh`. Hàng chip gieo nhanh (widget `QuickDivination`) giữ nguyên, không đụng.
- `frontend/src/features/Que/components/QueCard.jsx`: nhận `periodLabel`, hiển thị kỳ ở mặt trước và `data.displayPeriod` ở mặt sau.
- `frontend/src/features/Que/QuePage.css`: thêm style `.card-period`.

## 2. Bản serverless `frontend/api/que/`

Trước job chỉ có `quick-random.js`. Đã tạo mới:

- `frontend/api/que/_period.js` — helper dùng chung: dựng `baziContext` từ `frontend/lib/bazi` (giống `quick-random.js`), lấy Can Chi ngày/tháng/năm theo giờ Việt Nam, gọi `calculateHexagram`, `getFullInterpretation`, `generateOfflineAnalysis`, trả shape giống route backend (không có DB/LLM nên `ai_analysis` dùng bản offline).
- `frontend/api/que/daily.js` — route mỏng cho `/api/que/daily`.
- `frontend/api/que/monthly.js` — route mỏng cho `/api/que/monthly`.
- `frontend/api/que/yearly.js` — route mỏng cho `/api/que/yearly`.

Không tạo trùng file nào; `quick-random.js` giữ nguyên.

## 3. Kiểm chứng

Hồ sơ mẫu: `1990-05-15 10:30`, Nam, topic `Chung` (Tổng Quan).

### 3.1 Ba `hexagramId`

| Kỳ | hexagramId | Tên quẻ | displayPeriod |
|---|---|---|---|
| Ngày | **11** | Địa Thiên Thái | Ngày 20/11/2026 |
| Tháng | **43** | Trạch Thiên Quải | Tháng 11/2026 |
| Năm | **43** | Trạch Thiên Quải | Năm 2026 |

- Tháng và Năm **trùng quẻ 43 là trùng tình cờ**: tháng hiện tại Kỷ Hợi → 6+12=18, năm hiện tại Bính Ngọ → 3+7=10; cả hai `% 8 = 2` nên cùng ngoại quái, nội quái cố định theo Nhật chủ. Không ép khác.
- Kết quả bản serverless (`_period.js`) và route backend (gọi trực tiếp với `x-user-id` hợp lệ) cho **cùng bộ 11 / 43 / 43**.

### 3.2 Cache theo kỳ

- Gọi lại `/api/que/daily` cùng hồ sơ/kỳ/topic: `hexagramId=11`, `is_history=true` (backend lấy lại bản đã lưu theo `contextId + type + periodKey`).
- Bản serverless không có DB nhưng tính deterministic theo Can Chi kỳ + Nhật chủ + topic: gọi lại trong cùng kỳ luôn ra cùng `hexagramId`.
- Đổi sang ngày/tháng/năm khác thì Can Chi kỳ đổi → quẻ đổi theo.

### 3.3 Đổi topic (quái trên đổi)

Cùng hồ sơ, cùng kỳ ngày, chỉ đổi topic (bản serverless):

| Topic | hexagramId | Tên quẻ | Ngoại quái |
|---|---|---|---|
| Chung | 11 | Địa Thiên Thái | Khôn |
| Tài lộc | 43 | Trạch Thiên Quải | Đoài |
| Tình duyên | 14 | Hỏa Thiên Đại Hữu | Ly |
| Sức khỏe | 5 | Thủy Thiên Nhu | Khảm |

→ topic có ảnh hưởng, quái trên đổi đúng.

### 3.4 Chưa có hồ sơ

- Gọi endpoint kỳ thiếu birth params trả `400 { error: 'Missing birth data' }` (đúng thiết kế).
- UI: 3 ô disable + ghi chú + link `/ho-so-menh`; chip gieo nhanh vẫn hoạt động theo giờ.

### 3.5 Build / test / dev server

- `npm run build` trong `frontend`: **PASS** (Vite build thành công).
- `npm test` trong `backendjs`: **224/224 pass, 0 fail**.
- Chạy dev server Vite (cổng 3005) + backend (cổng 8888): `GET /xinque` trả **200**; gọi qua proxy `GET /api/que/daily?...&topic=Tài lộc` trả **hexagramId 43, Trạch Thiên Quải**.
- Không có công cụ browser automation trong môi trường nên chưa bấm chuột thật trên UI; đã kiểm chứng bằng build + gọi HTTP đúng 3 endpoint và qua proxy dev.

## 4. Những gì còn chưa chắc / lưu ý

- **Dev backend + khách chưa đăng nhập**: 3 route `/daily`, `/monthly`, `/yearly` bên `backendjs` có kiểm tra linh thạch (`que.service.js` dòng 56–63). `x-user-id` của khách là UUID sinh ở localStorage, không có trong bảng `users`, nên backend dev trả lỗi "Không đủ linh thạch"/"User not found". Bản live dùng serverless `frontend/api/que/*` không có bước này nên chạy bình thường. Theo yêu cầu không sửa backend nên giữ nguyên; cần Leo quyết định nếu muốn dev backend cũng chạy cho khách.
- Bản serverless dùng `generateOfflineAnalysis` thay cho LLM của backend, nên nội dung luận giải trên bản live ngắn hơn bản dev backend; `hexagramId`/Can Chi/kỳ vẫn khớp.
- Tháng và Năm trùng quẻ 43 ở thời điểm hiện tại là trùng tình cờ (đã giải thích ở 3.1), không phải lỗi nối endpoint.

## 5. Trạng thái git

- Đã commit local. **Không push, không deploy.**
