# BÁO CÁO — GOM MỤC + THẦN SỐ HỌC (LOCAL)

Ngày: 2026-11-20. Repo: `D:\WORK\projects\rongleo-bat-tu` (nhánh `main`).
Chỉ chạy LOCAL — **KHÔNG push, KHÔNG deploy**.

Trước khi làm đã kiểm `git log --oneline -1` = `481f6e3` (commit Tarot mới nhất), đúng thứ tự yêu cầu.

## 1. Tàng kinh các — đưa Điển tích vào chùa
- Thêm địa điểm **Tàng Kinh Các** vào bản đồ chùa (`frontend/src/features/chua/ChuaPage.jsx`), trỏ `/dientich`, ảnh nền `ban-do-chua.jpg`, màu riêng `#14b8a6`, marker ở `{ x: 14, y: 46 }`. Tự có mặt ở "Xem nhanh" và thẻ thư viện khu.
- Nội dung Điển tích (`ClassicTexts`) đổi tiêu đề thành **"TÀNG KINH CÁC — ĐIỂN TỊCH CỔ ĐIỂN"**, vẫn ở route `/dientich`.
- Bỏ mục `dientich` khỏi `ROOMS` (`frontend/src/config/rooms.js`); route `/dientich` giữ nguyên trong `App.jsx`.
- Kết quả: `/chua` có marker + thẻ Tàng Kinh Các; `/tra-cuu` không còn Điển tích riêng; `/dientich` vẫn 200.

## 2. Gom Xem ngày + Chọn ngày
- Tạo trang chung `frontend/src/features/DateSelection/XemNgayPage.jsx` (+ `.css`) với 2 chế độ trong cùng trang:
  - **Kiểm ngày**: `PersonalizedDate` (giữ các mốc Năm/Tháng/Ngày).
  - **Tìm ngày tốt**: `AuspiciousDatePicker` (lọc ngày lành/giờ tốt).
  - Chế độ đọc/ghi qua query `?mode=find`; chuyển tab cập nhật URL.
- `/xemngay` render trang chung; `/chonngay` đổi thành `<Navigate to="/xemngay?mode=find" replace />` để link cũ không chết và mở sẵn chế độ Tìm ngày tốt.
- `ROOMS`: bỏ mục `chonngay`, mục `XEM NGÀY` còn 1 dòng, desc ghi rõ 2 chế độ.

## 3. Gom Tư vấn với nút luận giải trong lá số
- `frontend/src/components/ComprehensiveInterpretation.jsx` (nút "🔮 Luận giải" trong `/laso`) viết lại: bỏ toàn bộ modal luận giải + gọi API riêng; nút chính, sticky mobile và FAB desktop đều `navigate('/tuvan')`.
- `/tuvan` vẫn là 1 mục tra cứu, `ConsultantPage` nhận `userData` từ `profileParams` của `MenhProfileContext` — không bắt nhập lại.
- Prompt `/api/consultant/ask` đã có sẵn 4 trụ + bảng ngũ hành (test `ngu-hanh-prompt.test.js` pass).
- Gọi Groq thật: đã thử 2 persona qua API local. Groq trả **HTTP 403 — "Access denied. Please check your network settings."** nên service dùng fallback cho cả 2 thầy; **ghi rõ ở đây, không giấu**. Không sửa Groq trong job này.

## 4. Sửa nhãn mục Phân tích
- `ROOMS`: `/phantich` đổi title **"Điện Tử Vi" → "Điện Tính Cách"**, giữ label "PHÂN TÍCH", giữ ảnh `dien-tu-vi.jpg`.
- Soát toàn bộ frontend: không còn chỗ nào gọi mục `/phantich` là "Tử Vi" (các chỗ "Tử Vi" còn lại thuộc `/tuvi` và `/tuviphuongtay`, đúng chức năng).

## 5. Thần số học — trang mới `/than-so-hoc`
### Backend
- Mở rộng `backendjs/src/bazi/than_so.js` theo hệ **Pythagore chuẩn quốc tế** (A=1 … Z=8), bỏ dấu tiếng Việt (đ→d), giữ số chủ 11/22.
- Thêm `backendjs/src/bazi/than_so_meaning.js`: nghĩa tiếng Việt cho 1–9, 11, 22 (chỉ trong hệ này).
- Thêm route `GET /api/than-so-hoc?name=&year=&month=&day=&current_year=` (mount trong `bazi.routes.js`), trả 6 số + cách tính + nghĩa tĩnh, **không gọi AI**.
- Test cứng mới `backendjs/tests/than-so-hoc.test.js` (6 test, 3 hồ sơ):
  - Leo 7/4/1988 "Phạm Minh Nhật": đường đời **1**, sứ mệnh **8**, linh hồn **11**, nhân cách **6**, ngày sinh **7**, năm cá nhân 2026 **3**. ✔
  - Ca số chủ: 29/9/1989 "Nguyễn Văn An": đường đời **11**, ngày sinh **11** (không rút gọn). ✔
  - Hồ sơ thứ ba 9/6/1971 "Trần Thị Bích": đường đời 6, sứ mệnh 4, linh hồn 1, nhân cách 3, ngày sinh 9, năm cá nhân 7. ✔

### Frontend
- Trang mới `frontend/src/features/numerology/ThanSoHocPage.jsx` (+ `.css`): đọc hồ sơ chung, gọi `/api/than-so-hoc`, hiện 6 thẻ số + nghĩa + cách tính; cảnh báo nếu hồ sơ thiếu họ tên.
- Route `/than-so-hoc` bọc `requireProfile` trong `App.jsx`; thêm mục **THẦN SỐ HỌC / Điện Thần Số** vào `ROOMS`.

## Kiểm chứng LOCAL
- `npm run build` (frontend): **PASS** (300 modules, vite build ok).
- `npm test` (backendjs): **282 pass / 0 fail**, gồm 6 test thần số mới.
- API local `GET /api/than-so-hoc` với hồ sơ Leo trả đúng: đường đời 1, sứ mệnh 8, năm cá nhân 3.
- Dev server đang chạy sẵn ở `:3005`/`:8888` (reuse, không tạo process thừa): các route `/`, `/tra-cuu`, `/chua`, `/dientich`, `/xemngay`, `/chonngay`, `/than-so-hoc`, `/tuvan` đều trả **HTTP 200**.
- `/chonngay` là redirect phía client (`Navigate` trong bundle đã kiểm), SPA fallback trả 200 như mọi route; không có browser headless trong repo để bấm thử trực tiếp.
- `/tra-cuu` dùng `ROOMS` mới (đã kiểm bundle: không còn `dientich`, không còn `chonngay`, có `than-so-hoc`, title `/phantich` = "Điện Tính Cách").
- Không có bước nào bị chặn quyền; không sửa file ngoài repo.

## Trạng thái git
- Đã commit local (KHÔNG push, KHÔNG deploy).
