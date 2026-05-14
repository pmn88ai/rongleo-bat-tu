# SECURITY SCAN REPORT — TASK-029 / Prompt 0.2

> Target: `backendjs/src/` + `backendjs/server.js`
> Scan date: 2026-05-14
> Method: Static code analysis (manual + semi-automated)
> Rules: Không sửa code, không refactor

---

## Fix Status

| Issue | Status | Fixed By |
|-------|--------|----------|
| SQL Injection — `que.routes.js:349` | ✅ **FIXED** — allowlist validation added | TASK-029 / Prompt 0.3 |
| Gender Bug — `consultant.routes.js:83,103` | ✅ **FIXED** — `parseGender()` helper added | TASK-029 / Prompt 0.3 |
| Gender Bug — `bazi.routes.js:516` | ✅ **FIXED** — `parseGender()` helper added | TASK-029 / Prompt 0.3 |
| Hardcoded admin credentials — `database.service.js:345-362` | ✅ **FIXED** — env-driven bootstrap | TASK-029 / Prompt 0.4 |
| No-auth bypass — `middleware/auth.js` | ✅ **FIXED** — production-locked, only works in dev | TASK-029 / Prompt 0.4 |

## Auth Bootstrap Flow (Updated)

**Previous (UNSAFE)**: Two hardcoded admin accounts with trivially crackable SHA256("admin") hash were auto-created on every fresh database. Hash: `8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918` = SHA256("admin").

**Current (SAFE)**:
1. On server start, `database.service.js` checks for `ADMIN_USERNAME` + `ADMIN_PASSWORD_HASH` env vars.
2. If both are set AND admin doesn't exist in DB → one admin account is created.
3. If env vars are missing → admin bootstrap is **skipped gracefully** with a warning log.
4. No hardcoded credentials exist in source code.

### Production Safety Notes

| Aspect | Dev (`NODE_ENV=development`) | Production (`NODE_ENV=production`) |
|--------|:---------------------------:|:----------------------------------:|
| `x-user-id` header bypass | ✅ Allowed | ❌ Rejected (401) |
| Admin routes | ✅ 403 (disabled intentionally) | ❌ 403 (disabled) |
| Admin bootstrap from env | ✅ Works if vars set | ✅ Works if vars set |
| Insecure defaults | None | None |
| Credentials in source | None | None |

### Env Requirements

```env
# Required for production
NODE_ENV=production

# Optional — only for bootstrap
ADMIN_USERNAME=admin@yourdomain.com
ADMIN_PASSWORD_HASH=<sha256_hex_of_password>
ADMIN_NAME=Administrator
```

---

## Critical Issues

| File | Line | Issue | Risk | Suggested Fix |
|------|------|-------|:----:|---------------|
| `routes/que.routes.js` | 346-353 | **SQL Injection** — String interpolation của `type` parameter vào SQL query: `metadata LIKE '%"queType":"${type}"%'`. `type` lấy từ `req.query.type` (user-controlled) không qua sanitize. | 🔴 | Dùng parameterized query. Nếu `type` là enum cố định, validate nó trước. |
| `services/database.service.js` | 345-362 | **Hardcoded admin credentials** — 2 admin accounts hardcoded với SHA256 hash `8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918`. Hash này = SHA256("admin") — trivially reversible. | 🔴 | Move credentials to env vars or a secure config file. Use bcrypt instead of SHA256. |
| `server.js` | 13 | **Commented-out route có thể bị lãng quên** — `// const dailyRoutes = require('./src/routes/daily.routes');` — nếu file daily.routes.js tồn tại và route được uncomment trong tương lai mà không có auth, có thể gây lỗ hổng. | 🔴 | Clean up dead code hoặc ensure daily routes file không tồn tại. |

## High Issues

| File | Line | Issue | Risk | Suggested Fix |
|------|------|-------|:----:|---------------|
| `middleware/auth.js` | 8-14 | **NO-AUTH bypass** — `authenticateToken` gán `req.user.id = req.headers['x-user-id'] || 'anonymous'` — **bất kỳ ai cũng có thể tự đặt user ID qua HTTP header**. | 🟠 | Không cần fix trong no-auth mode (đây là intentional design). Ghi rõ trong docs là no-auth mode và security implications. |
| `routes/auth.routes.js` | 12-18 | **NO-AUTH bypass (duplicate)** — authMiddleware duplicate trong auth.routes.js | 🟠 | Code smell: duplicate middleware. Dùng shared middleware từ 1 file. |
| `routes/admin.routes.js` | 12-13 | **adminMiddleware always returns 403** — admin routes permanently disabled. Nếu sau này enable mà quên thêm auth, toàn bộ admin panel sẽ public. | 🟠 | Khi re-enable admin, require proper JWT verification + role check. |
| `routes/consultant.routes.js` | 260-270 | **History endpoint không có auth** — `/api/consultant/history/:customerId` — bất kỳ ai biết customerId đều xem được lịch sử tư vấn. | 🟠 | Bind history lookup to user ID (owner-only). |
| `routes/bazi.routes.js` | 19-31 | **Every request creates a DB customer** — Mỗi request API /analyze đều gọi `dbService.createNewCustomer()` — không có rate limit riêng cho endpoint này (chỉ general limiter 500/15min). Dễ bị spam DB. | 🟠 | Apply stricter rate limit on /api/analyze hoặc giới hạn DB writes. |

