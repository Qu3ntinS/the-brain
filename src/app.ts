import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { staticPlugin } from '@elysiajs/static'
import { jwtAuth } from './plugins/jwt-auth'
import { resolveToken } from './lib/resolve-token'
import { landingModule } from './modules/landing'
import { loginModule } from './modules/login'
import { authModule } from './modules/auth'
import { sessionModule } from './modules/session'
import { apiModule } from './modules/api'

const isDocsPath = (path: string) =>
	path === '/docs' || path.startsWith('/docs/')

export const createApp = () =>
	new Elysia()
		.use(
			cors({
				origin: true,
				methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
				allowedHeaders: ['Content-Type', 'Authorization'],
			}),
		)
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
						{ name: 'App', description: 'Public pages' },
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
		.use(
			staticPlugin({
				assets: 'public/assets',
				prefix: '/assets',
			}),
		)
		.use(landingModule)
		.use(loginModule)
		.use(authModule)
		.use(sessionModule)
		.use(apiModule)

export type App = ReturnType<typeof createApp>
