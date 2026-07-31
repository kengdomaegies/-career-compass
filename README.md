# Career Compass

A short interest & work-style assessment that generates a personalized career
report with Claude, saves it to a database, emails it out automatically, and
gives each client a private link to view (and print) their own report.

## How it's put together

- **Frontend/backend**: Next.js (App Router). The quiz runs client-side; the
  Claude call, database, and email sending live behind server routes/actions
  so secrets never reach the browser.
- `app/page.js` — the quiz (intro → questions → submit).
- `app/methodology/page.js` — "how this assessment works" (RIASEC + work-style
  explanation), also appended as a printed appendix on every report.
- `app/api/reports/route.js` — receives computed scores, calls Claude
  (`lib/anthropic.js`), saves the report, emails the owner (and the client if
  they gave an email), returns an id.
- `app/api/reports/[id]/send/route.js` — the report page's "send this report"
  box posts here to email the report link to any address on demand.
- `app/r/[token]/page.js` — the private report page. The report's database
  id *is* the link token (a UUID, effectively unguessable).
- `app/admin/` — `/admin` lists every report ever generated. Gated by a
  passcode checked server-side (`lib/adminSession.js` signs a session cookie
  — the passcode itself never reaches the browser, unlike a client-side
  check).
- `prisma/schema.prisma` — one `Report` table (Postgres).

## Local setup

1. **Install Node.js** (18+) if you don't have it — https://nodejs.org, or
   via `nvm install 20`.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a free Postgres database — [Neon](https://neon.tech) is the
   easiest (free tier, no credit card). Copy the connection string it gives
   you.
4. (Optional but recommended) Create a free [Resend](https://resend.com)
   account for email sending. Copy the API key it gives you. Without this,
   the app still works — email sends just fail gracefully and get logged on
   the report instead of going out.
5. Copy `.env.example` to `.env` and fill in the values — see the comments
   in that file for what each one does and where to get it.
6. Push the schema to your database:

   ```bash
   npm run db:push
   ```

7. Run it:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000, take the quiz, and it'll redirect you to a
   `/r/<id>` page — that's the private link you'd send a client. Visit
   `/admin` and enter your `ADMIN_PASSCODE` to see every report generated.

## Deploying (Vercel)

1. Push this project to a GitHub repo.
2. In [Vercel](https://vercel.com), "Add New Project" → import the repo.
3. Add every variable from your `.env` file in the Vercel project settings
   (Settings → Environment Variables).
4. Deploy. Vercel runs `npm install` (which runs `prisma generate` via
   `postinstall`) and `npm run build` automatically.
5. Run `npm run db:push` once locally (pointed at the production
   `DATABASE_URL`) to create the table in your production database, or run
   it from Vercel's CLI/terminal.

Each client report then lives at `https://yourapp.vercel.app/r/<id>` —
that's the link to send them. There's no login: the id is the access
control, so treat the link like a password and only share it with that
client. `/admin`, unlike the report links, does require the passcode.

## Email sending

- **Automatic**: every time a report is generated, `OWNER_EMAIL` gets a
  notification with the link. The client's email is collected on the intro
  screen for your own records/follow-up, but isn't auto-emailed a copy.
- **Manual**: the report page has a "Send this report" box that emails the
  report link to any address, any time (pre-filled with the client's email
  if they gave one).
- Resend's default sender (`onboarding@resend.dev`) works without owning a
  domain, which is enough to get started. For production use at any real
  volume, verify your own domain in Resend and point `RESEND_FROM` at it.
- Every send attempt (automatic or manual) is logged on the report's
  `emailLog` field — check it with `npm run db:studio` if a send seems to
  have gone missing.

## Restricting who can take the assessment

By default the assessment (`/`) is open to anyone with the link. To limit it
to your own clients: go to `/admin` → **Assessment access** → set a
passcode. Visitors then have to enter it before they can start the quiz
(remembered for 30 days per browser). Change or remove it any time, no
redeploy needed — unlike `ADMIN_PASSCODE`, this one lives in the database.

Two other approaches worth considering if you want tighter control later:

- **Per-client invite links**: generate a unique link per client (instead of
  a shared passcode) that's tied to one report slot. More setup, but no
  shared secret to leak, and you can see exactly who used which link.
- **Expiring links**: add an `expiresAt` to the passcode/session so access
  automatically closes after a course or engagement ends, rather than
  staying open until you manually remove it.

Neither is built — the shared passcode is the simplest version that covers
"keep the general public out." Ask if you want either of the above.

## Notes / things you may want to add later

- No rate limiting on `/api/reports` — fine for personal/low-volume use;
  add something like Vercel's rate limiting or a CAPTCHA if this becomes
  public-facing at scale.
- Links don't expire. If you want that, add an `expiresAt` column and check
  it in `app/r/[token]/page.js`.
- The admin session is a single shared passcode, not per-user accounts —
  fine for one coach; if multiple people need separate logins later, that's
  a bigger change (real user accounts + auth provider).
