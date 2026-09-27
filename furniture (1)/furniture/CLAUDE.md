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

- MongoDB must be running at `MONGO_URI` (from `server/.env`) before the API starts. The server exits within 5s if it can't connect.
- A stale server process can hold port 3550, so a new instance fails with EADDRINUSE while the old one keeps serving. Check with `netstat -ano | findstr :3550`.
- Role ids are fixed in `server/src/seed/seedData.js`. Customer `646afa59a201bba44448c945` and Vendor `646afa4fa201bba44448c943` are also hard-coded in `client/src/Components/pages/Register.js`, so keep them in sync. Login redirects on `role.name` (`Customer` / `Vendor` / `Admin`).
- Money is stored as **integer paise** (`server/src/utils/money.js`). Only the legacy routes convert to and from rupees (`basePrice`).

## Server architecture

`src/server.js` (connect, listen) → `src/app.js` (middleware, routers, error handling) → `src/routes/v1.js` → `src/modules/<feature>/`.

- Each feature module holds `<feature>.model.js`, `.service.js` (all database calls), `.controller.js` (thin handlers wrapped in `utils/asyncHandler`) and `.routes.js` (REST: `GET /`, `POST /`, `GET|PATCH|DELETE /:id`). The cart, address, order and payment modules only have models so far.
- The REST API lives under `/api/v1` (`/auth/{register,login}`, `/users`, `/products`, `/categories`, …). Responses are `{ message, data }`, and creates return 201.
- `src/legacy/legacy.routes.js` keeps the old URLs the CRA client calls (`/user/user`, `/product/product`, …), mapped onto the same controllers with small adapters for renamed fields. `tests/legacy-routes.test.js` guards that contract. Delete both once a new client replaces the CRA app.
- Errors: throw `utils/ApiError` (or let Mongoose throw). `middleware/errorHandler.js` maps errors to 400/401/404/409/500 JSON and never sends internals. `utils/ensureFound` turns a null lookup into a 404.
- Uploads: `middleware/upload.js` (multer, field `file`). Product images go to `client/public/uploads` (the CRA client shows them from `/uploads/<name>`); other uploads go to `server/uploads`. Files keep their original names.
- No authentication yet: every route is public, passwords are stored in plaintext, and login returns an array of matching users. The client stores the user's `_id` in `localStorage` under `_id`.

## Client architecture

- All routes are declared in `client/src/App.js`, which has three areas:
  - Public storefront pages in `src/Components/` and `src/Components/pages/` (Main, Shop, Login, Register, Cart, Customerdashboard, …)
  - Admin dashboard in `src/dashbord/` (sic), nested under `/admindashboard/*` with the `AppDashbord.js` sidebar layout
  - Vendor dashboard in `src/Newdashborad/` (sic), nested under `/Vendordashboard/*`. Its page files often carry an `11` suffix to avoid name clashes with the admin pages.
- There is no API client module or base-URL config. Components call axios directly with hard-coded legacy URLs such as `http://localhost:3550/user/user`. Some leftover calls point at ports 4000/5000 (`/pg/...`, `/cart/...`, `/Bills/...`) that no server here provides.
- The logged-in user is identified only by `localStorage.getItem("_id")`.
