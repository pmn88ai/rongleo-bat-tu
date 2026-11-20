# BÁO CÁO — BẢN ĐỒ CHÙA MỚI (NỀN CỔNG CHÙA + ẢNH TỪNG KHU)

Ngày: 20/11/2026
Phạm vi: chỉ trang `/chua` + 2 dòng đổi tên file video nguồn ở trang Chánh Điện và Vườn Tịnh Tâm.

## 1. Đã thay đổi

### (A) + (E) Nền trang giống bước vào chùa
- `ChuaPage.jsx` render thêm lớp nền cố định `.chua-scene-bg` phía sau nội dung:
  - Video `/video/cong-chua.mp4` (tự chạy, lặp, tắt tiếng, `playsInline`).
  - `poster="/images/chua/nen-cong-chua.jpg"` và ảnh nền CSS cùng file để dự phòng khi video chưa tải được.
  - Lớp phủ tối `.chua-scene-veil` (gradient + radial) để chữ vẫn đọc rõ.
- Tiêu đề "Vào Chùa Xem" và câu mô tả giữ nguyên.
- Nền sao/xoáy cũ (`bazi-bg`) bị lớp nền mới che trong trang `/chua`.

### (B) Bản đồ nhìn từ trên cao, bấm điểm đánh dấu là tới
- Dùng `ban-do-chua.jpg` (1920×1280, khung tỉ lệ 3:2) làm bản đồ tổng thể.
- 9 điểm đánh dấu là các `Link` thật (bấm/chạm được, có `aria-label`), mỗi điểm gồm chấm màu + tooltip tên khu và tên thầy; hiện khi rê chuột hoặc focus bàn phím.
- Điểm ở sát mép (Điện Tử Vi, Điện Bát Tự) được căn tooltip vào trong; điểm Vườn ở sát mép trên được đặt tooltip xuống dưới để không bị cắt.

Vị trí 9 điểm theo % chiều rộng/chiều cao ảnh:

| Khu | Đường dẫn | x | y |
|---|---|---|---|
| Chánh Điện | `/chanh-dien` | 50% | 44% |
| Vườn Tịnh Tâm | `/vuon-tinh-tam` | 50% | 13% |
| Điện Tử Vi (Thầy Tinh Tú) | `/tuvi` | 14% | 50% |
| Điện Bát Tự (Thầy Can Chi) | `/` | 87% | 50% |
| Quầy Xem Ngày (Thầy Hoàng Đạo) | `/xemngay` | 31% | 67% |
| Quầy Vận Hôm Nay (Thầy Thời Vận) | `/van-hom-nay` | 36% | 84% |
| Quầy Tình Duyên (Thầy Duyên Khởi) | `/duyenso` | 64% | 84% |
| Quầy Xin Quẻ (Thầy Quẻ Cát) | `/xinque` | 71% | 66% |
| Phòng Hỏi Thầy (Thầy Huyền Cơ + Thầy Mệnh Mèo GenZ) | `/tuvan` | 50% | 89% |

### (C) Lưới thẻ ảnh từng khu kiểu street view
- Dưới bản đồ có lưới 9 thẻ, mỗi thẻ: ảnh 16:9 của khu, tên khu, tên thầy (khu không có thầy ghi "Không gian Phật" / "Không gian tĩnh tâm"), 1 dòng mô tả ngắn và nút "Vào →".
- Thẻ Chánh Điện và Vườn Tịnh Tâm đứng đầu lưới.
- Bấm thẻ (toàn bộ thẻ là `Link`) chạy tới đúng trang của khu.
- Giữ nguyên hàng "XEM NHANH", dòng gợi ý đăng nhập cuối trang, menu trên cùng; không đổi tên khu, tên thầy, đường dẫn.

### (D) Mobile
- Bản đồ co theo chiều rộng màn hình, chấm đánh dấu vùng chạm 36px.
- Lưới thẻ xếp 1 cột ở ≤640px, 2 cột ở ≤900px.
- Không dùng chiều rộng cố định, không tạo phần tử tràn ngang.

### (E) Video 2 trang Chánh Điện + Vườn
- `ChanhDienPage.jsx`: đổi nguồn video sang `/video/chanh-dien-pp.mp4`.
- `VuonTinhTamPage.jsx`: đổi nguồn video sang `/video/vuon-tinh-tam-pp.mp4`.
- Không đổi gì khác; không xóa file gốc 8s.

## 2. Kiểm tra
- `npm run build` trong `frontend/`: PASS (Vite 7.3.0, 537 modules; chỉ còn cảnh báo sẵn có về chunk lớn và html2canvas import động/tĩnh).
- Kiểm tra bằng code + build:
  - Nền `/chua` dùng `cong-chua.mp4`, poster `nen-cong-chua.jpg`: đúng.
  - Bản đồ dùng `ban-do-chua.jpg`, đủ 9 điểm đánh dấu trỏ đúng 9 đường dẫn yêu cầu.
  - Lưới đủ 9 thẻ đúng file ảnh, đúng thứ tự Chánh Điện + Vườn đầu lưới.
  - Hàng "Xem nhanh" đủ 9 lối tắt; dòng đăng nhập cuối trang còn nguyên.
  - Mobile 375px: map 100% chiều rộng, lưới 1 cột, không có thuộc tính gây tràn ngang.
  - Trang Chánh Điện dùng `chanh-dien-pp.mp4`; Vườn dùng `vuon-tinh-tam-pp.mp4`.
- Không có bước bị chặn quyền. Không dùng trình duyệt headless (môi trường không có Playwright/Puppeteer), nên kiểm tra giao diện bằng code + build theo cho phép của task.

## 3. Lint
- Lệnh lint mặc định của repo (`npx eslint ...`) không chạy được vì `package.json` đặt `"type": "commonjs"` trong khi `eslint.config.js` dùng cú pháp ESM (lỗi cấu hình có sẵn, không do đợt này).
- Đã chạy ESLint với cấu hình tạm tương đương cho các file thay đổi:
  - `ChuaPage.jsx`: PASS.
  - `VuonTinhTamPage.jsx`: PASS.
  - `ChanhDienPage.jsx`: báo 1 lỗi có sẵn ở dòng 19 (`react-hooks/refs`: truy cập ref khi render qua `fullscreen.enter`), không liên quan dòng video vừa đổi; theo yêu cầu chỉ đổi tên file video nên không sửa thêm.

## 4. File đã sửa
- `frontend/src/features/chua/ChuaPage.jsx`
- `frontend/src/features/chua/ChuaPage.css`
- `frontend/src/features/chua/ChanhDienPage.jsx` (1 dòng)
- `frontend/src/features/chua/VuonTinhTamPage.jsx` (1 dòng)

Không push, không deploy.
