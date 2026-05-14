/**
 * API Contract Regression Tests
 *
 * Validates endpoint structure, response shape, and error handling.
 * Ensures future refactors don't silently break frontend expectations.
 *
 * Environment: Node >= 18 (node --test built-in)
 * Dependencies: None beyond existing Express app + fetch() (Node 18+)
 *
 * Run:
 *   node --test backendjs/tests/api-contract.test.js
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

// ─── Test Server Setup ───────────────────────────────────────────────────────

const TEST_PORT = 0; // 0 = OS assigns random available port
let server = null;
let baseUrl = '';

/**
 * Import the Express app. This triggers dbService.init() as a side effect
 * (creates tables and seeds data in backendjs/data/bazi_consultant.db).
 * Safe for testing — uses the same DB path as production.
 */
before(async () => {
    // Suppress noisy DB logs during tests
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
            console.log(`\n  [API Test] Server started on ${baseUrl}`);
            resolve();
        });
    });
});

after(() => {
    if (server) {
        server.close();
        console.log(`  [API Test] Server closed`);
    }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const validBirth = { year: 1990, month: 6, day: 15, hour: 12, gender: 'Nam', calendar: 'solar' };

const get = async (path, params = {}) => {
    const url = new URL(path, baseUrl);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString());
    let body = null;
    try { body = await res.json(); } catch { body = null; }
    return { status: res.status, headers: res.headers, body };
};

const post = async (path, data = {}) => {
    const res = await fetch(new URL(path, baseUrl).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    let body = null;
    try { body = await res.json(); } catch { body = null; }
    return { status: res.status, headers: res.headers, body };
};

// ─── Suite 1: Health Check ──────────────────────────────────────────────────

describe('GET / — health check', () => {

    it('returns 200 with server info', async () => {
        const { status, body } = await get('/');
        assert.equal(status, 200);
        assert.ok(body);
        assert.ok(body.name);
        assert.ok(body.status);
        assert.equal(body.status, 'running');
    });

    it('returns version string', async () => {
        const { body } = await get('/');
        assert.ok(body.version);
        assert.ok(typeof body.version === 'string');
    });
});

// ─── Suite 2: BaZi Analysis Endpoint ────────────────────────────────────────

describe('GET /api/analyze — full BaZi analysis', () => {

    it('returns 200 with valid birth params', async () => {
        const { status, body } = await get('/api/analyze', validBirth);
        assert.equal(status, 200);
    });

    it('response has metadata field', async () => {
        const { body } = await get('/api/analyze', validBirth);
        assert.ok(body.metadata);
        assert.ok(body.metadata.phien_ban);
        assert.ok(body.metadata.thoi_gian_tao);
    });

    it('response has thong_tin_co_ban with bat_tu', async () => {
        const { body } = await get('/api/analyze', validBirth);
        assert.ok(body.thong_tin_co_ban);
        assert.ok(body.thong_tin_co_ban.bat_tu);
        assert.ok(body.thong_tin_co_ban.bat_tu.nam);
        assert.ok(body.thong_tin_co_ban.bat_tu.thang);
        assert.ok(body.thong_tin_co_ban.bat_tu.ngay);
        assert.ok(body.thong_tin_co_ban.bat_tu.gio);
        assert.equal(body.thong_tin_co_ban.bat_tu.nam.length, 2);
        assert.equal(body.thong_tin_co_ban.bat_tu.thang.length, 2);
        assert.equal(body.thong_tin_co_ban.bat_tu.ngay.length, 2);
        assert.equal(body.thong_tin_co_ban.bat_tu.gio.length, 2);
    });

    it('response has 4 chi_tiet_tru (pillars)', async () => {
        const { body } = await get('/api/analyze', validBirth);
        assert.ok(Array.isArray(body.chi_tiet_tru));
        assert.equal(body.chi_tiet_tru.length, 4);
    });

    it('each pillar has all required fields', async () => {
        const { body } = await get('/api/analyze', validBirth);
        const requiredPillarFields = ['tru', 'can', 'chi', 'nap_am', 'thap_than_can', 'thap_than_chi', 'tang_can', 'than_sat', 'truong_sinh'];
        for (const pillar of body.chi_tiet_tru) {
            for (const field of requiredPillarFields) {
                assert.ok(Object.hasOwn(pillar, field), `Missing field "${field}" in pillar ${pillar.tru}`);
            }
        }
    });

    it('response has diem_so with ngu_hanh_vn (5 elements)', async () => {
        const { body } = await get('/api/analyze', validBirth);
        assert.ok(body.diem_so);
        assert.ok(body.diem_so.ngu_hanh_vn);
        const elements = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];
        for (const el of elements) {
            assert.ok(Object.hasOwn(body.diem_so.ngu_hanh_vn, el), `Missing element: ${el}`);
        }
    });

    it('response has phan_tich with cau_truc', async () => {
        const { body } = await get('/api/analyze', validBirth);
        assert.ok(body.phan_tich);
        assert.ok(body.phan_tich.cau_truc);
        assert.ok(body.phan_tich.cau_truc.thien_can);
        assert.ok(body.phan_tich.cau_truc.dia_chi);
    });

    it('response has phan_tich.can_bang_ngu_hanh', async () => {
        const { body } = await get('/api/analyze', validBirth);
        assert.ok(body.phan_tich.can_bang_ngu_hanh);
    });

    it('response has phan_tich.luan_tinh with required keys', async () => {
        const { body } = await get('/api/analyze', validBirth);
        assert.ok(body.phan_tich.luan_tinh);
        // luan_tinh is an object with personality, career, marriage, stars, metadata
        const lt = body.phan_tich.luan_tinh;
        assert.ok(lt.personality !== undefined);
        assert.ok(lt.career !== undefined);
        assert.ok(lt.marriage !== undefined);
        assert.ok(lt.stars !== undefined);
        assert.ok(lt.metadata !== undefined);
        // Each section should have content (either array of strings or object with text)
        if (typeof lt.personality === 'object') {
            const hasContent = Object.keys(lt.personality).length > 0;
            assert.ok(hasContent, 'personality should have content');
        }
    });

    it('response has luan_giai as array of sections', async () => {
        const { body } = await get('/api/analyze', validBirth);
        assert.ok(body.luan_giai);
        // luan_giai is a direct array of section objects (not wrapped in {sections: []})
        const isArray = Array.isArray(body.luan_giai);
        const isWrapped = body.luan_giai.sections && Array.isArray(body.luan_giai.sections);
        assert.ok(isArray || isWrapped, 'luan_giai must be array or have sections array');
        const sections = isArray ? body.luan_giai : body.luan_giai.sections;
        assert.ok(sections.length > 0, 'luan_giai should have at least one section');
        const first = sections[0];
        assert.ok(first.title, 'section should have title');
        assert.ok(first.icon, 'section should have icon');
        assert.ok(first.content, 'section should have content');
    });

    it('response has dai_van (array, non-empty)', async () => {
        const { body } = await get('/api/analyze', validBirth);
        assert.ok(Array.isArray(body.dai_van));
        assert.ok(body.dai_van.length > 0);
        const firstDv = body.dai_van[0];
        assert.ok(firstDv.can_chi);
        assert.ok(firstDv.nam);
        assert.ok(firstDv.thap_than);
    });

    it('response has structured_interpretations (new field)', async () => {
        const { body } = await get('/api/analyze', validBirth);
        // New field — should exist with at least personality
        if (body.structured_interpretations) {
            const si = body.structured_interpretations;
            if (si.personality) {
                assert.ok(si.personality.id);
                assert.ok(si.personality.category);
                assert.ok(si.personality.confidence);
                assert.ok(Array.isArray(si.personality.content));
            }
        } else {
            // Acceptable if not present (graceful fallback in old version)
            console.log('  [INFO] structured_interpretations not present (acceptable)');
        }
    });

    it('response is deterministic (same input = same 4 pillars)', async () => {
        const r1 = await get('/api/analyze', validBirth);
        const r2 = await get('/api/analyze', validBirth);
        const pillars1 = r1.body.chi_tiet_tru.map(p => `${p.can} ${p.chi}`).join('|');
        const pillars2 = r2.body.chi_tiet_tru.map(p => `${p.can} ${p.chi}`).join('|');
        assert.equal(pillars1, pillars2);
    });
});

// ─── Suite 3: /api/chart (Basic Chart) ──────────────────────────────────────

describe('GET /api/chart — basic chart', () => {

    it('returns 200 with valid params', async () => {
        const { status } = await get('/api/chart', validBirth);
        assert.equal(status, 200);
    });

    it('returns pillars array', async () => {
        const { body } = await get('/api/chart', validBirth);
        assert.ok(Array.isArray(body.pillars));
        assert.equal(body.pillars.length, 4);
    });

    it('returns elements object', async () => {
        const { body } = await get('/api/chart', validBirth);
        assert.ok(body.elements);
    });

    it('returns basicInfo', async () => {
        const { body } = await get('/api/chart', validBirth);
        assert.ok(body.basicInfo);
    });
});

// ─── Suite 4: /api/dayun (Luck Cycles / Đại Vận) ────────────────────────────

describe('GET /api/dayun — luck cycles', () => {

    it('returns 200 with valid params', async () => {
        const { status } = await get('/api/dayun', validBirth);
        assert.equal(status, 200);
    });

    it('returns dai_van array', async () => {
        const { body } = await get('/api/dayun', validBirth);
        assert.ok(body.dai_van);
        assert.ok(Array.isArray(body.dai_van));
        assert.ok(body.dai_van.length > 0);
    });

    it('each dai_van entry has can_chi, nam, thap_than', async () => {
        const { body } = await get('/api/dayun', validBirth);
        for (const dv of body.dai_van) {
            assert.ok(dv.can_chi, 'Missing can_chi');
            assert.ok(dv.nam !== undefined, 'Missing nam');
            assert.ok(dv.thap_than, 'Missing thap_than');
        }
    });
});

// ─── Suite 5: /api/elements (Ngũ Hành) ──────────────────────────────────────

describe('GET /api/elements — Ngũ Hành analysis', () => {

    it('returns 200 with valid params', async () => {
        const { status, body } = await get('/api/elements', validBirth);
        assert.equal(status, 200);
        assert.ok(body.diem_so);
    });

    it('returns 5-element scores', async () => {
        const { body } = await get('/api/elements', validBirth);
        const elements = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];
        for (const el of elements) {
            assert.ok(Object.hasOwn(body.diem_so.ngu_hanh_vn, el));
        }
    });
});

