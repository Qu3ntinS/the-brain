import { t } from 'elysia'

export const loginBody = t.Object({
	username: t.String({ minLength: 1 }),
	password: t.String({ minLength: 1 }),
})

export const tokenResponse = t.Object({
	accessToken: t.String(),
	tokenType: t.Literal('Bearer'),
	expiresIn: t.String(),
})

export const meResponse = t.Object({
	id: t.String(),
	username: t.String(),
})

export const errorResponse = t.Object({
	error: t.String(),
	message: t.String(),
})

export const okResponse = t.Object({
	ok: t.Literal(true),
})

export type LoginBody = typeof loginBody.static
export type TokenResponse = typeof tokenResponse.static
export type MeResponse = typeof meResponse.static
