# BÁO CÁO — Bổ sung ca Tử vi: giờ Tý 23:00 + tháng nhuận + lịch Việt

Ngày: 2026-11-20. Repo: `D:\WORK\projects\rongleo-bat-tu`.
Phạm vi: bổ sung bộ ca mới, sửa 3 lệch (giờ Tý / tháng nhuận / lịch Việt), không sửa bộ 32 ca cũ.

## 1. Ba quy tắc đã áp dụng

### 1.1. Lịch Việt
- Khách nhập ngày âm Việt → quy đổi sang dương lịch bằng **lịch Việt, thuật toán Hồ Ngọc Đức, UTC+7 (105°E)** → rồi mới an sao trên ngày dương đó (iztro vẫn dùng lịch Trung Hoa để an sao).
- Ngày dương nhập vào thì không đổi lịch.
- Bộ 32 ca cũ **không sửa** — vẫn giữ lịch Trung Hoa như cũ.

### 1.2. Giờ Tý
Đã chạy iztro 2.6.3 thật để xác định trước quy ước:

```
astro.bySolar('1990-05-15', 12, '男')   // 晚子时 23:00~00:00
→ lunarDate hiển thị: 1990-04-21
→ chineseDate: 庚午 辛巳 辛巳 戊子     (trụ ngày = ngày kế tiếp)
→ Tử Vi tại Dậu (giống lá số ngày 1990-05-16)
astro.bySolar('1990-05-15', 0, '男')    // 早子时 00:00~01:00
→ chineseDate: 庚午 辛巳 庚辰 丙子
→ Tử Vi tại Tý
```

Kết luận quy ước iztro:
- 23:00–23:59 = **Tý muộn (timeIndex 12)**, an sao dùng **ngày âm + 1** (nếu là ngày cuối tháng thì về mùng 1, **tháng giữ nguyên**), **không** áp fixLeap.
- Trụ ngày/giờ lấy theo ngày kế tiếp (khớp `chineseDate` của iztro).
- 00:00–00:59 = Tý sớm (timeIndex 0), không cộng ngày.

### 1.3. Tháng nhuận
- Kỳ vọng lấy từ `astro.byLunar(..., isLeapMonth=true)` với **fixLeap = true** (mặc định iztro 2.6.3).
- Nửa đầu tháng nhuận (ngày ≤ 15) tính theo tháng nhuận; nửa sau (ngày > 15) tính sang tháng kế tiếp.
- Đã kiểm bằng 2 mốc: tháng 2 nhuận 2023 (ngày 6 và ngày 22) và tháng 6 nhuận 2025 (ngày 12 và ngày 25).

## 2. Nguồn sinh kỳ vọng

- **iztro 2.6.3** cài bằng npm trong thư mục tạm ngoài repo (`%TEMP%\opencode\iztro-src`), không thêm dependency vào repo.
- Ghi chú: TASK ghi “pip, venv riêng” nhưng iztro là thư viện **npm/JavaScript**, không có bản pip. Đã cài đúng phiên bản 2.6.3 bằng npm; đây là điểm lệch so với câu chữ TASK, không ảnh hưởng nguồn kỳ vọng.
- Mỗi ca trong fixtures đều ghi `nguon`, `ngay duong`, `ngay am Trung Hoa` (hoặc `am Viet`), `gio_index_iztro`, `quy_uoc`.

## 3. Danh sách ca mới

File: `backendjs/tests/fixtures/cases-tu-vi-bo-sung.json` — **11 ca**.

### 3.1. Giờ Tý (3 ca)

| Ca | Dương lịch | Giờ | Giới tính | Âm Trung Hoa | Nguồn |
|---|---|---|---|---|---|
| `ty-2300-1990-05-15` | 1990-05-15 | 23:00 | nam | 21/4/1990 | `astro.bySolar('1990-5-15', 12, '男')` |
| `ty-2330-2016-08-20` | 2016-08-20 | 23:30 | nữ | 18/7/2016 | `astro.bySolar('2016-8-20', 12, '女')` |
| `ty-2359-2031-12-03` | 2031-12-03 | 23:59 | nam | 19/10/2031 | `astro.bySolar('2031-12-3', 12, '男')` |

Mỗi ca so thêm **trụ ngày** và **trụ giờ** (kỳ vọng lấy từ `chineseDate` của iztro).

### 3.2. Tháng nhuận (4 ca)

