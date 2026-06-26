import { eq } from 'drizzle-orm'
import { db } from './client'
import {
	permissions,
	rolePermissions,
	roles,
	userRoles,
	users,
} from './schema'
import {
	AuthorizationService,
	pickPrimaryRole,
} from '../lib/auth/authorization'
import {
	PERMISSION_CATALOG,
	SYSTEM_ROLE_ADMIN,
	SYSTEM_ROLE_PERMISSIONS,
	SYSTEM_ROLE_USER,
	type PermissionSlug,
} from '../lib/auth/permissions'

const upsertPermission = async (slug: PermissionSlug) => {
	const meta = PERMISSION_CATALOG[slug]

	await db
		.insert(permissions)
		.values({
			id: slug,
			slug,
			name: meta.name,
			description: meta.description,
			category: meta.category,
		})
		.onConflictDoUpdate({
			target: permissions.id,
			set: {
				name: meta.name,
				description: meta.description,
				category: meta.category,
			},
		})
}

const upsertSystemRole = async (
	slug: typeof SYSTEM_ROLE_ADMIN | typeof SYSTEM_ROLE_USER,
	name: string,
	description: string,
	permissionSlugs: readonly PermissionSlug[],
) => {
	await db
		.insert(roles)
		.values({
			id: slug,
			slug,
			name,
			description,
			isSystem: true,
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: roles.id,
			set: {
				name,
				description,
				isSystem: true,
				updatedAt: new Date(),
			},
		})

	await db.delete(rolePermissions).where(eq(rolePermissions.roleId, slug))

	if (permissionSlugs.length > 0) {
		await db.insert(rolePermissions).values(
			permissionSlugs.map((permissionId) => ({
				roleId: slug,
				permissionId,
			})),
		)
	}
}

export const syncAccessCatalog = async () => {
	for (const slug of Object.keys(PERMISSION_CATALOG) as PermissionSlug[]) {
		await upsertPermission(slug)
	}

	await upsertSystemRole(
		SYSTEM_ROLE_ADMIN,
		'Administrator',
		'Full access to all features',
		SYSTEM_ROLE_PERMISSIONS[SYSTEM_ROLE_ADMIN],
	)

	await upsertSystemRole(
		SYSTEM_ROLE_USER,
		'User',
		'Default application access',
		SYSTEM_ROLE_PERMISSIONS[SYSTEM_ROLE_USER],
	)
}

export const migrateLegacyUserRoles = async () => {
	const rows = await db.select({ id: users.id }).from(users)

	for (const user of rows) {
		const existing = await AuthorizationService.getUserRoleSlugs(user.id)

		if (existing.length > 0) continue

		await AuthorizationService.setUserRoles(user.id, [SYSTEM_ROLE_USER])
	}
}

export const ensureAdminUserRoles = async (adminUserId: string) => {
	const slugs = await AuthorizationService.getUserRoleSlugs(adminUserId)

	if (!slugs.includes(SYSTEM_ROLE_ADMIN)) {
		await AuthorizationService.setUserRoles(adminUserId, [
			...new Set([...slugs, SYSTEM_ROLE_ADMIN]),
		])
	}
}

export const getPrimaryRoleForUser = async (userId: string) => {
	const slugs = await AuthorizationService.getUserRoleSlugs(userId)
	return pickPrimaryRole(slugs)
}