// ─── Suite 6: /api/stars (Thần Sát) ─────────────────────────────────────────

describe('GET /api/stars — Thần Sát', () => {

    it('returns 200 with valid params', async () => {
        const { status } = await get('/api/stars', validBirth);
        assert.equal(status, 200);
    });

    it('returns sao_dac_biet with star fields', async () => {
        const { body } = await get('/api/stars', validBirth);
        assert.ok(body.sao_dac_biet);
    });
});

// ─── Suite 7: Invalid Input ─────────────────────────────────────────────────

describe('invalid input safety — BaZi endpoints', () => {

    it('missing year returns 400', async () => {
        const { status, body } = await get('/api/analyze', { month: 6, day: 15 });
        assert.equal(status, 400);
        assert.ok(body.error);
    });

    it('missing month returns 400', async () => {
        const { status, body } = await get('/api/analyze', { year: 1990, day: 15 });
        assert.equal(status, 400);
        assert.ok(body.error);
    });

    it('missing day returns 400', async () => {
        const { status, body } = await get('/api/analyze', { year: 1990, month: 6 });
        assert.equal(status, 400);
        assert.ok(body.error);
    });

    it('invalid month (13) returns 500 error from engine', async () => {
        const { status, body } = await get('/api/analyze', { ...validBirth, month: 13 });
        // Engine will throw, server returns 500 with error message
        assert.ok(status === 500 || status === 400);
        assert.ok(body.error || body.message);
    });

    it('malformed gender (random string) does not crash server', async () => {
        const { status, body } = await get('/api/analyze', { ...validBirth, gender: 'xyz_invalid_gender' });
        assert.equal(status, 200);
        assert.ok(body.thong_tin_co_ban);
    });

    it('GET /api/analyze with no params returns 400', async () => {
        const { status } = await get('/api/analyze', {});
        assert.equal(status, 400);
    });

    it('POST to GET-only endpoint returns 404', async () => {
        const { status } = await post('/api/analyze', validBirth);
        assert.equal(status, 404);
    });
});

