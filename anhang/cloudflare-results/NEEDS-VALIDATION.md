# Needs Validation — GravelCraft (`wbs-vibecode-checker`)

All 17 records below are source-grounded and independently verified in Phase 5. None are assigned a severity because bounded local execution was blocked on this macOS host (`Darwin 27.3.0 arm64`).

---

## 1. `datasheets-download-sibling-prefix-traversal`
**Title**: Path traversal to sibling directory via missing trailing separator in datasheets download
- **Claimed Root Cause**: `routes/datasheets.js:7` resolves `baseDir` without a trailing `path.sep` and `routes/datasheets.js:15` validates containment with `resolved.startsWith(baseDir)`, which matches any sibling path sharing the `'datasheets'` prefix.
- **Trace**:
  - `entrypoint` `routes/datasheets.js:10` (`router.get('/download')`): Unauthenticated user input is read from `req.query.file`.
  - `propagation` `routes/datasheets.js:14` (`router.get('/download')`): `path.resolve(baseDir, String(file))` resolves `'..'` segments against `baseDir` (`<repo>/datasheets`).
  - `propagation` `routes/datasheets.js:15` (`router.get('/download')`): `resolved.startsWith(baseDir)` succeeds for `<repo>/datasheets-private/supplier-pricing-confidential.txt` because `baseDir` lacks a trailing `path.sep`.
  - `sink` `routes/datasheets.js:21` (`router.get('/download')`): `res.download(resolved)` sends the contents of the out-of-directory file to the unauthenticated caller.
- **Evidence**: `routes/datasheets.js:7`, `routes/datasheets.js:15`, `datasheets-private/supplier-pricing-confidential.txt:1`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: In an isolated sandbox running `server.js`, send `GET /api/datasheets/download?file=../datasheets-private/supplier-pricing-confidential.txt` and confirm HTTP 200 with the confidential supplier pricing file contents.

---

## 2. `db/seed.js:seed:default-credentials-auto-seeded`
**Title**: Application startup automatically seeds hardcoded weak account credentials
- **Claimed Root Cause**: Demo/seed user accounts with known weak passwords are automatically created during application startup rather than restricted to an explicit development-only setup step.
- **Trace**:
  - `entrypoint` `server.js:9` (`startup`): Calls `seed()` unconditionally when `server.js` starts.
  - `propagation` `db/seed.js:38` (`seed`): Inserts `admin@gravelcraft.local` (`'admin123'`), `alice@example.com` (`'alice123'`), and `bob@example.com` (`'bob123'`) into `users`.
  - `sink` `routes/auth.js:24` (`POST /api/auth/login`): Allows unauthenticated visitors to authenticate as the seeded admin or customer accounts using the hardcoded passwords.
- **Evidence**: `server.js:9`, `db/seed.js:38`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start the app against a fresh database in an isolated loopback sandbox and send `POST /api/auth/login` with email `'admin@gravelcraft.local'` and password `'admin123'`, verifying HTTP 200 and issuance of an `auth_token` cookie.

---

## 3. `internal-metrics-ssrf-and-proxy-trust-bypass`
**Title**: Internal metrics endpoint exposed via SSRF loopback chain and vulnerable to local reverse-proxy trust
- **Claimed Root Cause**: `routes/tools.js:24-28` enforces access control on `/internal/metrics` solely via `req.socket.remoteAddress` loopback checks without authentication or proxy-aware isolation, while `POST /api/tools/fetch-spec` allows server-side requests to `127.0.0.1`.
- **Trace**:
  - `entrypoint` `routes/tools.js:7` (`router.post('/api/tools/fetch-spec')`): Authenticated user submits `http://127.0.0.1:3000/internal/metrics` to `POST /api/tools/fetch-spec`.
  - `propagation` `routes/tools.js:16` (`router.post('/api/tools/fetch-spec')`): Server-side `fetch()` connects to local Express server from loopback address `127.0.0.1`.
  - `propagation` `routes/tools.js:26` (`router.get('/internal/metrics')`): `req.socket.remoteAddress` matches `'127.0.0.1'`, bypassing the `'Internal use only'` check.
  - `sink` `routes/tools.js:29` (`router.get('/internal/metrics')`): Endpoint queries `db/connection.js` for `users` and `orders` counts and returns `uptimeSeconds`, `users`, `orders`, `adminContact`, and `dbFile`.
