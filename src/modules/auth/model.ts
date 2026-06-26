import { t } from 'elysia'
import { userRoles } from '../../lib/user-role'
import { errorResponse, okResponse } from '../../models/shared'

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
	displayName: t.Union([t.String(), t.Null()]),
	avatarUrl: t.Union([t.String(), t.Null()]),
	role: t.Union(userRoles.map((role) => t.Literal(role))),
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.String({ format: 'date-time' }),
})

export { updateProfileBody } from '../users/model'

export { errorResponse, okResponse }

export type LoginBody = typeof loginBody.static
export type TokenResponse = typeof tokenResponse.static
export type MeResponse = typeof meResponse.static
export type { UpdateProfileBody } from '../users/model'
