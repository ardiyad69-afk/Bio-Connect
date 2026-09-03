# LinkStart

Multi-user bio link platform (Linktree clone). Rencana deployment lengkap ada di [issue #8](https://github.com/ardiyad69-afk/LinkStart/issues/8).

## Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001
- Contoh profil setelah seed: http://localhost:3000/kiki, http://localhost:3000/budi, http://localhost:3000/sari
- Login demo: `kiki@example.com` / `password123` (begitu juga budi@, sari@)

## Struktur

- `apps/web` — Next.js App Router (halaman publik `/[username]` + dashboard)
- `apps/api` — ElysiaJS di atas Node, auth & mutasi data
- `packages/db` — Drizzle ORM schema, migrations, seed
- `packages/shared` — tipe & skema Zod bersama
