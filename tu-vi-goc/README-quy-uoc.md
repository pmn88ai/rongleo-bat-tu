# REGRESSION TEST — AN SAO TỬ VI (đóng băng 24/10/2026)

## Đây là gì
Bộ 32 lá số kiểm thử đã đóng băng để bảo vệ kết quả kiểm định vòng 1: từ nay, bất kỳ lần sửa nào vào `cong-cu/an_sao_tu_vi.py` (đổi bảng, đổi công thức, đổi Tứ Hóa) đều phải chạy lại bộ này. PASS mới được coi là không làm hỏng nền cũ.

## Cách chạy lại (ai cũng chạy được)
```
cd kiem-dinh/regression
python3 run_regression.py
```
Kết quả mong đợi: `REGRESSION: 32/32 ca PASS — TOÀN BỘ ĐẠT`, mã thoát 0.

## Dữ liệu và nguồn đối chiếu
- `cases.json`: đầu vào (năm/tháng/ngày ÂM lịch, giờ, giới tính) + kết quả kỳ vọng (Mệnh, Thân, Cục, 14 chính tinh, Tứ Hóa).
- Kỳ vọng được sinh từ **iztro phiên bản 2.6.3** (thư viện Tử Vi Đẩu Số mã nguồn mở độc lập, hệ truyền thống Trung Hoa) ngày 24/10/2026.
- Bảng vị trí sao Tử Vi của script: bảng công bố tại thayphucloc.com + thayhungtuvi.com (trùng nhau từng ô), nạp lại ngày 24/10/2026 sau khi phát hiện và sửa 48/150 ô chép sai của lần nạp đầu.
- Bộ ca phủ: Mệnh đủ 12/12 cung · đủ 5 Cục · Can năm đủ 10/10 (nhờ 5 ca bổ sung năm 2026–2029 + 2021).

## Quy ước đầu vào của bộ ca (đọc trước khi kết luận "đúng tuyệt đối")
- Ngày/tháng là **âm lịch theo lịch Trung Hoa** (thuật toán của iztro). Lịch Việt Nam có thể lệch 1 ngày ở một số tháng — bộ ca KHÔNG kiểm chứng được độ lệch này; khi tra cho khách Việt phải quy đổi bằng lịch Việt Nam trước rồi mới đưa ngày âm vào script.
- Giờ sinh: 12 khoảng giờ Chi chuẩn; **chưa có ca giờ Tý sát ranh giới 23:00** (vấn đề "Tý sớm/Tý muộn" và quy ước đổi ngày chưa kiểm thử).
- **Chưa có ca tháng nhuận** — lá số sinh tháng nhuận chưa được kiểm chứng ở cả hai hệ.
- Trường phái an sao: hệ phổ biến (Toàn Tập). Các hệ an sao khác (nếu có) nằm ngoài phạm vi bộ này.

## Kỷ luật thay đổi
- Không sửa `cases.json` để cho PASS. Muốn đổi kỳ vọng: phải có nguồn độc lập mới + ghi vào NHAT_KY_CAP_NHAT.html (ngày, lý do, nguồn).
- Mỗi lần sửa script: chạy regression, ghi kết quả vào nhật ký.
