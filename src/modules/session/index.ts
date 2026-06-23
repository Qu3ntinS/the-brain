import { Elysia } from 'elysia'
import { jwtAuth } from '../../plugins/jwt-auth'
import { AuthService } from '../auth/service'
import { AuthModel } from '../auth/model'

export const sessionModule = new Elysia({ name: 'session' })
	.use(jwtAuth)
	.model({
		'session.token': AuthModel.tokenResponse,
		'session.error': AuthModel.errorResponse,
	})
	.post(
		'/refresh',
		async ({ user, jwt, set }) => {
			const session = await AuthService.issueSession(jwt, user.username)

			set.headers['Set-Cookie'] = AuthService.sessionCookie(
				session.accessToken,
			)

			return AuthService.buildSessionResponse(session.accessToken)
		},
		{
			isAuth: true,
			response: {
				200: 'session.token',
				401: 'session.error',
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
