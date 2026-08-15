# AI Workflow Note — Ajaia Docs

## Tools used

- **Cursor (Claude)** — primary coding agent for scaffolding, implementation, and documentation
- **Node.js 25.9.0 via nvm** — runtime per user requirement

## Where AI materially sped up work

| Area | AI contribution |
|------|-----------------|
| **Project scaffolding** | Generated Next.js API routes, Prisma schema, and component structure in one pass |
| **TipTap integration** | Toolbar wiring, extensions (StarterKit + Underline), JSON persistence pattern |
| **Boilerplate** | Auth cookie signing, share CRUD, upload validation, seed script |
| **Documentation** | README, architecture note, submission checklist drafted from implementation |

Estimated time saved: **~2–3 hours** vs hand-writing from scratch.

## What AI generated but I changed or rejected

| AI output | Change |
|-----------|--------|
| Prisma 7 initial install | **Rejected** — Prisma 7 removed `url` from schema; downgraded to Prisma 6 for simpler SQLite DX |
| Autosave on every keystroke | **Rejected** — chose explicit Save to reduce race conditions and API noise in a demo app |
| `.docx` support suggestion | **Rejected** — scoped to `.txt`/`.md` with clear UI messaging |
| Dark mode styling from template | **Simplified** — light-first UI for a cleaner docs-like feel |
| Generic Next.js landing page | **Replaced** entirely with login → dashboard → editor flow |

## How I verified correctness

1. **`npm test`** — 4 unit tests on validation and text-import helpers
2. **`npm run build`** — TypeScript + Next.js production build passes
3. **`prisma db push && db:seed`** — database schema and seed data apply cleanly
4. **Manual flow review** — login → create doc → format text → save → refresh → share with second user

## Judgment calls (human, not AI)

- Prioritized **sharing visibility** (owned vs shared sections) over polish features
- Chose **SQLite** to avoid paid/hosted DB dependencies for reviewers
- Limited uploads to **512 KB** and **two file types** to keep error handling tractable
- Documented **deployment constraints** (SQLite needs persistent disk) rather than pretending Vercel + SQLite works

## Honest assessment

AI was most valuable for **breadth** (many files quickly) and **remembering library APIs** (TipTap, Prisma). Human judgment was needed for **scope control**, **deployment realism**, and **rejecting over-engineered patterns** the model tends to suggest.
