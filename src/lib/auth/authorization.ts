import { eq, inArray } from 'drizzle-orm'
import { db } from '../../database/client'
import {
	permissions,
	rolePermissions,
	roles,
	userPermissionGrants,
	userRoles,
} from '../../database/schema'
import {
	isPermissionSlug,
	PERMISSIONS,
	SYSTEM_ROLE_ADMIN,
	type PermissionSlug,
} from './permissions'

export type ResolvedAccess = {
	roles: string[]
	permissions: PermissionSlug[]
	primaryRole: string
}

const rolePriority = (slug: string) => {
	if (slug === SYSTEM_ROLE_ADMIN) return 0
	return 1
}

export const pickPrimaryRole = (roleSlugs: string[]) => {
	if (roleSlugs.length === 0) return SYSTEM_ROLE_ADMIN

	return [...roleSlugs].sort(
		(a, b) => rolePriority(a) - rolePriority(b) || a.localeCompare(b),
	)[0]!
}

export abstract class AuthorizationService {
	static async resolveAccess(userId: string): Promise<ResolvedAccess> {
		const assignedRoles = await db
			.select({ id: roles.id, slug: roles.slug })
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(eq(userRoles.userId, userId))

		const roleSlugs = assignedRoles.map((row) => row.slug)
		const roleIds = assignedRoles.map((row) => row.id)

		const rolePermissionRows =
			roleSlugs.length === 0
				? []
				: await db
						.select({ slug: permissions.slug })
						.from(rolePermissions)
						.innerJoin(
							permissions,
							eq(rolePermissions.permissionId, permissions.id),
						)
						.where(inArray(rolePermissions.roleId, roleIds))

		const grantRows = await db
			.select({
				slug: permissions.slug,
				effect: userPermissionGrants.effect,
			})
			.from(userPermissionGrants)
			.innerJoin(
				permissions,
				eq(userPermissionGrants.permissionId, permissions.id),
			)
			.where(eq(userPermissionGrants.userId, userId))

		const effective = new Set<PermissionSlug>(
			rolePermissionRows
				.map((row) => row.slug)
				.filter(isPermissionSlug),
		)

		for (const grant of grantRows) {
			if (!isPermissionSlug(grant.slug)) continue

			if (grant.effect === 'allow') effective.add(grant.slug)
			if (grant.effect === 'deny') effective.delete(grant.slug)
		}

		return {
			roles: roleSlugs,
			permissions: [...effective],
			primaryRole: pickPrimaryRole(roleSlugs),
		}
	}

	static async hasPermission(userId: string, permission: PermissionSlug) {
		const access = await AuthorizationService.resolveAccess(userId)
		return access.permissions.includes(permission)
	}

	static async hasAnyPermission(
		userId: string,
		required: PermissionSlug[],
	) {
		const access = await AuthorizationService.resolveAccess(userId)
		return required.some((permission) =>
			access.permissions.includes(permission),
		)
	}

	static async getUserRoleSlugs(userId: string) {
		const rows = await db
			.select({ slug: roles.slug })
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(eq(userRoles.userId, userId))

		return rows.map((row) => row.slug)
	}

	static async setUserRoles(userId: string, roleSlugs: string[]) {
		const uniqueSlugs = [...new Set(roleSlugs)]

		if (uniqueSlugs.length === 0) {
			return { ok: false as const, message: 'At least one role is required' }
		}

		const roleRows = await db
			.select()
			.from(roles)
			.where(inArray(roles.slug, uniqueSlugs))

		if (roleRows.length !== uniqueSlugs.length) {
			return { ok: false as const, message: 'One or more roles were not found' }
		}

		await db.delete(userRoles).where(eq(userRoles.userId, userId))

		await db.insert(userRoles).values(
			roleRows.map((role) => ({
				userId,
				roleId: role.id,
			})),
		)

		return { ok: true as const }
	}

	static async countUsersWithRole(roleSlug: string) {
		const [role] = await db
			.select()
			.from(roles)
			.where(eq(roles.slug, roleSlug))
			.limit(1)

		if (!role) return 0

		const rows = await db
			.select({ userId: userRoles.userId })
			.from(userRoles)
			.where(eq(userRoles.roleId, role.id))

		return rows.length
	}

	static async userHasRole(userId: string, roleSlug: string) {
		const slugs = await AuthorizationService.getUserRoleSlugs(userId)
		return slugs.includes(roleSlug)
	}

	static async canManageUsers(userId: string) {
		return AuthorizationService.hasPermission(userId, PERMISSIONS.USERS_WRITE)
	}
}
