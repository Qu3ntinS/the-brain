#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

if ! command -v docker >/dev/null 2>&1; then
	echo 'Docker not found — skipping Postgres, Adminer, and Mailpit.'
	exit 0
fi

if ! docker info >/dev/null 2>&1; then
	echo 'Docker daemon is not running — skipping Postgres, Adminer, and Mailpit.'
	exit 0
fi

docker compose up -d --wait

if command -v bun >/dev/null 2>&1; then
	bun run db:migrate
	bun run db:seed
fi

postgres_port="${POSTGRES_PORT:-5432}"
adminer_port="${ADMINER_PORT:-8080}"
mailpit_web_port="${MAILPIT_WEB_PORT:-18025}"
mailpit_smtp_port="${MAILPIT_SMTP_PORT:-11025}"

echo
echo 'Dev services ready:'
echo "  Postgres  localhost:${postgres_port}"
echo "  Adminer   http://localhost:${adminer_port}"
echo "  Mailpit   http://localhost:${mailpit_web_port} (SMTP :${mailpit_smtp_port})"
