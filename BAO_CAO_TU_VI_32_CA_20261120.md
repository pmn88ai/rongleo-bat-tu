# BÁO CÁO — Chạy lại bộ 32 ca kiểm định Tử vi (an sao)

Ngày: 2026-11-20. Repo: `D:\WORK\projects\rongleo-bat-tu`.
Phạm vi: chỉ chạy và báo cáo. **Không sửa bảng an sao, không sửa dữ liệu ca.**

## 1. Kết quả tổng hợp

| Hạng mục | Kết quả |
|---|---|
| Bộ test có sẵn `backendjs/tests/tu-vi-golden.test.js` | **46/46 test PASS** (4 suite), 0 fail |
| Script đối chiếu trực tiếp fixtures (mới) | **32/32 ca PASS** |
| Ca lệch | **0** |

### (a) Bộ test có sẵn

Lệnh đã chạy:

```
cd backendjs
node --test tests/tu-vi-golden.test.js
```

Kết quả cuối log:

```
ℹ tests 46
ℹ suites 4
ℹ pass 46
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

Trong đó suite `Bộ ca đóng băng (tu-vi-goc/cases.json)` chạy đủ 32 ca, tất cả đều `✔` (Mệnh / Thân / Cục / 14 chính tinh / Tứ Hóa). Log có cảnh báo `ERR_ERL_PERMISSIVE_TRUST_PROXY` của `express-rate-limit` khi khởi động server cho phần test endpoint — chỉ là cảnh báo cấu hình, không ảnh hưởng kết quả test.

### (b) Script đối chiếu fixtures

- File: `backendjs/tests/fixtures/cases-tu-vi-32.json` (đã chuyển từ `cases-tu-vi-32.json` ở repo root vào, giữ nguyên nội dung; xác nhận trùng từng byte với `tu-vi-goc/cases.json`).
- Script: `backendjs/tests/tu-vi-32-cases-check.js` — đọc fixtures, gọi `lapLaSo()` + `canNamFromYear()` trong `backendjs/src/bazi/tu_vi.js`, so sánh Mệnh, Thân, Cục, 14 chính tinh, 4 Tứ Hóa; in từng ca lệch nếu có.

Lệnh đã chạy:

```
cd backendjs
node tests/tu-vi-32-cases-check.js
```

Kết quả:

```
Bộ ca: D:\WORK\projects\rongleo-bat-tu\backendjs\tests\fixtures\cases-tu-vi-32.json
KẾT QUẢ: 32/32 ca PASS
EXIT=0
```

### Bảng ca lệch

Không có ca nào lệch — không có dòng nào để liệt kê.

## 2. Điểm Leo đã chốt — Quý Hóa Khoa

- File: `backendjs/src/bazi/tu_vi.js`
- Dòng: **62**
- Nội dung: `'Quý': ['Phá Quân', 'Cự Môn', 'Thái Âm', 'Tham Lang']`
- Quy ước cột (dòng 51): `[Lộc, Quyền, Khoa, Kỵ]` → phần tử thứ 3 (index 2) là **Thái Âm**.

Kiểm runtime:

```
node -e "const t=require('./backendjs/src/bazi/tu_vi'); console.log(t.TU_HOA['Quý'][2])"
→ Thái Âm
```

**Kết luận: ĐÚNG — Quý Hóa Khoa là Thái Âm, không phải Thái Dương.**

## 3. Giới hạn của bộ ca (theo README bộ regression)

Nguồn: `tu-vi-goc/README-quy-uoc.md` và `meta.quy_uoc_dau_vao` trong `cases-tu-vi-32.json`.

1. **Lịch Trung Hoa, không phải lịch Việt**: ngày/tháng âm theo thuật toán iztro (lịch Trung Hoa). Lịch Việt Nam có thể lệch 1 ngày ở một số tháng; bộ ca không kiểm chứng được độ lệch này. Khi tra cho khách Việt phải quy đổi bằng lịch Việt trước.
2. **Chưa có ca giờ Tý sát ranh giới 23:00** — vấn đề Tý sớm/Tý muộn và quy ước đổi ngày chưa được kiểm thử.
3. **Chưa có ca tháng nhuận** — lá số sinh tháng nhuận chưa được kiểm chứng ở cả hai hệ.
4. **Trường phái an sao: Toàn Tập** (bản mặc định Toàn Tập/Kham Thiên, chốt 24/10/2026). Các hệ an sao khác nằm ngoài phạm vi.
5. Phạm vi trường so sánh chỉ gồm Mệnh, Thân, Cục, 14 chính tinh, Tứ Hóa — **chưa gồm** sao phụ, Tuần/Triệt, độ sáng.

## 4. Đề xuất

Không có lệch cần sửa. Các đề xuất tăng độ phủ cho đợt sau (không làm trong đợt này):

1. Bổ sung ca giờ Tý sát 23:00 (23:00, 23:30, 23:59) và ca tháng nhuận, có nguồn độc lập — theo đúng kỷ luật "không sửa `cases.json` để cho PASS", phải ghi nguồn vào nhật ký.
2. Cân nhắc đổi `tu-vi-golden.test.js` đọc fixtures `backendjs/tests/fixtures/cases-tu-vi-32.json` thay vì `tu-vi-goc/cases.json`, để bộ test trong `backendjs/` tự chứa và không phụ thuộc thư mục ngoài `backendjs/`.
3. Giữ script `tu-vi-32-cases-check.js` làm công cụ báo cáo nhanh (in diff từng trường) bên cạnh test assert.

## 5. Kỷ luật tuân thủ

- Không sửa `backendjs/src/bazi/tu_vi.js`.
- Không sửa `cases-tu-vi-32.json` / `cases.json`.
- Không push, không deploy. Chỉ commit local.
