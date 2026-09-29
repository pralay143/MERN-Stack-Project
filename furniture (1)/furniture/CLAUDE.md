# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

E-furniture marketplace (MERN). Independent npm projects with no root package.json:

- `server/`: Express 4.22 + Mongoose 8 REST API (CommonJS), tested with Jest + Supertest
- `web/`: the new client (Vite, React 19, TypeScript, Tailwind 4, TanStack Query, React Router 7), tested with Vitest + Testing Library. Covers the storefront and the seller/admin dashboards.
- `client/`: the old Create React App client (React 18, Bootstrap/MUI/Tailwind mixed). Kept until `web/` also has cart and checkout; don't add features to it.

The git root is two levels up (`MERN-Stack-Project/`), and this project sits under a folder with a space in its name (`furniture (1)/`). Quote paths in shell commands.

The `CLAUDE.md` in `Documents/GitHub/` (an ancestor directory) describes an unrelated .NET project (Agilic API). Ignore it here.

## Commands

```bash
# API: http://localhost:3550 (reads server/.env; copy .env.example first)
cd server && npm install && npm run dev        # nodemon; npm start for plain node
cd server && npm test                          # all tests (in-memory MongoDB, never the local db)
cd server && npx jest tests/v1-routes.test.js  # one file
cd server && npx jest -t "duplicate email"     # tests whose name matches
cd server && npm run seed                      # add missing roles, categories, admin user
cd server && npm run seed:reset                # drop the database, then seed
cd server && npm run seed:demo                 # also 4 brands and 20 products with photos and stock
cd server && npm run check:razorpay            # checks RAZORPAY_KEY_ID/SECRET in .env (never prints the secret)

# New client: http://localhost:5173 (proxies /api and /uploads to the API)
cd web && npm install && npm run dev
cd web && npm test                             # Vitest; API modules are mocked with vi.mock
cd web && npm run typecheck && npm run lint    # tsc -b, oxlint
cd web && npm run build

# Old client: http://localhost:3000
cd client && npm install && npm start
cd client && npm run build
cd client && npm test -- --watchAll=false App  # CRA/Jest (only the default App.test.js exists)
```

The client lints through CRA's `react-app` ESLint config during `npm start`/`build`. The server has no lint script yet.

## Runtime requirements and gotchas

- `server/.env` needs `MONGO_URI` and `JWT_SECRET` (32+ chars); the server exits at startup without them. MongoDB must be reachable (the server exits within 5s otherwise). `.env.example` documents every setting.
- A stale server process can hold port 3550, so a new instance fails with EADDRINUSE while the old one keeps serving. Check with `netstat -ano | findstr :3550`.
- Role ids are fixed in `server/src/seed/seedData.js`. Registration always creates a Customer; only an admin can change a role (PATCH `/api/v1/users/:id`). Registration fails until the roles exist, so run `npm run seed` on a fresh database.
- Money is stored as **integer paise** (`server/src/utils/money.js`). Only the legacy routes convert to and from rupees (`basePrice`).
- Store rules (per-item limit 10, 30 cart lines, free delivery from ₹20,000, otherwise ₹499) live in `server/src/config/shop.js`; `web/src/lib/shop.ts` mirrors them for display only. Keep both in sync.

## Server architecture

`src/server.js` (connect, listen) → `src/app.js` (middleware, routers, error handling) → `src/routes/v1.js` → `src/modules/<feature>/`.

- Each feature module holds `<feature>.model.js`, `.service.js` (all database calls), `.controller.js` (thin handlers wrapped in `utils/asyncHandler`) and `.routes.js` (REST: `GET /`, `POST /`, `GET|PATCH|DELETE /:id`). The order and payment modules only have models so far.
- Cart, addresses and checkout act only on `req.user`'s own data (no ids for another user are accepted; another user's address is a 404). One `Cart` document per user; prices are never stored in it, so it always shows current prices. `Product.stock` limits what can go in a cart (409 with how many are left).
- `GET /api/v1/checkout/summary?addressId=` computes lines, subtotal, delivery and total on the server with `checkout.service.totalsFor`; order creation must reuse it so the total shown is the total charged. It returns `canPlaceOrder` and plain-language `blockers`.
- The REST API lives under `/api/v1` (`/auth/{register,login}`, `/users`, `/products`, `/categories`, …). Responses are `{ message, data }`, and creates return 201.
- `src/legacy/legacy.routes.js` keeps the old URLs the CRA client calls (`/user/user`, `/product/product`, …), mapped onto the same controllers with small adapters for renamed fields. `tests/legacy-routes.test.js` guards that contract. Delete both once a new client replaces the CRA app.
- Errors: throw `utils/ApiError` (or let Mongoose throw). `middleware/errorHandler.js` maps errors to 400/401/403/404/409/413/500 JSON and never sends internals. `utils/ensureFound` turns a null lookup into a 404.
- Route order for writes: guards → upload (if any) → `validate(schema)` → controller, e.g. `router.post('/', ...vendorOrAdmin, ...uploadImage, validate(productSchemas.create), productController.create)`. The legacy router must use the same guards.

## Security model

