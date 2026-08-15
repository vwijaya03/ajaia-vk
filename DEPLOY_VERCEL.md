# Deploy ke Vercel

Vercel **tidak bisa** pakai SQLite file (`dev.db`) karena serverless tidak punya persistent disk. Solusinya: **Turso** (SQLite di cloud, gratis) + **Vercel** untuk app-nya.

## Ringkasan

| Lokal | Production (Vercel) |
|-------|---------------------|
| SQLite file `dev.db` | Turso (libSQL cloud) |
| Tanpa Turso env vars | `TURSO_*` env vars wajib |

---

## Step 1 — Push code ke GitHub

```bash
cd ajaia-docs
git init
git add .
git commit -m "Ajaia Docs submission"
git remote add origin https://github.com/USERNAME/ajaia-docs.git
git push -u origin main
```

---

## Step 2 — Buat database Turso (gratis)

1. Daftar di [turso.tech](https://turso.tech)
2. Install Turso CLI:

```bash
brew install tursodatabase/tap/turso
turso auth login
```

3. Buat database:

```bash
turso db create ajaia-docs
turso db show ajaia-docs --url
turso db tokens create ajaia-docs
```

Catat:
- **Database URL** → `libsql://....turso.io`
- **Auth token** → string panjang

---

## Step 3 — Deploy ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new)
2. Import repo GitHub kamu
3. **Root Directory:** `ajaia-docs` (kalau repo root-nya folder AJAIA)
4. Framework: **Next.js** (auto-detect)

### Environment Variables

Tambahkan di Vercel → Project → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `libsql://your-db.turso.io` |
| `TURSO_DATABASE_URL` | sama dengan `DATABASE_URL` |
| `TURSO_AUTH_TOKEN` | token dari `turso db tokens create` |
| `SESSION_SECRET` | string random panjang (min 32 karakter) |

5. Klik **Deploy**

Build command otomatis pakai `vercel-build` yang akan:
- generate Prisma client
- push schema ke Turso
- seed demo users
- build Next.js

---

## Step 4 — Verifikasi

1. Buka URL Vercel kamu (mis. `https://ajaia-docs.vercel.app`)
2. Login: `alice@ajaia.test` / `password123`
3. Coba buat dokumen → save → refresh → data masih ada

---

## Update SUBMISSION.md

Setelah deploy sukses, ganti `LIVE_URL_TBD` dengan URL Vercel kamu:

```
https://your-project.vercel.app
```

---

## Troubleshooting

**Build gagal di `prisma db push`**
- Pastikan `DATABASE_URL` dan `TURSO_AUTH_TOKEN` sudah benar
- URL harus format `libsql://...` bukan `file:./dev.db`

**Login OK tapi dokumen hilang setelah refresh**
- Turso env vars belum diset → app jatuh ke SQLite ephemeral di `/tmp`
- Cek Environment Variables di Vercel

**Lokal masih jalan normal?**
- Ya. Tanpa `TURSO_*` vars, app pakai SQLite file lokal seperti biasa.

---

## Biaya

- **Vercel** — free tier cukup untuk demo
- **Turso** — free tier (9 GB storage, 500 databases)

Keduanya **gratis** untuk submission ini.
