# Architecture Note — Ajaia Docs

## Goal

Ship a **coherent, demo-ready document editor** within a 4–6 hour timebox — not a Google Docs clone. Depth over breadth.

## Priorities (in order)

1. **End-to-end document lifecycle** — create → edit with formatting → save → reopen with formatting intact
2. **Sharing that reviewers can verify in 60 seconds** — seeded users, visible owned vs shared lists, owner-only share controls
3. **File upload with clear product intent** — import files as documents + attach files to documents (both `.txt`/`.md`)
4. **Persistence that survives refresh** — SQLite + TipTap JSON content
5. **Reviewer experience** — one-command setup, demo credentials, README, one automated test

## Stack decisions

| Choice | Why |
|--------|-----|
| **Next.js full stack** | Single repo, fast iteration, API routes colocated with UI |
| **TipTap (ProseMirror)** | Mature rich-text model; JSON serialization preserves structure |
| **SQLite + Prisma** | Zero external services for local review; simple schema |
| **Cookie sessions (HMAC-signed)** | Enough for mocked auth without JWT complexity |
| **Seeded users** | Sharing demo works immediately without signup flow |

## Data model

```
User ──owns──▶ Document ◀──shares── DocumentShare ──▶ User
                  │
                  └──▶ Attachment (base64 in SQLite)
```

- **Document.content** stores TipTap JSON (not HTML) for reliable round-trips
- **Sharing** is many-to-many via `DocumentShare`; owners manage access
- **Attachments** are stored inline (base64) — acceptable at 512 KB limit for this scope

## API surface

| Route | Purpose |
|-------|---------|
| `POST /api/auth/login` | Mock login, set session cookie |
| `GET /api/documents` | List owned + shared docs |
| `POST /api/documents` | Create document |
| `GET/PATCH/DELETE /api/documents/[id]` | Read/update/delete |
| `GET/POST/DELETE /api/documents/[id]/share` | Manage sharing |
| `POST /api/upload` | Import file or attach to doc |

Access control: every document route checks `ownerId` or `DocumentShare` membership.

## Frontend structure

- **Dashboard** — two explicit sections (Owned / Shared) with badges
- **Editor page** — title inline edit, toolbar, manual save (intentional — avoids autosave race conditions in a short build)
- **Share dialog** — pick from seeded users, revoke access

## Tradeoffs accepted

| Cut | Rationale |
|-----|-----------|
| No real-time collaboration | CRDT/websocket work is a separate project; would dilute core flows |
| No `.docx` | Binary parsing + styling loss; `.txt`/`.md` cover import demo |
| Manual save vs autosave | Simpler UX contract; easier to debug in a take-home |
| SQLite on single node | Fine for demo; production would use Postgres + object storage for attachments |
| Attachments in DB | Avoids S3 setup; size-capped at 512 KB |

## What I'd build next (+2–4 hours)

1. Autosave with debounce + optimistic UI
2. Postgres migration for cloud deploy (Neon/Supabase)
3. `.docx` import via mammoth.js
4. Edit vs view-only share roles
5. Export to Markdown

## Testing strategy

- Unit tests on **pure helpers** (`validation`, `textToTipTapContent`) — fast, no DB
- Manual walkthrough for editor UX and sharing flows
- Production build (`npm run build`) as integration gate
