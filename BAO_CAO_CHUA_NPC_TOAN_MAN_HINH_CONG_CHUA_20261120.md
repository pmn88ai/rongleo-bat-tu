# BÁO CÁO — NÚT TOÀN MÀN HÌNH CHO TRANG CỔNG CHÙA /chua (20/11/2026)

## 1. Đã thêm nút toàn màn hình như thế nào

Dùng lại đúng mẫu của 2 trang Chánh Điện và Vườn Tịnh Tâm:

- `frontend/src/features/chua/ChuaPage.jsx`
  - Import `useTempleFullscreen`, `TempleSceneControls`, `TempleFullscreenButton` và `TempleScene.css`.
  - Gắn `fullscreen.sceneRef` vào khung nền `.chua-scene-bg` (chứa `cong-chua.mp4`).
  - Đặt `TempleSceneControls` bên trong khung cảnh: khi bật toàn màn hình chỉ còn 2 nút tròn ở góc trên-phải (Thoát toàn màn hình + Nhạc phát/dừng).
  - Đặt `TempleFullscreenButton` ở góc trên-phải phần nội dung, trong slot `.chua-fs-slot` (cùng kiểu nút với 2 trang kia).
  - Khung nội dung đổi thành `chua-page chua-content` để có class riêng ẩn khi ở chế độ toàn màn hình (tránh trùng class `chua-page` mà MobileShell đang gắn lên wrapper mobile).
- `frontend/src/features/chua/ChuaPage.css`
  - `.chua-fs-slot`: hàng flex căn phải cho nút vào toàn màn hình, không tràn ngang trên mobile.
  - `body.temple-fullscreen-active .chua-content { display: none !important; }`: ẩn bản đồ, lưới thẻ ảnh, hàng "Xem nhanh", dòng gợi ý đăng nhập, tiêu đề.
  - `body.temple-fullscreen-active .chua-scene-bg { z-index: 2147483000; }`: đưa video nền cổng chùa phủ kín màn hình.
  - Các menu/thanh điều hướng khác đã được ẩn sẵn bởi bộ luật toàn màn hình dùng chung trong `TempleScene.css`.
- `frontend/src/components/MusicPlayer.jsx`
  - Thêm `/chua` vào danh sách route giữ nhạc sống (`keepsMusicAlive`) để khi vào cổng chùa nhạc đang phát không bị tự dừng.
  - `MusicPlayer` vẫn KHÔNG render nút nhạc thu nhỏ ở `/chua` ngoài chế độ toàn màn hình; nút nhạc trong toàn màn hình do `TempleSceneControls` dùng chung `MusicPlayerContext` đảm nhận. Không đổi hành vi nút nhạc thu nhỏ ở các trang khác.

Esc: ở chế độ rạp dự phòng, hook `useTempleFullscreen` đã bắt `Escape` để thoát; ở chế độ Fullscreen API, trình duyệt tự xử lý Esc.

Không tạo lại/đổi tên file video, không đụng 2 file video của Chánh Điện và Vườn.

## 2. Kết quả kiểm tra

- Nút toàn màn hình có trên `/chua` (góc trên-phải khung nội dung) — đã kiểm tra trong code + build.
- Khi bật toàn màn hình: `.chua-content` bị ẩn, chỉ còn `.chua-scene-bg` (video `cong-chua.mp4`) phủ toàn màn hình + 2 nút tròn của `TempleSceneControls`.
- Esc thoát: có, qua `useTempleFullscreen` (fallback) và Fullscreen API (native).
- Nút nhạc dùng chung `MusicPlayerContext` (`useMusicPlayer().toggle` / `isPlaying`).
- Mobile 375px: slot nút dùng flex căn phải, không có phần tử rộng cố định mới; không tràn ngang.
- Không dùng trình duyệt headless (kiểm tra bằng code + build theo yêu cầu).

## 3. Lint + build

- `npm run build` trong `frontend/`: PASS (vite build thành công, chỉ còn cảnh báo kích thước chunk và dynamic import có sẵn từ trước).
- Lint: KHÔNG chạy được vì cấu hình ESLint sẵn có của repo bị lỗi môi trường — `frontend/eslint.config.js` dùng `import` nhưng `frontend/package.json` đặt `"type": "commonjs"`, khiến ESLint báo `Cannot use import statement outside a module`. Lỗi này có từ trước, không do thay đổi lần này; không sửa vì ngoài phạm vi task.

## 4. Phạm vi

Chỉ sửa trang cổng chùa và phần giữ nhạc liên quan. Không sửa các quầy, không sửa engine, không đụng Groq. Không push, không deploy.
