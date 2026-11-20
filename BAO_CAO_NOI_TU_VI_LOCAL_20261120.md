# BÁO CÁO — Nối /tuvi với API Tử vi mới + hàm live (LOCAL)

Ngày: 2026-11-20. Chỉ làm local, **không push, không deploy**.

## File đã đổi

| File | Việc làm |
|---|---|
| `frontend/lib/bazi/tu_vi.js` | Copy nguyên `backendjs/src/bazi/tu_vi.js` sang lib live |
| `frontend/lib/bazi/lunar_viet.js` | Copy nguyên `backendjs/src/bazi/lunar_viet.js` sang lib live |
| `frontend/api/tu-vi.js` | **Mới** — GET handler serverless, nhận đúng query param như route backend, trả cùng dạng kết quả, không kiểm credit |
| `frontend/src/features/tu_vi/TuViPage.jsx` | Thêm chọn lịch Trung Hoa/Việt, tick tháng nhuận, ô giờ:phút, ô ngày dương tùy chọn; đường cũ giữ nguyên |
| `frontend/src/features/tu_vi/TuViPage.css` | Style cho 2 ô giờ:phút |

## Phụ thuộc của engine

- `tu_vi.js` chỉ require `lunar-javascript`, `./ganzhi`, `./lunar_viet`.
- `lunar-javascript` đã có sẵn trong `frontend/package.json` (`^1.6.12`).
- `frontend/lib/bazi/ganzhi.js` đã đồng bộ byte-for-byte với backend (đã kiểm `fc /b`: no differences).
- `lunar_viet.js` không require gói nào.
- Vì vậy **không cần thêm dependency**, hàm live không crash vì thiếu gói.

## Hành vi form

- Mặc định: giữ nguyên đường cũ (`ngay_am`, `thang_am`, `gio_chi`, `can_nam`) khi không dùng tính năng mới.
- Chọn "Âm lịch Việt" → gửi `lich=viet`; tick "Tháng nhuận" → gửi `thang_nhuan=true`.
- Nhập giờ:phút → gửi `gio`/`phut` (đường mới). Không nhập → vẫn dùng select giờ Chi như cũ.
- Khi đường mới bắt buộc có giờ mà người dùng chỉ chọn giờ Chi (âm Việt / tháng nhuận / ngày dương), dùng giờ giữa khoảng của Chi đã chọn làm dự phòng (Tý 00:00, Sửu 02:00, …, Hợi 22:00) — không tự đoán Chi khác.
- Nhập ngày dương (input date tùy chọn) → gửi `duong_lich=YYYY-MM-DD` + `gio`.
- Luật "không rõ giờ sinh thì chặn" vẫn giữ nguyên.

## Kết quả kiểm chứng LOCAL

### 1. Backend
- `cd backendjs && npm test` → **267 pass / 0 fail** (gồm toàn bộ ca Tử vi bổ sung, 32 ca golden, lịch Việt).

### 2. Frontend build
- `cd frontend && npm run build` → **PASS**.

### 3. 3 ca mẫu từ `cases-tu-vi-bo-sung.json`

Gọi trực tiếp handler live `frontend/api/tu-vi.js` bằng req/res giả (Node), so cả với fixture và với engine backend:

| Ca | Nguồn | Mệnh | Thân | Cục | Tử Vi | Kết quả |
|---|---|---|---|---|---|---|
| `ty-2300-1990-05-15` | dương 15/05/1990, 23:00 | Tỵ | Tỵ | 4 | Dậu | PASS (14 chính tinh + trụ ngày/giờ khớp) |
| `nhuan-2023-02-22` | âm 22/2/2023 nhuận, 14:30 | Dậu | Hợi | 3 | Hợi | PASS (14 chính tinh khớp) |
| `viet-2006-06-10` | âm Việt 10/6/2006, 09:00 | Dần | Tý | 3 | Thìn | PASS (14 chính tinh khớp) |

- Live handler == backend engine: **cả 3 ca JSON trùng khớp hoàn toàn**.
- Đường cũ (`ngay_am/thang_am/gio_chi/can_nam`) qua live handler == backend: PASS.
- `duong_lich` sai định dạng → 400: PASS.

### 4. Dev server local
- Backend `:8888` health 200; frontend `:3005` mở `/tuvi` → **200**.
- Gọi `/api/tu-vi` qua dev server (proxy sang backend) với 3 ca trên → **3/3 PASS**.
- Đã tắt server và xoá log tạm sau khi kiểm.

## Chưa kiểm / giới hạn

- Chưa chạy `vercel dev` để phục vụ chính `frontend/api/tu-vi.js` qua HTTP thật; handler đã được import trực tiếp và so khớp backend (đúng yêu cầu task).
- Chưa thao tác tay toàn bộ UI trên trình duyệt (mới xác nhận `/tuvi` trả 200 + build pass). Cần Leo bấm thử các nút mới khi duyệt.
- Chưa push, chưa deploy theo đúng yêu cầu.
