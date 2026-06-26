import { t } from 'elysia'
import { errorResponse, okResponse } from '../../models/shared'

export const roleSlugSchema = t.String({ minLength: 2, maxLength: 32 })

export const userPublic = t.Object({
	id: t.String(),
	username: t.String(),
	displayName: t.Union([t.String(), t.Null()]),
	avatarUrl: t.Union([t.String(), t.Null()]),
	role: roleSlugSchema,
	roles: t.Array(roleSlugSchema),
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.String({ format: 'date-time' }),
})

export const createUserBody = t.Object({
	username: t.String({ minLength: 2, maxLength: 32 }),
	password: t.String({ minLength: 8, maxLength: 128 }),
	displayName: t.Optional(t.String({ minLength: 1, maxLength: 64 })),
	role: t.Optional(roleSlugSchema),
	roles: t.Optional(t.Array(roleSlugSchema, { minItems: 1 })),
})

export const updateUserBody = t.Object({
	username: t.Optional(t.String({ minLength: 2, maxLength: 32 })),
	password: t.Optional(t.String({ minLength: 8, maxLength: 128 })),
	displayName: t.Optional(t.Union([t.String({ minLength: 1, maxLength: 64 }), t.Null()])),
	role: t.Optional(roleSlugSchema),
	roles: t.Optional(t.Array(roleSlugSchema, { minItems: 1 })),
})

export const updateProfileBody = t.Object({
	displayName: t.Optional(t.Union([t.String({ minLength: 1, maxLength: 64 }), t.Null()])),
	password: t.Optional(t.String({ minLength: 8, maxLength: 128 })),
	currentPassword: t.Optional(t.String({ minLength: 1 })),
})

export const usersListResponse = t.Object({
	users: t.Array(userPublic),
})

export { errorResponse, okResponse }

export type UserPublic = typeof userPublic.static
export type CreateUserBody = typeof createUserBody.static
export type UpdateUserBody = typeof updateUserBody.static
export type UpdateProfileBody = typeof updateProfileBody.static
