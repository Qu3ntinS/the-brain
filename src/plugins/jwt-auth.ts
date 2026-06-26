import { Elysia, t } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { bearer } from '@elysiajs/bearer'
import { env } from '../config/env'
import { AUTH_COOKIE } from '../lib/auth-cookie'
import { errors } from '../lib/http-errors'
import { resolveToken } from '../lib/resolve-token'
import type { UserRole } from '../lib/user-role'
import { userRoles } from '../lib/user-role'
import { UsersService } from '../modules/users/service'

export type JwtPayload = {
	sub: string
	username: string
	role: UserRole
	displayName?: string | null
}

export type AuthUser = {
	id: string
	username: string
	displayName: string | null
	avatarUrl: string | null
	role: UserRole
}

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
		status: typeof import('elysia').status
	},
) => {
	const auth = await authenticate(ctx)

	if (!auth) {
		return errors.unauthorized()
	}

	return { user: auth.user satisfies AuthUser }
}

export const assertAdmin = async (
	ctx: AuthContext & {
		status: typeof import('elysia').status
	},
) => {
	const auth = await assertAuthenticated(ctx)

	if ('code' in auth) return auth

	const record = await UsersService.getRecordById(auth.user.id)

	if (!record || record.role !== 'admin') {
		return errors.forbidden()
	}

	return { user: UsersService.toAuthUser(record) }
}

const roleSchema = t.Union(userRoles.map((role) => t.Literal(role)))

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
				role: roleSchema,
				displayName: t.Optional(t.Union([t.String(), t.Null()])),
				avatarUrl: t.Optional(t.Union([t.String(), t.Null()])),
			}),
		}),
	)
	.use(bearer())
	.macro({
		isAuth: {
			resolve: ({ bearer, jwt, status, cookie }) =>
				assertAuthenticated({ bearer, jwt, cookie, status }),
		},
		isAdmin: {
			resolve: ({ bearer, jwt, status, cookie }) =>
				assertAdmin({ bearer, jwt, cookie, status }),
		},
	})
