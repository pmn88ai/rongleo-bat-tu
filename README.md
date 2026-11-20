# Mệnh Lý AI — RongLeo

> Nền tảng mệnh lý học Đông phương của **Phạm Minh Nhật (RongLeo)**: Bát Tự, Tử Vi, gieo quẻ Kinh Dịch và không gian chùa.

*[English version](README.en.md)*

---

## Giới thiệu

Mệnh Lý AI là ứng dụng web giúp lập và luận giải lá số theo mệnh lý học phương Đông. Giao diện viết bằng React 19 + Vite, máy chủ Express.js, engine tính toán thuần JavaScript, phần tư vấn dùng mô hình AI qua Groq. Bản production chạy trên Vercel tại **rongleo-menhly.vercel.app**.

---

## Tính năng chính

- **Bát Tự**: lập lá số Tứ Trụ (Năm — Tháng — Ngày — Giờ) với Thiên Can, Địa Chi, Tàng Can, Thập Thần, Nạp Âm, Không Vong; biểu đồ Ngũ Hành.
- **Đại Vận & Lưu Niên**: tính chu kỳ đại vận, vận hạn theo năm, tháng và tiểu vận.
- **Luận giải**: ma trận quan hệ Can Chi (hợp, xung, hình, hại, phá), phân tích Thập Thần, Ngũ Hành, Thần Sát, Cách Cục và các phần điển tích cổ văn (Tử Bình Chân Thuyên, Trích Thiên Tùy, Bệnh Dược, Đồng Tình Luận, Kim Bất Hoán).
- **Tử Vi**: lập và xem lá số Tử Vi theo ngày giờ sinh.
- **Gieo quẻ**: gieo quẻ Kinh Dịch theo giờ và mệnh, tra 64 quẻ cùng luận giải hào biến, quẻ hỗ, quẻ biến.
- **Chùa**: không gian Chánh Điện và Vườn Tịnh Tâm với cảnh nền và nhạc thiền.
- **Vận Hôm Nay**: xem vận hạn trong ngày và tạo ảnh chia sẻ.
- **Tư vấn AI**: hỏi đáp về lá số, câu hỏi gợi ý theo chủ đề, lưu lịch sử tư vấn.
- **Hợp duyên**: so sánh hai lá số và chấm điểm tương hợp.
- **Xem ngày / Chọn ngày**: đánh giá ngày tốt xấu theo lá số cá nhân, chọn ngày hoàng đạo.
- **Tử Vi phương Tây**: cung Mặt Trời, Mặt Trăng và đặc điểm tính cách.
- **Bài viết**: bài viết kiến thức mệnh lý, hỗ trợ Markdown và slug SEO.
- **Tài khoản & quản trị**: đăng ký/đăng nhập JWT, hồ sơ cá nhân, lịch sử tư vấn, trang quản trị (bài viết, câu hỏi gợi ý, người dùng, nhật ký truy cập).
- **Xuất dữ liệu**: xuất lá số dạng ảnh PNG hoặc PDF.

---

## Công nghệ

| Lớp | Công nghệ |
|---|---|
| Frontend | React 19, Vite 7, React Router 7, react-markdown, html2canvas, jsPDF |
| Backend | Express 4, SQLite (sql.js/sqlite3), lunar-javascript, JWT, helmet, express-rate-limit, lru-cache |
| AI | Groq API (mô hình ngôn ngữ), lớp OpenRouter dự phòng |
| Chạy & deploy | npm workspaces, concurrently, nodemon, Vercel |

---

## Cấu trúc thư mục

