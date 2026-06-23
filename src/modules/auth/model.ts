import { t } from 'elysia'

export namespace AuthModel {
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

	export type loginBody = typeof loginBody.static
	export type tokenResponse = typeof tokenResponse.static
	export type meResponse = typeof meResponse.static
}
