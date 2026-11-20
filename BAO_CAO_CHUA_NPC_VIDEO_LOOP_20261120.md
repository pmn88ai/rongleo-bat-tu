# BAO CAO — DOI 3 VIDEO NEN CHUA SANG BAN VONG LAP MUOT (20/11/2026)

## 1. Da doi 3 duong dan

| File | Cu | Moi |
|---|---|---|
| `frontend/src/features/chua/ChuaPage.jsx:118` | `/video/cong-chua-v2.mp4` | `/video/cong-chua-loop.mp4` |
| `frontend/src/features/chua/ChanhDienPage.jsx:14` | `/video/chanh-dien-v2.mp4` | `/video/chanh-dien-loop.mp4` |
| `frontend/src/features/chua/VuonTinhTamPage.jsx:30` | `/video/vuon-tinh-tam-pp.mp4` | `/video/vuon-tinh-tam-loop.mp4` |

Khong sua gi khac: poster `/images/chua/nen-cong-chua.jpg` giu nguyen, khong dung toi quay, engine, Groq, nhac, nut toan man hinh.

## 2. Kiem tra file video moi

Da co san trong `frontend/public/video/`, dung ten va dung kich thuoc theo task:

- `cong-chua-loop.mp4` — 3.220.674 byte (khop)
- `chanh-dien-loop.mp4` — 1.608.696 byte (khop)
- `vuon-tinh-tam-loop.mp4` — 4.251.054 byte (khop)

Khong doi ten / xoa / ghi de bat ky file video nao. Cac file cu (`cong-chua-v2.mp4`, `chanh-dien-v2.mp4`, `vuon-tinh-tam-pp.mp4`, ...) van con nguyen.

## 3. Ket qua kiem chung

- Grep trong `frontend/src`: khong con tham chieu `cong-chua-v2`, `chanh-dien-v2`, `vuon-tinh-tam-pp`; ca 3 trang dung dung file `-loop.mp4`.
- Lint: KHONG CO script lint trong repo (`frontend/package.json` va root `package.json` chi co dev/build/preview/start), nen khong chay duoc buoc lint. Khong phai bi chan quyen.
- Build: `npm run build` trong `frontend/` — PASS (`vite v7.3.0`, 537 modules transformed, built in 5.53s). Chi co warning co san ve kich thuoc chunk va dynamic import html2canvas, khong lien quan thay doi nay.
- Khong co buoc nao bi chan quyen trong dot chay nay.

## 4. Git

Commit local (message ASCII khong dau), KHONG push, KHONG deploy.
