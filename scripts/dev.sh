#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

port="${PORT:-3000}"
health_url="http://127.0.0.1:${port}/api/health"

bun run dev:services

bun run dev:api &
api_pid=$!

cleanup() {
	kill "$api_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Waiting for API at ${health_url}…"

for _ in $(seq 1 150); do
	if curl -sf "$health_url" >/dev/null 2>&1; then
		break
	fi

	if ! kill -0 "$api_pid" 2>/dev/null; then
		echo 'API process exited before becoming ready.' >&2
		wait "$api_pid" || true
		exit 1
	fi

	sleep 0.2
done

if ! curl -sf "$health_url" >/dev/null 2>&1; then
	echo "API did not become ready at ${health_url}" >&2
	exit 1
fi

echo "API ready — starting web dev server."
bun run dev:web
