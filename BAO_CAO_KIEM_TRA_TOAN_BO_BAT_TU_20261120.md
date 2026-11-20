# BÁO CÁO KIỂM TRA TOÀN BỘ BÁT TỰ — 20/11/2026

Ngày: 20/11/2026. Repo: `rongleo-bat-tu`, nhánh main. Người làm: opencode (HP) + Muse_anh kiểm lại, viết báo cáo, commit.

## 0. Quá trình

- Lần 1 (15:03): job kẹt — log 0 byte suốt 16 phút. Đã tắt (PID 38180) và chạy lại.
- Lần 2 (15:22–15:34): chạy 12 phút, làm xong các sửa nhưng dừng ở bước cuối (dọn file tạm bị chặn quyền `external_directory`, auto-reject) nên chưa viết báo cáo, chưa commit.
- Muse_anh kiểm lại độc lập: chạy lại `npm test` + `npm run build`, soi toàn bộ diff, dọn file tạm, viết báo cáo này, commit.

## 1. Kết quả kiểm chứng (số liệu thật)

- **Backend test: 224/224 pass, 0 fail** (chạy lại 2 lần: lần job chạy và lần Muse_anh chạy lại, cùng kết quả). 221 test cũ + 3 test mới F9.
- **Frontend build: PASS, built in 5.06s** (Vite; chỉ cảnh báo chunk-size có sẵn từ trước).
- **7 ca nổi tiếng đúng trụ năm/tháng + nhật chủ:** Mao Zedong (Quý Tỵ / Giáp Tý / Đinh), Elon Musk (Tân Hợi / Giáp Ngọ / Giáp), Steve Jobs (Ất Mùi / Mậu Dần / Bính), Taylor Swift (Kỷ Tỵ / Bính Tý / Đinh), Bruce Lee (Canh Thìn / Đinh Hợi / Giáp), Albert Einstein (Kỷ Mão / Đinh Mão / Bính), Hồ Chí Minh (Canh Dần / Tân Tỵ / Canh).
- **Giờ Tý:** 23:00 → Canh Tý, 00:00 → Mậu Tý (cả hai đều là giờ Tý). Lỗi F1 (19/11) đã sửa, xác nhận lại bằng test.
- **Cách cục / luận tĩnh:** các lỗi F2/F3/F5 (19/11) đã sửa; test pass. Grep `backendjs/src/bazi/luan_giai` cho `rng.|random`: **0 kết quả**.
- **Đại vận theo múi giờ:** chạy cùng bộ kiểm với TZ Asia/Ho_Chi_Minh, America/New_York, UTC — dãy Đại vận 7 ca nổi tiếng giống hệt nhau cả 3 múi giờ (vd Mao: Quý Hợi 6t/1900, Nhâm Tuất 16t/1910, Tân Dậu 26t/1920...). Engine không phụ thuộc múi giờ máy chủ cho các ca này.

## 2. Đã sửa trong đợt này (20 file, +107/−61)

### 2.1 Bỏ luận random (backend)
Luận giải không còn bốc ngẫu nhiên. Các mẫu đã gỡ:
- `backendjs/src/bazi/phan_tich/data/luan_giai_lib.js` — bỏ `sort(() => 0.5 - Math.random()).slice(0, 10)` và `arr[Math.floor(Math.random() * arr.length)]`, thay bằng chọn xác định.
- `backendjs/src/bazi/phan_tich/luan_dong.js` — bỏ `list[Math.floor(Math.random() * list.length)]`.
- `backendjs/src/bazi/phan_tich/luan_giai_quan_he.js` — bỏ `if (Math.random() > 0.5)` khi thêm dự đoán sức khỏe, thay bằng trộn xác định theo miền.
- `backendjs/src/bazi/phan_tich/dong_tinh_luan.js`, `backendjs/src/bazi/thoi_gian_luan/data/mega_career.js`, `mega_health.js`, `mega_love.js`, `mega_wealth.js` — bỏ chọn ngẫu nhiên trong kho câu (pool), thay bằng chọn xác định.
- `backendjs/src/bazi/hop_hon/index.js` — bỏ `Math.floor(Math.random() * 15) - 7` (biến thiên ngẫu nhiên ±7).
- `backendjs/src/bazi/questions/engine.js` — bỏ import `createSeededRandom` không còn dùng.
- Riêng `backendjs/src/bazi/luan_giai/core.js`: grep không còn `rng`/`random` — file này đã sạch từ trạng thái đã commit (không cần sửa thêm).

