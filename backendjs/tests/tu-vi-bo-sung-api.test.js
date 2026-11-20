/**
 * Test endpoint /api/tu-vi cho các đường nhập mới:
 *  - duong_lich + gio (giờ Tý muộn)
 *  - nam_am + lich=viet (âm Việt)
 *  - nam_am + thang_nhuan (âm Trung Hoa, tháng nhuận)
 *
 * Chạy:
 *   cd backendjs && node --test tests/tu-vi-bo-sung-api.test.js
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

let server = null;
let baseUrl = '';

before(async () => {
    const origLog = console.log;
    const origWarn = console.warn;
    console.log = () => {};
    console.warn = () => {};
    const app = require('../server');
    console.log = origLog;
    console.warn = origWarn;

    return new Promise((resolve) => {
        server = http.createServer(app);
        server.listen(0, () => {
            baseUrl = `http://127.0.0.1:${server.address().port}`;
            resolve();
        });
    });
});

after(() => {
    if (server) server.close();
});

async function getJson(pathname, params = {}) {
    const url = new URL(pathname, baseUrl);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString());
    let body = null;
    try { body = await res.json(); } catch { body = null; }
    return { status: res.status, body };
}

describe('GET /api/tu-vi — đường nhập mới', () => {
    it('duong_lich + giờ Tý muộn 23:00 → tính sang ngày kế tiếp', async () => {
        const { status, body } = await getJson('/api/tu-vi', {
            duong_lich: '1990-05-15',
            gio: '23:00',
            gioi_tinh: 'Nam'
        });
        assert.equal(status, 200);
        assert.equal(body.nguon.gio_index_iztro, 12);
        assert.equal(body.nguon.am_trung_hoa.ngay, 21);
        assert.equal(body.nguon.da_an_sao_bang.ngay_am, 22);
        assert.equal(body.menh.chi, 'Tỵ');
        assert.equal(body.tru_ngay.can_chi, 'Tân Tỵ');
    });

    it('nam_am + lich=viet → quy đổi bằng lịch Việt rồi an sao', async () => {
        const { status, body } = await getJson('/api/tu-vi', {
            nam_am: 2007,
            thang_am: 1,
            ngay_am: 1,
            lich: 'viet',
            gio: '12:00',
            gioi_tinh: 'Nữ'
        });
        assert.equal(status, 200);
        assert.equal(body.nguon.lich, 'am_viet');
        assert.equal(body.nguon.duong_lich, '2007-02-17');
        assert.equal(body.nguon.am_trung_hoa.nam, 2006);
        assert.equal(body.menh.chi, 'Mùi');
    });

    it('nam_am + thang_nhuan → áp fixLeap nửa sau tháng nhuận', async () => {
        const { status, body } = await getJson('/api/tu-vi', {
            nam_am: 2023,
            thang_am: 2,
            ngay_am: 22,
            thang_nhuan: 'true',
            gio: '14:30',
            gioi_tinh: 'Nữ'
        });
        assert.equal(status, 200);
        assert.equal(body.nguon.am_trung_hoa.nhuan, true);
        assert.equal(body.nguon.da_an_sao_bang.thang_am, 3);
        assert.equal(body.menh.chi, 'Dậu');
    });

    it('duong_lich sai định dạng → 400', async () => {
        const { status, body } = await getJson('/api/tu-vi', {
            duong_lich: '15/05/1990',
            gio: '23:00'
        });
        assert.equal(status, 400);
        assert.ok(body.error);
    });

    it('âm Việt không tồn tại (tháng nhuận sai) → 400', async () => {
        const { status, body } = await getJson('/api/tu-vi', {
            nam_am: 2024,
            thang_am: 2,
            ngay_am: 1,
            thang_nhuan: 'true',
            lich: 'viet',
            gio: '12:00'
        });
        assert.equal(status, 400);
        assert.ok(body.error);
    });
});
