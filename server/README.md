# ITI Apprenticeship Portal API

Run the API from this directory with:

```powershell
npm run dev
```

Configure `MONGODB_URI` and a `JWT_SECRET` of at least 32 characters in the
server environment. Password recovery uses Resend; configure `RESEND_API_KEY`,
`RESET_EMAIL_FROM` (a sender verified with Resend), and `CLIENT_ORIGIN` to
enable it. Reset links expire after 15 minutes and the token is stored as a
SHA-256 hash.

For production, also set `NODE_ENV=production` and `CORS_ORIGINS` to the
comma-separated frontend origins allowed to call the API. `CLIENT_ORIGIN` must
be HTTPS and included in `CORS_ORIGINS`. Keep all values private; do not commit
credentials or include them in logs.

Student resume uploads accept PDF and DOCX files up to 5 MB. Files are stored
outside the public web root; MongoDB stores their private storage reference and
metadata, not file contents. Set `RESUME_STORAGE_DIR` to a durable private
volume in production (the default is `server/private/resumes`). Do not expose
that directory through static hosting. Student downloads require that
student's authentication; employer downloads are limited to applications for
their own jobs.

`GET /api/admin/analytics` requires an Admin bearer token. It aggregates
registered user roles, jobs, applications, statuses, trade/location counts,
and UTC monthly creation activity. Growth compares the latest three months
with the preceding three and is omitted when history is insufficient or the
baseline is zero. The current application model has no confirmed-placement
field, so the analytics response marks placements as untracked rather than
counting selected applications as placements.
