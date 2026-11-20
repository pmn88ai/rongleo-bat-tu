# BÁO CÁO — Thêm lời giảng giải đơn giản cho Tarot

Ngày: 2026-11-20. Chạy LOCAL, **không push, không deploy**.

## Đã làm

1. **`frontend/src/data/tarotCards.js`** — thêm 2 trường cho đủ **78/78 lá**:
   - `giaiThichXuoi`: 1–2 câu tiếng Việt thường, diễn lại đúng nghĩa xuôi của Waite, nói thẳng lá báo gì / nên làm gì / coi chừng gì.
   - `giaiThichNguoc`: cùng cách, nhưng bám đúng nghĩa ngược của Waite; khác rõ với chiều xuôi.
   - Không thêm nghĩa mới ngoài Waite. Trong câu giảng không dùng “chiều ngược”, “§4”, “Át/Vua”, “Ẩn chính/phụ”; chỉ dùng tên lá tiếng Việt khi cần.
   - Giữ nguyên toàn bộ dữ liệu cũ (upright, reversed, keywords, extra, ảnh, id…).

2. **`frontend/src/features/Tarot/TarotPage.jsx`** — đổi thứ tự hiển thị trong mỗi lá:
   - Đầu tiên, nổi bật nhất: khối **“Hiểu đơn giản là:”** hiển thị đúng chiều đã rút (xuôi hoặc ngược).
   - Sau đó mới tới 2 khối nghĩa gốc Waite xuôi/ngược + keyword chips.
   - Mục **§4** đưa xuống cuối, thu gọn trong `<details>` nhãn **“Đọc thêm — dành cho người rành bài”**, mặc định đóng.
   - Giữ nguyên random 78 lá, không trùng trong cùng trải, tung xuôi/ngược 50/50, khách không cần hồ sơ.

3. **`frontend/src/features/Tarot/TarotPage.css`** — thêm style cho khối giảng giải nổi bật (viền/nền vàng khi xuôi, đỏ khi ngược) và cho khối `<details>` thu gọn.

4. Cập nhật dòng ghi chú cuối trang: nói rõ phần “Hiểu đơn giản là” chỉ diễn lại nghĩa gốc, không thêm nghĩa mới.

## Kiểm chứng (local)

- `npm run build` (frontend): **pass** (300 modules, vite build xong).
- Dev server `http://localhost:3005/tarot`: **HTTP 200**; dev server đọc đúng file mới (module `tarotCards.js` serve ra có đủ trường giảng giải).
- Kiểm tự động: **78/78 lá** có cả `giaiThichXuoi` và `giaiThichNguoc`, không rỗng, không lá nào để 2 chiều giống nhau, không dính từ cấm trong câu giảng.

### 5 lá mẫu (cả 2 chiều)

| Lá | Xuôi | Ngược |
|---|---|---|
| Kẻ Khờ | Coi chừng làm liều, bốc đồng, tiêu xài hay tin người quá nhanh — dễ bị lừa, dễ lộ chuyện riêng. Dừng lại nghĩ trước khi bước. | Sự cẩu thả, thờ ơ, làm mà không để tâm — mọi thứ trôi tuột, trống rỗng. Cần tỉnh lại, giữ chặt việc của mình. |
| Mười Kiếm | Đây là lá báo chạm đáy: đau, mất mát, một việc kết thúc không êm. Nhưng chạm đáy rồi thì chỉ còn đường đi lên. | Cái đau đó không tới nữa, hoặc đã qua rồi. Thay vào đó có lộc, có việc tốt tới — nhưng chỉ được một lúc thôi, không bền. |
| Hai Cốc | Có một mối gắn bó đẹp: tình yêu, tình bạn hay một sự hợp tác ăn ý. Hai người hiểu nhau, nên giữ và vun vào. | Lá nghiêng về đam mê nồng nhiệt giữa hai người. Cảm xúc mạnh, nhưng nhớ đừng để nó che mất lý trí. |
| Pháp Sư | Bạn có tay nghề, sự khéo léo và ý chí để xoay việc — nhưng cũng có cạm bẫy từ kẻ xung quanh, đừng chủ quan. Dùng tài khéo, nhưng coi chừng mất mát, bệnh tật. | Lá này dễ chỉ về chuyện bệnh tật, bất an, hoặc tai tiếng. Sức khỏe và tinh thần cần được chăm trước. |
| Hoàng Hậu Cốc | Một người phụ nữ dịu dàng, tận tụy, hiểu chuyện — hoặc chính bạn đang có trực giác và lòng thương tốt. Nên nghe theo trực giác đó. | Coi chừng vẻ ngoài đoan trang che một người khó lường, có thể không đáng tin hay ngang ngược. Đừng chỉ nhìn bề ngoài. |

Ghi chú: bước kiểm 200 và dev server dùng lại tiến trình Vite đang chạy sẵn ở cổng 3005 của repo này (không tắt tiến trình đó). Không gặp bước nào bị chặn quyền.

## Trạng thái git

Commit local, **không push, không deploy**.
