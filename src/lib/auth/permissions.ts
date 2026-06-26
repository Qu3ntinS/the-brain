export const PERMISSION_CATALOG = {
	'users:read': {
		name: 'Read users',
		description: 'List and view user accounts',
		category: 'users',
	},
	'users:write': {
		name: 'Manage users',
		description: 'Create, update, and delete user accounts',
		category: 'users',
	},
	'roles:read': {
		name: 'Read roles',
		description: 'View roles and permission assignments',
		category: 'access',
	},
	'roles:write': {
		name: 'Manage roles',
		description: 'Create and update custom roles and their permissions',
		category: 'access',
	},
	'grants:write': {
		name: 'Manage user grants',
		description: 'Assign direct feature permissions to individual users',
		category: 'access',
	},
	'docs:read': {
		name: 'Read API docs',
		description: 'View OpenAPI documentation',
		category: 'system',
	},
	'profile:write': {
		name: 'Edit own profile',
		description: 'Update profile and avatar for the current user',
		category: 'profile',
	},
} as const

export type PermissionSlug = keyof typeof PERMISSION_CATALOG

export const permissionSlugs = Object.keys(
	PERMISSION_CATALOG,
) as PermissionSlug[]

export const PERMISSIONS = {
	USERS_READ: 'users:read',
	USERS_WRITE: 'users:write',
	ROLES_READ: 'roles:read',
	ROLES_WRITE: 'roles:write',
	GRANTS_WRITE: 'grants:write',
	DOCS_READ: 'docs:read',
	PROFILE_WRITE: 'profile:write',
} as const satisfies Record<string, PermissionSlug>

export const SYSTEM_ROLE_ADMIN = 'admin'
export const SYSTEM_ROLE_USER = 'user'

export const SYSTEM_ROLE_PERMISSIONS = {
	[SYSTEM_ROLE_ADMIN]: permissionSlugs,
	[SYSTEM_ROLE_USER]: [
		PERMISSIONS.PROFILE_WRITE,
		PERMISSIONS.DOCS_READ,
	],
} as const satisfies Record<string, readonly PermissionSlug[]>

export const isPermissionSlug = (value: string): value is PermissionSlug =>
	permissionSlugs.includes(value as PermissionSlug)
