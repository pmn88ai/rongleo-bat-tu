# BÁO CÁO CHÙA NPC ĐỢT 2 — CHÁNH ĐIỆN + VƯỜN TỊNH TÂM + ĐĂNG NHẬP + NHẠC (20/11/2026)

**Phạm vi:** repo `rongleo-bat-tu`, nhánh hiện tại. Chỉ làm frontend + `backendjs/src/routes/auth.routes.js`. Không sửa engine tính toán, không đụng Groq. Không push, không deploy.

**Lịch sử chạy:** lượt 1 (09:25, PID 8460) dựng xong trang rồi kẹt ở bước kiểm tra đăng nhập (log đứng yên từ 09:35, không file nào được viết thêm) nên đã tắt. Lượt 2 làm nốt (10:39–10:47, PID 11840) kiểm chứng bằng vite preview (`/chanh-dien` HTTP 200) nhưng dừng ở bước chụp màn hình headless: Chrome trên máy nằm ở `C:\Program Files\Google\Chrome` nhưng lệnh chụp gọi nhầm đường `C:\Program Files (x86)\...` ("The system cannot find the path specified") rồi bị chặn quyền `external_directory` (auto-reject). Bước chụp màn hình đã bỏ qua theo luật — kiểm chứng thay bằng build + đọc code + xem thử trên điện thoại của Leo (xem §3). Báo cáo này do Muse viết sau khi kiểm chứng độc lập, rồi commit thay.

## 1. Đã làm

### (A) Chánh điện + Vườn tịnh tâm
- Route mới: `/chanh-dien` (`ChanhDienPage.jsx`) và `/vuon-tinh-tam` (`VuonTinhTamPage.jsx`), dùng chung `TempleBackground.jsx` + `TempleScene.css` (nền CSS/SVG + hiệu ứng khói/nước/lá bằng CSS; tự dùng video nền lặp tắt tiếng từ `public/video/chanh-dien.mp4` / `vuon-tinh-tam.mp4` nếu file tồn tại — hiện chưa có file video, Flow sẽ làm sau).
- Vườn có thẻ video nhạc của Leo (đang chờ đổi sang YouTube — xem đợt bổ sung).
- Cả 2 trang đã có trong bản đồ `/chua` + menu.

### (B) Đăng nhập (nối hệ thống có sẵn, không làm mới)
- `AuthModal.jsx` / `UserProfileModal.jsx` + JWT auth backend (`GET /api/auth/me` trong `backendjs/src/routes/auth.routes.js`) đã nối vào app: `AuthProvider` bọc toàn app, nút tài khoản `AccountButton` hiện ở cả `DesktopShell` và `MobileShell`.
- Sau khi đăng nhập, hồ sơ (tên, ngày sinh, giờ sinh, giới tính) được lưu và tự điền ở mọi quầy: `App.jsx` dùng `savedProfile` từ `useAuth()` — có hồ sơ đã lưu thì không bật về `/` ở 3 trang `/xemngay`, `/xinque`, `/tuvan` nữa (khách chưa đăng nhập vẫn xem đủ, chỉ phải gõ lại mỗi quầy). `/lich-su` hiện lịch sử của người đã đăng nhập.

### (C) Nhạc
- Trình phát dùng chung ở cấp app (`MusicPlayerContext.jsx` — một thẻ audio duy nhất, nhạc không dừng/phát lại khi chuyển giữa chánh điện và vườn), nhạc mặc định là file `frontend/public/audio/thien.mp3` (bản piano của Leo, đã copy vào repo từ trước, phát lặp).
- Mặc định thu nhỏ thành nút tròn ở góc (`expanded` khởi tạo `false`); bấm thì vừa phát nhạc vừa mở thành thanh mỏng dưới cùng (tên bài, tiến trình, âm lượng, nút thu nhỏ); chỉ hiện ở 2 trang chùa, rời khỏi 2 trang thì tạm dừng.

## 2. File đã thay đổi / tạo mới

| File | Nội dung |
|---|---|
| `frontend/src/features/chua/ChanhDienPage.jsx` | Trang chánh điện |
| `frontend/src/features/chua/VuonTinhTamPage.jsx` | Trang vườn tịnh tâm |
| `frontend/src/features/chua/TempleBackground.jsx` | Nền chùa dùng chung |
| `frontend/src/features/chua/TempleScene.css` | CSS cảnh chùa |
| `frontend/src/components/MusicPlayer.jsx/.css` | Trình phát nhạc (nút tròn + thanh mỏng) |
| `frontend/src/context/MusicPlayerContext.jsx` | Audio dùng chung toàn app |
| `frontend/src/components/AccountButton.jsx/.css` | Nút tài khoản |
| `frontend/src/App.jsx`, `DesktopShell.jsx`, `MobileShell.jsx`, `UserProfileModal.jsx`, `context/AuthContext.jsx`, `features/chua/ChuaPage.jsx`, `features/chua/ChuaPage.css`, `features/Homepage/BirthInput.jsx`, `index.css`, `utils/getUserId.js` | Nối auth + nhạc + route chùa |
| `backendjs/src/routes/auth.routes.js` | Thêm `GET /api/auth/me` |
| `frontend/public/audio/thien.mp3` | Nhạc piano của Leo (sẽ đổi sang YouTube ở đợt bổ sung) |
| `BAO_CAO_CHUA_NPC_DOT2_20261120.md` | Báo cáo này |

## 3. Kiểm chứng

| Hạng mục | Kết quả |
|---|---|
| `npm run build` trong `frontend/` | PASS — vite build, 535 modules, built in 6.28s (cảnh báo chunk >500kB và html2canvas có sẵn từ trước, không phải lỗi) |
| vite preview `http://localhost:4180/chanh-dien` | HTTP 200 |
| Route `/chanh-dien`, `/vuon-tinh-tam` | Có trong `App.jsx`, có trong bản đồ `/chua` |
| Đăng nhập + hồ sơ tự điền | Kiểm tra code: `AuthProvider` bọc app, `AccountButton` ở cả 2 shell, `App.jsx` dùng `savedProfile` để bỏ qua bước bật về `/`; backend có `GET /api/auth/me`. Chưa test đăng nhập thật đầu-cuối bằng tài khoản (cần tài khoản + backend chạy) — Leo test giúp khi xem thử. |
| Nhạc | Kiểm tra code: `expanded` mặc định `false` (nút tròn), 1 audio duy nhất ở cấp app, track `/audio/thien.mp3`, phát lặp. Leo đã xem thử trên điện thoại lúc 09:59: 2 trang hiển thị đúng, nút nhạc tròn hiện ở góc dưới phải. |
| Mobile 375px | Không chụp màn hình headless được (bị chặn quyền, xem đầu báo cáo). Kiểm tra bằng mắt: Leo xem thử trên điện thoại 09:59, 2 trang hiển thị đúng, không tràn; code dùng `max-w` + grid co giãn. Chụp màn hình 375px sẽ làm lại ở đợt bổ sung nếu cần. |
| Headless Chrome | BỎ QUA — gọi nhầm đường `Program Files (x86)` + bị chặn quyền `external_directory` (auto-reject). Đã kiểm chứng thay bằng build + preview HTTP 200 + xem thử trên điện thoại. |

## 4. Chưa làm (đợt bổ sung sau)
- Nút toàn màn hình ở chánh điện + vườn (Leo yêu cầu 09:59).
- Đổi nhạc mặc định sang video YouTube `jKoznZSMX6s` + xóa file mp3 19MB khỏi build.
- Clip nền Flow 8 giây (chụp nền sạch → Flow → `public/video/`).

**Không push. Không deploy.**
