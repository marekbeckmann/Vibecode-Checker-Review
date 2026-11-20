# Security Audit Report — GravelCraft (`wbs-vibecode-checker`)

## 1. Run Metadata & Scope
- **Run ID**: `run-1`
- **Profile**: `standard`
- **Scope**: Full repository (`---REDACTED---`)
- **Budget**: Unset (`null`)
- **Source Ref**: `nogit-2026-11-20` (not a Git repository)
- **Prior Runs**: None (`prior_status: "none"` on all 12 coverage units)
- **Execution Policy**: `sandboxed-source-and-local-only`
- **Local Execution Limitation**: On this macOS host (`Darwin 27.3.0 arm64`), required OS-enforced sandbox controls (isolated loopback network namespace, read-only target/toolchain mounts, and per-sandbox memory, process, and disk limits) cannot be enforced. Per audit policy, no target-controlled code (`server.js`, `db/seed.js`) was executed. Consequently, **0** findings are marked `confirmed`, and **17** source-verified boundary issues are classified as `needs_validation` with exact bounded local (and deployment) validation plans.

## 2. Security Posture Summary
Source inspection of the GravelCraft Express + EJS + SQLite e-commerce application identified **17 source-grounded boundary issues** across authentication/session management, injection, access control, business logic, file handling, SSRF, CORS/CSRF, and error disclosure. All 17 leads were independently verified against repository source in Phase 5 and await bounded local execution in a full OS-enforced sandbox (e.g., Linux container/namespace sandbox) to promote to `confirmed`.

## 3. Confirmed Findings
None (`0` confirmed records). Local execution was blocked by missing OS-enforced sandbox controls on this host.

## 4. Needs Validation Leads
All 17 leads below were independently verified against source. No severity is assigned until bounded local execution confirms the runtime effect.

| Title | Repository Trace | Blocker | Bounded Local / Deployment Next Step |
|---|---|---|---|
| Path traversal to sibling directory via missing trailing separator in datasheets download | `routes/datasheets.js:10` -> `:14` -> `:15` -> `:21` | Missing OS sandbox controls on macOS | Local: `GET /api/datasheets/download?file=../datasheets-private/supplier-pricing-confidential.txt` in isolated sandbox |
| Application startup automatically seeds hardcoded weak account credentials | `server.js:9` -> `db/seed.js:38` -> `routes/auth.js:24` | Missing OS sandbox controls on macOS | Local: Start against fresh DB in sandbox and `POST /api/auth/login` with `admin@gravelcraft.local` / `admin123` |
| Internal metrics endpoint exposed via SSRF loopback chain and vulnerable to local reverse-proxy trust | `routes/tools.js:7` -> `:16` -> `:26` -> `:29` | Missing OS sandbox controls on macOS | Local: Chain `POST /api/tools/fetch-spec` to `http://127.0.0.1:3000/internal/metrics`; Deployment: verify proxy strips `/internal/metrics` |
| Credentialed CORS reflects arbitrary Origin headers | `server.js:19` -> `middleware/cors.js:2` -> `routes/account.js:9` | Missing OS sandbox controls on macOS | Local: Send `GET /api/account/profile` with `Origin: https://evil.example` and `auth_token` cookie |
| Missing CSRF protection on cookie-authenticated state-changing endpoints | `server.js:21` -> `routes/account.js:7` -> `:16` | Missing OS sandbox controls on macOS | Local: Send `POST /api/account/profile` with `auth_token` cookie, untrusted `Origin`, and no CSRF token |
| Logout does not invalidate auth_token JWT server-side | `routes/auth.js:34` -> `middleware/auth.js:4` -> `:15` | Missing OS sandbox controls on macOS | Local: Capture `auth_token` at login, call `POST /api/auth/logout`, replay cookie to `GET /api/account/profile` |
| Cross-tenant order disclosure via self-editable companyName in GET /api/orders/company-report | `routes/account.js:17` -> `:19` -> `routes/orders.js:19` | Missing OS sandbox controls on macOS | Local: `POST /api/account/profile` with `companyName: 'Sample Builders'`, then `GET /api/orders/company-report` |
| Second-order SQL injection via companyName in GET /api/orders/company-report | `routes/account.js:17` -> `:19` -> `routes/orders.js:17` -> `:19` | Missing OS sandbox controls on macOS | Local: Set `companyName` to `UNION SELECT` payload via `/api/account/profile`, then `GET /api/orders/company-report` |
| IDOR in GET /api/orders/:id allows reading other users' orders | `routes/orders.js:25` -> `:26` -> `:35` | Missing OS sandbox controls on macOS | Local: Log in as `alice@example.com` (`user_id=2`) and request `GET /api/orders/1002` (`user_id=3`) |
| Client-controlled unitPrice and unvalidated quantity in POST /api/orders/checkout | `routes/orders.js:39` -> `:44` -> `:49` | Missing OS sandbox controls on macOS | Local: `POST /api/orders/checkout` with `items: [{productId: 1, quantity: 10, unitPrice: 0.01}]` |
| Reflected XSS in GET /search via unescaped EJS tag `<%- query %>` | `routes/pages.js:16` -> `:22` -> `views/search.ejs:2` | Missing OS sandbox controls on macOS | Local: Request `GET /search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E` and inspect unescaped HTML |
| SQL injection in GET /api/products via unparameterized category query parameter | `routes/products.js:10` -> `:13` -> `:17` | Missing OS sandbox controls on macOS | Local: Request `GET /api/products?category=' UNION SELECT ... FROM users--` |
| TOCTOU race condition in POST /api/vouchers/redeem allows multi-redemption of a single voucher | `routes/vouchers.js:13` -> `:19` -> `:23` -> `:25` | Missing OS sandbox controls on macOS | Local: Send 5 concurrent `POST /api/vouchers/redeem` requests for `GRAVEL25` and check `store_credit` |
| Global Express error handler discloses stack traces and internal error messages | `server.js:16` -> `:37` -> `:39` | Missing OS sandbox controls on macOS | Local: Send malformed JSON `{` to `POST /api/auth/login` and verify HTTP 500 JSON contains `stack` |
| Hardcoded weak JWT secret allows arbitrary account impersonation | `middleware/auth.js:4` -> `services/auth.js:22` -> `routes/account.js:9` | Missing OS sandbox controls on macOS | Local: Sign HS256 JWT with secret `'gravel123'` for `admin@gravelcraft.local` and call `GET /api/account/profile` |
| Unsalted MD5 used for password hashing | `routes/auth.js:7` -> `services/auth.js:7` -> `routes/auth.js:17` | Missing OS sandbox controls on macOS | Local: Register via `POST /api/auth/register` and verify `users.password_hash` equals raw MD5 hex |
| SSRF via naive 'localhost' substring blocklist in POST /api/tools/fetch-spec | `routes/tools.js:8` -> `:12` -> `:16` | Missing OS sandbox controls on macOS | Local: `POST /api/tools/fetch-spec` with `url: 'http://127.0.0.1:3000/internal/metrics'` |

