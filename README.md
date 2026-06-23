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
bun run dev            # API :3000 · UI :5173 (proxied /api)
```

Production build:

```bash
bun run build
bun run start
```

## Environment

| Variable | Required | Default |
|----------|----------|---------|
| `JWT_SECRET` | yes | — |
| `ADMIN_PASSWORD` | yes | — |
| `ADMIN_USERNAME` | no | `admin` |
| `PORT` | no | `3000` |
| `JWT_EXPIRES_IN` | no | `7d` |
| `CORS_ORIGIN` | prod | — |

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | API + web dev servers |
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
