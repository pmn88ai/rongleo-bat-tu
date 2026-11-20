# BÁO CÁO SỬA LỖI TƯ VẤN /tuvan (GROQ) — 20/11/2026

## 1. Các file đã sửa

| File | Nội dung sửa |
|---|---|
| `backendjs/server.js` | Dòng 1–2: nạp `dotenv` từ `.env.local` ở gốc repo bằng đường dẫn tuyệt đối `path.join(__dirname, '..', '.env.local')` thay vì `require('dotenv').config()` mặc định (chỉ đọc `backendjs/.env`). |
| `backendjs/src/services/groq.service.js` | Đổi `GROQ_MODEL` từ `llama3-70b-8192` sang `openai/gpt-oss-20b`; cập nhật comment header cho khớp. Giữ nguyên retry, fallback, system prompt. |
| `frontend/lib/services/groq.service.js` | Đổi `GROQ_MODEL` từ `llama-3.1-8b-instant` sang `openai/gpt-oss-20b`. Giữ nguyên toàn bộ logic còn lại. |

Không copy, không in, không ghi giá trị `GROQ_API_KEY` ra bất kỳ đâu. Chỉ kiểm tra sự tồn tại: key có trong `.env.local` gốc, độ dài 56 ký tự.

## 2. Kiểm chứng bằng câu hỏi thật

- Câu hỏi: `hôm nay con nên làm gì?`
- Lá số dùng để test: nam, sinh 15/05/1990, 10:30, dương lịch.
- Endpoint: `POST http://localhost:8888/api/consultant/ask` với `useAI: true`, persona `huyen_co`.
- Kết quả: HTTP 200 nhưng nội dung trả về **vẫn là câu fallback**:
  - "Con ơi, Thầy đang gặp chút trở ngại trong việc kết nối nguồn năng lượng để luận giải câu hỏi ... của con."
  - "Con hãy kiên nhẫn chờ ít phút rồi thử lại nhé. Duyên đến thì mọi sự sẽ sáng tỏ."
- **Trạng thái kiểm chứng: CHƯA ĐẠT** (chưa phải nội dung luận giải thật).

## 3. Lỗi thật từ phía Groq (đã đọc, không có key trong log)

Gọi trực tiếp Groq API từ máy này (chỉ in status + body lỗi, không in key):

```text
STATUS=403
BODY={"error":{"message":"Access denied. Please check your network settings."}}
CF-RAY: a5d3d7634b68f908-SIN
```

- Gọi `GET https://api.groq.com/openai/v1/models` **không kèm Authorization** cũng trả 403 với đúng thông báo trên.
- Nghĩa là Cloudflare của Groq đang chặn IP/network egress hiện tại trước cả bước xác thực key, **không phải lỗi key, không phải lỗi model, không phải lỗi code**.
- Đây là hành vi đã được ghi nhận trên Groq Community: Groq chặn IP dải VPN/datacenter và trả 403 "Access denied. Please check your network settings."
- Vì vậy không thể đạt bước kiểm chứng câu trả lời thật từ mạng hiện tại. Cần chạy lại kiểm chứng sau khi tắt VPN/proxy hoặc đổi sang mạng khác (ví dụ hotspot điện thoại), rồi gọi lại endpoint với cùng câu hỏi.

## 4. Kết quả test suite

- Lệnh đúng theo test runner của repo (`node:test`): `node --test` trong `backendjs/`
  - **221 tests / 221 pass / 0 fail**.
- `node --test tests/api-contract.test.js`: **43/43 pass**.
- `npm test` (Jest) báo 190 pass / 31 fail: Jest đang chạy sai các file viết bằng `node:test` (lỗi runner có sẵn, không liên quan thay đổi Groq). Cùng các test đó chạy bằng `node --test` đều pass.

## 5. Kết luận

- Đã sửa xong 2 nguyên nhân theo yêu cầu: nạp đúng `.env.local` gốc và đổi model còn hoạt động (`openai/gpt-oss-20b`) ở cả backend lẫn frontend lib.
- Chưa thể xác nhận ĐẠT bằng câu hỏi thật do Groq/Cloudflare chặn IP của mạng hiện tại (403). Không báo "đã xong" cho phần kiểm chứng này.
- Việc cần làm tiếp: tắt VPN/proxy hoặc đổi mạng, sau đó gọi lại `POST /api/consultant/ask` với câu hỏi thật để xác nhận.
