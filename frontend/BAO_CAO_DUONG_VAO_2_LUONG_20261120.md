# BÁO CÁO — LÀM LẠI ĐƯỜNG VÀO TRANG TỬ VI THEO 2 LUỒNG (20/11/2026)

## 1. Đã đổi gì

### 1.1. Trang chủ 2 cửa — `src/features/Homepage/HomePage.jsx` (mới)
- Cửa 1 **"Đi dạo chùa"**: đi thẳng `/chua`, không cần nhập gì.
- Cửa 2 **"Tra cứu & Xin quẻ"**: nếu chưa có hồ sơ → `/ho-so-menh`; nếu đã có hồ sơ → `/tra-cuu`.
- Trang chủ `/` route đổi từ form nhập bát tự sang `HomePage` (trong `src/App.jsx`).

### 1.2. Hồ sơ mệnh nhập một lần
- `src/context/MenhProfileContext.jsx` (mới): context `useMenhProfile` quản lý một hồ sơ duy nhất.
- `src/App.jsx`: route mới `/ho-so-menh` — chính là form bát tự hiện tại (`BirthInput`) ở chế độ `profileMode`, có dòng "Nhập một lần — dùng cho mọi mục tra cứu"; lưu xong tự chuyển tới `/tra-cuu` (hoặc `?next=` đúng mục đang muốn vào).
- `src/features/Homepage/BirthInput.jsx`: nhận `profileMode`, tự điền từ hồ sơ chung, đổi tiêu đề/nút thành "HỒ SƠ MỆNH" / "LƯU HỒ SƠ MỆNH"; form và các trường giữ nguyên, không thêm trường.
- `src/features/Homepage/TraCuuPage.jsx` (mới): route `/tra-cuu`, hiển thị hồ sơ đang dùng + danh sách mọi mục tra cứu + nhóm đi dạo chùa.

### 1.3. Mọi mục tra cứu đọc chung hồ sơ mệnh (`src/App.jsx`)
- Các trang cần lá số (`/laso`, `/phantich`, `/vanhan`, `/dientich`): tự gọi `analyze(profileParams)` một lần từ hồ sơ mệnh, không bắt nhập lại.
- Các trang chỉ cần thông tin sinh (`/xemngay`, `/chonngay`, `/tuvan`, `/duyenso`, `/xinque`, `/tuviphuongtay`): nhận `userData = profileParams` từ hồ sơ chung (không còn dùng `inputParams` riêng).
- `/duyenso` (`MatchingPage`) và `/tuviphuongtay` (`WesternPage`) nay nhận `profileParams`; form sửa riêng trong tool vẫn giữ.
- `/tuvi` (`TuViPage`) và `/van-hom-nay` (`VanHomNayPage`): tự điền từ hồ sơ mệnh (đổi dương → âm/giờ Chi ở Tử vi), vẫn cho sửa riêng trong tool.
- Chưa có hồ sơ mà vào thẳng link tool: `<Navigate>` về `/ho-so-menh?next=<đúng mục>`, nhập xong quay lại đúng mục.

### 1.4. Điều hướng tách 2 nhóm
- `src/config/rooms.js` (mới): khai báo `TEMPLE_LINKS` (Đi dạo chùa) và `ROOMS` (Tra cứu, kèm ảnh/màu từng phòng).
- `src/components/DesktopShell.jsx`: nav trên cùng chia 2 nhóm rõ ràng "Đi dạo chùa" và "Tra cứu" (kèm mục "Hồ sơ & Tra cứu"), bỏ một hàng 11 mục trộn lẫn; bỏ truyền `location.search` khi chuyển tab.
- `src/components/MobileShell.jsx`: header nav chia 2 nhóm tương tự; bỏ truyền `location.search` ở bottom nav.

### 1.5. Mỗi phòng một diện mạo riêng
- `src/App.jsx` + `src/index.css`: mỗi phòng tra cứu dùng `room-bg` riêng + đổi `--accent-gold`/`--accent-gold-glow` theo phòng, thêm ribbon tên phòng.
- Ảnh lấy đúng 11 ảnh có sẵn trong `public/images/chua/`, không thêm ảnh mới, không dùng ảnh ngoài. Bảng phòng → ảnh/màu:

