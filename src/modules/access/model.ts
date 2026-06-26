import { t } from 'elysia'
import { errorResponse, okResponse } from '../../models/shared'

export const permissionPublic = t.Object({
	id: t.String(),
	slug: t.String(),
	name: t.String(),
	description: t.Union([t.String(), t.Null()]),
	category: t.Union([t.String(), t.Null()]),
})

export const rolePublic = t.Object({
	id: t.String(),
	slug: t.String(),
	name: t.String(),
	description: t.Union([t.String(), t.Null()]),
	isSystem: t.Boolean(),
	permissions: t.Array(t.String()),
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.String({ format: 'date-time' }),
})

export const rolesListResponse = t.Object({
	roles: t.Array(rolePublic),
})

export const permissionsListResponse = t.Object({
	permissions: t.Array(permissionPublic),
})

export const createRoleBody = t.Object({
	slug: t.String({ minLength: 2, maxLength: 32, pattern: '^[a-z0-9-]+$' }),
	name: t.String({ minLength: 2, maxLength: 64 }),
	description: t.Optional(t.String({ maxLength: 256 })),
	permissions: t.Optional(t.Array(t.String())),
})

export const updateRoleBody = t.Object({
	name: t.Optional(t.String({ minLength: 2, maxLength: 64 })),
	description: t.Optional(t.Union([t.String({ maxLength: 256 }), t.Null()])),
	permissions: t.Optional(t.Array(t.String())),
})

export const setUserRolesBody = t.Object({
	roles: t.Array(t.String(), { minItems: 1 }),
})

export const userGrantBody = t.Object({
	permission: t.String(),
	effect: t.Union([t.Literal('allow'), t.Literal('deny')]),
})

export const setUserGrantsBody = t.Object({
	grants: t.Array(userGrantBody),
})

export const userAccessResponse = t.Object({
	userId: t.String(),
	roles: t.Array(t.String()),
	permissions: t.Array(t.String()),
	grants: t.Array(
		t.Object({
			permission: t.String(),
			effect: t.Union([t.Literal('allow'), t.Literal('deny')]),
		}),
	),
})

export { errorResponse, okResponse }

export type CreateRoleBody = typeof createRoleBody.static
export type UpdateRoleBody = typeof updateRoleBody.static

export type RolePublic = typeof rolePublic.static
export type PermissionPublic = typeof permissionPublic.static
