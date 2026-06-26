<div align="center">

<center>
  <img src="public/assets/brain-logo.png" alt="The Brain" width="120" />
</center>

<h1>The Brain</h1>
<p>Personal API hub — portfolio glue, side projects, and one place to log in.</p>

</div>

---

**Stack:** [Bun](https://bun.sh) · [ElysiaJS](https://elysiajs.com) · [Vue 3](https://vuejs.org) · [Vite](https://vite.dev) · [Tailwind](https://tailwindcss.com) · [Scalar](https://scalar.com)

## Quick start

```bash
cp .env.example .env   # JWT_SECRET + ADMIN_PASSWORD setzen
bun install
bun run --cwd web install
bun run dev            # Docker (Postgres, Adminer, Mailpit) + API :3000 · UI :5173
```

`bun run dev` startet automatisch die Docker-Services (Postgres, Adminer, Mailpit). Ohne Docker laufen API und Web trotzdem — die DB-Verbindung ist dann nur nicht verfügbar (`/api/health` meldet `degraded`).

| Service | URL / Port |
|---------|------------|
| Postgres | `localhost:5432` |
| Adminer | http://localhost:8080 (Server: `postgres`, User/Pass: `brain`) |
| Mailpit UI | http://localhost:18025 (SMTP: `localhost:11025`) |

Services stoppen: `bun run dev:down`

Production build:

```bash
bun run build
bun run start
```

## Environment

| Variable | Required | Default |
|----------|----------|---------|
| `JWT_SECRET` | yes | — |
| `ADMIN_PASSWORD` | yes | — (seeds initial admin in Postgres) |
| `ADMIN_USERNAME` | no | `admin` (seeds initial admin in Postgres) |
| `PORT` | no | `3000` |
| `JWT_EXPIRES_IN` | no | `7d` |
| `DATABASE_URL` | no | `postgres://brain:brain@localhost:5432/brain` |
| `SMTP_HOST` | no | `localhost` |
| `SMTP_PORT` | no | `11025` |
| `CORS_ORIGIN` | prod | — |

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Docker services + API + web dev servers |
| `bun run dev:down` | Stop Docker services |
| `bun run db:push` | Sync Drizzle schema to Postgres (dev) |
| `bun run db:migrate` | Apply SQL migrations |
| `bun run db:seed` | Create/update admin user from env |
| `bun run build` | Build SPA into `web/dist` |
| `bun run start` | Run API (serves built UI) |
| `bun test` | Backend tests |
| `bun run test:web` | Frontend tests |
| `bun run generate:logo` | Regenerate logo assets |

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing |
| `/login` | Sign in |
| `/dashboard` | Overview (auth) |
| `/dashboard/docs` | API reference (auth) |
| `/api/docs` | Standalone OpenAPI UI |
| `/api/docs/json` | OpenAPI spec |

## License

**Private** — all rights reserved. Not for redistribution or public use.
