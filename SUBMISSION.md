# Submission Checklist — Ajaia Docs

## Included in this folder

| Item | Location | Status |
|------|----------|--------|
| Source code | `ajaia-docs/` | ✅ |
| README (setup & run) | `ajaia-docs/README.md` | ✅ |
| Architecture note | `ajaia-docs/ARCHITECTURE.md` | ✅ |
| AI workflow note | `ajaia-docs/AI_WORKFLOW.md` | ✅ |
| This submission index | `ajaia-docs/SUBMISSION.md` | ✅ |
| Walkthrough video URL | `ajaia-docs/VIDEO_URL.txt` | ✅ |
| Live deployment URL | README + below | ⏳ Deploy to Railway/Docker |

## Walkthrough video

https://www.loom.com/share/9fa3887c868c412caa52477a0e060d57

## Live URL

```
LIVE_URL_TBD
```

## Review credentials

All demo users share password: `password123`

- **alice@ajaia.test** — document owner
- **bob@ajaia.test** — pre-shared access to "Getting Started"
- **carol@ajaia.test** — use for live sharing demo

## What works end-to-end

- Login with seeded accounts
- Create, rename, edit, save, and reopen documents
- Rich text: bold, italic, underline, H1/H2, bullet/numbered lists
- Import `.txt` / `.md` files as new documents
- Attach `.txt` / `.md` files to documents
- Share documents with other users; revoke access
- Owned vs shared document lists
- Data persists across browser refresh

## What is incomplete

- Real-time collaborative editing
- `.docx` import
- Autosave (manual Save button only)
- Role-based permissions (view vs edit)
- Cloud deployment URL (needs deploy step)

## Next 2–4 hours (if continued)

1. Deploy to Railway with persistent volume + update live URL
2. Add autosave with debounce
3. Add `.docx` import via mammoth.js

## Local verification (for reviewers)

```bash
cd ajaia-docs
nvm use
npm install
cp .env.example .env
npm run db:push && npm run db:seed
npm run dev
# → http://localhost:3000
npm test
npm run build
```

## Node version

**25.9.0** (see `.nvmrc`)