See [NEEDS-VALIDATION.md](NEEDS-VALIDATION.md) for full traces, verified evidence, and validation plans.

## 5. Hardening Notes & Positive Patterns

### Hardening Notes
- `services/auth.js:27`: `setAuthCookie` omits `httpOnly: true`, `secure: true`, and `sameSite`.
- `services/auth.js:23`: `verifyToken` does not pin `algorithms: ['HS256']` or validate `iss`/`aud` claims.
- `routes/auth.js`: Lacks rate limiting/brute-force protection on `/api/auth/login` and password length/complexity enforcement on `/api/auth/register`.
- `views/partials/header.ejs:8`: Loads `https://code.jquery.com/jquery-3.3.1.min.js` without Subresource Integrity (`integrity`), and `server.js` sets no Content-Security-Policy header.
- `package.json:19` & `package-lock.json`: Pins `lodash 4.17.15` (known prototype-pollution CVEs, though only `_.pick` on SQLite row objects in `routes/products.js:17,25` is used); upgrade to `>=4.17.21`.
- `public/js/shop.js:89-95`: Does not clear `localStorage.getItem('cart')` on logout.
- `gravel-store.zip`: Present at repo root; unreferenced by runtime code.

### Positive Source Patterns
- `GET /api/orders` (`routes/orders.js:9-14`), `GET/POST /api/account/profile` (`routes/account.js:10,18`), `GET /api/products/:id` (`routes/products.js:21`), and `routes/pages.js` routes use parameterized SQLite queries (`?`).
- `public/js/shop.js` uses `textContent` rather than `innerHTML` for dynamic DOM updates.
- `routes/datasheets.js:18` checks `fs.statSync(resolved).isFile()` before `res.download`.
- `routes/tools.js:16,18` applies a 5000ms `AbortSignal.timeout` and slices response bodies to 5000 characters.
- `server.js:42` defaults `HOST` to `'127.0.0.1'` when unset.

## 6. Coverage Summary
- **Total coverage units**: `12` (`candidate`: `12`, `covered`: `0`, `blocked`: `0`, `deferred`: `0`, `out_of_scope`: `0`)
- **Post-wave coverage critic**: `stop: true` (0 missing units, 0 reassignments)
- **Final-clean coverage critic**: `stop: true` (0 missing units, 0 reassignments)
- **Rejected candidates**: `1` (`views/partials/header.ejs:script:jquery-3.3.1:missing-sri` — reclassified as a defense-in-depth hardening note).
