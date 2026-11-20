# BÁO CÁO — Gọn bản đồ chùa còn 4 chấm (2026-11-20)

## Đã làm
- `frontend/src/features/chua/ChuaPage.jsx`: bản đồ chùa giờ đúng 4 điểm:
  - `chanhdien` → `/chanh-dien` (giữ nguyên)
  - `vuontinhtam` → `/vuon-tinh-tam` (giữ nguyên)
  - `tangkinhcac` → `/dientich` (giữ nguyên)
  - `tracuu` (mới) — title "Tra Cứu", shortLabel "Tra cứu" → `/tra-cuu`, ảnh `quay-xem-ngay.jpg`, accent `#fbbf24`, toạ độ `{ x: 87, y: 50 }`.
- Bỏ 6 marker khỏi bản đồ: `battu`, `xemngay`, `vanhomnay`, `duyenso`, `xinque`, `tuvan`. Thẻ ảnh (gallery) và "Xem nhanh" tự rút theo `PLACES` nên cũng còn 4.
- `frontend/src/features/chua/ChuaPage.css`: đổi rule canh tooltip `.chua-pin--battu` → `.chua-pin--tracuu`.
- Không sửa `/tra-cuu`, không xoá/redirect route riêng nào.

## Kiểm chứng LOCAL
- `npm run build` (frontend): pass.
- Dev server 3005: `GET /chua` = 200, `GET /tra-cuu` = 200.
- Headless Chrome (dump DOM) tại `/chua`: 4 pin `chanhdien, vuontinhtam, tangkinhcac, tracuu`; 4 link nhanh và 4 card đều trỏ `/chanh-dien, /vuon-tinh-tam, /dientich, /tra-cuu`.
- Không còn link tra cứu cũ trong vùng bản đồ/gallery.
- `/tra-cuu`: đủ 11 mục (laso, phantich, vanhan, xemngay, than-so-hoc, tuvan, duyenso, xinque, tarot, tuviphuongtay, van-hom-nay).

## Trạng thái
- Commit local. KHÔNG push, KHÔNG deploy.
