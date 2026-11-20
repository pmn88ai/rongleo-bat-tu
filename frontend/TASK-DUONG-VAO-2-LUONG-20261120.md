# TASK OPENCODE — LÀM LẠI ĐƯỜNG VÀO TRANG TỬ VI THEO 2 LUỒNG (20/11/2026)

Leo chốt: đường vào hiện tại chưa tối ưu — khách vãng lai phải nhập lại thông tin ở từng mục; Duyên số và Tử vi Tây dùng dữ liệu nhập riêng, không dùng chung kết quả đã phân tích; chỉ người đăng nhập mới được lưu hồ sơ; thanh điều hướng trộn chung 11 mục (đi dạo chùa lẫn tra cứu).

## 1. Repo và nguyên tắc
- Repo: `D:\WORK\projects\rongleo-bat-tu`, thư mục `frontend` (Vite React 19, port dev 3005). Chỉ sửa frontend (App.jsx, các trang tra cứu, nav, hồ sơ). KHÔNG sửa `backendjs`, KHÔNG sửa thuật toán, KHÔNG sửa video/nhạc chùa, KHÔNG sửa cơ chế đăng nhập/AuthContext (chỉ ĐỌC để nối `savedProfile`). Commit local khi xong (message ASCII không dấu). KHÔNG push, KHÔNG deploy.
- LUẬT BẮT BUỘC: nếu bất kỳ bước nào bị chặn quyền (external_directory, trình duyệt headless, hay bất kỳ permission nào) thì BỎ QUA bước đó, ghi rõ vào báo cáo là đã bỏ qua vì bị chặn quyền, rồi LÀM TIẾP các bước còn lại. KHÔNG được dừng cả đợt chạy chỉ vì 1 bước bị chặn. KHÔNG truy cập file ngoài repo.
- Giữ nguyên mọi tính năng hiện có: form nhập bát tự, các tool tra cứu, video chùa (cổng/chánh điện/vườn), nhạc, fullscreen, đăng nhập. Chỉ đổi CÁCH VÀO và CÁCH CHIA SẺ HỒ SƠ.

## 2. Việc cần làm
Đọc trước App.jsx, các trang tra cứu, AuthContext và cách `savedProfile` đang lưu (backend `/api/auth/me`) rồi làm:

(a) **Một "Hồ sơ mệnh" duy nhất, nhập một lần:**
- Tạo một kho hồ sơ chung (vd hook/context `useMenhProfile`): lưu vào localStorage cho khách vãng lai; người đã đăng nhập thì đồng bộ với `savedProfile` đã có (đọc/ghi qua AuthContext, đừng làm lại cơ chế đăng nhập).
- Hồ sơ = đúng thông tin form nhập bát tự hiện tại (tên, ngày/giờ sinh, giới tính, ...). Không thêm trường mới, không đổi form nhập.
- Trang chủ `/` đổi thành **2 cửa**: Cửa 1 "Đi dạo chùa" (đi thẳng vào /chua, không cần nhập gì) và Cửa 2 "Tra cứu & Xin quẻ" (đi vào trang "Hồ sơ mệnh" — chính là form nhập bát tự hiện tại, chuyển thành route riêng vd `/ho-so-menh`). Nhập xong thì vào danh sách các mục tra cứu.

(b) **Mọi mục tra cứu đọc chung hồ sơ mệnh:**
- Các route: /laso, /phantich, /vanhan, /dientich, /xemngay, /chonngay, /tuvan, /duyenso, /xinque, /tuvi, /tuviphuongtay, /van-hom-nay — tất cả đều đọc hồ sơ mệnh chung. Nếu đã có hồ sơ thì KHÔNG bắt nhập lại (đặc biệt /duyenso và /tuviphuongtay hiện dùng `inputParams` riêng — phải đổi sang đọc hồ sơ chung, giữ lại form sửa riêng trong tool nếu tool đã có).
- Nếu chưa có hồ sơ (vd vào thẳng link /laso) thì đưa về trang "Hồ sơ mệnh" với dòng ghi rõ "nhập một lần, dùng cho mọi mục tra cứu", nhập xong quay lại đúng mục đó.

(c) **Tách điều hướng thành 2 nhóm:**
- Nav trên cùng chia rõ 2 nhóm: "Đi dạo chùa" (/chua, /chanh-dien, /vuon-tinh-tam) và "Tra cứu" (các mục ở (b)). Không còn một hàng 11 mục trộn lẫn.

(d) **Mỗi phòng một diện mạo riêng:**
- Mỗi mục tra cứu dùng một ảnh nền + màu nhấn riêng, lấy từ bộ ảnh đã có trong `frontend/public/images/chua/` (11 ảnh) — KHÔNG thêm ảnh mới, KHÔNG dùng ảnh ngoài. Các phòng phải nhìn khác nhau ngay từ cái nhìn đầu tiên (không còn một màu chung cho mọi tool).

## 3. Kiểm chứng trước khi báo xong
- `npm run build` trong frontend phải PASS.
- Chạy dev server, kiểm bằng curl: trang chủ `/` có 2 cửa ("Đi dạo chùa", "Tra cứu"); route hồ sơ mệnh trả về form nhập; /chua mở được không cần hồ sơ.
- Kiểm bằng code: /duyenso và /tuviphuongtay không còn đọc `inputParams` riêng mà đọc hồ sơ chung; mọi tool ở (b) đều có đường đọc hồ sơ chung.

## 4. Báo cáo
Viết file `BAO_CAO_DUONG_VAO_2_LUONG_20261120.md` trong repo, ghi: đã đổi gì (route nào, file nào), cách hồ sơ mệnh lưu/chia sẻ, mỗi phòng dùng ảnh/màu nào, kết quả build, và những gì chỉ kiểm bằng code (chờ Leo kiểm tay trên trình duyệt).
