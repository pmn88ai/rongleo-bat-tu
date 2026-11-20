# BAO CAO — DOI VIDEO NEN CONG CHUA SANG BAN KHOI TU LAM (20/11/2026)

## 1. Thay doi
- File: `frontend/src/features/chua/ChuaPage.jsx` (dong 118)
- Cu: `src="/video/cong-chua-loop.mp4"`
- Moi: `src="/video/cong-chua-smoke.mp4"`
- Poster giu nguyen: `/images/chua/nen-cong-chua.jpg`
- Khong sua gi khac (chanh dien, vuon, quay, engine, Groq, nhac, nut toan man hinh).

## 2. Kiem tra
- `grep cong-chua` trong `ChuaPage.jsx`: chi con `cong-chua-smoke.mp4` (dong 118) va poster `nen-cong-chua.jpg` (dong 119). Khong con tham chieu `cong-chua-loop`.
- File dich ton tai: `frontend/public/video/cong-chua-smoke.mp4` — 1.035.110 byte (dung so voi task). Khong doi ten/xoa/ghi de file video nao.
- Khong co script lint trong `frontend/package.json` (chi co dev/build/preview) nen bo qua lint.

## 3. Build
- `npm run build` trong `frontend/`: PASS (vite v7.3.0, 537 modules, built in 6.06s). Chi co canh bao chunk > 500 kB va dynamic import html2canvas — khong phai loi, co tu truoc.

## 4. Ghi chu
- Khong push, khong deploy. Chi commit local.
