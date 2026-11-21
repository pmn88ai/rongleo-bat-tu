# BAO CAO TEMPLE PHASE 3 — NPC NHO NGUOI DUNG (21/11/2026)

## Lam gi
- Them component `NpcMemory` (`frontend/src/features/chua/NpcMemory.jsx` + `NpcMemory.css`) + bang map thay `npcTeachers.js` (9 NPC).
- Nguoi da dang nhap mo trang chua: NPC chao bang ten trong ho so (`savedProfile` / `/api/auth/me`, vd "Chao Nguyen Van Test, Thay Huyen Co nho con.") + 1 dong ho so (gioi tinh, ngay sinh) + toi da 3 cau hoi cu gan nhat cua dung thay do; bam vao cau cu thi mo lai cau tra loi cu.
- Gan `NpcMemory` vao: `/chua` (Cổng chùa), `/chanh-dien`, `/vuon-tinh-tam`, `/tuvi` (Thầy Tinh Tú), `/laso` (Thầy Can Chi), `/xemngay` (Thầy Hoàng Đạo), `/van-hom-nay` (Thầy Thời Vận), `/duyenso` (Thầy Duyên Khởi), `/xinque` (Thầy Quẻ Cát), Phòng Hỏi Thầy (`ConsultantPage`, theo persona Huyền Cơ / Mệnh Mèo).
- Khach vang lai: giu nguyen, chi them 1 dong moi dang nhap ("đăng nhập ở góc trên để các thầy nhớ con..."). Rieng trang `/chua` khong hien dong moi nay (`showGuestInvite={false}`).
- Bao mat: backend `getUserId` uu tien id trong JWT Bearer <redacted> thay vi tin header `x-user-id` (khong doc/ghi nham lich su nguoi khac); `getUserHistory` tra them `theme_id` de loc dung thay; frontend dung `getAuthHeaders()` (x-user-id + Bearer <redacted> neu da dang nhap). Khong luu them gi vao localStorage.

## Kiem chung (tu lam lai 21/11, khong dung Chrome)
- Frontend build: PASS (vite build 5,51s, 303 modules).
- Backend test: **282/282 PASS, 0 fail** (56 suite).
- API tren backend dev 8888 (tai khoan test moi, id 6, ho so Nguyen Van Test 1990): hoi 2 cau qua `/api/consultant/ask` deu 200 (luu #19, #20); `/api/consultant/my-history` tra `count=2 user=6` ngay ca khi gui kem header `x-user-id` gia mao — token thang; khach (x-user-id khac, khong token) tra `count=0`.
- Logic loc `npcMatches` kiem truc tiep: Cổng chùa nhan moi cau; Phong Hoi Thay loc theo persona; Bat Tu nhan `comprehensive`; Duyen Khoi nhan `matching`; Que Cat nhan `xin_que`; cau `matching` khong roi vao Phong Hoi Thay.

## Luu y
- 3 quay Tu Vi / Xem Ngay / Van Hom Nay hien chua co luong nao luu lich su tu van voi `theme_id` tuong ung (`tu_vi` / `xem_ngay` / `van_hom_nay`), nen NPC o 3 quay nay hien loi chao + dong ho so, phan cau cu hien dong "Thay chua giu cau hoi cu nao cua con o quay nay." — dung nhu thiet ke (khong phai loi). Khi nao cac quay nay co luong luu lich su thi cau cu se hien.
- Cau hoi tu van hoi bang id so hien luu `theme_id` rong (hanh vi co san cua route `/ask`, Phase 3 khong doi) — khong anh huong Cổng chùa va Phong Hoi Thay (loc theo persona).

## Bo qua
- Test bang trinh duyet Chrome/headless: **bo qua** — opencode bi chan quyen `external_directory` (duong dan Chrome) nen job goc chet o buoc nay truoc khi viet bao cao/commit. Can Leo mo tay `/chua`, `/chanh-dien`, `/vuon-tinh-tam` sau khi dang nhap de xem NPC chao ten + cau cu.

## Trang thai
- Commit local, **KHONG push, KHONG deploy** (doi Leo duyet).