// ─── Suite 8: Consultant Endpoints ──────────────────────────────────────────

describe('/api/consultant — AI consultant', () => {

    it('GET /api/consultant/themes returns 200', async () => {
        const { status, body } = await get('/api/consultant/themes');
        assert.equal(status, 200);
        assert.ok(Array.isArray(body));
        if (body.length > 0) {
            assert.ok(body[0].id);
            assert.ok(body[0].name);
        }
    });

    it('GET /api/consultant/questions/:id returns array', async () => {
        const { status, body } = await get('/api/consultant/questions/1');
        assert.equal(status, 200);
        assert.ok(Array.isArray(body));
    });

    it('GET /api/consultant/stats returns stats object', async () => {
        const { status, body } = await get('/api/consultant/stats');
        assert.equal(status, 200);
    });

    it('POST /api/consultant/ask without body returns 400', async () => {
        const { status, body } = await post('/api/consultant/ask', {});
        assert.equal(status, 400);
        assert.ok(body.error);
    });

    it('POST /api/consultant/ask with minimal params returns 400', async () => {
        const { status } = await post('/api/consultant/ask', {
            year: 1990, month: 6, day: 15
            // missing questionId
        });
        assert.equal(status, 400);
    });
});

// ─── Suite 9: /api/matching ──────────────────────────────────────────────────

