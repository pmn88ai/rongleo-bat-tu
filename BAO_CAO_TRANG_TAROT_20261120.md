# BÁO CÁO — Trang Tarot `/tarot` (LOCAL)

Ngày: 2026-11-20. Phạm vi: chỉ chạy/kiểm local, **không push, không deploy**.

## 1. Dữ liệu và ảnh

- Ảnh: `frontend/public/images/tarot/` — đủ **78 file .jpg** (đo thực tế 66,4 MiB ≈ 69,6 MB), đúng tên mã lá trong `tarot-data/INDEX.md`.
- Hồ sơ gốc: `tarot-data/profiles/` — **78 file .md** (22 Ẩn chính + 56 Ẩn phụ).
- Module frontend dùng được: `frontend/src/data/tarotCards.js`
  - Sinh tự động từ 78 hồ sơ (không sửa tay nội dung nghĩa).
  - Mỗi lá gồm: `id`, tên tiếng Việt, tên gốc, `arcana` (major/minor), chất (Cốc/Tiền/Kiếm/Gậy), nhóm hiển thị, đường dẫn ảnh, nghĩa xuôi + từ khóa, nghĩa ngược + từ khóa, nghĩa bổ sung §4.
  - Đối chiếu số lượng: **78/78 lá có nghĩa xuôi và nghĩa ngược**; **56/56 lá Ẩn phụ có nghĩa bổ sung §4**; 78/78 ảnh tồn tại đúng đường dẫn.
- Nguồn/giấy phép: A.E. Waite, *The Pictorial Key to the Tarot* (1910, Public Domain); ảnh RWS từ Wikimedia Commons (Public Domain Mark), ghi trong `tarot-data/NGUON.md`.

## 2. Mẫu trình bày 6 mục của Leo

**Không tìm thấy file mẫu 6 mục.** Đã tìm trong `tarot-data/INDEX.md` (chỉ là danh sách 78 lá + dung lượng ảnh, không có mẫu hiển thị), `tarot-data/NGUON.md`, `docs/` và toàn bộ file `.md` trong repo — chỉ có chính `TASK-TRANG-TAROT-20261120.md` nhắc tới cụm "6 mục"/"25/10/2026".

Vì vậy dùng đúng cấu trúc dự phòng trong task, không thêm mục tự bịa:
tên lá (Việt + gốc) → nhóm → hình → nghĩa xuôi → nghĩa ngược → ý nghĩa bổ sung §4 (chỉ 56 lá Ẩn phụ) → từ khóa.

## 3. Trang `/tarot`

- Route độc lập trong `frontend/src/App.jsx`: `/tarot` — **không cần hồ sơ mệnh/đăng nhập**, khách cũng rút được.
- Component: `frontend/src/features/Tarot/TarotPage.jsx` + `TarotPage.css`.
- 2 kiểu rút:
  - **Rút 1 lá**: câu hỏi nhanh, 1 lá chủ đạo.
  - **Trải 3 lá**: Quá khứ — Hiện tại — Tương lai.
- Ngẫu nhiên đúng như Tarot (khác gieo quẻ theo mệnh/giờ):
  - Xáo toàn bộ 78 lá bằng Fisher–Yates, lấy không trùng trong cùng một trải.
  - Mỗi lá tung xuôi/ngược 50/50 (`Math.random() < 0.5`).
  - Lá ngược được xoay ảnh 180° và gắn nhãn "Ngược"; nghĩa đang rút được làm nổi, nghĩa còn lại vẫn hiển thị để tham khảo.
- Có ô câu hỏi không bắt buộc; nút "Rút lại" để rút trải mới.
- **Không gọi AI** ở v1 — chỉ hiển thị nghĩa gốc từ dữ liệu.

## 4. Điều hướng

- Thêm mục `tarot` vào `ROOMS` trong `frontend/src/config/rooms.js` (nhãn TAROT, tiêu đề "Quầy Tarot", ảnh nền `major_01_magician.jpg`, màu nhấn tím).
- Nhờ đó tự xuất hiện ở:
  - Lưới `/tra-cuu` (TraCuuPage map từ `ROOMS`).
  - Nav desktop `DesktopShell` và nav mobile `MobileShell` (đều map từ `ROOMS`).

## 5. Kiểm chứng LOCAL

| Hạng mục | Kết quả |
|---|---|
| `npm run build` (frontend) | **PASS** — 296 module, vite build 5,50s (chỉ còn cảnh báo chunk >500 kB có sẵn từ trước) |
| `GET /tarot` trên dev server | **HTTP 200** |
| Rút 1 lá | 1 lá, 1 khối nghĩa, ảnh load thật (naturalWidth > 0) |
| Rút lại 1 lá | Ra lá khác lần trước |
| Trải 3 lá | Đủ 3 lá + 3 khối nghĩa, đủ 3 vị trí Quá khứ/Hiện tại/Tương lai |
| Trùng lá trong 1 trải | **Không trùng** (kiểm cả lần đầu và rút lại) |
| Rút lại trải 3 lá | Có lá mới, vẫn không trùng trong trải |
| Đối chiếu nghĩa với `profiles/` | **KHỚP** ở toàn bộ lá rút ngẫu nhiên trong test |
| Mẫu chỉ định: Cups 02 xuôi, The Fool ngược, The Magician xuôi | Hiển thị đúng tên/chiều; nghĩa xuôi + ngược + nghĩa phụ khớp đúng file `profiles/`; lá ngược xoay 180° |
| `/tra-cuu` và nav | Có link `/tarot` ("TAROT — Quầy Tarot") |
| Ảnh 78 lá | Đủ 78 file, đúng mã lá |

Công cụ kiểm: Chrome headless + CDP (click thật vào nút/mode, đọc DOM và ảnh), có ép chuỗi random để rút đúng 3 lá mẫu.

## 6. Chưa kiểm chứng / lưu ý

- `npx eslint` không chạy được do cấu hình có sẵn của repo: `frontend/package.json` đặt `"type": "commonjs"` trong khi `frontend/eslint.config.js` dùng cú pháp ESM. Lỗi này không liên quan thay đổi Tarot; `vite build` vẫn pass.
- Chưa có test tự động trong repo cho Tarot (repo không có test runner frontend); kiểm chứng ở trên chạy local qua trình duyệt headless.
- Chưa làm luận giải AI cho Tarot (đúng phạm vi v1).
