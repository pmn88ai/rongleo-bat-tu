# Nguồn ảnh Tarot RWS — ghi chú kiểm chứng

## Nguồn đã dùng (đủ 78 lá)

- Wikimedia Commons, category "Rider-Waite-Smith tarot deck (TaionWC)": 22 lá Major (`RWS Tarot NN Tên.jpg`) + 56 lá Minor (`Wands/Cups/Swords/Pents` + số 01–14; 01=Át, 11=Tiểu Đồng, 12=Hiệp Sĩ, 13=Hoàng Hậu, 14=Vua).
- Ảnh Major là bản scan màu "Pam-A" (Pamela Colman Smith, 1909–1910). Bản gốc RWS đã hết bảo hộ: tác giả mất 1942/1951, ấn bản trước 1931 → Commons gắn Public Domain Mark. Bản tô màu/chỉnh sửa mới có thể có quyền riêng — bộ này dùng đúng bản scan gốc, không dùng bản tô lại.
- Kiểm chứng lúc tải: đủ 78/78 file, đều là JPEG hợp lệ, kích thước 685–1170 KB/lá.

- Giấy phép: cả 78 file đều có dấu Public Domain theo metadata Commons lúc tải.

## Hai nguồn chưa xác định được (cần Leo gửi lại link nếu muốn đúng nguồn đó)

- GitHub repo "TarotCards": tìm 2 vòng qua web search không thấy repo đúng tên + file SOURCES.md. Không tự nhận một repo khác là repo đó.
- Gói CC0 trên itch.io (mô tả: RWS 300×527 px, JPG+PNG): không tìm thấy gói đúng mô tả. Gói CC0 tìm được trên itch.io là của dettamada ("Tarot Playing Cards") — nhưng đó là bản BIẾN TẤU thành bài tây (Cốc=Hearts, Tiền=Diamonds, Hiệp Sĩ=ký hiệu H, 638×456 ngang), KHÔNG phải ảnh RWS thuần. Không dùng gói đó thay cho gói đã mô tả.

## Quy ước tên

- Major: `major_NN_ten.jpg` (NN = 00–21). Minor: `<suit>_<rank>.jpg` (suit: wands/cups/swords/pentacles; rank: ace, 02–10, page, knight, queen, king).
- Giữ đuôi `.jpg` theo file gốc (ví dụ của Leo dùng `.png` chỉ là minh họa quy ước đặt tên).
- Tên tiếng Việt: Nữ Hoàng = lá Major III (Empress); Hoàng Hậu = lá Queen của các chất — để khỏi trùng tên.
- Nghĩa xuôi: ĐÃ NẠP đủ 78/78 hồ sơ ngày 20/11/2026 — theo Waite, The Pictorial Key to the Tarot (1910, Public Domain); xem mục "Nghĩa xuôi — đã nạp 20/11/2026" ở cuối file.
- Nghĩa ngược: ĐÃ NẠP đủ 78/78 hồ sơ ngày 20/11/2026 theo lệnh Leo (bỏ khóa 25/10) — theo Waite, Part III §2 (Minor) và §3 (Major); xem mục "Nghĩa ngược + nghĩa phụ §4 — đã nạp 20/11/2026" ở cuối file.

## Lưu ý quyền tác giả

- Dấu Public Domain trên Commons căn theo luật Mỹ + nước có thời hạn ≤ life+80. Trước khi dùng thương mại tại Việt Nam/thị trường khác, vẫn cần đối chiếu riêng — đúng như lưu ý Leo đã ghi kèm nguồn itch.io.

## Nghĩa xuôi — đã nạp 20/11/2026

- Nguồn: A.E. Waite, *The Pictorial Key to the Tarot* (London: William Rider & Son, 1910; bản in 1911, text dùng là bản tái bản 1922) — Public Domain (tác giả mất 1942).
- Lấy qua dataset có cấu trúc: StarTarotOnline, "tarot-rws-historical-meanings" v1.1.0 (Hugging Face, DOI 10.5281/zenodo.22917681) — trường `divinatory_meanings.upright`, tức đúng lời "Divinatory Meanings" của Waite, Part III §2 (56 lá Minor) và §3 (22 lá Major), đã đối chiếu với ảnh scan bản in. Phần tuyển chọn/cấu trúc của dataset theo CC BY 4.0; lời Waite là Public Domain (Mỹ, EU, Anh).
- URL dataset: https://huggingface.co/datasets/StarTarotOnline/tarot-rws-historical-meanings
- URL sách (bản text đầy đủ): https://en.wikisource.org/wiki/Index:The_Pictorial_Key_to_the_Tarot.pdf và https://archive.org/stream/A.EWaiteThePictorialKeyToTheTarot/A.%20E%20Waite%20-%20The%20Pictorial%20Key%20to%20the%20Tarot_djvu.txt
- Bản dịch tiếng Việt trong 78 hồ sơ là dịch trung thực từ lời Waite (ngôn ngữ đơn giản + từ khóa), không thêm nội dung tự chế; không dùng nghĩa từ sách/guide thương mại hiện đại. Nghĩa ngược và nghĩa phụ §4 đã nạp sau đó ngày 20/11/2026 (xem mục cuối file); nghĩa xuôi không sửa trong đợt đó.
- Trạng thái: 78/78 hồ sơ đã nạp nghĩa xuôi (20/11/2026).

## Nghĩa ngược + nghĩa phụ §4 — đã nạp 20/11/2026

- Nguồn: cùng A.E. Waite, *The Pictorial Key to the Tarot* (1910, Public Domain), qua cùng dataset StarTarotOnline "tarot-rws-historical-meanings" v1.1.0 — trường `divinatory_meanings.reversed` (nghĩa ngược: Part III §2 cho 56 lá Minor, §3 cho 22 lá Major) và các trường `additional_upright` / `additional_reversed` (nghĩa phụ: Part III §4, "Some Additional Meanings of the Lesser Arcana", chỉ có ở 56 lá Minor).
- Nghĩa ngược: đã nạp đủ 78/78 hồ sơ, dịch tiếng Việt ngắn gọn (ý chính + 1 dòng "Từ khóa" riêng), theo lệnh Leo ngày 20/11/2026 bỏ khóa cũ 25/10 (quyết cũ: chỉ dùng nghĩa xuôi).
- Nghĩa phụ §4: đã nạp đủ 56/56 lá Minor, thêm 1 dòng "Nghĩa phụ (§4 Waite)" ngay sau khối nghĩa xuôi, trước dòng nghĩa ngược; gồm nghĩa bổ sung xuôi, kèm phần ngược (dạng "Ngược: ...") khi §4 có ghi và khác nghĩa ngược chính. 22 lá Major KHÔNG có §4 nên không thêm dòng này.
- Lưu ý: với lá Hai Cốc, nghĩa ngược chính của Waite (§2 không có dòng ngược riêng) lấy từ §4 ("Passion" — Đam mê), nên dòng nghĩa phụ §4 của lá này chỉ ghi phần xuôi để khỏi trùng lặp.
- Trạng thái: 78/78 hồ sơ có nghĩa ngược; 56/56 Minor có nghĩa phụ §4; 0/22 Major có nghĩa phụ §4 (20/11/2026).