## Medium Issues

| File | Line | Issue | Risk | Suggested Fix |
|------|------|-------|:----:|---------------|
| `server.js` | 49 | **CORS wide open** — `app.use(cors())` cho phép tất cả origins, methods, headers. | 🟡 | Restrict CORS to known origins (production domain). |
| `server.js` | 50 | **Large JSON body limit** — `express.json({ limit: '5mb' })` — cho phép payload lớn, dễ bị DoS qua memory exhaustion. | 🟡 | Reduce limit to 1MB hoặc implement size validation trước parse. |
| `server.js` | 54 | **Trust proxy enabled** — `app.set('trust proxy', true)` — trust tất cả proxies, có thể bị IP spoofing nếu không đứng sau reverse proxy thật. | 🟡 | Set specific trust proxy (e.g., `trust proxy: ['loopback', 'linklocal', 'uniquelocal']`) hoặc config IP of actual proxy. |
| `routes/que.routes.js` | 33-37 | **Weak contextId generation** — `generateContextId` dùng birth params để tạo ID deterministic. Nếu attacker đoán được params của user khác, có thể xem được quẻ của họ. | 🟡 | Include userId hoặc session token trong contextId. |
| `services/database.service.js` | 11 | **Hardcoded DB path** — `DB_PATH` hardcoded, không dùng env var. | 🟡 | Make DB path configurable via env var. |
| `services/database.service.js` | 1037-1057 | **approveCreditRequest / rejectCreditRequest không validate admin** — trong no-auth mode không thành vấn đề, nhưng sẽ critical nếu admin mode được bật. | 🟡 | Needs manual review when re-enabling admin. |
| `server.js` | 19 | **Unsafe default port** — `PORT = process.env.PORT || 8888` — mặc định dùng port 8888 nếu không có env. Không phải security issue trực tiếp nhưng có conflict risk. | 🟡 | Document required env vars clearly. |
| `services/groq.service.js` | 13 | **API key from env** — `process.env.GROQ_API_KEY`. Nếu env không được set, error message có thể leak key path. | 🟡 | Add guard: "GROQ_API_KEY is not configured" message ổn. Key không bị leak. OK để nguyên. |

## Low Issues

| File | Line | Issue | Risk | Suggested Fix |
|------|------|-------|:----:|---------------|
| `routes/consultant.routes.js` | 74,103 | **Gender parsing logic** — `g.startsWith('n') && !g.includes('am') || g.includes('female') || g.includes('nữ')` — logic phức tạp dễ sai. Nếu ai đó gửi `gender: "Nam"` thì `g.startsWith('n')` = true → isFemale = true (BUG!). | 🟢 | Fix gender parsing: dùng lowercase so sánh exact match. |
| `routes/bazi.routes.js` | 13-14 | **No input validation** — year/month/day không được validate range. Year có thể là bất kỳ số nào (âm, quá lớn). | 🟢 | Add year range validation (1900-2100), month (1-12), day (1-31), hour (0-23). |
| `server.js` | 141-144 | **Generic error handler** — `res.status(500).json({ error: err.message })` — trả error message ra client. Có thể leak internal implementation. | 🟢 | Don't expose err.message in production. Use generic message. |
| `routes/articles.routes.js` | — | **Cần check articles routes** — cần manual review articles endpoints for auth. | 🟢 | Review articles.routes.js. |
| `services/database.service.js` | 358 | **Insert with raw values** — `INSERT INTO users (email, password_hash, name, credits, is_admin) VALUES (?, ?, ?, 9999, 1)` — hardcoded credit value 9999. | 🟢 | Make credits configurable. |

## Safe Areas

