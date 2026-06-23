import { Elysia } from 'elysia'
import { jwtAuth } from '../../plugins/jwt-auth'
import { clearAuthCookie } from '../../lib/auth-cookie'
import { AuthModel } from './model'
import { AuthService } from './service'

export const authModule = new Elysia({ prefix: '/auth', name: 'auth' })
	.use(jwtAuth)
	.model({
		'auth.login': AuthModel.loginBody,
		'auth.token': AuthModel.tokenResponse,
		'auth.me': AuthModel.meResponse,
		'auth.error': AuthModel.errorResponse,
	})
	.post(
		'/login',
		async ({ body, jwt, set }) => {
			const validated = AuthService.validateCredentials(body)
			if ('code' in validated) return validated

			const session = await AuthService.issueSession(
				jwt,
				validated.username,
			)

			set.headers['Set-Cookie'] = AuthService.sessionCookie(
				session.accessToken,
			)

			return AuthService.buildSessionResponse(session.accessToken)
		},
		{
			body: 'auth.login',
			response: {
				200: 'auth.token',
				401: 'auth.error',
			},
			detail: {
				summary: 'Login',
				description: 'Exchange credentials for a JWT and session cookie',
				tags: ['Auth'],
			},
		},
	)
	.get(
		'/me',
		({ user }) => user,
		{
			isAuth: true,
			response: {
				200: 'auth.me',
				401: 'auth.error',
			},
			detail: {
				summary: 'Current user',
				description:
					'Returns the authenticated user from the JWT or session cookie',
				tags: ['Auth'],
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.post(
		'/logout',
		({ set }) => {
			set.headers['Set-Cookie'] = clearAuthCookie()

			return { ok: true as const }
		},
		{
			detail: {
				summary: 'Logout',
				description: 'Clears the session cookie',
				tags: ['Auth'],
			},
		},
	)