- **Evidence**: `routes/tools.js:25`, `routes/tools.js:31`, `server.js:35`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: In an isolated sandbox running `server.js`, confirm direct non-loopback request to `GET /internal/metrics` returns 403, then chain `POST /api/tools/fetch-spec` with `url='http://127.0.0.1:3000/internal/metrics'` to confirm HTTP 200 with internal metrics returned.
- **Validation Plan (Deployment)**: Verify whether production/staging deploys a local reverse proxy (e.g., nginx) forwarding external paths to Express over `127.0.0.1` without stripping or blocking `/internal/metrics`.

---

## 4. `middleware/cors.js:cors:origin-reflection-credentials`
**Title**: Credentialed CORS reflects arbitrary Origin headers
- **Claimed Root Cause**: `middleware/cors.js` copies `req.headers.origin` directly into `Access-Control-Allow-Origin` with `Access-Control-Allow-Credentials: true` without validating against an allowlist of trusted origins.
- **Trace**:
  - `entrypoint` `server.js:19` (`app.use(cors)`): Global Express middleware invokes `cors(req, res, next)` on every incoming HTTP request.
  - `propagation` `middleware/cors.js:2` (`cors`): Reads untrusted `req.headers.origin` and sets `Access-Control-Allow-Origin` to that value alongside `Access-Control-Allow-Credentials: true` (lines 4-5).
  - `sink` `routes/account.js:9` (`GET /api/account/profile`): Authenticated endpoint returns user `email`, `full_name`, `company_name`, `shipping_address`, and `store_credit` with permissive credentialed CORS headers.
- **Evidence**: `middleware/cors.js:4`, `server.js:19`, `routes/account.js:10`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start the app in an isolated loopback sandbox, send `GET /api/account/profile` with `Origin: https://evil.example` and a valid `auth_token` cookie, and verify the response echoes `Access-Control-Allow-Origin: https://evil.example` and `Access-Control-Allow-Credentials: true` alongside the JSON profile.

---

## 5. `routes/account.js:profile:missing-csrf-protection`
**Title**: Missing CSRF protection on cookie-authenticated state-changing endpoints
- **Claimed Root Cause**: Authentication relies on an ambient cookie without `SameSite` restriction and without per-request CSRF token or `Origin`/`Referer` enforcement on state-changing routes.
- **Trace**:
  - `entrypoint` `server.js:21` (`app.use(optionalAuth)`): Reads `req.cookies.auth_token` in `middleware/auth.js` and populates `req.user` for all routes.
  - `propagation` `routes/account.js:7` (`router.use(requireAuth)`): Authorizes `POST /api/account/profile` solely based on `req.user` derived from the `auth_token` cookie.
  - `sink` `routes/account.js:16` (`POST /api/account/profile`): Updates `users.full_name`, `email`, `shipping_address`, and `company_name` in SQLite without any CSRF check.
- **Evidence**: `services/auth.js:27`, `middleware/auth.js:4`, `routes/account.js:16`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start the app in an isolated loopback sandbox, issue `POST /api/account/profile` with a valid `auth_token` cookie and an untrusted `Origin: https://evil.example` header and no CSRF token, and verify the server returns 200 OK and updates the user's profile.

---

## 6. `routes/auth.js:logout:stateless-jwt-not-revoked`
**Title**: Logout does not invalidate auth_token JWT server-side
- **Claimed Root Cause**: Session termination relies solely on client-side cookie deletion without server-side token revocation or session state tracking.
- **Trace**:
  - `entrypoint` `routes/auth.js:34` (`POST /api/auth/logout`): Calls `clearAuthCookie(res)` without recording token revocation.
  - `propagation` `middleware/auth.js:4` (`optionalAuth`): Accepts replayed `req.cookies.auth_token` and calls `verifyToken(token)` without checking revocation.
  - `sink` `middleware/auth.js:15` (`requireAuth`): Grants authenticated access to protected endpoints for a previously logged-out token.
- **Evidence**: `routes/auth.js:35`, `services/auth.js:18`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start the app in an isolated loopback sandbox, log in via `POST /api/auth/login` to capture `auth_token`, call `POST /api/auth/logout`, then replay the captured `auth_token` cookie to `GET /api/account/profile` and verify it still returns 200 OK.

---

## 7. `routes/orders.js:GET-api-orders-company-report:missing-tenant-authz-company-name`
**Title**: Cross-tenant order disclosure via self-editable companyName in GET /api/orders/company-report
- **Claimed Root Cause**: `POST /api/account/profile` (`routes/account.js:16-22`) allows unverified self-service updates to `users.company_name`, and `GET /api/orders/company-report` (`routes/orders.js:16-23`) treats `users.company_name` as an authoritative tenant boundary.
- **Trace**:
  - `entrypoint` `routes/account.js:17` (`router.post('/profile')`): Authenticated user supplies target `companyName` (e.g., `'Sample Builders'`).
  - `propagation` `routes/account.js:19` (`router.post('/profile')`): Updates `users.company_name` for `req.user.id` without verification.
  - `sink` `routes/orders.js:19` (`router.get('/company-report')`): Queries orders matching `me.company_name` and returns matching order summaries and total.
