import { Elysia } from 'elysia'
import { assertAuthenticated, jwtAuth } from './jwt-auth'

const isDocsPath = (path: string) =>
	path === '/api/docs' || path.startsWith('/api/docs/')

export const docsAuth = new Elysia({ name: 'docs-auth' })
	.use(jwtAuth)
	.onBeforeHandle({ as: 'scoped' }, async ({ path, bearer, jwt, cookie, status }) => {
		if (!isDocsPath(path)) return

		const result = await assertAuthenticated({ bearer, jwt, cookie, status })
		if ('code' in result) return result
	})
