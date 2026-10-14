# ITI Apprenticeship & Trade Job Matching Portal

React/Vite client and Express/Mongoose API for student, employer, and admin
workflows.

Authentication and password-recovery throttles currently keep counters in
process memory. They are suitable only for a single API instance; use a shared
rate-limit store or an upstream gateway when deploying multiple instances.

## Local development

Prerequisites: Node.js 22 or newer, Bun 1.3 or newer, and MongoDB (local or
Atlas).

1. Install the client and server dependencies:

   ```powershell
   cd client
   bun install
   cd ..\server
   bun install
   ```

2. Configure the server environment in `server/.env` using the variable names
   listed below. Keep the file private and do not commit it.
3. Start the API:

   ```powershell
   cd server
   npm run dev
   ```

4. In another terminal, start the frontend:

   ```powershell
   cd client
   npm run dev
   ```

The development API defaults to `http://localhost:5000/api`.

## Environment variables

Server:

- `MONGODB_URI`
- `JWT_SECRET` (at least 32 characters)
- `PORT` (optional; defaults to 5000)
- `NODE_ENV` (`production` in production)
- `CORS_ORIGINS` (comma-separated allowed frontend origins; required in production)
- `RESEND_API_KEY`
- `RESET_EMAIL_FROM` (verified Resend sender)
- `CLIENT_ORIGIN` (frontend origin used in password-reset email links)
- `RESUME_STORAGE_DIR` (optional path for private resume files; defaults to
  `server/private/resumes`)

Client build:

- `VITE_API_BASE_URL` (API base URL ending in `/api`; if omitted in production,
  the client uses same-origin `/api`, which requires a reverse proxy to the API)

Ordinary signup and login do not require email OTP. Password recovery uses
Resend; reset links expire after 15 minutes and reset tokens are stored as
SHA-256 hashes. Set `CLIENT_ORIGIN` to the deployed HTTPS client origin and
include that exact origin in `CORS_ORIGINS`.

Resume uploads accept PDF and DOCX files up to 5 MB. File contents are stored
outside the public web root; MongoDB stores the filename, private storage key,
content type, and size. Configure `RESUME_STORAGE_DIR` to a durable, private
volume in production, back it up securely, and ensure all API instances can
access it. Never expose this directory through static hosting.

## Checks

```powershell
cd client
npm run build
npm run lint
bun audit
cd ..\server
bun audit
Get-ChildItem .\src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

The automated checks do not create or modify database records. End-to-end
workflow verification requires a configured MongoDB and accounts created
through the normal application/admin process.

## Deployment

1. Deploy the API with `npm start`, Node.js 22 or newer, and the server
   environment variables above. Use a production-strength, private
   `JWT_SECRET`; configure MongoDB Atlas network access and a least-privilege
   database user.
2. Configure Resend with a verified sender and set `RESEND_API_KEY`,
   `RESET_EMAIL_FROM`, and `CLIENT_ORIGIN`. These settings are required by the
   server's production startup validation.
3. Set `CORS_ORIGINS` to the exact HTTPS frontend origin(s).
4. In Vercel, set the project Root Directory to `client` so Vercel uses the
   client build and `client/vercel.json`. Keep the Vite build output directory
   as `dist`.
5. Build the client with `VITE_API_BASE_URL` set to the public API base URL
   ending in `/api`, or route same-origin `/api` requests to the API. The
   client's Vercel rewrite serves the SPA entry point for frontend routes and
   excludes `/api` requests.
6. Confirm the frontend can call the API, password recovery delivers mail, and
   the existing MongoDB data remains intact. Do not run seed/reset scripts
   against production.
7. Mount a persistent private volume for resume storage and set
   `RESUME_STORAGE_DIR`; verify it is not reachable from public static URLs.

Do not deploy with placeholder values or share environment values in logs,
screenshots, or support requests.