- **Evidence**: `routes/account.js:19`, `routes/orders.js:17`, `db/seed.js:44`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start the app in an isolated sandbox, authenticate as `alice@example.com`, `POST /api/account/profile` with `companyName: 'Sample Builders'`, then `GET /api/orders/company-report` and confirm Bob Sample's order 1002 is returned.

---

## 8. `routes/orders.js:GET-api-orders-company-report:second-order-sqli-company-name`
**Title**: Second-order SQL injection via companyName in GET /api/orders/company-report
- **Claimed Root Cause**: `GET /api/orders/company-report` (`routes/orders.js:18-20`) interpolates `me.company_name` into a SQL template literal instead of using a parameterized placeholder.
- **Trace**:
  - `entrypoint` `routes/account.js:17` (`router.post('/profile')`): Authenticated user submits arbitrary `companyName` in JSON body.
  - `propagation` `routes/account.js:19` (`router.post('/profile')`): Saves unvalidated `companyName` into `users.company_name`.
  - `propagation` `routes/orders.js:17` (`router.get('/company-report')`): Loads `me.company_name` from `users WHERE id = req.user.id`.
  - `sink` `routes/orders.js:19` (`router.get('/company-report')`): Interpolates `'${me.company_name}'` directly into `SELECT id, customer_name, total_amount, status FROM orders WHERE company_name = '${me.company_name}'`.
- **Evidence**: `routes/account.js:19`, `routes/orders.js:19`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start the app in an isolated sandbox, authenticate as `alice@example.com`, `POST /api/account/profile` with `companyName: "' UNION SELECT id, email, 0, password_hash FROM users--"`, then `GET /api/orders/company-report` and confirm user emails/hashes are returned in `orders`.

---

## 9. `routes/orders.js:GET-api-orders-id:idor-missing-owner-check`
**Title**: IDOR in GET /api/orders/:id allows reading other users' orders
- **Claimed Root Cause**: `GET /api/orders/:id` (`routes/orders.js:25-36`) queries `SELECT * FROM orders WHERE id = ?` using `req.params.id` without an ownership predicate (`AND user_id = ?`) or role check.
- **Trace**:
  - `entrypoint` `routes/orders.js:25` (`router.get('/:id')`): Authenticated request supplies arbitrary `req.params.id` after passing `router.use(requireAuth)` at line 7.
  - `propagation` `routes/orders.js:26` (`router.get('/:id')`): `db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)` fetches any user's order without checking `user_id`.
  - `sink` `routes/orders.js:35` (`router.get('/:id')`): Returns `{ ...order, items }` containing the victim's PII, shipping address, phone, and purchased items.
- **Evidence**: `routes/orders.js:7`, `routes/orders.js:26`, `db/seed.js:44`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start the app in an isolated sandbox, log in as `alice@example.com` (`user_id=2`), request `GET /api/orders/1002` (owned by `user_id=3`, Bob Sample), and confirm HTTP 200 returns Bob Sample's order details and items.

---

## 10. `routes/orders.js:POST-api-orders-checkout:client-controlled-price-quantity`
**Title**: Client-controlled unitPrice and unvalidated quantity in POST /api/orders/checkout
- **Claimed Root Cause**: `POST /api/orders/checkout` (`routes/orders.js:38-57`) trusts `req.body.items[].unitPrice` and `quantity` without server-side product price lookup or positive finite number validation.
- **Trace**:
  - `entrypoint` `routes/orders.js:39` (`router.post('/checkout')`): Reads client-supplied `items` array from `req.body`.
  - `propagation` `routes/orders.js:44` (`router.post('/checkout')`): Computes `total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)` using untrusted client values.
  - `sink` `routes/orders.js:49` (`router.post('/checkout')`): Persists attacker-controlled `total` into `orders.total_amount` and `i.unitPrice`/`i.quantity` into `order_items`.
- **Evidence**: `routes/orders.js:44`, `routes/orders.js:55`, `public/js/shop.js:124`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start the app in an isolated sandbox, authenticate as `alice@example.com`, `POST /api/orders/checkout` with `items: [{productId: 1, quantity: 10, unitPrice: 0.01}]`, and confirm HTTP 201 returns `total: 0.1` and persists the manipulated `total_amount`.

