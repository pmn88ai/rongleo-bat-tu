# BÁO CÁO CHÙA NPC ĐỢT 2 BỔ SUNG — 20/11/2026

## 1. Phạm vi đã làm
Chỉ sửa `frontend/`. Không đụng `backendjs/`, Groq, engine tính toán.
Không push, không deploy.

## 2. File đã thêm / sửa
Thêm mới:
- `frontend/src/features/chua/useTempleFullscreen.js` — hook quản lý Fullscreen API + chế độ "rạp" dự phòng.
- `frontend/src/features/chua/TempleSceneControls.jsx` — nút "Toàn màn hình" và cụm 2 nút khi đang toàn màn hình.

Sửa:
- `frontend/src/features/chua/ChanhDienPage.jsx` — gắn ref khung cảnh, thêm nút Toàn màn hình + cụm điều khiển trong khung cảnh.
- `frontend/src/features/chua/VuonTinhTamPage.jsx` — gắn ref khung cảnh, thêm nút Toàn màn hình + cụm điều khiển; thẻ "Video nhạc của Leo" nhúng thẳng YouTube.
- `frontend/src/features/chua/TempleScene.css` — style nút toàn màn hình, cụm 2 nút, chế độ ẩn giao diện, responsive 375px.
- `frontend/src/context/MusicPlayerContext.jsx` — đổi nguồn nhạc từ file mp3 sang YouTube IFrame API (`jKoznZSMX6s`), giữ nguyên interface play/pause/seek/volume cho thanh nhạc.
- `frontend/src/components/MusicPlayer.jsx` — đổi thông báo lỗi từ "không tìm thấy /audio/thien.mp3" sang lỗi tải nhạc YouTube.

Đã xóa:
- `frontend/public/audio/thien.mp3` (bản copy 19MB; bản gốc vẫn ở `D:\WORK\temp\nhac_thu_gian\`).

## 3. Nút toàn màn hình
- Có nút "⛶ Toàn màn hình" rõ ràng ở góc trên bên phải vùng khung cảnh trên cả 2 trang.
- Bấm nút: gọi `requestFullscreen` trên chính khung cảnh (`TempleBackground` + cảnh SVG).
- Khi toàn màn hình: ẩn hết header, menu tab, thẻ tiêu đề/mô tả, thẻ video, thanh nhạc, các pill TỬ VI / VẬN HÔM NAY; chỉ còn đúng 2 nút ở góc trên phải: Thoát toàn màn hình (✕) và Nhạc phát/dừng (▶ / ❚❚).
- `fullscreenchange` được lắng nghe để đồng bộ trạng thái; bấm Esc (mặc định trình duyệt) thoát và giao diện trở lại như cũ.
- Trình duyệt không hỗ trợ hoặc từ chối Fullscreen API: tự chuyển sang chế độ "rạp" bằng CSS (class `temple-fullscreen-active` trên `body`), khung cảnh phủ kín viewport, vẫn có nút thoát ở góc. Esc trong chế độ này cũng thoát.
- Mobile 375px: nút bấm được, khung cảnh phủ kín, 2 nút điều khiển nằm gọn góc trên phải.

## 4. Nhạc YouTube
- MusicPlayer mặc định phát video `jKoznZSMX6s` qua YouTube IFrame API (trình phát ẩn), thanh nhạc vẫn điều khiển được phát/dừng, tua (seek), âm lượng.
- Thẻ "Video nhạc của Leo" ở Vườn tịnh tâm nhúng `https://www.youtube.com/embed/jKoznZSMX6s`, không còn placeholder "chỉ cần đưa link YouTube".
- Nhạc chạy qua hạ tầng YouTube, không dùng file mp3 của repo.

## 5. Kiểm chứng
- `npm run build` trong `frontend/`: PASS (Vite 7.3.0, 537 modules, built in ~6.9s).
- `frontend/dist` không còn `audio/thien.mp3`.
- Kiểm tra bằng Chrome headless + CDP:
  - `/chanh-dien` và `/vuon-tinh-tam`, viewport 375x812 và 1440x900: `document.scrollWidth === innerWidth` (375/1440), không tràn ngang.
  - Bấm nút Toàn màn hình ở cả 2 trang: body có class `temple-fullscreen-active`, còn đúng 2 nút (`Thoát toàn màn hình`, `Phát nhạc`), `.temple-content` và `.music-fab` bị ẩn.
  - Bấm Esc: class mất, nội dung hiển thị lại, cụm 2 nút biến mất.
  - Bấm nút nhạc trong chế độ toàn màn hình: trình phát YouTube ẩn được tạo với đúng video `jKoznZSMX6s`, nút chuyển sang trạng thái `is-playing` (video thực sự phát).
  - Thẻ video Vườn tịnh tâm: iframe trỏ đúng `youtube.com/embed/jKoznZSMX6s`, không còn `.music-video-placeholder`.
- Ghi chú: Chrome headless từ chối Fullscreen API nên nhánh native fullscreen không chạy trực tiếp trong môi trường headless; nhánh dự phòng CSS đã được kiểm tra đầy đủ (đúng là fallback mà task yêu cầu). Code native dùng API chuẩn `requestFullscreen` / `exitFullscreen` / `fullscreenchange`.
- Ghi chú: `npx eslint` không chạy được do `frontend/eslint.config.js` dùng ESM nhưng `frontend/package.json` đang `"type": "commonjs"` (lỗi cấu hình có sẵn, ngoài phạm vi task). Build không bị ảnh hưởng.

## 6. Trạng thái
Đã commit local. KHÔNG push. KHÔNG deploy.