| Ca | Âm Trung Hoa | Dương lịch | Giờ | Giới tính | Nguồn |
|---|---|---|---|---|---|
| `nhuan-2023-02-06` | 6/2 nhuận/2023 | 2023-03-27 | 09:15 | nam | `astro.byLunar('2023-2-6', 5, '男', true)` |
| `nhuan-2023-02-22` | 22/2 nhuận/2023 | 2023-04-12 | 14:30 | nữ | `astro.byLunar('2023-2-22', 7, '女', true)` |
| `nhuan-2025-06-12` | 12/6 nhuận/2025 | 2025-08-05 | 08:00 | nam | `astro.byLunar('2025-6-12', 4, '男', true)` |
| `nhuan-2025-06-25` | 25/6 nhuận/2025 | 2025-08-18 | 16:45 | nữ | `astro.byLunar('2025-6-25', 8, '女', true)` |

### 3.3. Lịch Việt lệch lịch Trung Hoa 1 ngày (4 ca)

Đã quét 2000–2030, tìm được 16 tháng lệch thật (ví dụ 6/2006, 1/2007, 10/2018, 1/2030). Chọn 4 ca:

| Ca | Âm Việt | Dương lịch (lịch Việt) | Âm Trung Hoa cùng ngày dương | Giờ | Giới tính |
|---|---|---|---|---|---|
| `viet-2006-06-10` | 10/6/2006 | 2006-07-04 | 9/6/2006 | 09:00 | nam |
| `viet-2007-01-01` | 1/1/2007 | 2007-02-17 | 30/12/2006 (khác cả năm can) | 12:00 | nữ |
| `viet-2018-10-20` | 20/10/2018 | 2018-11-26 | 19/10/2018 | 15:00 | nam |
| `viet-2030-01-15` | 15/1/2030 | 2030-02-16 | 14/1/2030 | 21:00 | nữ |

Nguồn từng ca: lịch Việt (Hồ Ngọc Đức) quy đổi âm Việt → dương, rồi `astro.bySolar(<ngày dương>, timeIndex, giới tính)`; ghi đầy đủ trong `nguon` của fixtures.

## 4. Trước khi sửa — lệch bao nhiêu

Chạy lại đúng cách cũ (dùng thẳng ngày âm nhập vào, không cộng ngày Tý muộn, không fixLeap, không quy đổi lịch Việt):

```
BASELINE: 2/11 ca PASS
```

9 ca lệch:

| Nhóm | Ca lệch | Trường lệch |
|---|---|---|
| Giờ Tý | `ty-2300-1990-05-15` | 14/14 chính tinh sai vị trí (Tử Vi Thìn thay vì Dậu…) |
| Giờ Tý | `ty-2330-2016-08-20` | 14/14 chính tinh sai vị trí |
| Giờ Tý | `ty-2359-2031-12-03` | 14/14 chính tinh sai vị trí |
| Giờ Tý | cả 3 ca | Trụ ngày cũng sai nếu tính bằng `lunar-javascript` cho 23:xx (Canh Thìn/Ất Tuất/Đinh Sửu thay vì Tân Tỵ/Ất Hợi/Mậu Dần) |
| Tháng nhuận | `nhuan-2023-02-22` | Mệnh, Thân |
| Tháng nhuận | `nhuan-2025-06-25` | Mệnh, Thân, Cục + 14/14 chính tinh (17 trường) |
| Lịch Việt | `viet-2006-06-10` | 14/14 chính tinh sai vị trí |
| Lịch Việt | `viet-2007-01-01` | Mệnh, Thân, Cục + 14/14 chính tinh + cả 4 Tứ Hóa (21 trường) |
| Lịch Việt | `viet-2018-10-20` | 14/14 chính tinh sai vị trí |
| Lịch Việt | `viet-2030-01-15` | 14/14 chính tinh sai vị trí |

Hai ca PASS baseline là 2 ca tháng nhuận **nửa đầu** (`nhuan-2023-02-06`, `nhuan-2025-06-12`) — đúng như dự đoán vì nửa đầu không bị dịch tháng.

## 5. Sau khi sửa — kết quả

| Hạng mục | Kết quả |
|---|---|
| Bộ ca mới `tu-vi-bo-sung-check.js` | **11/11 ca PASS** |
| Bộ 32 ca cũ `tu-vi-32-cases-check.js` | **32/32 ca PASS** (không đổi) |
| `npm test` trong `backendjs` | **267/267 test PASS**, 0 fail |
| Build frontend (`npm run build` trong `frontend`) | **PASS** (293 modules, vite 7.3.0) |