### 2.2 F9 — âm lịch giữ giờ + năm khởi Đại Vận (mới phát hiện trong đợt kiểm tra)
- `backendjs/src/bazi/calculator.js` — vào bằng âm lịch: `Lunar.fromYmd` → `Lunar.fromYmdHms` (bản cũ làm mất giờ/phút, trụ giờ luôn rơi về Tý/00:00). Thêm nhãn tháng nhuận ("2 nhuận") cho `ngay_am_lich`.
- `backendjs/src/bazi/dayun.js` — năm khởi vận cộng cả phần tháng (3 ngày = 1 năm, 1 ngày = 4 tháng). Bản cũ dùng `birthYear + ageStart - 1` nên lệch 1–2 năm so với nhập vận. Giờ: Mao (26/12/1893) nhập vận Tháng 4/1900, Đại vận đầu Quý Hợi 1900, tiếp Nhâm Tuất 1910.
- `backendjs/tests/golden-fixes.test.js` — thêm nhóm test F9 (3 ca): âm lịch giữ trụ giờ Thìn, tháng nhuận âm 2/2023 đổi đúng (dương 22/3/2023, trụ tháng Ất Mão), năm khởi Đại Vận khớp nhập vận.
- `backendjs/tests/core.test.js` — chỉ cập nhật chú thích (23:00 → Canh Tý, 00:00 → Mậu Tý). Không sửa assertion nào, không làm yếu test.

### 2.3 Ba sửa nhỏ theo lệnh Leo 15:19
- **Nút header:** `frontend/src/components/DesktopShell.jsx` (dòng 45) và `frontend/src/components/MobileShell.jsx` (dòng 65, 79) — "← RongLeo Land" → "Trang chủ rongleo", link `https://rongleo.com`, mở tab mới.
- **Bỏ tên mặc định:** `frontend/src/features/Homepage/BirthInput.jsx` — trang Hồ sơ mệnh luôn mở với ô tên trống; ngày/tháng/năm sinh, giới, giờ sinh vẫn lấy từ hồ sơ đã lưu (chưa có hồ sơ: mặc định 15/6/1990, Nam, 10h00). `frontend/src/App.jsx` — lưu mà để trống tên thì giữ nguyên tên cũ trong hồ sơ (không ghi đè bằng rỗng).
- **Nav tra cứu tràn ngang:** `frontend/src/index.css` — `.nav-group-items` đổi sang `flex-wrap: wrap`, `overflow-x: visible` (bỏ cuộn ngang).
- **Linh Thạch (một phần):** `frontend/src/features/Que/components/QueCard.jsx` — bỏ nhãn "💎 10 linh thạch" và đổi title nút xin lại thành "Xin quẻ mới".

## 3. Đã kiểm và kết luận

