import { Elysia } from 'elysia'
import { clearSessionCookie } from '../../lib/auth-cookie'
import { jwtAuth } from '../../plugins/jwt-auth'
import * as AuthModel from './model'
import { AuthService } from './service'

export const authModule = new Elysia({ prefix: '/auth', name: 'auth' })
	.use(jwtAuth)
	.model({
		'auth.login': AuthModel.loginBody,
		'auth.token': AuthModel.tokenResponse,
		'auth.me': AuthModel.meResponse,
		'auth.error': AuthModel.errorResponse,
		'auth.ok': AuthModel.okResponse,
	})
	.post(
		'/login',
		async ({ body, jwt, cookie }) => {
			const validated = AuthService.validateCredentials(body)
			if ('code' in validated) return validated

			const session = await AuthService.issueSession(
				jwt,
				validated.username,
			)

			AuthService.applySessionCookie(
				cookie.brain_token,
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
	.post(
		'/refresh',
		async ({ user, jwt, cookie }) => {
			const session = await AuthService.issueSession(jwt, user.username)

			AuthService.applySessionCookie(
				cookie.brain_token,
				session.accessToken,
			)

			return AuthService.buildSessionResponse(session.accessToken)
		},
		{
			isAuth: true,
			response: {
				200: 'auth.token',
				401: 'auth.error',
			},
			detail: {
				summary: 'Refresh session',
				description:
					'Issues a new JWT and refreshes the browser session cookie',
				tags: ['Auth'],
				security: [{ bearerAuth: [] }],
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
		({ cookie }) => {
			clearSessionCookie(cookie.brain_token)

			return { ok: true as const }
		},
		{
			response: {
				200: 'auth.ok',
			},
			detail: {
				summary: 'Logout',
				description: 'Clears the session cookie',
				tags: ['Auth'],
			},
		},
	)
