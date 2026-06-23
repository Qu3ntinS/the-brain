import { Elysia, t } from 'elysia'
import { openapi } from '@elysiajs/openapi'
import { jwtAuth } from '../../plugins/jwt-auth'
import { resolveToken } from '../../lib/resolve-token'
import { authModule } from '../auth'
import { apiErrorHandler } from './error-page'

const isDocsPath = (path: string) =>
	path === '/api/docs' || path.startsWith('/api/docs/')

export const apiModule = new Elysia({ prefix: '/api', name: 'api' })
	.use(jwtAuth)
	.onBeforeHandle(async ({ path, bearer, jwt, request, set }) => {
		if (!isDocsPath(path)) return

		const auth = await resolveToken(
			jwt,
			bearer,
			request.headers.get('cookie'),
		)

		if (!auth) {
			set.status = 401
			return {
				error: 'Unauthorized',
				message: 'Missing or invalid credentials',
			}
		}
	})
	.use(
		openapi({
			path: '/docs',
			documentation: {
				info: {
					title: 'The Brain API',
					version: '1.0.0',
					description:
						'Personal API hub — portfolio, side projects, and the lightweight glue.',
				},
				tags: [
					{ name: 'Auth', description: 'JWT authentication' },
					{ name: 'System', description: 'Health & utilities' },
				],
				components: {
					securitySchemes: {
						bearerAuth: {
							type: 'http',
							scheme: 'bearer',
							bearerFormat: 'JWT',
						},
					},
				},
			},
			scalar: {
				authentication: {
					preferredSecurityScheme: 'bearerAuth',
				},
			},
		}),
	)
	.use(authModule)
	.get(
		'/health',
		() => ({
			status: 'ok',
			service: 'the-brain',
			timestamp: new Date().toISOString(),
		}),
		{
			detail: {
				summary: 'Health check',
				tags: ['System'],
			},
		},
	)
	.get(
		'/ping',
		({ user }) => ({
			message: `Hey ${user.username}, The Brain hears you loud and clear.`,
			userId: user.id,
		}),
		{
			isAuth: true,
			response: {
				200: t.Object({
					message: t.String(),
					userId: t.String(),
				}),
			},
			detail: {
				summary: 'Protected ping',
				description: 'Example protected route — requires Bearer JWT',
				tags: ['System'],
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.onError(({ code, error, set, request }) =>
		apiErrorHandler({ code, error, set, request }),
	)
