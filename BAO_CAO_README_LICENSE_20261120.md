# BÁO CÁO — Viết lại README + LICENSE của Leo, bỏ giấy phép cũ

Ngày: 2026-11-20. Repo: `D:\WORK\projects\rongleo-bat-tu`.
Thực hiện theo `TASK-README-LICENSE-20261120.md`. Commit local, KHÔNG push, KHÔNG deploy.

## 1. File đã viết lại / tạo mới

| File | Việc đã làm |
|---|---|
| `README.md` | Viết lại toàn bộ bằng tiếng Việt: dự án Mệnh Lý AI của Phạm Minh Nhật (RongLeo); tính năng thật trong repo (Bát Tự, Đại Vận/Lưu Niên, luận giải, Tử Vi, gieo quẻ Kinh Dịch, chùa, Vận Hôm Nay, tư vấn AI, hợp duyên, xem/chọn ngày, Tử Vi phương Tây, bài viết, tài khoản/quản trị, xuất PNG/PDF); cấu trúc thư mục `frontend`, `frontend/api`, `frontend/lib`, `backendjs`, `docs`; cách chạy local (frontend 3005, backend 8888, proxy `/api`); test bằng `node --test`; deploy Vercel tại `rongleo-menhly.vercel.app`. Đã gỡ huy hiệu giấy phép cũ, mục giấy phép cũ và link LICENSE cũ. |
| `README.en.md` | Viết lại toàn bộ bằng tiếng Anh, cùng nội dung với bản tiếng Việt. Đã gỡ huy hiệu giấy phép cũ, mục giấy phép cũ và link LICENSE cũ. |
| `LICENSE` | Tạo mới. Giấy phép riêng của Leo: © 2026 Phạm Minh Nhật (RongLeo), toàn quyền bảo lưu (All Rights Reserved). Không ai được sao chép, phân phối, công bố, sửa đổi, tạo sản phẩm phái sinh, bán, cho thuê, cấp phép lại hoặc dùng lại toàn bộ hay một phần dự án dưới bất kỳ hình thức nào nếu không có sự cho phép trước bằng văn bản của chủ sở hữu. Có bản tiếng Việt và tiếng Anh, không dùng văn bản của giấy phép cũ. |
| `backendjs/package.json` | Đổi trường giấy phép từ giá trị cũ sang `"license": "UNLICENSED"` (dòng 21). |
| `frontend/package.json` | Thêm `"license": "UNLICENSED"` (dòng 5) vì trước đó file không có trường giấy phép. |
| `package.json` (root) | Không có trường giấy phép nên không sửa (đúng điều kiện trong task). |
| `BAO_CAO_KIEM_TRA_TOAN_BO_BAT_TU_20261120.md` | Cập nhật 2 dòng cũ còn nhắc tên giấy phép cũ (dòng 47 và 58) thành "giấy phép cũ"; ghi chú việc đã xử lý ngày 20/11/2026. Không đổi kết luận lịch sử khác. |

## 2. Tóm tắt nội dung LICENSE mới

- Bản quyền: © 2026 Phạm Minh Nhật (RongLeo).
- Toàn quyền bảo lưu (All Rights Reserved).
- Áp dụng cho toàn bộ mã nguồn, tài liệu, dữ liệu, hình ảnh, âm thanh và nội dung trong repo.
- Cấm sao chép, phân phối, công bố, sửa đổi, tạo sản phẩm phái sinh, bán, cho thuê, cấp phép lại, dùng lại — toàn bộ hay một phần — dưới mọi hình thức nếu không có sự cho phép trước bằng văn bản của chủ sở hữu.
- Truy cập/xem dự án không tạo ra quyền sử dụng nào ngoài phạm vi giấy phép.
- Dự án cung cấp "nguyên trạng", không bảo đảm; chủ sở hữu không chịu trách nhiệm thiệt hại phát sinh.
- Mọi đề nghị xin phép phải được chủ sở hữu chấp thuận bằng văn bản.

## 3. Các chỗ đã gỡ giấy phép cũ (file + dòng cũ)

| File | Dòng cũ | Nội dung cũ |
|---|---:|---|
| `README.md` | 8 | Huy hiệu `license-MIT-green.svg` |
| `README.md` | 513–515 | Mục `## 📄 License` + dòng "MIT License — Xem file [LICENSE](LICENSE)..." |
| `README.en.md` | 8 | Huy hiệu `license-MIT-green.svg` |
| `README.en.md` | 495–497 | Mục `## 📄 License` + dòng "MIT License — See [LICENSE](LICENSE)..." |
| `backendjs/package.json` | 21 | `"license": "MIT"` → `"license": "UNLICENSED"` |
| `frontend/package.json` | — | Không có trường giấy phép; đã thêm `"license": "UNLICENSED"` |
| `BAO_CAO_KIEM_TRA_TOAN_BO_BAT_TU_20261120.md` | 47, 58 | Nhắc tên giấy phép cũ trong báo cáo kiểm tra 19/11 → đổi thành "giấy phép cũ" |

## 4. Kiểm chứng

Lệnh đã chạy (loại trừ `node_modules`, `.git`, `package-lock.json`):

```bash
git grep -n -I -E "MIT" -- . ":(exclude)package-lock.json"
git grep -n -I -i -E "mit license|license.*mit|mit.*license" -- .
findstr /n /c:"MIT" README.md README.en.md LICENSE backendjs\package.json frontend\package.json package.json
```

Kết quả:

- Không còn chuỗi nào liên quan tới giấy phép cũ trong README, LICENSE, các `package.json` và toàn bộ file đang được git theo dõi.
- Các kết quả còn khớp chuỗi "MIT" chỉ là chuỗi con của từ khác, không liên quan giấy phép:
  - `LIMIT` trong câu SQL (`backendjs/src/routes/*.js`, `backendjs/src/services/database.service.js`, `docs/SECURITY_REPORT.md`);
  - `LIMITATIONS` / `LIMITATION` trong chú thích kỹ thuật (`backendjs/src/western/signs/moon.js`, `backendjs/tests/core.test.js`);
  - `MIS_NATURE_MAJOR_LIMIT`, `MISFORTUNE_MAJOR_LIMIT` trong dữ liệu câu hỏi (`backendjs/src/bazi/questions/*`, `frontend/lib/bazi/questions/*`).
- `LICENSE` hiện tồn tại nên link trong README không còn gãy.
- Đã kiểm tra JSON của 3 file `package.json` sau khi sửa: hợp lệ.
- Đã chạy `npm test -w backendjs`: 224 test pass, 0 fail (có cảnh báo `trust proxy` sẵn có của express-rate-limit, không ảnh hưởng kết quả).

## 5. Commit

Commit local các file thuộc phạm vi task: `README.md`, `README.en.md`, `LICENSE`, `backendjs/package.json`, `frontend/package.json`, báo cáo này và cập nhật nhỏ ở báo cáo kiểm tra cũ. Không stage các file/log/task không liên quan đang có trong working tree. Không push, không deploy.
