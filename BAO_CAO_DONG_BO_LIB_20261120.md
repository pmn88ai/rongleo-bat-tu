# BÁO CÁO — Đồng bộ bản sửa Bát Tự sang `frontend/lib/bazi` (bản live)
Ngày: 2026-11-20. Repo: `D:\WORK\projects\rongleo-bat-tu`. Không push, không deploy.

## 1. Phạm vi và cách so
- So byte-level toàn bộ cây `backendjs/src/bazi/` với `frontend/lib/bazi/`:
  - Backend: 103 file. Frontend: 99 file. Chung: 99 file.
  - Chỉ backend: `than_so.js`, `tu_vi.js`, `van_hom_nay.js`, `types/interpretation.types.js`.
  - Chung nhưng khác nội dung: `output.js`, `phan_tich/ngu_hanh.js`.
- Kết quả sau đồng bộ: 97/99 file chung giống hệt từng byte; `phan_tich/ngu_hanh.js` giống hệt sau khi chuẩn hoá CRLF/LF (frontend dùng CRLF, backend LF); `output.js` khác cố ý (mục 3).
- Khi bắt đầu phiên, 17 file dưới đây đã ở trạng thái đã sửa trong working tree (từ lần chạy trước của chính task này). Phiên này so lại từng file với backendjs, xác nhận khớp, rồi kiểm chứng và commit.

## 2. File đã đồng bộ (17 file, khớp `backendjs/src/bazi`)
| File | Nội dung sửa chính |
|---|---|
| `calculator.js` | Âm lịch giữ giờ/phút bằng `Lunar.fromYmdHms`; `hour = 0` không bị đổi thành 12; nhãn tháng nhuận; `can_yeu` = "chưa xác định được"; ghi chú điểm thô |
| `dayun.js` | Năm khởi Đại Vận cộng cả phần tháng (`3 ngày = 1 năm, 1 ngày = 4 tháng`), hết lệch 1–2 năm |
| `ganzhi.js` | Thêm `GOD_FULL_NAMES` + `toGodFullName` (nhãn Thập Thần đầy đủ, thống nhất) |
| `geju.js` | Lập cách theo nhãn đầy đủ; bỏ mặc định "Sát"; không khớp mẫu → "Chưa xác định được" |
| `hop_hon/index.js` | Bỏ `Math.random` dao động ±7 điểm của `calculateAspectScore` |
| `luan_giai/core.js` | Bỏ `createSeededRandom`; bỏ chọn câu ngẫu nhiên; các mục không có căn cứ ghi "chưa đủ căn cứ" |
| `phan_tich/data/luan_giai_lib.js` | `permute` dùng 10 mục đầu cố định; `mix`/`pick` lấy `arr[0]` |
| `phan_tich/dong_tinh_luan.js` | Bỏ seeded RNG; chọn câu đầu tiên cố định |
| `phan_tich/luan_dong.js` | Đọc đúng `nguHanhResult.nhan_dinh.cuong_do`; bỏ `getRandomIntro` |
| `phan_tich/luan_giai_quan_he.js` | Bỏ nhánh 50% `Math.random` cho mục sức khỏe |
| `phan_tich/luan_tinh.js` | `getStrengthLabel` đọc `nhan_dinh.cuong_do`; đếm/luận Thập Thần theo nhãn đầy đủ; sức khỏe theo kỵ thần |
| `phan_tich/ngu_hanh.js` | Viết lại theo quy tắc tủ: điểm thô chỉ để hiển thị; tòng cách đủ 4 điều kiện; điều hậu → cách cục → vượng/nhược; bỏ ngưỡng số tự đặt |
| `questions/engine.js` | Seed bỏ `new Date().getHours()` (không đổi theo giờ chạy) |
| `thoi_gian_luan/data/mega_career.js` | Bỏ `Math.random`, lấy `pool[0]` |
| `thoi_gian_luan/data/mega_health.js` | Bỏ random 50% + random index, lấy phần tử đầu |
| `thoi_gian_luan/data/mega_love.js` | Bỏ `Math.random`, lấy `pool[0]` |
| `thoi_gian_luan/data/mega_wealth.js` | Bỏ `Math.random`, lấy `pool[0]` |