```
rongleo-bat-tu/
├── package.json          # Monorepo (npm workspaces)
├── frontend/             # React 19 + Vite, cổng dev 3005
│   ├── src/
│   │   ├── features/     # BaziChart, LuckCycles, Interpretation, Consultant,
│   │   │                 # Matching, DateSelection, Que, tu_vi, van_hom_nay, chua, Admin...
│   │   ├── components/   # Shell mobile/desktop, AuthModal, export button...
│   │   ├── services/     # apiClient, imageExport, pdfExport
│   │   ├── context/      # AuthContext
│   │   ├── hooks/        # useBaziApi, useWindowSize
│   │   └── config/       # cấu hình route, phòng chùa
│   ├── api/              # API serverless cho Vercel (core, consultant, misc, que...)
│   ├── lib/              # Engine Bát Tự dùng chung cho bản chạy trên Vercel
│   ├── public/           # ảnh, âm thanh, tài nguyên tĩnh
│   └── vercel.json       # Rewrite /api và cấu hình deploy
├── backendjs/            # Express API, cổng 8888
│   ├── server.js
│   ├── src/
│   │   ├── bazi/         # Engine tính toán Bát Tự
│   │   ├── routes/       # bazi, consultant, auth, admin, articles, que, tu_vi, van_hom_nay
│   │   ├── services/     # bazi, database, cache, que, groq, openrouter
│   │   ├── middleware/
│   │   ├── western/      # Tử Vi phương Tây
│   │   └── utils/
│   └── tests/            # Test engine và API bằng node --test
└── docs/                 # Tài liệu kiến trúc, luận giải, bảo mật
```

---

## Chạy local

Yêu cầu: Node.js >= 18 và npm >= 8.

```bash
npm install
```

Tạo file môi trường:

```bash
cp backendjs/.env.example backendjs/.env
cp frontend/.env.example frontend/.env
```

Trong `backendjs/.env`, đặt `PORT=8888`. Muốn dùng phần tư vấn AI thì điền `GROQ_API_KEY`; các tính năng lá số, đại vận, luận giải, gieo quẻ, chọn ngày vẫn chạy khi không có khóa AI.

Chạy cả hai phía:

```bash
npm run dev
```

- Frontend: http://localhost:3005
- Backend: http://localhost:8888
- Vite proxy `/api` sang backend cổng 8888.

Chạy riêng lẻ:

```bash
npm run dev:frontend
npm run dev:backend
```

Build frontend:

```bash
npm run build
```

---

## Test

Backend dùng Node.js built-in test runner (`node --test`):

```bash
# Từ thư mục gốc
npm test -w backendjs

# Hoặc trong backendjs
cd backendjs
npm test

# Chạy một nhóm test
npm run test:core -w backendjs
npm run test:api -w backendjs
npm run test:western -w backendjs
```

---

## Deploy

Bản production chạy trên Vercel:

- Website: https://rongleo-menhly.vercel.app
- Thư mục deploy: `frontend/`
- `frontend/vercel.json` cấu hình build Vite và rewrite các tuyến `/api` sang hàm serverless trong `frontend/api/`.
- Biến môi trường frontend: `VITE_SITE_URL`, `VITE_GA_ID`, `VITE_GOOGLE_SITE_VERIFICATION`, `VITE_CLARITY_ID`.

---

## Tài liệu

| Tài liệu | Nội dung |
|---|---|
| [ENGINE_ARCHITECTURE.md](docs/ENGINE_ARCHITECTURE.md) | Kiến trúc engine Bát Tự |
| [PROJECT_MAP.md](docs/PROJECT_MAP.md) | Bản đồ hệ thống và kiểm tra bảo mật, SEO |
| [INTERPRETATION_SYSTEM.md](docs/INTERPRETATION_SYSTEM.md) | Hệ thống luận giải |
| [WESTERN_ASTROLOGY.md](docs/WESTERN_ASTROLOGY.md) | Tử Vi phương Tây |
| [SECURITY_REPORT.md](docs/SECURITY_REPORT.md) | Báo cáo bảo mật |

---

## Giấy phép

Bản quyền © 2026 Phạm Minh Nhật (RongLeo). Toàn quyền bảo lưu. Xem [LICENSE](LICENSE) để biết điều kiện sử dụng.

---

<p align="center">
  <b>Mệnh Lý AI</b> — Phạm Minh Nhật (RongLeo)<br/>
  <i>rongleo-menhly.vercel.app</i>
</p>