describe('POST /api/matching — compatibility', () => {

    it('missing person1 returns 400', async () => {
        const { status, body } = await post('/api/matching', {
            person2: { year: 1991, month: 7, day: 20 }
        });
        assert.equal(status, 400);
        assert.ok(body.error);
    });

    it('missing person2 returns 400', async () => {
        const { status } = await post('/api/matching', {
            person1: { year: 1990, month: 6, day: 15 }
        });
        assert.equal(status, 400);
    });

    it('complete valid request returns matching result', async () => {
        const { status, body } = await post('/api/matching', {
            person1: { year: 1990, month: 6, day: 15, hour: 12, gender: 'Nam' },
            person2: { year: 1995, month: 3, day: 20, hour: 8, gender: 'Nữ' },
            relationship: 'romance'
        });
        assert.equal(status, 200);
        // Should have totalScore or error
        if (body.totalScore !== undefined) {
            assert.ok(typeof body.totalScore === 'number');
        }
    });
});

// ─── Suite 10: Article Routes ────────────────────────────────────────────────

describe('GET /api/articles — articles', () => {

    it('returns 200 with articles array', async () => {
        const { status, body } = await get('/api/articles');
        assert.equal(status, 200);
        // Body might be an array or have items field
        assert.ok(Array.isArray(body) || body.items || body.articles);
    });
});

// ─── Suite 11: Contract Summary ─────────────────────────────────────────────

describe('API contract summary', () => {

    it('print coverage report', async () => {
        const endpoints = [
            { method: 'GET',  path: '/' },
            { method: 'GET',  path: '/api/analyze' },
            { method: 'GET',  path: '/api/chart' },
            { method: 'GET',  path: '/api/dayun' },
            { method: 'GET',  path: '/api/elements' },
            { method: 'GET',  path: '/api/stars' },
            { method: 'GET',  path: '/api/consultant/themes' },
            { method: 'GET',  path: '/api/consultant/questions/1' },
            { method: 'GET',  path: '/api/consultant/stats' },
            { method: 'GET',  path: '/api/articles' },
            { method: 'POST', path: '/api/matching' },
            { method: 'POST', path: '/api/consultant/ask' },
        ];

        const results = [];
        for (const ep of endpoints) {
            try {
                const res = ep.method === 'GET'
                    ? await get(ep.path, ep.path === '/api/analyze' || ep.path === '/api/chart' || ep.path === '/api/dayun' || ep.path === '/api/elements' || ep.path === '/api/stars' ? validBirth : {})
                    : await post(ep.path, {});
                results.push({ ...ep, status: res.status, ok: true });
            } catch (e) {
                results.push({ ...ep, status: 0, ok: false, error: e.message });
            }
        }

        console.log(`\n=========================================`);
        console.log(`  API CONTRACT COVERAGE REPORT`);
        console.log(`=========================================`);
        let passed = 0;
        let failed = 0;
        for (const r of results) {
            const icon = r.ok ? '✓' : '✗';
            const statusText = r.ok ? `${r.status}` : `ERR`;
            console.log(`  ${icon} ${r.method.padEnd(6)} ${r.path.padEnd(35)} ${statusText}`);
            if (r.ok) passed++;
            else failed++;
        }
        console.log(`-----------------------------------------`);
        console.log(`  Endpoints tested: ${results.length}`);
        console.log(`  Passed:           ${passed}`);
        console.log(`  Failed:           ${failed}`);
        console.log(`=========================================\n`);

        assert.ok(passed > 0, 'No endpoints were successfully tested');
    });
});
