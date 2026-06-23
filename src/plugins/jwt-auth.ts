import { Elysia, t } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { bearer } from '@elysiajs/bearer'
import { env } from '../config/env'
import { resolveToken } from '../lib/resolve-token'

export type JwtPayload = {
	sub: string
	username: string
}

export const jwtAuth = new Elysia({ name: 'jwt-auth' })
	.use(
		jwt({
			name: 'jwt',
			secret: env.jwtSecret,
			exp: env.jwtExpiresIn,
			iss: 'the-brain',
			schema: t.Object({
				sub: t.String(),
				username: t.String(),
			}),
		}),
	)
	.use(bearer())
	.macro({
		isAuth: {
			resolve: async ({ bearer, jwt, status, request }) => {
				const auth = await resolveToken(
					jwt,
					bearer,
					request.headers.get('cookie'),
				)

				if (!auth) {
					return status(401, {
						error: 'Unauthorized',
						message: 'Missing or invalid credentials',
					})
				}

				return { user: auth.user }
			},
		},
	})
