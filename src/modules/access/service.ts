import { asc, eq, inArray } from 'drizzle-orm'
import { db } from '../../database/client'
import {
	permissions,
	rolePermissions,
	roles,
	userPermissionGrants,
} from '../../database/schema'
import { AuthorizationService } from '../../lib/auth/authorization'
import {
	isPermissionSlug,
	PERMISSION_CATALOG,
	PERMISSIONS,
	SYSTEM_ROLE_ADMIN,
	type PermissionSlug,
} from '../../lib/auth/permissions'
import { assignUserRoles } from '../../lib/auth/role-assignment'
import { errors } from '../../lib/http-errors'
import type {
	CreateRoleBody,
	RolePublic,
	UpdateRoleBody,
} from './model'

const toRolePublic = async (role: typeof roles.$inferSelect): Promise<RolePublic> => {
	const permissionRows = await db
		.select({ slug: permissions.slug })
		.from(rolePermissions)
		.innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
		.where(eq(rolePermissions.roleId, role.id))

	return {
		id: role.id,
		slug: role.slug,
		name: role.name,
		description: role.description,
		isSystem: role.isSystem,
		permissions: permissionRows.map((row) => row.slug),
		createdAt: role.createdAt.toISOString(),
		updatedAt: role.updatedAt.toISOString(),
	}
}

const validatePermissionSlugs = (slugs: string[]) => {
	const valid = slugs.filter(isPermissionSlug)

	if (valid.length !== slugs.length) {
		return errors.badRequest('One or more permissions are invalid')
	}

	return valid
}

export abstract class AccessService {
	static async listPermissions() {
		const rows = await db.select().from(permissions).orderBy(asc(permissions.slug))

		return rows.map((row) => ({
			id: row.id,
			slug: row.slug,
			name: row.name,
			description: row.description,
			category: row.category,
		}))
	}

	static async listRoles() {
		const rows = await db.select().from(roles).orderBy(asc(roles.createdAt))

		return Promise.all(rows.map(toRolePublic))
	}

	static async getRoleById(id: string) {
		const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1)

		return role ? toRolePublic(role) : null
	}

	static async createRole(body: CreateRoleBody) {
		const [existing] = await db
			.select()
			.from(roles)
			.where(eq(roles.slug, body.slug))
			.limit(1)

		if (existing) {
			return errors.conflict('Role slug is already taken')
		}

		const permissionSlugs = body.permissions ?? []
		const validated = validatePermissionSlugs(permissionSlugs)

		if ('code' in validated) return validated

		const id = crypto.randomUUID()

		const [created] = await db
			.insert(roles)
			.values({
				id,
				slug: body.slug,
				name: body.name,
				description: body.description ?? null,
				isSystem: false,
				updatedAt: new Date(),
			})
			.returning()

		if (validated.length > 0) {
			await db.insert(rolePermissions).values(
				validated.map((permissionId) => ({
					roleId: id,
					permissionId,
				})),
			)
		}

		return toRolePublic(created!)
	}

	static async updateRole(id: string, body: UpdateRoleBody) {
		const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1)

		if (!role) {
			return errors.notFound('Role not found')
		}

		if (role.isSystem && body.permissions) {
			return errors.badRequest('System roles cannot change permissions here')
		}

		const patch: Partial<typeof roles.$inferInsert> = {
			updatedAt: new Date(),
		}

		if (body.name !== undefined) patch.name = body.name
		if (body.description !== undefined) patch.description = body.description

		const [updated] = await db
			.update(roles)
			.set(patch)
			.where(eq(roles.id, id))
			.returning()

		if (body.permissions) {
			const validated = validatePermissionSlugs(body.permissions)

			if ('code' in validated) return validated

			await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id))

			if (validated.length > 0) {
				await db.insert(rolePermissions).values(
					validated.map((permissionId) => ({
						roleId: id,
						permissionId,
					})),
				)
			}
		}

		return toRolePublic(updated!)
	}

	static async removeRole(id: string) {
		const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1)

		if (!role) {
			return errors.notFound('Role not found')
		}

		if (role.isSystem) {
			return errors.badRequest('System roles cannot be deleted')
		}

		if (role.slug === SYSTEM_ROLE_ADMIN) {
			return errors.badRequest('The admin role cannot be deleted')
		}

		await db.delete(roles).where(eq(roles.id, id))

		return { ok: true as const }
	}

	static async setUserRoles(userId: string, roleSlugs: string[], actorId: string) {
		const result = await assignUserRoles(userId, roleSlugs, actorId)

		if ('code' in result) return result

		return AuthorizationService.resolveAccess(userId)
	}

	static async getUserAccess(userId: string) {
		const access = await AuthorizationService.resolveAccess(userId)

		const grants = await db
			.select({
				permission: permissions.slug,
				effect: userPermissionGrants.effect,
			})
			.from(userPermissionGrants)
			.innerJoin(
				permissions,
				eq(userPermissionGrants.permissionId, permissions.id),
			)
			.where(eq(userPermissionGrants.userId, userId))

		return {
			userId,
			roles: access.roles,
			permissions: access.permissions,
			grants,
		}
	}

	static async setUserGrants(
		userId: string,
		grants: { permission: string; effect: 'allow' | 'deny' }[],
	) {
		for (const grant of grants) {
			if (!isPermissionSlug(grant.permission)) {
				return errors.badRequest(`Invalid permission: ${grant.permission}`)
			}
		}

		await db
			.delete(userPermissionGrants)
			.where(eq(userPermissionGrants.userId, userId))

		if (grants.length > 0) {
			await db.insert(userPermissionGrants).values(
				grants.map((grant) => ({
					userId,
					permissionId: grant.permission,
					effect: grant.effect,
				})),
			)
		}

		return AccessService.getUserAccess(userId)
	}

	static permissionCatalog() {
		return Object.entries(PERMISSION_CATALOG).map(([slug, meta]) => ({
			id: slug,
			slug,
			...meta,
		}))
	}

	static requiredPermissions = PERMISSIONS
}
