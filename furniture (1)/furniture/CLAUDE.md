# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

E-furniture marketplace (MERN). Two independent npm projects with no root package.json:

- `server/`: Express 4 + Mongoose 6 REST API (CommonJS, plain `node`, no nodemon)
- `client/`: Create React App (React 18, react-router-dom v6, react-hook-form, axios, react-toastify, Bootstrap/MUI/Tailwind mixed)

The git root is two levels up (`MERN-Stack-Project/`), and this project sits under a folder with a space in its name (`furniture (1)/`). Quote paths in shell commands.

The `CLAUDE.md` in `Documents/GitHub/` (an ancestor directory) describes an unrelated .NET project (Agilic API). Ignore it here.

## Commands

```bash
# API: http://localhost:3550
cd server && npm install && node app.js

# UI: http://localhost:3000
cd client && npm install && npm start
cd client && npm run build
cd client && npm test                            # CRA/Jest watch mode (only the default App.test.js exists)
cd client && npm test -- --watchAll=false App    # single run, filtered by filename
```

The server has no tests and no lint script. The client lints through CRA's `react-app` ESLint config during `npm start`/`build`.

## Runtime requirements and gotchas

- MongoDB must be running at `mongodb://127.0.0.1:27017/database` (hard-coded in `server/app.js`; there is no `.env`). Start MongoDB **before** the API. If the first connection fails, Mongoose does not retry, and every query then times out after about 10s with its buffering error. The controllers report that as `"error in adding X..."` / 404. When you see this, restart the server and confirm it logs `db connected successfully.....`.
- A stale `node app.js` can hold port 3550, so a new instance fails with EADDRINUSE while the old one keeps serving. Check with `netstat -ano | findstr :3550`.
- The `role` collection must contain the IDs hard-coded in `client/src/Components/pages/Register.js`: Customer `646afa59a201bba44448c945`, Vendor `646afa4fa201bba44448c943`. Login uses `populate('role')` and redirects on `role.name` (`Customer` / `Vendor` / `Admin`), so a missing role document produces `role: null`.

## Server architecture

`app.js` → `routes/<entity>Routes.js` → `controller/<entity>Controller.js` → `schema/<entity>Schema.js` (Mongoose model).

- Each router is mounted at `/<entity>`, and the routes inside repeat the entity name, so URLs look like `/user/user`, `/user/user/:id`, `/user/user/login`, `/product/product`, `/category/category`. Other mounts: `/Brand`, `/vendor` (vendor_detail), `/vproduct` (vendor_product), `/upload` (multer).
- Controllers use Mongoose **callback** APIs (`save(cb)`, `find().exec(cb)`), which Mongoose 7+ removes, so don't upgrade Mongoose without rewriting them. Responses are `{ message, data }`; errors are usually returned as 404 regardless of cause.
- Models are registered with lowercase singular names (`'user'`, `'role'`, …), and refs use those names.
- Several schemas (cart, order, payment, feedback, etc.) have no routes yet.
- File uploads: `multer` disk storage writes to `server/uploads/` using the original filename (field name `file`). `app.js` doesn't serve that folder statically.
- Auth is plain email+password lookup (passwords stored in plaintext). There are no tokens; the client stores the user's `_id` in `localStorage` under the key `_id`.

## Client architecture

- All routes are declared in `client/src/App.js`, which has three areas:
  - Public storefront pages in `src/Components/` and `src/Components/pages/` (Main, Shop, Login, Register, Cart, Customerdashboard, …)
  - Admin dashboard in `src/dashbord/` (sic), nested under `/admindashboard/*` with the `AppDashbord.js` sidebar layout
  - Vendor dashboard in `src/Newdashborad/` (sic), nested under `/Vendordashboard/*`. Its page files often carry an `11` suffix to avoid name clashes with the admin pages.
- There is no API client module or base-URL config. Components call axios directly with hard-coded URLs such as `http://localhost:3550/user/user`. Some leftover calls point at ports 4000/5000 (`/pg/...`, `/cart/...`, `/Bills/...`) that no server here provides.
- The logged-in user is identified only by `localStorage.getItem("_id")`.
