# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

E-furniture marketplace (MERN). Two independent npm projects with no root package.json:

- `server/`: Express 4.22 + Mongoose 8 REST API (CommonJS), tested with Jest + Supertest
- `client/`: Create React App (React 18, react-router-dom v6, react-hook-form, axios, react-toastify, Bootstrap/MUI/Tailwind mixed)

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

# UI: http://localhost:3000
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

## Server architecture

`src/server.js` (connect, listen) → `src/app.js` (middleware, routers, error handling) → `src/routes/v1.js` → `src/modules/<feature>/`.

- Each feature module holds `<feature>.model.js`, `.service.js` (all database calls), `.controller.js` (thin handlers wrapped in `utils/asyncHandler`) and `.routes.js` (REST: `GET /`, `POST /`, `GET|PATCH|DELETE /:id`). The cart, address, order and payment modules only have models so far.
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

## Client architecture

- All routes are declared in `client/src/App.js`, which has three areas:
  - Public storefront pages in `src/Components/` and `src/Components/pages/` (Main, Shop, Login, Register, Cart, Customerdashboard, …)
  - Admin dashboard in `src/dashbord/` (sic), nested under `/admindashboard/*` with the `AppDashbord.js` sidebar layout
  - Vendor dashboard in `src/Newdashborad/` (sic), nested under `/Vendordashboard/*`. Its page files often carry an `11` suffix to avoid name clashes with the admin pages.
- There is no API client module or base-URL config. Components call axios directly with hard-coded legacy URLs such as `http://localhost:3550/user/user`. Some leftover calls point at ports 4000/5000 (`/pg/...`, `/cart/...`, `/Bills/...`) that no server here provides.
- The logged-in user is identified only by `localStorage.getItem("_id")`. The CRA client never sends the login cookie, so every protected screen gets 401; it is being replaced by a new client.
