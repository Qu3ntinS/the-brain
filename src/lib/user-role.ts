export {
	SYSTEM_ROLE_ADMIN,
	SYSTEM_ROLE_USER,
	type PermissionSlug,
} from './auth/permissions'

/** @deprecated Use role slugs from the access system instead of a fixed enum. */
export type UserRole = string

export const userRoles = ['admin', 'user'] as const

export const isUserRole = (value: string) =>
	userRoles.includes(value as (typeof userRoles)[number])
