import { Elysia, status, t } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { bearer } from '@elysiajs/bearer'
import { env } from '../config/env'
import { AUTH_COOKIE } from '../lib/auth-cookie'
import { resolveToken } from '../lib/resolve-token'

export type JwtPayload = {
	sub: string
	username: string
}

export type AuthUser = {
	id: string
	username: string
}

export const unauthorizedBody = {
	error: 'Unauthorized',
	message: 'Missing or invalid credentials',
} as const

type AuthContext = {
	bearer: string | undefined | null
	jwt: {
		verify: (token: string) => Promise<unknown>
	}
	cookie: Record<string, { value?: unknown } | undefined>
}

export const readAuthToken = ({
	bearer,
	cookie,
}: Pick<AuthContext, 'bearer' | 'cookie'>) => {
	if (bearer) return bearer

	const value = cookie[AUTH_COOKIE]?.value
	return typeof value === 'string' ? value : null
}

export const authenticate = async (ctx: AuthContext) =>
	resolveToken(ctx.jwt, readAuthToken(ctx))

export const assertAuthenticated = async (
	ctx: AuthContext & {
		status: typeof status
	},
) => {
	const auth = await authenticate(ctx)

	if (!auth) {
		return status(401, unauthorizedBody)
	}

	return { user: auth.user satisfies AuthUser }
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
			resolve: ({ bearer, jwt, status, cookie }) =>
				assertAuthenticated({ bearer, jwt, cookie, status }),
		},
	})
