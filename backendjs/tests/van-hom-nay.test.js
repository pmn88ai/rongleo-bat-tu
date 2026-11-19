/**
 * Test vàng cho "Vận hôm nay" (bước 2, 19/11/2026).
 *
 * Chạy:
 *   cd backendjs && node --test tests/van-hom-nay.test.js
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const {
    reduceNumber,
    personalYear,
    personalMonth,
    personalDay,
    computePersonalNumbers
} = require('../src/bazi/than_so');
const {
    getDayCanChi,
    computeVanHomNay,
    LABELS,
    LEVELS
} = require('../src/bazi/van_hom_nay');

// ─── Thần số (quy tắc tủ) ───────────────────────────────────────────────────

describe('Thần số Pythagoras — ngày cá nhân', () => {
    it('sinh 9/6/1971 → năm cá nhân 2026 = 7', () => {
        assert.equal(personalYear({ day: 9, month: 6, year: 2026 }), 7);
    });

    it('sinh 9/6/1971 → năm cá nhân 2027 = 8', () => {
        assert.equal(personalYear({ day: 9, month: 6, year: 2027 }), 8);
    });

    it('sinh 7/4/1988 → năm cá nhân 2026 = 3', () => {
        assert.equal(personalYear({ day: 7, month: 4, year: 2026 }), 3);
    });

    it('giữ master 11/22 ở bước cuối, không rút tiếp', () => {
        assert.equal(reduceNumber(29), 11);
        assert.equal(reduceNumber(38), 11);
        assert.equal(reduceNumber(1984), 22);
        assert.equal(reduceNumber(2041), 7);
    });

    it('tháng cá nhân = rút gọn (năm cá nhân + tháng hiện tại)', () => {
        assert.equal(personalMonth(7, 10), 8);
    });

    it('ngày cá nhân = rút gọn (tháng cá nhân + ngày hiện tại)', () => {
        assert.equal(personalDay(8, 26), 7);
    });

    it('computePersonalNumbers trả đủ năm/tháng/ngày', () => {
        const result = computePersonalNumbers(
            { day: 9, month: 6, year: 1971 },
            { day: 26, month: 10, year: 2026 }
        );
        assert.deepEqual(result, { nam_ca_nhan: 7, thang_ca_nhan: 8, ngay_ca_nhan: 7 });
    });
});

// ─── Can chi ngày (lấy từ lunar-javascript) ─────────────────────────────────

describe('Can chi ngày — số liệu đã kiểm chứng', () => {
    it('26/10/2026 → Quý Dậu', () => {
        assert.equal(getDayCanChi(2026, 10, 26).can_chi, 'Quý Dậu');
    });

    it('31/10/2026 → Mậu Dần', () => {
        assert.equal(getDayCanChi(2026, 10, 31).can_chi, 'Mậu Dần');
    });
});

// ─── Đối chiếu ngày với lá số ───────────────────────────────────────────────

describe('Đối chiếu ngày với lá số — Mô hình Tầng 1', () => {
    // Người sinh 15/6/1990 có dụng thần Thủy (thủy khắc hỏa).
    const birth = { ngay_sinh: '1990-06-15' };

    it('can ngày là dụng thần (Quý = Thủy) → thuận', () => {
        const result = computeVanHomNay(birth, { today: new Date(2026, 9, 26) });
        const doiChieu = result.ket_qua[2];
        assert.equal(doiChieu.nhan, LABELS.doi_chieu);
        assert.equal(doiChieu.loai, 'MO_HINH_TANG_1');
        assert.deepEqual(doiChieu.noi_dung.dung_than, ['Thủy']);
        assert.equal(doiChieu.noi_dung.ket_luan, LEVELS.thuan);
        assert.equal(result.ket_qua[3].noi_dung.cau, 'Hôm nay hợp làm việc quan trọng, cứ tiến hành từ từ.');
    });

    it('can ngày khắc dụng thần (Mậu = Thổ khắc Thủy) → nên tránh việc lớn', () => {
        const result = computeVanHomNay(birth, { today: new Date(2026, 9, 31) });
        const doiChieu = result.ket_qua[2];
        assert.equal(doiChieu.noi_dung.ket_luan, LEVELS.tranh);
        assert.equal(result.ket_qua[3].noi_dung.cau, 'Hôm nay nên giữ sức, việc lớn để hôm khác.');
    });

    it('không có giờ sinh → ghi rõ giới hạn, không tính phần cần giờ sinh', () => {
        const result = computeVanHomNay({ ngay_sinh: '1990-06-15' }, { today: new Date(2026, 9, 26) });
        assert.equal(result.co_gio_sinh, false);
        assert.ok(result.gioi_han.some(line => line.includes('Chưa có giờ sinh')));
    });

    it('không xác định được dụng thần → chưa đủ căn cứ', () => {
        const result = computeVanHomNay({ ngay_sinh: '1985-03-20' }, { today: new Date(2026, 9, 26) });
        const doiChieu = result.ket_qua[2].noi_dung;
        assert.equal(doiChieu.ket_luan, LEVELS.chua_du_can_cu);
        assert.equal(result.ket_qua[3].noi_dung.cau, 'Chưa đủ căn cứ để kết luận hôm nay, cứ làm việc như thường.');
    });
});

// ─── Endpoint /api/van-hom-nay ───────────────────────────────────────────────

const TEST_PORT = 0;
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
        server.listen(TEST_PORT, () => {
            const addr = server.address();
            baseUrl = `http://127.0.0.1:${addr.port}`;
            resolve();
        });
    });
});

after(() => {
    if (server) server.close();
});

async function getJson(path, params = {}) {
    const url = new URL(path, baseUrl);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString());
    let body = null;
    try { body = await res.json(); } catch { body = null; }
    return { status: res.status, body };
}

describe('GET /api/van-hom-nay', () => {
    it('trả đủ 4 món kèm nhãn', async () => {
        const { status, body } = await getJson('/api/van-hom-nay', {
            ngay_sinh: '1990-06-15',
            gioi_tinh: 'Nam'
        });
        assert.equal(status, 200);
        assert.ok(Array.isArray(body.ket_qua));
        assert.equal(body.ket_qua.length, 4);

        const labels = body.ket_qua.map(item => item.nhan);
        assert.deepEqual(labels, [
            'Can chi hôm nay',
            'Ngày cá nhân thần số',
            'Đối chiếu ngày với lá số',
            'Lời nhắn hôm nay'
        ]);

        const loais = body.ket_qua.map(item => item.loai);
        assert.deepEqual(loais, ['TINH', 'TINH', 'MO_HINH_TANG_1', 'MAU_CO_DINH']);

        for (const item of body.ket_qua) {
            assert.ok(item.noi_dung, `Món "${item.nhan}" thiếu nội dung`);
            assert.ok(item.ghi_chu, `Món "${item.nhan}" thiếu ghi chú`);
        }
    });

    it('can chi hôm nay và ngày cá nhân có đủ số liệu', async () => {
        const { body } = await getJson('/api/van-hom-nay', { ngay_sinh: '1971-06-09' });
        assert.ok(body.ket_qua[0].noi_dung.can_chi);
        assert.ok(body.ket_qua[0].noi_dung.am_lich);
        assert.ok(body.ket_qua[1].noi_dung.nam_ca_nhan);
        assert.ok(body.ket_qua[1].noi_dung.thang_ca_nhan);
        assert.ok(body.ket_qua[1].noi_dung.ngay_ca_nhan);
    });

    it('không trả dữ kiện cá nhân ngoài ngày sinh đã nhập', async () => {
        const { body } = await getJson('/api/van-hom-nay', {
            ngay_sinh: '1990-06-15',
            gio_sinh: '10',
            gioi_tinh: 'Nam'
        });
        const serialized = JSON.stringify(body);
        for (const forbidden of ['ho_ten', 'ten', 'name', 'email', 'dia_chi', 'gioi_tinh']) {
            assert.ok(!serialized.includes(`"${forbidden}"`), `Không được trả field ${forbidden}`);
        }
        assert.equal(body.ngay_sinh, '1990-06-15');
    });

    it('thiếu ngày sinh → 400', async () => {
        const { status, body } = await getJson('/api/van-hom-nay', {});
        assert.equal(status, 400);
        assert.ok(body.error);
    });

    it('ngày sinh sai định dạng → 400', async () => {
        const { status, body } = await getJson('/api/van-hom-nay', { ngay_sinh: '15/06/1990' });
        assert.equal(status, 400);
        assert.ok(body.error);
    });

    it('ngày sinh không tồn tại → 400', async () => {
        const { status, body } = await getJson('/api/van-hom-nay', { ngay_sinh: '1990-02-31' });
        assert.equal(status, 400);
        assert.ok(body.error);
    });
});