### `phan_tich/ngu_hanh.js` (ca 407 dòng)
Đã xem kỹ: bản frontend chỉ là bản cũ hơn của cùng một file, không có đoạn code riêng cho serverless. Nội dung sau đồng bộ giống hệt backendjs (khác duy nhất CRLF/LF). Đã ghi đè bằng bản backendjs.

## 3. Khác biệt cố ý — KHÔNG đồng bộ
- `output.js`: backend có thêm `structured_interpretations` và `western_astrology`, phụ thuộc `./types/interpretation.types` và `../western/western` — hai module này **không tồn tại** trong `frontend/lib/bazi`. Đây là phần bổ sung riêng của backend, không thuộc nhóm sửa 78a8957. Giữ nguyên bản frontend để API live không gãy `require`.
- 4 file chỉ có ở backend (`than_so.js`, `tu_vi.js`, `van_hom_nay.js`, `types/interpretation.types.js`): không chép sang. Đã grep `frontend/api/` — không file nào require các module này.

## 4. Job quẻ (không giẫm chân)
- Commit `e4e305c` (gieo quẻ theo giờ) chỉ đụng: `backendjs/src/routes/que.routes.js`, `frontend/api/que/quick-random.js`, `frontend/src/App.jsx`, `QuickDivination.jsx`, `QuePage.jsx`.
- Không đụng file engine nào trong `src/bazi` hay `frontend/lib/bazi` ⇒ không có xung đột, không cần chờ job quẻ.
- Không sửa `que_data/`, `quick-random.js`, `QuePage.jsx`, `que.routes.js`.

## 5. Kiểm chứng (số liệu thật)
1. **Grep `Math.random`** trong các nhóm luận (`phan_tich`, `hop_hon`, `questions`, `luan_giai`, `thoi_gian_luan` + `data`): frontend **0**, backend **0**.
2. **`require` của API live**: `frontend/api/consultant.js`, `matching/ai.js`, `que/quick-random.js` vẫn trỏ đúng `../../lib/bazi/...`; các module đích đều tồn tại.
3. **Smoke test Node trực tiếp `frontend/lib/bazi/calculator` + `dayun`** — 10/10 PASS:
   - F9.1 âm lịch 1/2 nhuận/2023 giờ Thìn → dương `2023-03-22`, trụ giờ `Thìn`, `ngay_am_lich = "Năm 2023 tháng 2 nhuận ngày 1"`, tháng `Ất Mão`.
   - F9.2 Mão 26/12/1893 → `nhap_van = "Tháng 4/1900"`, Đại vận 1 `Quý Hợi` năm `1900`, Đại vận 2 năm `1910`.
4. **Lookup qua `output.formatOutput`** (đúng đường live dùng): lá 15/6/1990 12:00 nam → `Canh Ngọ | Nhâm Ngọ | Tân Hợi | Giáp Ngọ`, giờ chi `Ngọ`, 12 Đại vận, 9 mục luận giải, không có `NaN`, chạy 2 lần cho kết quả giống nhau.
5. **`npm test` trong `backendjs`** (`node --test "tests/*.test.js"`): **224/224 pass**, 44 suite, 0 fail, 0 skip.
6. **Build frontend** (`npm run build`): pass, 293 module, build 5.64s.
7. **Dev server**: `vite` chạy `127.0.0.1:5179`, `GET /` trả **HTTP 200**, `<title>RongLeo Mệnh Lý — Bát Tự, Đại Vận, Tử Vi Phương Tây</title>`.

## 6. Chưa chắc / hạn chế
- Không có công cụ trình duyệt trong phiên này nên chưa bấm thử UI thật; mới xác nhận dev server trả 200 + gọi thẳng engine qua `formatOutput` (cùng module mà `consultant.js` dùng). Cần Leo mở 1 trang tra cứu bằng mắt để chốt phần hiển thị.
- `output.js` frontend cũ hơn backend (thiếu structured/western) — đúng chủ ý, nhưng nếu sau này muốn bật 2 phần đó trên live thì phải copy kèm `types/` và `western/`.
- `"undefined"` xuất hiện trong chuỗi JSON của một số dữ liệu tĩnh (không phải lỗi mới, giống backend); không ảnh hưởng phép tính.