- **Auth**: `POST /api/v1/auth/login` sets an httpOnly `token` cookie (a JWT with the user id and role, `utils/session.js`); `/auth/logout` clears it; `GET /auth/me` returns the user. In `middleware/auth.js`, `requireAuth` reloads the user from the database on every request, `requireRole('admin', 'vendor')` checks roles, and `adminOnly` / `vendorOrAdmin` are ready-made guard arrays. Clients must send requests with credentials (axios `withCredentials: true`).
- **Ownership** (`utils/ownership.js`, checked in controllers): vendors change only their own products and vendor profile; users read/update only their own account. Controllers set owner fields (`product.user`, `vendor.userId`) from `req.user`, never from the body.
- **Passwords**: hashed with bcrypt by User model hooks. `select: false` plus a toJSON transform keep them out of responses; only login uses `.select('+password')`.
- **Validation**: each module has a `<feature>.validation.js` (Zod; shared rules in `utils/validators.js`). `middleware/validate.js` replaces `req.body` with the parsed result, dropping unknown keys (mass-assignment protection).
- **Hardening** (`middleware/security.js`): Helmet, CORS only for `CORS_ORIGINS` with credentials, 403 for writes whose `Origin` isn't allowlisted, rate limits on login (failed attempts) and registration.
- **Uploads** (`middleware/upload.js`): JPEG/PNG/WebP only, checked by content; `MAX_UPLOAD_MB`; random UUID filenames; stored in `UPLOAD_DIR` (default `server/uploads`) and served at `/uploads/<name>`.
- **Tests**: `tests/access.test.js` discovers every route and requires 401 when anonymous unless the route is on its `PUBLIC` list, and 403 for roles a `requireRole` guard excludes. Add new public routes to that list deliberately. `tests/helpers/auth.js` gives logged-in agents per role; `tests/setup/env.js` sets test-only env (low bcrypt cost, temporary upload folder).

## Web client architecture (`web/`)

- `src/router.tsx` declares every route; pages load lazily. `/shop`, `/products/:id`, `/about`, `/cart`, `/checkout` (login), `/login`, `/register`, `/account`, and `/dashboard/*` (Vendor and Admin; categories, brands and users are Admin only via `RequireAuth roles`).
- `src/api/client.ts` is the one axios instance (`/api/v1`, `withCredentials`), with `errorMessage` / `fieldErrors` / `errorStatus` helpers; `src/api/types.ts` mirrors the API's JSON. Each feature in `src/features/<name>/` has `api.ts` (plain request functions), `hooks.ts` (TanStack Query hooks and query keys) and its components. Mutations invalidate the affected keys (`productKeys`, `categoryKeys`, `brandKeys`).
- The shop's filters live in the URL (`features/products/filters.ts` parses and cleans them); the query key is derived from the parsed filters and uses `keepPreviousData`. `GET /api/v1/products` takes `q`, `category`, `brand`, `seller`, `minPrice`/`maxPrice` (paise), `sort` (`newest`, `price_asc`, `price_desc`, `name`), `page`, `limit` (max 48) and returns `meta: { page, limit, total, pages }`.
- Money: prices are paise everywhere; show them with `formatPaise` and read typed rupees with `rupeesToPaise` (`src/lib/money.ts`).
- Styling: Tailwind tokens in `src/index.css` (`bg-cream`, `text-walnut`, `rounded-card`, …), never raw hex. Shared UI in `src/components/ui/` (`Button`, `TextField`/`SelectField`/`TextAreaField`, `SearchField`, `Skeleton`, `EmptyState`, `Alert`).
- Forms: react-hook-form + zod schemas that repeat the API's limits; `applyServerErrors` puts the API's per-field 400 messages under the inputs.
- Cart: `features/cart` works for visitors and logged-in users alike. Visitors' carts live in localStorage (`guestCart.ts`, ids and quantities only); `useCart()` returns the same `Cart` shape either way. `CartSync` (in `SiteLayout`) merges the browser cart into the account after login/sign-up and sets a `mergeState` flag that checkout waits for.
- `/checkout` needs a login; it reads the server's summary (`features/checkout`) and manages addresses (`features/addresses`, also on `/account`). The Pay button is disabled until Razorpay is connected.
- Tests render with `renderRoute` (`src/test/render.tsx`) and mock a feature's `api.ts` with `vi.mock`.

## Old client architecture (`client/`)

- All routes are declared in `client/src/App.js`, which has three areas:
  - Public storefront pages in `src/Components/` and `src/Components/pages/` (Main, Shop, Login, Register, Cart, Customerdashboard, …)
  - Admin dashboard in `src/dashbord/` (sic), nested under `/admindashboard/*` with the `AppDashbord.js` sidebar layout
  - Vendor dashboard in `src/Newdashborad/` (sic), nested under `/Vendordashboard/*`. Its page files often carry an `11` suffix to avoid name clashes with the admin pages.
- There is no API client module or base-URL config. Components call axios directly with hard-coded legacy URLs such as `http://localhost:3550/user/user`. Some leftover calls point at ports 4000/5000 (`/pg/...`, `/cart/...`, `/Bills/...`) that no server here provides.
- The logged-in user is identified only by `localStorage.getItem("_id")`. The CRA client never sends the login cookie, so every protected screen gets 401; it is being replaced by a new client.
