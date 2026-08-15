# Ajaia Docs

A lightweight collaborative document editor built for the Ajaia full-stack assignment. Create and edit rich-text documents, import `.txt`/`.md` files, attach files to documents, and share access with teammates.

## Live demo

> **Deploy before submission:** See [Deployment](#deployment) below. Add your live URL here and in `SUBMISSION.md`.

`LIVE_URL_TBD`

## Quick start (local)

**Requirements:** Node.js **25.9.0** (via nvm), npm

```bash
cd ajaia-docs
nvm use          # reads .nvmrc → 25.9.0
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

| Email | Password | Notes |
|-------|----------|-------|
| `alice@ajaia.test` | `password123` | Owner of seeded "Getting Started" doc |
| `bob@ajaia.test` | `password123` | Has shared access to Alice's doc |
| `carol@ajaia.test` | `password123` | No shared docs by default |

### Sharing flow (for reviewers)

1. Sign in as **alice@ajaia.test**
2. Open **Getting Started** → **Share** → add **Carol Kim**
3. Sign out, sign in as **carol@ajaia.test**
4. Carol sees the doc under **Shared with you**

## Features

| Area | Status |
|------|--------|
| Create / rename / save / reopen documents | ✅ |
| Rich text: bold, italic, underline, headings, lists | ✅ |
| Import `.txt` / `.md` as new document | ✅ |
| Attach `.txt` / `.md` to existing document | ✅ |
| Owner vs shared document lists | ✅ |
| Grant / revoke sharing | ✅ |
| SQLite persistence (formatting preserved as TipTap JSON) | ✅ |
| Automated tests (`npm test`) | ✅ |

### Intentionally out of scope

- Real-time multi-user editing (OT/CRDT)
- `.docx` import (would add mammoth.js + edge cases)
- Role-based permissions (view vs edit)
- Version history, comments, PDF export

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # run production build
npm test           # unit tests (Vitest)
npm run db:push    # apply schema to SQLite
npm run db:seed    # seed demo users + sample doc
```

## File upload limits

- **Import:** `.txt`, `.md` → creates a new editable document
- **Attach:** `.txt`, `.md` → stored as attachment on current document
- Max size: **512 KB** (stated in dashboard UI)

## Deployment

SQLite needs a persistent filesystem. Recommended options:

### Option A — Railway (recommended)

1. Push repo to GitHub
2. Create Railway project → deploy from repo (`ajaia-docs` root)
3. Set env vars: `DATABASE_URL=file:./prisma/dev.db`, `SESSION_SECRET=<random>`
4. Add a persistent volume mounted at `/app/prisma`
5. Set start command: `npm run db:push && npm run db:seed && npm start`

### Option B — Docker

```bash
docker build -t ajaia-docs .
docker run -p 3000:3000 -e SESSION_SECRET=change-me ajaia-docs
```

### Option C — Vercel + Turso (recommended for Vercel)

SQLite file tidak bisa dipakai di Vercel serverless. Pakai **Turso** (SQLite cloud, gratis) sebagai database.

Panduan lengkap: **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)**

Ringkas:
1. Push repo ke GitHub
2. Buat DB di [turso.tech](https://turso.tech) → dapat URL + token
3. Deploy di [vercel.com/new](https://vercel.com/new) → set env vars:
   - `DATABASE_URL` = `file:./prisma/.vercel.db` (untuk Prisma CLI)
   - `TURSO_DATABASE_URL` = `libsql://....turso.io`
   - `TURSO_AUTH_TOKEN` = token Turso
   - `SESSION_SECRET` = random string
4. Deploy — selesai

Lokal tetap pakai SQLite file; production otomatis pakai Turso kalau env vars diset.

### Option D — Vercel tanpa Turso

**Tidak recommended** — data tidak persisten antar request.

## Project structure

```
src/
  app/           # Next.js App Router pages + API routes
  components/    # Editor, dashboard, share dialog
  lib/           # Auth, DB, document helpers, validation
prisma/          # Schema, seed, SQLite database
```

## Tech stack

- **Next.js 16** (App Router, API routes)
- **TipTap** (ProseMirror rich-text editor)
- **Prisma + SQLite**
- **Tailwind CSS 4**
- **Vitest** for tests

## Further reading

- [Walkthrough video (Loom)](https://www.loom.com/share/9fa3887c868c412caa52477a0e060d57)
- [ARCHITECTURE.md](./ARCHITECTURE.md) — design priorities and tradeoffs
- [AI_WORKFLOW.md](./AI_WORKFLOW.md) — how AI tools were used
- [SUBMISSION.md](./SUBMISSION.md) — deliverables checklist
