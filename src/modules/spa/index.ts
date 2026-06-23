import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'
import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const webDist = join(process.cwd(), 'web/dist')
const webIndex = join(webDist, 'index.html')

export const spaModule = new Elysia({ name: 'spa' })
	.use(
		staticPlugin({
			assets: 'public/assets',
			prefix: '/assets',
		}),
	)
	.get('*', ({ request, set }) => {
		const path = new URL(request.url).pathname

		if (path.startsWith('/api') || path.startsWith('/assets')) {
			return
		}

		const assetPath = join(webDist, path)

		if (
			path !== '/' &&
			existsSync(assetPath) &&
			statSync(assetPath).isFile()
		) {
			return Bun.file(assetPath)
		}

		if (!existsSync(webIndex)) {
			set.status = 503
			set.headers['content-type'] = 'text/plain; charset=utf-8'
			return 'Frontend not built. Run: bun run build:web'
		}

		set.headers['content-type'] = 'text/html; charset=utf-8'
		return Bun.file(webIndex)
	})
