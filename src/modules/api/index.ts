import { Elysia, t } from 'elysia'
import { openapi } from '@elysiajs/openapi'
import { checkDatabase } from '../../database/client'
import { AuthorizationService } from '../../lib/auth/authorization'
import { jwtAuth, assertAuthenticated } from '../../plugins/jwt-auth'
import { docsAuth } from '../../plugins/docs-auth'
import { accessModule } from '../access'
import { authModule } from '../auth'
import { usersModule } from '../users'
import { apiErrorHandler } from './error-page'
import { renderDocsPage } from './docs-page'
import { openApiDocumentation, openApiExclude } from './openapi-config'
import { getOpenApiSpecForPermissions } from './openapi-spec'

export const apiModule = new Elysia({ prefix: '/api', name: 'api' })
	.use(jwtAuth)
	.use(docsAuth)
	.use(
		openapi({
			path: '/docs',
			provider: null,
			documentation: openApiDocumentation,
			exclude: openApiExclude,
			scalar: {
				authentication: {
					preferredSecurityScheme: 'bearerAuth',
				},
			},
		}),
	)
	.get('/docs', () => new Response(renderDocsPage(), {
		headers: {
			'content-type': 'text/html; charset=utf-8',
		},
	}), {
		detail: { hide: true },
	})
	.get(
		'/docs/json',
		async ({ bearer, jwt, cookie, status }) => {
			const auth = await assertAuthenticated({ bearer, jwt, cookie, status })

			if ('code' in auth) return auth

			const access = await AuthorizationService.resolveAccess(auth.user.id)

			return getOpenApiSpecForPermissions(access.permissions)
		},
		{
			detail: { hide: true },
		},
	)
	.use(authModule)
	.use(usersModule)
	.use(accessModule)
	.get(
		'/health',
		async () => {
			const database = await checkDatabase()

			return {
				status: database.ok ? 'ok' : 'degraded',
				service: 'the-brain',
				timestamp: new Date().toISOString(),
				database: database.ok ? 'connected' : 'disconnected',
				...(database.ok ? {} : { databaseError: database.error }),
			}
		},
		{
			response: {
				200: t.Object({
					status: t.Union([t.Literal('ok'), t.Literal('degraded')]),
					service: t.Literal('the-brain'),
					timestamp: t.String(),
					database: t.Union([
						t.Literal('connected'),
						t.Literal('disconnected'),
					]),
					databaseError: t.Optional(t.String()),
				}),
			},
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
