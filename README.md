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

By default the assessment (`/`) is open to anyone with the link. `/admin`
has two ways to lock it down — use either or both together:

- **Shared passcode**: set one passcode everyone uses. Simple, one thing to
  share. Optionally set it to expire after N days.
- **Invite links**: generate a unique `/start/<token>` link per client
  instead. No shared secret to leak, you can see who's used their link and
  how many times, and you can revoke one client's access without affecting
  anyone else's. Also supports an optional expiry per invite.

Either one being configured locks the assessment down — a visitor without a
valid passcode or invite session sees a "this assessment is private" screen
instead of the quiz. If a passcode or invite has an expiry and it passes,
that specific credential just stops working (the assessment does **not**
reopen to the public — you'd need to set a new passcode or issue a new
invite). Sessions granted before an expiry are remembered for up to 30 days
per browser, capped to whatever's left until that expiry.

There's no login for report links (`/r/<id>`) — those stay unguessable-UUID
gated as before, unaffected by any of this.

## Reliability & admin extras

- **The gate is enforced on the API, not just the page**: `/api/reports`
  checks the quiz session cookie itself (when a passcode or invite is
  configured), so someone can't bypass the gate screen by POSTing directly
  to the endpoint.
- **Rate limiting**: max 5 report generations per IP per hour
  (`lib/rateLimit.js`), backed by a small self-pruning `RateLimitHit` table
  — no Redis/Upstash needed. Adjust `MAX_PER_WINDOW`/`WINDOW_MS` there if
  needed.
- **Quiz progress is saved to localStorage** as the client answers, and
  restored if they refresh or close the tab partway through. Cleared on
  successful submission.
- **Admin dashboard** has a search box (name/email) over the reports list,
  an "Across all clients" insights panel showing the distribution of top
  interest areas and average work-style leans, and a CSV export button
  (respects the current search filter).
- **Failure alerts**: if a narrative fails to generate (initial attempt or
  a later Regenerate), `OWNER_EMAIL` gets a distinct "⚠ narrative failed"
  email immediately, instead of only finding out by noticing it in the
  dashboard later. A banner also appears at the top of `/admin` whenever
  any report needs attention.
- **Repeat-client history**: if the same email takes the assessment more
  than once, their reports get a "(N assessments)" badge and a "History"
  toggle showing a table of their scores over time with deltas from the
  previous attempt — useful for before/after a coaching engagement.

## Notes / things you may want to add later

- Report links (`/r/<id>`) don't expire. If you want that, add an
  `expiresAt` column and check it in `app/r/[token]/page.js`.
- The admin session is a single shared passcode, not per-user accounts —
  fine for one coach; if multiple people need separate logins later, that's
  a bigger change (real user accounts + auth provider).