---

## 11. `routes/pages.js:GET:/search:views/search.ejs:xss`
**Title**: Reflected XSS in GET /search via unescaped EJS tag `<%- query %>`
- **Claimed Root Cause**: `views/search.ejs` uses unescaped EJS output (`<%- query %>`) instead of HTML-escaped output (`<%= query %>`) for untrusted `req.query.q`.
- **Trace**:
  - `entrypoint` `routes/pages.js:16` (`router.get('/search')`): Reads untrusted `req.query.q` into `query = String(req.query.q || '')` without HTML encoding.
  - `propagation` `routes/pages.js:22` (`router.get('/search')`): Passes `query` directly to `res.render('search', { title: 'Search', query, products })`.
  - `sink` `views/search.ejs:2` (`template`): Renders `<h1>Search results for "<%- query %>"</h1>` using unescaped EJS output.
- **Evidence**: `routes/pages.js:16`, `views/search.ejs:2`, `server.js:11`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start `server.js` in an isolated sandboxed container, send `GET /search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E`, and confirm the HTTP response body contains unescaped `<script>alert(1)</script>` without a blocking `Content-Security-Policy` header.

---

## 12. `routes/products.js:GET:/api/products:category:sqli`
**Title**: SQL injection in GET /api/products via unparameterized category query parameter
- **Claimed Root Cause**: `routes/products.js` interpolates `req.query.category` into a SQL template literal instead of using a SQLite parameter placeholder (`?`).
- **Trace**:
  - `entrypoint` `routes/products.js:10` (`router.get('/')`): Extracts untrusted `category` from `req.query`.
  - `propagation` `routes/products.js:13` (`router.get('/')`): Interpolates `category` directly into ``db.prepare(`SELECT * FROM products WHERE category = '${category}'`).all()``.
  - `sink` `routes/products.js:17` (`router.get('/')`): Projects rows with `_.pick(p, publicFields)`, which still returns injected `UNION SELECT` values under product field names.
- **Evidence**: `routes/products.js:13`, `routes/products.js:17`, `db/schema.js:15`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start `server.js` in an isolated sandboxed container with seeded SQLite DB and request `GET /api/products?category=%27%20UNION%20SELECT%20id%2Cemail%2Cpassword_hash%2Crole%2Cfull_name%2Cstore_credit%2C0%2Cshipping_address%2C%27%27%20FROM%20users--` to confirm user records are returned in the JSON response.

---

## 13. `routes/vouchers.js:POST-api-vouchers-redeem:toctou-double-redemption`
**Title**: TOCTOU race condition in POST /api/vouchers/redeem allows multi-redemption of a single voucher
- **Claimed Root Cause**: `POST /api/vouchers/redeem` (`routes/vouchers.js:15-26`) performs a non-atomic check-then-act across an `async await` boundary (`verifyWithPartner`) and updates `vouchers` without `WHERE used = 0` or checking affected row count.
- **Trace**:
  - `entrypoint` `routes/vouchers.js:13` (`router.post('/redeem')`): Concurrent authenticated requests submit the same voucher code.
  - `propagation` `routes/vouchers.js:19` (`router.post('/redeem')`): Checks `voucher.used === 1` from an earlier `SELECT` before any state mutation.
  - `propagation` `routes/vouchers.js:23` (`router.post('/redeem')`): Awaits `verifyWithPartner(code)` (50ms `setTimeout`), yielding to concurrent requests.
  - `sink` `routes/vouchers.js:25` (`router.post('/redeem')`): Unconditionally sets `used = 1 WHERE code = ?` and increments `users.store_credit` at line 26 for every concurrent request.
- **Evidence**: `routes/vouchers.js:10`, `routes/vouchers.js:19`, `routes/vouchers.js:25`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start the app in an isolated sandbox, authenticate as `alice@example.com`, send 5 concurrent `POST /api/vouchers/redeem` requests with `{code: 'GRAVEL25'}`, and confirm `store_credit` increases by more than `25.0`.

---

## 14. `server.js:errorHandler:stack-trace-disclosure`
**Title**: Global Express error handler discloses stack traces and internal error messages
- **Claimed Root Cause**: The Express error handler returns raw `err.message` and `err.stack` in HTTP responses instead of logging server-side and returning a generic error payload.
- **Trace**:
  - `entrypoint` `server.js:16` (`app.use(express.json())`): Unauthenticated HTTP request with malformed JSON (or an unhandled route exception) invokes `next(err)`.
  - `propagation` `server.js:37` (`errorHandler`): Express routes the unhandled error to the 4-argument error middleware `(err, req, res, next)`.
  - `sink` `server.js:39` (`errorHandler`): Responds with `res.status(500).json({ error: err.message, stack: err.stack })` to the client.
