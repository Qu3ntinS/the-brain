import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { env } from './config/env'
import { apiModule } from './modules/api'
import { spaModule } from './modules/spa'
import { apiNotFoundHandler } from './modules/api/error-page'
import { database } from './plugins/database'

const webIndex = join(process.cwd(), 'web/dist/index.html')

const serveSpaShell = (set: {
	status?: number | string
	headers: Record<string, string | number>
}) => {
	if (!existsSync(webIndex)) {
		set.status = 503
		set.headers['content-type'] = 'text/plain; charset=utf-8'
		return 'Frontend not built. Run: bun run build:web'
	}

	set.status = 200
	set.headers['content-type'] = 'text/html; charset=utf-8'
	return Bun.file(webIndex)
}

export const createApp = () =>
	new Elysia()
		.use(database)
		.use(
			cors({
				origin: env.corsOrigin,
				methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
				allowedHeaders: ['Content-Type', 'Authorization'],
				credentials: true,
			}),
		)
		.use(apiModule)
		.use(spaModule)
		.onError(({ code, set, request, path }) => {
			const pathname = path ?? new URL(request.url).pathname

			if (code === 'NOT_FOUND') {
				if (pathname.startsWith('/api')) {
					return apiNotFoundHandler({ set, request })
				}

				if (!existsSync(webIndex)) {
					set.status = 503
					set.headers['content-type'] = 'text/plain; charset=utf-8'
					return 'Frontend not built. Run: bun run build:web'
				}

				return new Response(Bun.file(webIndex), {
					status: 200,
					headers: { 'content-type': 'text/html; charset=utf-8' },
				})
			}
		})
		.get('/', ({ set }) => serveSpaShell(set), {
			detail: { hide: true },
		})
		.get('/login', ({ set }) => serveSpaShell(set), {
			detail: { hide: true },
		})
		.get('/dashboard', ({ set }) => serveSpaShell(set), {
			detail: { hide: true },
		})

export type App = ReturnType<typeof createApp>
