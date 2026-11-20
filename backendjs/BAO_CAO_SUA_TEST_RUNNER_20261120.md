# Báo cáo sửa bộ chạy test — 20/11/2026

## 1. Đã đổi gì
- `backendjs/package.json`: script `"test"` đổi từ `"jest"` sang `"node --test \"tests/*.test.js\""`.
  - Lý do dùng glob `tests/*.test.js` thay vì `node --test tests/`: Node v24.15.0 trên máy này không nhận thư mục làm tham số (báo `Cannot find module ...\tests`), nên phải truyền danh sách file test bằng glob.
- Giữ nguyên các script `test:core`, `test:api`, `test:western`.
- KHÔNG gỡ `jest` khỏi `devDependencies` (vẫn để đó, chỉ không dùng làm runner nữa).
- KHÔNG sửa gì trong `src/` và `tests/`.

## 2. Kết quả kiểm chứng
- `npm test` trong `backendjs`:
  - tests: 221
  - suites: 43
  - pass: 221
  - fail: 0
  - Khớp đúng số đã kiểm chứng trước đó bằng `node --test`.
- `node --test tests/core.test.js`: tests 68, suites 14, pass 68, fail 0. Không còn dòng lỗi `calculateStartAge is not a function`.

## 3. Vì sao jest hỏng
7 file test trong `tests/` được viết cho Node built-in test runner (`node:test`, cú pháp ESM `import`). Jest không chạy được các file này: nó báo `Test Suites: 7 failed, 7 total / Tests: 0 total`, lỗi đầu tiên là `ReferenceError: You are trying to 'import' a file after the Jest environment has been torn down`. Nghĩa là jest không thực thi được test nào, không phải test hay thuật toán sai.

## 4. Vì sao thuật toán không sai
Khi chạy bằng `node --test`, toàn bộ 221 test pass, 0 fail. Lỗi `dayun.calculateStartAge is not a function` chỉ xuất hiện trong output của jest (do jest resolve module khác), không xuất hiện lần nào khi chạy `node --test`; hàm `calculateStartAge` vẫn tồn tại trong `src/bazi/dayun.js` (module.exports dòng 618–620) và phần tính Nhập Vận chạy đúng. Đây là lỗi do môi trường jest, không phải lỗi thuật toán.

## 5. Ghi chú
- Không push, không deploy. Chỉ commit local.
- Không có bước nào bị chặn quyền trong đợt chạy này.
