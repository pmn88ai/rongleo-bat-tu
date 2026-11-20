# Báo cáo — Ẩn /tuvi + đưa kết luận an sao vào luận giải (LOCAL)

Ngày: 2026-11-20. Phạm vi: repo `rongleo-bat-tu`. Không push, không deploy.

## 1. Đã ẩn /tuvi ở những chỗ nào
- `frontend/src/config/rooms.js`: bỏ mục `tuvi` khỏi `ROOMS`.
  - Nhờ đó nav Desktop (`DesktopShell`), nav Mobile (`MobileShell`) và danh sách công cụ `/tra-cuu` (`TraCuuPage`) không còn mục Tử vi.
- `frontend/src/App.jsx`: bỏ nút nổi (FAB) `🔮 TỬ VI` trỏ tới `/tuvi`.
- `frontend/src/features/chua/ChuaPage.jsx`: bỏ địa điểm `Điện Tử Vi` khỏi bản đồ chùa.

Giữ nguyên: route `/tuvi` trong `App.jsx`, trang `TuViPage`, engine an sao, API `GET /api/tu-vi` (vẫn mở trực tiếp được để test nội bộ).

## 2. Kết luận an sao chèn vào luận giải
- Thêm helper `tu_vi_summary.js` ở cả 2 phía:
  - `backendjs/src/bazi/tu_vi_summary.js`
  - `frontend/lib/bazi/tu_vi_summary.js`
- `POST /api/consultant/ask` (bản local `backendjs/src/routes/consultant.routes.js` và bản live `frontend/api/consultant.js`) tự tính lá số Tử vi từ ngày/giờ sinh trong hồ sơ mệnh khi `useAI=true`, rồi gắn vào `baziContext.tu_vi`.
- `groq.service.js` (cả 2 phía) chèn block `## LÁ SỐ TỬ VI (AN SAO TỰ ĐỘNG — ĐÃ KIỂM CHỨNG)` vào prompt gửi AI, kèm ghi chú: kết quả đã kiểm chứng 32/32 ca đóng băng + 11/11 ca bổ sung, dùng làm căn cứ và KHÔNG tự bịa lại lá số.
- Thiếu giờ sinh: không an sao, prompt có ghi chú "Chưa có lá số Tử vi vì hồ sơ thiếu giờ sinh (không rõ giờ). Phần luận giải Bát tự vẫn chạy bình thường." Câu hỏi không bị chặn, không báo lỗi.
- An sao lỗi (ngày giờ không hợp lệ): trả ghi chú thay vì ném lỗi, luận giải Bát tự vẫn chạy.

Mẫu tóm tắt với fixture 7/4/1988 11:30 Nam:

```
Lá số Tử vi (an sao tự động): Mệnh tại Dậu (Tân Dậu), Thân tại Dậu (đồng cung Mệnh), Cục 3 (Mộc tam cục); 14 chính tinh: Tử Vi tại Thân, Liêm Trinh tại Tý, Thiên Đồng tại Mão, Vũ Khúc tại Thìn, Thái Dương tại Tỵ, Thiên Cơ tại Mùi, Thiên Phủ tại Thân, Thái Âm tại Dậu, Tham Lang tại Tuất, Cự Môn tại Hợi, Thiên Tướng tại Tý, Thiên Lương tại Sửu, Thất Sát tại Dần, Phá Quân tại Ngọ; Tứ Hóa năm sinh: Tham Lang Hóa Lộc (tại Tuất), Thái Âm Hóa Quyền (tại Dậu), Hữu Bật Hóa Khoa, Thiên Cơ Hóa Kỵ (tại Mùi)
```

## 3. Kiểm chứng
| Hạng mục | Kết quả |
|---|---|
| `npm test` backend | PASS 272/272 test, 56 suite |
| Test mới `tests/tu-vi-luan-giai.test.js` | PASS 5/5: fixture Mệnh Dậu/Thái Âm Hóa Quyền; prompt có block Tử vi + ghi chú kiểm chứng; thiếu giờ sinh có note, câu hỏi vẫn còn; thiếu ngày sinh/không an sao được không ném lỗi |
| `npm run build` frontend | PASS |
| Dev server | `/tuvi` trả 200, `/tra-cuu` trả 200 |
| Nav / `/tra-cuu` | Không còn mục Tử vi (nguồn `ROOMS` đã bỏ, cả Desktop/Mobile/TraCuu đều map từ đây) |
| Kiểm tra bản live `frontend/lib` | Helper + `buildUserPrompt` cho đúng tóm tắt và note thiếu giờ sinh (chạy Node trực tiếp) |

Chưa kiểm được: gọi Groq thật để xem câu trả lời AI — Groq đang lỗi 403 từ máy này, không phải do code mới. Phần chèn prompt đã được kiểm bằng test/Node trực tiếp trên `buildUserPrompt` (đúng chuỗi sẽ gửi đi), không gọi AI.

## 4. File thay đổi
- `frontend/src/config/rooms.js`
- `frontend/src/App.jsx`
- `frontend/src/features/chua/ChuaPage.jsx`
- `backendjs/src/routes/consultant.routes.js`
- `frontend/api/consultant.js`
- `backendjs/src/services/groq.service.js`
- `frontend/lib/services/groq.service.js`
- `backendjs/src/bazi/tu_vi_summary.js` (mới)
- `frontend/lib/bazi/tu_vi_summary.js` (mới)
- `backendjs/tests/tu-vi-luan-giai.test.js` (mới)
- `BAO_CAO_AN_TU_VI_VAO_LUAN_GIAI_20261120.md` (mới)

Không gặp bước nào bị chặn quyền.
