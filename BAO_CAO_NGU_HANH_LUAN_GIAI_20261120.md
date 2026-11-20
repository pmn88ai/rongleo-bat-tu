# BÁO CÁO — Chèn bảng ngũ hành đã tính vào prompt luận giải (LOCAL)

Ngày: 2026-11-20. Phạm vi: LOCAL, không push, không deploy. Không kill server 3005/8888.

## 1. Nguồn thật duy nhất cho ngũ hành
- Tạo `backendjs/src/bazi/ngu_hanh_table.js`, copy đồng bộ sang `frontend/lib/bazi/ngu_hanh_table.js`.
- Bảng Can→hành và Chi→hành **không hardcode trong prompt**: module đọc trực tiếp từ engine `ganzhi.ELEMENTS` / `ganzhi.ZHI_ELEMENTS` (đã có sẵn trong `bazi/ganzhi.js`, backend/frontend giống hệt nhau).
- Module xuất: `GAN_HANH`, `ZHI_HANH`, `getCanHanh`, `getChiHanh`, `buildNguHanhTuTruBlock(pillars)`.

## 2. Điểm chèn prompt (cả 2 phía)
- Backend: `backendjs/src/routes/consultant.routes.js` (prompt tổng hợp) + `backendjs/src/services/groq.service.js` (prompt `/api/consultant/ask`).
- Frontend: `frontend/api/consultant.js` + `frontend/lib/services/groq.service.js`.
- Khối chèn vào prompt (ví dụ hồ sơ 7/4/1988 11:30 nam):

```
## DỮ KIỆN ĐÃ TÍNH — NGŨ HÀNH 4 TRỤ (KHÔNG ĐƯỢC TỰ SUY)
- Năm Mậu Thìn: Mậu (Thổ), Thìn (Thổ)
- Tháng Bính Thìn: Bính (Hỏa), Thìn (Thổ)
- Ngày Nhâm Thìn: Nhâm (Thủy), Thìn (Thổ)
- Giờ Bính Ngọ: Bính (Hỏa), Ngọ (Hỏa)
Bảng Can: Giáp Mộc, Ất Mộc, Bính Hỏa, Đinh Hỏa, Mậu Thổ, Kỷ Thổ, Canh Kim, Tân Kim, Nhâm Thủy, Quý Thủy.
Bảng Chi: Tý Thủy, Sửu Thổ, Dần Mộc, Mão Mộc, Thìn Thổ, Tỵ Hỏa, Ngọ Hỏa, Mùi Thổ, Thân Kim, Dậu Kim, Tuất Thổ, Hợi Thủy.
CHỈ dùng đúng các giá trị ngũ hành của từng Can và từng Chi ở trên. KHÔNG tự suy ngũ hành của Can/Chi, KHÔNG gán lại hành khác.
```

Giữ nguyên tóm tắt Tử vi, fallback thiếu giờ sinh và các hành vi khác.

## 3. Kiểm chứng cứng (không gọi Groq)
Thêm `backendjs/tests/ngu-hanh-prompt.test.js`:
- Bảng đủ 10 Can + 12 Chi đúng chuẩn.
- Prompt hồ sơ 7/4/1988 11:30 nam chứa `Mậu (Thổ)`, `Thìn (Thổ)`, `Bính (Hỏa)`, `Nhâm (Thủy)`; KHÔNG chứa `Mậu là kim loại`, `Thìn là gỗ`, `Thìn (Mộc)`, `Mậu (Kim)`.
- Hồ sơ năm Canh Thân (1/6/1980 10:00) chứa `Canh (Kim)`, `Thân (Kim)`, `Tân (Kim)`, `Tỵ (Hỏa)`.

Kết quả `npm test` backend: **276/276 pass, 0 fail**. `npm run build` frontend: **pass** (Vite build xong, chỉ còn cảnh báo chunk >500 kB có sẵn).

## 4. Kiểm chứng mềm (gọi Groq thật)
- Dựng server backend tạm cổng **8899** (không đụng 3005/8888), gọi `POST /api/consultant/ask` với hồ sơ 7/4/1988 11:30 nam, `useAI: true`, câu hỏi yêu cầu nói rõ ngũ hành Can/Chi.
- **Không kiểm được nội dung AI**: Groq trả `403` ở cả 3 lần retry:
  `{"error":{"message":"Access denied. Please check your network settings."}}`
  Gọi thẳng `https://api.groq.com/openai/v1/models` bằng key trong `.env.local` cũng trả `403` y hệt. Đây là chặn mạng/geo (VPN hoặc định tuyến), không phải lỗi prompt.
- Hệ thống trả fallback của Groq service:
  `"Con ơi, Thầy đang gặp chút trở ngại trong việc kết nối nguồn năng lượng để luận giải câu hỏi..."`.
- Ghi nhận trung thực: **chưa có bằng chứng AI trả lời đúng/sai sau khi chèn bảng** vì Groq không trả về nội dung. Khi mạng thông, cần chạy lại đúng lệnh trên để đọc bài thật.

## 5. An toàn vận hành
- Server 3005 và 8888 không bị kill.
- Server tạm 8899 đã tự tắt sau kiểm chứng.
- Chỉ sửa file trong repo này.
