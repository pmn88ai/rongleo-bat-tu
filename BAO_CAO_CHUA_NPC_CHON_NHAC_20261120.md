# BAO CAO — CHUA NPC: BO CHON NHAC (20/11/2026)

## 1. Danh sach nhac nam o dau
- Mot noi duy nhat: mang `TRACKS` trong `frontend/src/context/MusicPlayerContext.jsx`.
- Moi bai gom `{ id: '<YouTube video id>', title: '<ten hien thi>' }`.
- Hien co 1 bai: `jKoznZSMX6s` — "Nhac piano + tieng nuoc chay 2 tieng".

### Cach them bai moi
Them 1 dong vao mang `TRACKS`, vi du:
```js
{ id: 'VIDEO_ID_MOI', title: 'Ten bai moi' }
```
Khong can sua file nao khac: thanh nhac, the video o vuon va trinh phat deu doc tu `TRACKS`.

## 2. Da lam gi
- `MusicPlayerContext.jsx`:
  - Them `TRACKS`, `currentTrackId`, `selectTrack`, `trackError`, `embedSrc`.
  - `selectTrack` goi `loadVideoById`, phat bai moi ngay, giu trang thai thu nho/mo rong; trinh phat van la mot instance duy nhat o cap app nen chuyen Chanh dien <-> Vuon khong dung.
  - Loi khi doi bai: hien thong bao `Khong phat duoc "<bai>". Van giu bai dang phat.` va tai lai bai truoc do, khong lam vo trang.
  - Giu vong lap (`setLoop`) sau khi doi bai.
- `MusicPlayer.jsx`: thanh nhac mo rong co dropdown chon bai (hien ten bai dang phat), them dong thong bao loi. Nut tron thu nho giu nguyen hanh vi.
- `MusicPlayer.css`: style dropdown + thong bao loi; mobile an am luong nhu cu, dropdown co `min-width: 0` de khong tran ngang.
- `VuonTinhTamPage.jsx`: the video o vuon lay `embedSrc`/`currentTrack` tu context, luon dung bai dang chon.

## 3. Kiem chung
- `npm run build` trong `frontend/`: PASS (vite build, 537 modules).
- Lint: BI BO QUA vi bi chan quyen/cau hinh co san — `frontend/package.json` dat `"type": "commonjs"` trong khi `eslint.config.js` dung ESM, nen `npx eslint` bao `Cannot use import statement outside a module`. Du an cung khong co script `lint`. Khong sua cau hinh ngoai pham vi dot nay.
- Khong chay trinh duyet headless (khong can/thieu quyen). Da kiem tra bang code:
  - Mo thanh nhac thay dropdown bai.
  - Doi bai -> `loadVideoById` + `playVideo`.
  - Chuyen Chanh dien <-> Vuon dung chung provider, khong tao player moi.
  - Thu nho/mo rong giu nguyen.
  - Mobile 375px: thanh nhac `width: 100%`, dropdown `flex: 1 1 auto; min-width: 0`, am luong an -> khong tran ngang.

## 4. Ghi chu
- Khong push, khong deploy. Chi commit local.