| File | Lines | Reason |
|------|-------|--------|
| `services/groq.service.js` | 13 | API key loaded from `process.env.GROQ_API_KEY` — đúng cách. |
| `services/openrouter.service.js` | 10-11 | API key + model loaded from env — đúng cách. |
| `services/cache.service.js` | All | Dùng LRU cache in-memory — không có security issue. |
| `server.js` | 47-48 | Helmet + compression — security headers đúng. |
| `server.js` | 22-44 | Rate limiting 3 tầng — general, auth, AI limiter well configured. |
| `services/database.service.js` | 53-97 | `run()`, `get()`, `all()` dùng parameterized queries (`?` placeholders) — safe from SQL injection trong các method chính. |
| `services/database.service.js` | 37 | WAL mode enabled — performance, không security issue. |
| `services/bazi.service.js` | All | Pure calculation logic, không có I/O nguy hiểm. |
| `services/que.service.js` | All | Uses parameterized queries for DB operations. |
| `routes/auth.routes.js` | 37-41 | Login/register endpoints trả về 200 với dummy message — intentional no-auth mode design. |

## SQL Injection Deep Dive

**Vulnerable code** (`que.routes.js:346-353`):

```js
const query = `
    SELECT id, answer, metadata, created_at 
    FROM consultations 
    WHERE user_id = ? AND theme_id = 'xin_que' 
    AND metadata LIKE '%"queType":"${type}"%'
    ORDER BY created_at DESC 
    LIMIT ?
`;

const results = await database.all(query, [userId, parseInt(limit)]);
```

**Problem**: `type` comes from `req.query.type`. Although `limit` uses parameterized `?`, the `type` is directly interpolated into the SQL string. An attacker could send:
- `/api/que/timeline?type="; DELETE FROM consultations;--`
- `/api/que/timeline?type=" UNION SELECT ...`

**Note**: `database.all()` internally uses `sqlite3`. SQLite does support multiple statements, but `db.all()` will only return results from the first statement. However, a tautology injection like `" OR 1=1 --` could leak all que data for all users.

**Mitigation**: Validate `type` against a whitelist: `['daily', 'monthly', 'yearly']` before using in query, OR use parameterized query for all values.

## Gender Parsing Bug

**Vulnerable code** (`consultant.routes.js:83`):
```js
const g = (gender || '').toLowerCase();
const isFemale = g.startsWith('n') && !g.includes('am') || g.includes('female') || g.includes('nữ') || g.includes('nư');
```

**Bug**: Operator precedence issue. This evaluates as:
```
(g.startsWith('n') && !g.includes('am')) || g.includes('female') || ...
```

So if `gender = "Nam"`:
- `g.startsWith('n')` = true
- `!g.includes('am')` = true (does NOT include 'am')
- **Result: isFemale = true** ← BUG! Nam should be male.

**Impact**: All users with `gender: "Nam"` will be treated as female, potentially affecting gender-specific BaZi calculations (Đại Vận direction, etc.).

The same logic exists in `bazi.routes.js:516`.

## Recommended Fix Order

1. **Fix SQL Injection** — `que.routes.js:346-353` — đây là critical active vulnerability, attacker có thể đọc/tấn công DB ngay lập tức.
2. **Fix Gender Parsing Bug** — `consultant.routes.js:83`, `bazi.routes.js:516` — ảnh hưởng đến core business logic, Nam bị tính thành Nữ.
3. **Remove hardcoded admin credentials** — `database.service.js:345-362` — critical cho production deployment.
4. **Add input validation** — validate year/month/day/hour range ở tất cả endpoints.
5. **Restrict CORS** — từ `*` sang whitelist domain.
6. **Reduce JSON body limit** — từ 5MB xuống 1MB.
7. **Fix history endpoint** — `consultant.routes.js:260-270` — add ownership check.
8. **Clean up dead code** — commented-out routes, duplicate middleware.

## Next Prompt Recommendation

**Prompt để fix issue quan trọng nhất (SQL Injection + Gender Bug):**

> "Open `backendjs/src/routes/que.routes.js`. Tìm SQL injection ở lines 346-353: `metadata LIKE '%"queType":"${type}"%'`. Fix bằng cách validate `type` parameter against whitelist `['daily', 'monthly', 'yearly']` trước khi dùng trong query. Nếu type không hợp lệ, trả về 400 error.
>
> Sau đó, open `backendjs/src/routes/consultant.routes.js`. Tìm gender parsing bug ở line 83: `const isFemale = g.startsWith('n') && !g.includes('am') || g.includes('female') || g.includes('nữ')`. Fix operator precedence bằng cách thêm parentheses hoặc dùng exact match: `['nữ', 'female', 'nu'].includes(g)`. Cùng logic ở `bazi.routes.js:516`.
>
> Chỉ sửa 2 file này. Không sửa gì khác."