Lệnh đã chạy:

```
cd backendjs
node tests/tu-vi-32-cases-check.js
node tests/tu-vi-bo-sung-check.js
npm test

cd frontend
npm run build
```

## 6. File đã sửa / thêm

| File | Loại | Nội dung |
|---|---|---|
| `backendjs/src/bazi/lunar_viet.js` | **mới** | Quy đổi Âm Việt ↔ Dương (Hồ Ngọc Đức, UTC+7), gồm `solarToLunar`, `lunarToSolar`, `lunarMonthDays`; giới hạn 1800–2199 |
| `backendjs/src/bazi/tu_vi.js` | sửa | Thêm `timeIndexFromHour`, `gioChiFromTimeIndex`, `lapLaSoTuDuongLich`, `lapLaSoTuAmTrungHoa`, `lapLaSoTuAmViet`; giữ nguyên `lapLaSo` và toàn bộ bảng an sao cũ |
| `backendjs/src/routes/tu_vi.js` | sửa | `/api/tu-vi` nhận thêm `duong_lich`, `nam_am + lich=viet`, `nam_am + thang_nhuan`, `gio`/`phut`; đường cũ `ngay_am/thang_am/gio_chi/can_nam` giữ nguyên |
| `backendjs/tests/fixtures/cases-tu-vi-bo-sung.json` | **mới** | 11 ca + meta quy ước + nguồn từng ca |
| `backendjs/tests/tu-vi-bo-sung-check.js` | **mới** | Script đối chiếu, in từng trường lệch |
| `backendjs/tests/tu-vi-bo-sung.test.js` | **mới** | Test 11 ca + test quy ước Tý/nhuận/lịch Việt |
| `backendjs/tests/tu-vi-bo-sung-api.test.js` | **mới** | Test endpoint `/api/tu-vi` cho 3 đường nhập mới |
| `backendjs/tests/lunar-viet.test.js` | **mới** | Test module quy đổi với mốc Việt đã biết + khứ hồi cả năm 2006/2018/2030 |
| `BAO_CAO_BO_SUNG_CA_TU_VI_20261120.md` | **mới** | Báo cáo này |

Không sửa: `backendjs/tests/fixtures/cases-tu-vi-32.json`, `tu-vi-goc/*`, bảng `BANG_TU_VI`, `TU_HOA`.

## 7. Những gì còn chưa chắc

1. **iztro là npm, không phải pip.** TASK ghi pip/venv; thực tế đã cài `iztro@2.6.3` bằng npm trong thư mục tạm ngoài repo. Không thêm dependency vào repo.
2. **Tý muộn ngày cuối tháng âm là quirk của iztro.** iztro cộng ngày rồi trừ số ngày của tháng hiện tại nhưng **giữ nguyên tháng** (ngày 30 → mùng 1 cùng tháng). Repo đã khớp iztro; về mặt lý thuyết lịch có thể có cách xử lý khác (sang tháng mới), nhưng TASK yêu cầu bám iztro.
3. **iztro hiển thị `lunarDate` của Tý muộn là ngày cũ**, nhưng lá số dùng ngày mới. Repo bám theo lá số (đã đối chiếu 14 chính tinh + trụ ngày/giờ), không bám chuỗi hiển thị.
4. **Chỉ so trụ ngày/giờ cho ca Tý**, không so trụ năm/tháng (phạm vi TASK).
5. **Lịch Việt 1800–2199.** Ngoài khoảng này module trả lỗi/không hỗ trợ.
6. **Chưa có ca âm Việt rơi đúng tháng nhuận Việt** (4 ca lịch Việt đều là tháng thường). Module có xử lý nhuận và đã test riêng tháng 2 nhuận 2023, nhưng bộ ca Tử vi chưa phủ tổ hợp “âm Việt + nhuận + Tý muộn”.
7. **Frontend chưa có trang Tử vi.** Đường nhập mới đã nối vào API backend; `frontend/lib/bazi` không có code Tử vi nên không phải đồng bộ. Khi nào frontend làm trang Tử vi, cần gọi đúng query params mới.
8. **Kỳ vọng dựa trên iztro 2.6.3**, chưa đối chiếu chéo với một nguồn Tử vi độc lập thứ hai cho các ca mới.

## 8. Commit

Đã commit local. **Không push, không deploy.**