- **Google Apps Script URL:** KHÔNG còn tồn tại. Grep `useBaziApi.js` và `services/apiClient.js`: không có URL ngoài nào, chỉ gọi API nội bộ qua `apiClient`. (Kế hoạch gộp 19/11 ghi URL này ở dòng 8 của `useBaziApi.js` — trạng thái code hiện tại không còn; không rõ bị gỡ từ đợt nào.)
- **Giấy phép:** repo KHÔNG có file LICENSE (`if exist LICENSE` → NO_LICENSE). README.md (dòng 8, 515) và README.en.md (dòng 8, 497) ghi MIT, trong đó dòng 515 dẫn tới file LICENSE không tồn tại. `backendjs/package.json` ghi `"license": "MIT"`. Engine là bản port JS của một backend Bát tự Python không rõ tên/tác giả. **Chỉ báo cáo như trên, không tự nhận giấy phép nào.**
- **Tử vi an-sao:** job chỉ đọc tài liệu kiểm định của Kho Huyền Học (bộ 32 ca đóng băng 24/10/2026, kỳ vọng 32/32 PASS). **Chưa chạy lại bộ 32 ca trong đợt này** — không có dòng kết quả 32/32 trong log. Bảng an-sao hiện tại chưa được đối chiếu lại với iztro trong đợt này.
- **Ngũ hành / Đại vận / trụ giờ theo giá trị:** test chỉ kiểm hình dạng (có `diem_so.ngu_hanh_vn` 5 hành, có `can_bang_ngu_hanh`, Đại vận trả đúng cấu trúc) + vài ca cố định (F9, 7 ca nổi tiếng). **Chưa đối chiếu điểm Ngũ hành, tuổi khởi vận, trụ Đại vận với nguồn độc lập cho toàn bộ ca** — đúng như README của tests đã thừa nhận ở mục "Future phases".
- **Linh Thạch (còn lại):** `frontend/src/components/AuthModal.jsx` vẫn ghi "Đăng ký nhận ngay 100 Linh Thạch miễn phí" (dòng 90, 198); `frontend/src/features/Admin/AdminPage.jsx` vẫn có mục thống kê/quản lý/điều chỉnh Linh Thạch và mục yêu cầu Linh Thạch. Backend `database.service.js` vẫn ghi `logCreditTransaction(..., 'Linh thạch khởi tạo')` và `openrouter.service.js` vẫn nhắc hoàn Linh Thạch khi lỗi. Chỉ mới gỡ nhãn phí trên thẻ quẻ.
- **Gieo quẻ random:** KHÔNG sửa trong đợt này theo đúng chỉ đạo (mục j của task) — Leo đã chốt hướng sửa riêng lúc 15:26, job riêng `TASK-GIEO-QUE-THEO-GIO-20261120.md` chạy sau.

## 4. Còn tồn tại — cần Leo quyết

1. **`frontend/lib/bazi/` là bản sao lệch của engine backend.** So sánh byte (`fc /b`): `dayun.js` giống nhau trước F9, giờ lệch 7 dòng (thiếu fix F9); `phan_tich/ngu_hanh.js` lệch 407 dòng (phiên bản khác hẳn). Các file này vẫn còn `Math.random` (vd `lib/bazi/phan_tich/luan_giai_lib.js:60,256,266`, `luan_dong.js:218`, `mega_*.js`). Chưa rõ frontend có dùng bản sao này trực tiếp ở trang nào không (hook chính gọi API backend). Cần quyết: **xóa bản sao hay đồng bộ nó với backend**.
2. **Linh Thạch còn ở AuthModal + AdminPage** (mục 3). Cần quyết: gỡ hết nhãn + tắt hẳn hệ điểm, hay giữ lại làm hệ điểm thật (cần thanh toán).
3. **Tử vi 32 ca chưa chạy lại** — cần chạy bộ regression của Kho Huyền Học để chốt bảng an-sao hiện tại.
4. **README ghi MIT nhưng thiếu file LICENSE** (link gãy). Cần quyết: thêm file LICENSE MIT hay gỡ claim MIT khỏi README/package.json.
5. **Ngũ hành / Đại vận chưa có fixture đối chiếu giá trị** — cần nguồn độc lập (vd bảng điểm của một lá số đã công bố) mới chốt được.

## 5. Commit

Commit local (chưa push, chưa deploy): 20 file trên + báo cáo này.