| Phòng (route) | Ảnh nền | Màu nhấn |
|---|---|---|
| Lá số `/laso` | `/images/chua/dien-bat-tu.jpg` | `#fbbf24` |
| Phân tích `/phantich` | `/images/chua/dien-tu-vi.jpg` | `#c084fc` |
| Vận hạn `/vanhan` | `/images/chua/quay-van-hom-nay.jpg` | `#fb923c` |
| Điển tích `/dientich` | `/images/chua/ban-do-chua.jpg` | `#94a3b8` |
| Xem ngày `/xemngay` | `/images/chua/quay-xem-ngay.jpg` | `#4ade80` |
| Chọn ngày `/chonngay` | `/images/chua/chanh-dien.jpg` | `#34d399` |
| Tư vấn `/tuvan` | `/images/chua/phong-hoi-thay.jpg` | `#e2c044` |
| Duyên số `/duyenso` | `/images/chua/quay-tinh-duyen.jpg` | `#f472b6` |
| Gieo quẻ `/xinque` | `/images/chua/quay-xin-que.jpg` | `#60a5fa` |
| Tử vi `/tuvi` | `/images/chua/dien-tu-vi.jpg` | `#a78bfa` |
| Tử vi Tây `/tuviphuongtay` | `/images/chua/vuon-tinh-tam.jpg` | `#38bdf8` |
| Vận hôm nay `/van-hom-nay` | `/images/chua/nen-cong-chua.jpg` | `#fb7185` |

- Trang chủ 2 cửa dùng lại ảnh có sẵn: cửa chùa `nen-cong-chua.jpg`, cửa tra cứu `dien-bat-tu.jpg`.

## 2. Cách hồ sơ mệnh lưu / chia sẻ
- Khách vãng lai: `localStorage` key `menh_profile`.
- Người đã đăng nhập: đọc/ghi qua `AuthContext` sẵn có (`savedProfile`, `updateProfile` → `/api/auth/profile`), không sửa cơ chế đăng nhập. Khi server có hồ sơ thì ưu tiên server; khi khách đã có hồ sơ local rồi mới đăng nhập thì đẩy một lần lên server.
- Lưu hồ sơ mới sẽ xoá kết quả lá số cũ trong `sessionStorage` để lần vào tool kế tiếp tính lại theo hồ sơ mới.
- Không thêm trường mới: hồ sơ đúng các trường form bát tự hiện tại (tên, giới tính, năm/tháng/ngày/giờ/phút, lịch).

## 3. Kiểm chứng
- `npm run build`: **PASS** (Vite build thành công, chỉ còn cảnh báo chunk >500 kB và dynamic import html2canvas có sẵn từ trước).
- Dev server đang chạy sẵn ở port 3005 (không khởi động thêm được vì port bận):
  - `GET /` → 200, `GET /ho-so-menh` → 200, `GET /chua` → 200.
  - Kiểm module Vite: `HomePage.jsx` có "Cửa 1 / Đi dạo chùa" và "Cửa 2 / Tra cứu & Xin quẻ"; `App.jsx` có route `/ho-so-menh`, `/tra-cuu`, `/chua`.
- Kiểm bằng code:
  - `App.jsx` không còn dùng `inputParams`; `/duyenso` và `/tuviphuongtay` nhận `profileParams`.
  - Tất cả route trong mục (b) đều đi qua `useMenhProfile` (trực tiếp hoặc qua `profileParams`/`analyze`).
  - `/chua` không bị guard hồ sơ.

## 4. Chỉ kiểm bằng code — chờ Leo kiểm tay trên trình duyệt
- Bố cục/màu sắc thực tế của 2 cửa trang chủ, ribbon từng phòng, nav 2 nhóm trên desktop và mobile.
- Luồng bấm tool khi chưa có hồ sơ → về `/ho-so-menh` → nhập → quay lại đúng tool.
- Đồng bộ hồ sơ khi đăng nhập / đăng xuất thật với backend `/api/auth/me` & `/api/auth/profile`.
- Tự điền ở `/tuvi`, `/van-hom-nay`, `/duyenso`, `/tuviphuongtay` với hồ sơ thật.
- Không chạy được ESLint: `eslint.config.js` là ESM nhưng `package.json` khai `"type": "commonjs"` (lỗi cấu hình có sẵn từ trước, ngoài phạm vi task).

## 5. Phạm vi
- Chỉ sửa frontend. Không sửa `backendjs`, không sửa thuật toán, không sửa video/nhạc chùa, không sửa AuthContext.
- Không push, không deploy.
