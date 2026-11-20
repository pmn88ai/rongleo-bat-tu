# BÁO CÁO — TẮT LỚP TRANG TRÍ TẠM (SVG/CSS) Ở 2 TRANG CHÁNH ĐIỆN + VƯỜN (20/11/2026)

## 1. Đã gỡ những gì

### Trang Chánh Điện (`frontend/src/features/chua/ChanhDienPage.jsx`)
- Gỡ hẳn component `BuddhaSilhouette` (tượng Phật SVG + quầng sáng hồ lô vàng ở giữa khung).
- Gỡ hẳn component `IncenseSmoke` (lư hương + 3 nén nhang + khói).
- Gỡ khối `chanh-lotus` (5 cánh sen hồng dưới cùng).
- Gỡ các lớp phủ trang trí: `chanh-radiance`, `chanh-beams` (3 chùm sáng), `chanh-floor`.
- Xóa toàn bộ CSS chỉ phục vụ các phần tử trên trong `TempleScene.css` (kể cả keyframes `chanh-breathe`, `beam-sway`, `smoke-rise` và các rule mobile liên quan).
- Nền `.chanh-scene` rút về màu tối đơn sắc làm fallback khi video chưa load.

### Trang Vườn Tịnh Tâm (`frontend/src/features/chua/VuonTinhTamPage.jsx`)
- Gỡ hẳn SVG `vuon-garden`: đồi nền/đồi trước, dải suối xanh uốn lượn, các vệt nước lấp lánh, bụi đá xám, cỏ vẽ tay.
- Gỡ 2 cây tròn hoạt hình (`vuon-tree--left`, `vuon-tree--right`) cùng lá/thân.
- Gỡ bụi tre (`vuon-bamboo`).
- Gỡ các lớp phủ `vuon-sky`, `vuon-sun`, và 4 đốm đom đóm (`vuon-firefly`).
- Xóa toàn bộ CSS tương ứng (hill/stream/rocks/grass/tree/leaf/bamboo/firefly + keyframes và rule mobile).
- Nền `.vuon-scene` rút về màu tối đơn sắc làm fallback khi video chưa load.

## 2. Giữ nguyên
- Video nền thật vẫn được dùng: `/video/chanh-dien.mp4` và `/video/vuon-tinh-tam.mp4` (component `TempleBackground`, tự chạy lặp, `muted`).
- Tiêu đề + mô tả, nút toàn màn hình, nút nhạc trong chế độ toàn màn hình (`TempleSceneControls`), thẻ video nhạc ở Vườn, và menu.
- Không sửa trình phát nhạc, không đụng Groq/backend.

## 3. Kiểm chứng
- `npm run build` trong `frontend/`: PASS (537 modules, build xong không lỗi; chỉ còn warning chunk size có sẵn từ trước).
- Kiểm tra code: không còn tham chiếu nào tới các class trang trí đã gỡ trong `src` (đã grep toàn bộ).
- Video nền, nút toàn màn hình, nút nhạc, thẻ video nhạc vẫn còn trong code 2 trang.
- Mobile 375px: `.temple-page` có `overflow-x: hidden`, `.temple-content` dùng `width: 100%` + `padding` + `box-sizing: border-box`; không thêm phần tử nào có thể gây tràn ngang.
- Lint: `frontend/package.json` không có script lint; file `eslint.config.js` là ESM nhưng package khai `"type": "commonjs"` nên ESLint 9 không nạp được config (lỗi có sẵn, không do thay đổi này). Khi chạy thử bằng bản config `.mjs` tạm, ESLint báo 1 lỗi `react-hooks/refs` tại `ChanhDienPage.jsx:19` (`fullscreen.enter`) — lỗi này có từ trước và nằm ở nút toàn màn hình, thuộc phạm vi không được sửa theo task.

## 4. Trạng thái
- Đã commit local (message ASCII không dấu). KHÔNG push, KHÔNG deploy.