- **Evidence**: `server.js:39`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start the app in an isolated loopback sandbox, send a `POST` request with `Content-Type: application/json` and invalid JSON body `'{'` to `/api/auth/login`, and verify HTTP 500 JSON contains `'stack'` with server file paths.

---

## 15. `services/auth.js:JWT_SECRET:hardcoded-jwt-secret`
**Title**: Hardcoded weak JWT secret allows arbitrary account impersonation
- **Claimed Root Cause**: `JWT_SECRET` is hardcoded as a weak static string (`'gravel123'`) in source code instead of being loaded from a high-entropy secret configuration.
- **Trace**:
  - `entrypoint` `middleware/auth.js:4` (`optionalAuth`): Reads client-supplied `req.cookies.auth_token` on every request.
  - `propagation` `services/auth.js:22` (`verifyToken`): Verifies the token using hardcoded `JWT_SECRET = 'gravel123'` (line 4) and returns decoded claims directly into `req.user`.
  - `sink` `routes/account.js:9` (`GET /api/account/profile`): Uses `req.user.id` from the forged JWT to read and modify the target user's account.
- **Evidence**: `services/auth.js:4`, `services/auth.js:23`, `middleware/auth.js:7`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start the app in an isolated loopback sandbox, sign an HS256 JWT with payload `{id:1,email:'admin@gravelcraft.local',role:'admin'}` using secret `'gravel123'`, send it as `Cookie: auth_token=<jwt>` to `GET /api/account/profile`, and verify HTTP 200 with `admin@gravelcraft.local`'s profile.

---

## 16. `services/auth.js:hashPassword:unsalted-md5-password-hash`
**Title**: Unsalted MD5 used for password hashing
- **Claimed Root Cause**: Password storage uses an unsalted fast cryptographic hash (MD5) instead of a slow, salted password KDF such as scrypt, bcrypt, or Argon2.
- **Trace**:
  - `entrypoint` `routes/auth.js:7` (`POST /api/auth/register`): Accepts user password in `req.body.password` and passes it to `hashPassword(password)` (line 18).
  - `propagation` `services/auth.js:7` (`hashPassword`): Computes `crypto.createHash('md5').update(String(password)).digest('hex')` without salt.
  - `sink` `routes/auth.js:17` (`POST /api/auth/register`): Persists the unsalted MD5 digest into `users.password_hash` in SQLite.
- **Evidence**: `services/auth.js:7`, `services/auth.js:11`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: Start the app in an isolated loopback sandbox, register a user via `POST /api/auth/register`, and inspect the SQLite `users.password_hash` column to confirm it equals the raw unsalted MD5 hex digest of the password.

---

## 17. `tools-fetch-spec-ssrf-blocklist-bypass`
**Title**: SSRF via naive 'localhost' substring blocklist in POST /api/tools/fetch-spec
- **Claimed Root Cause**: `routes/tools.js:9-14` only checks `/^https?:\/\//i` and `!url.includes('localhost')` before calling `fetch(url)` at line 16, which performs no IP/DNS validation and follows HTTP redirects by default.
- **Trace**:
  - `entrypoint` `routes/tools.js:8` (`router.post('/api/tools/fetch-spec')`): Authenticated user (via `requireAuth` in `middleware/auth.js:15`) supplies `req.body.url`.
  - `propagation` `routes/tools.js:12` (`router.post('/api/tools/fetch-spec')`): Case-sensitive substring check `!url.includes('localhost')` passes for `http://127.0.0.1:3000/...`, `http://[::1]:3000/...`, private IPs, and external redirectors.
  - `sink` `routes/tools.js:16` (`router.post('/api/tools/fetch-spec')`): `fetch(url, { signal: AbortSignal.timeout(5000) })` issues the server-side HTTP request and returns `response.status` and `body.slice(0, 5000)` at line 18.
- **Evidence**: `routes/tools.js:9`, `routes/tools.js:12`, `routes/tools.js:16`
- **Blockers**: macOS host lacks OS-enforced isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory/process/disk limits.
- **Validation Plan (Local)**: In an isolated sandbox running `server.js`, authenticate a user and `POST /api/tools/fetch-spec` with `url='http://127.0.0.1:3000/internal/metrics'` (and `url='http://LOCALHOST:3000/internal/metrics'`) to confirm HTTP 200 with the internal metrics payload returned in `spec`.
