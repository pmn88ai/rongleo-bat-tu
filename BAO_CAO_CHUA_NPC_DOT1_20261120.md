# BÁO CÁO BẢN ĐỒ CHÙA + NPC — ĐỢT 1 (20/11/2026)

Phạm vi: chỉ frontend. Không sửa `backendjs/`, engine tính toán (bazi/luan_giai), `groq.service.js`. Không push, không deploy. Không làm đăng nhập.

## 1. File đã thêm / sửa

Thêm mới:
- `frontend/src/features/chua/ChuaPage.jsx` — trang bản đồ chùa `/chua`, hàng "Xem nhanh", 7 quầy, 8 NPC, dòng ghi chú đăng nhập ở cuối.
- `frontend/src/features/chua/ChuaPage.css` — style bản đồ chùa (sân chùa SVG ở giữa, quầy xếp quanh), responsive 375px, style thẻ lối vào trang chủ.

Sửa:
- `frontend/src/App.jsx` — import `ChuaPage`, thêm route `/chua` (route độc lập, không cần dữ liệu lá số). Route `/` và các route cũ giữ nguyên.
- `frontend/src/components/DesktopShell.jsx` — thêm tab menu "VÀO CHÙA" trỏ `/chua`.
- `frontend/src/features/Homepage/BirthInput.jsx` — thêm thẻ lối vào "Vào chùa xem" ngay dưới tiêu đề trang chủ, link tới `/chua`. Người quen đường cũ vẫn dùng form/lối cũ bình thường, không bị ép qua chùa.

Không dùng ảnh ngoài, không gọi API tạo ảnh. Chân dung NPC là vòng tròn chữ cái đầu, sân chùa là SVG vẽ tay trong code.

## 2. Tên NPC và quầy tương ứng

| # | Quầy | Link | NPC |
|---|------|------|-----|
| 1 | Điện Tử Vi | `/tuvi` | Thầy Tinh Tú |
| 2 | Điện Bát Tự | `/` | Thầy Can Chi |
| 3 | Quầy Xem Ngày | `/xemngay` | Thầy Hoàng Đạo |
| 4 | Quầy Vận Hôm Nay | `/van-hom-nay` | Thầy Thời Vận |
| 5 | Quầy Tình Duyên | `/duyenso` | Thầy Duyên Khởi |
| 6 | Quầy Xin Quẻ | `/xinque` | Thầy Quẻ Cát |
| 7 | Phòng Hỏi Thầy | `/tuvan` | Thầy Huyền Cơ Bát Tự (giữ nguyên) + Thầy Mệnh Mèo GenZ (giữ nguyên) |

8 tên NPC khác nhau. Quầy Hỏi Thầy giữ đúng 2 persona đã có trong `ConsultantPage.jsx`, chỉ vẽ 2 thẻ thầy trong cùng 1 quầy.

## 3. Kiểm chứng

- `npm run build` trong `frontend/`: PASS (vite 7.3.0, 525 modules, build 8.66s). Có cảnh báo cũ về chunk lớn/html2canvas, không phải lỗi.
- Dev server `vite --port 5177`: `/chua` trả HTTP 200.
- Kiểm bằng Edge headless (không bị chặn quyền, không phải bỏ qua bước này):
  - `/chua`: đủ 7 quầy, 8 tên NPC đúng danh sách trên, dòng cuối đúng câu "Đăng nhập để lưu hồ sơ, lần sau khỏi gõ lại — sắp có."
  - Link từng quầy (thuộc tính `href`): `/tuvi`, `/`, `/xemngay`, `/van-hom-nay`, `/duyenso`, `/xinque`, `/tuvan` — đúng.
  - Bấm thực tế từng nút: `/tuvi` → `/tuvi`; `/` → `/`; `/van-hom-nay` → `/van-hom-nay`; `/duyenso` → `/duyenso`. Riêng `/xemngay`, `/xinque`, `/tuvan` bị đưa về `/` vì các trang này vốn có guard "phải có lá số" khi chưa nhập ngày sinh — đây là hành vi cũ, không sửa trong đợt 1. Link và trang đích vẫn đúng như trước.
  - Trang chủ 375px: có thẻ "Vào chùa xem", `href=/chua`, bấm vào đi tới `/chua` và hiển thị đủ 7 quầy.
  - Mobile 375px trên `/chua`: `innerWidth = 375`, `scrollWidth = 375` → không tràn ngang; bản đồ về 1 cột dọc.

## 4. Đợt 2 còn lại

- Đăng nhập + lưu hồ sơ/lịch sử: gắn `AuthModal` / `UserProfileModal` đã có sẵn trong `frontend/src/components/`, lưu lá số và câu hỏi để lần sau khỏi gõ lại.
- NPC nhớ chuyện cũ: lưu ngữ cảnh hội thoại theo người dùng, để mỗi thầy nhớ câu hỏi/lá số trước đó.
