# Hacker House — Snow Edition v2 · The Alpine Circle

Second edition of the landing: same minimalist one-card layout, but a
**richer old-money palette** — deep bottle-green room, aged ivory card,
claret + oxblood accents, brass rules. Snow falls ivory against the green.
No build step, no framework.

V1: cream paper, pine & red.
V2 (this repo): the card sits *inside* the green room.

## Palette

| Token | Value | Role |
|---|---|---|
| `--room` | `#16281e` | bottle-green page background |
| `--cream` | `#f3ecda` | the ivory card |
| `--claret` | `#7a1f2b` | em, overline, hover |
| `--oxblood` | `#4a1420` | pillars band, button |
| `--gold` | `#b99a5b` | brass borders & rules |

## Files

| File | Purpose |
|---|---|
| `index.html` | Card structure & copy (monogram crest, duotone plate) |
| `styles.css` | Green-room palette, brass framing, claret band |
| `app.js` | Waitlist form logic + ivory snowfall |
| `functions/api/join.js` | Pages Function: `POST /api/join` → D1 + confirmation email |
| `migrations/0001_init.sql` | D1 `applications` table (seat nº, dedupe by email) |
| `wrangler.toml` | D1 binding + `MAIL_FROM` / `MAIL_REPLY_TO` vars |
| `.dev.vars` (ignored) | Local `RESEND_API_KEY` — never committed |

## Run locally

```bash
python3 -m http.server 8081
```

## The backend (Cloudflare Pages + D1 + Resend)

The form posts to `/api/join`, served by a **Pages Function**
(`functions/api/join.js`). It validates, inserts into **D1**
(`applications` table, one seat per email via `UNIQUE`), sends a
confirmation email through **Resend**, and returns `{ ok, position,
emailSent }`. `app.js` shows the real seat number and "check your inbox".

Three places, one repo — don't mix them up:

| Where | What lives there |
|---|---|
| **Git (repo)** | `index.html`, `app.js`, `styles.css`, `functions/`, `migrations/`, `wrangler.toml` (no secrets) |
| **Cloudflare** | Pages (static + Functions), D1 database, Secrets (`RESEND_API_KEY`), DNS (SPF/DKIM) |
| **External** | Resend (sends the mail) + the applicant's inbox |

`window.WAITLIST_ENDPOINT` is set to `/api/join` only when the page is
hosted (not `github.io`/`localhost`/`file:`). On a plain static host there
is no `/api/join`, so the form silently falls back to `localStorage` (demo
mode, no email).

### 1 · Create the database (once)

```bash
npx wrangler d1 create hacker-house-db        # copy database_id into wrangler.toml
npx wrangler d1 migrations apply hacker-house-db --local    # test locally
npx wrangler d1 migrations apply hacker-house-db --remote   # production
```

### 2 · Verify the sending domain (Resend)

Add the domain in Resend, copy its **SPF + DKIM** records into the DNS zone
of your domain in Cloudflare. Until that's green, emails fail. The default
`onboarding@resend.dev` only delivers to your own Resend account email.

### 3 · Secrets (never committed)

```bash
npx wrangler pages secret put RESEND_API_KEY --project-name=<PAGES_PROJECT>
# optional: a heads-up copy for each signup
npx wrangler pages secret put NOTIFY_EMAIL  --project-name=<PAGES_PROJECT>
```

### 4 · Local preview

```bash
cp .dev.vars.example .dev.vars        # paste your RESEND_API_KEY
npx wrangler pages dev .              # serves static + /api/join + local D1
```

### 5 · Deploy

```bash
npx wrangler pages deploy . --project-name=<PAGES_PROJECT>
```

Deploy only to **Cloudflare Pages** (manually as above, or connect the repo
with build command empty and output root `/`, then the D1 binding +
`RESEND_API_KEY` in the project's Settings → Functions). GitHub Pages serves
static files only and would never send email, so no GitHub Pages workflow is
kept.

