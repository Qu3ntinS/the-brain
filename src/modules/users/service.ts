import { asc, eq } from 'drizzle-orm'
import { db } from '../../database/client'
import { users } from '../../database/schema'
import {
	AuthorizationService,
	pickPrimaryRole,
} from '../../lib/auth/authorization'
import { assignUserRoles } from '../../lib/auth/role-assignment'
import {
	SYSTEM_ROLE_ADMIN,
	SYSTEM_ROLE_USER,
} from '../../lib/auth/permissions'
import { deleteAvatarFile, saveAvatarFile } from '../../lib/avatar-storage'
import { errors } from '../../lib/http-errors'
import { hashPassword, verifyPassword } from '../../lib/password'
import type {
	CreateUserBody,
	UpdateProfileBody,
	UpdateUserBody,
	UserPublic,
} from './model'

type DbUser = typeof users.$inferSelect

const toPublicUser = async (user: DbUser): Promise<UserPublic> => {
	const roles = await AuthorizationService.getUserRoleSlugs(user.id)

	return {
		id: user.id,
		username: user.username,
		displayName: user.displayName,
		avatarUrl: user.avatarUrl,
		role: pickPrimaryRole(roles),
		roles,
		createdAt: user.createdAt.toISOString(),
		updatedAt: user.updatedAt.toISOString(),
	}
}

export abstract class UsersService {
	static async toPublic(user: DbUser): Promise<UserPublic> {
		return toPublicUser(user)
	}

	static async list() {
		const rows = await db
			.select()
			.from(users)
			.orderBy(asc(users.createdAt))

		return Promise.all(rows.map(toPublicUser))
	}

	static async getById(id: string) {
		const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)

		return user ? toPublicUser(user) : null
	}

	static async getRecordById(id: string) {
		const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)

		return user ?? null
	}

	static async getRecordByUsername(username: string) {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.username, username))
			.limit(1)

		return user ?? null
	}

	static async create(body: CreateUserBody) {
		const existing = await UsersService.getRecordByUsername(body.username)

		if (existing) {
			return errors.conflict('Username is already taken')
		}

		const passwordHash = await hashPassword(body.password)
		const roleSlugs = body.roles?.length
			? body.roles
			: body.role
				? [body.role]
				: [SYSTEM_ROLE_USER]

		const [created] = await db
			.insert(users)
			.values({
				id: crypto.randomUUID(),
				username: body.username,
				displayName: body.displayName ?? null,
				passwordHash,
				updatedAt: new Date(),
			})
			.returning()

		const assigned = await assignUserRoles(created!.id, roleSlugs, created!.id)

		if ('code' in assigned) {
			await db.delete(users).where(eq(users.id, created!.id))
			return assigned
		}

		return toPublicUser(created!)
	}

	static async update(id: string, body: UpdateUserBody, actorId: string) {
		const user = await UsersService.getRecordById(id)

		if (!user) {
			return errors.notFound('User not found')
		}

		if (body.username && body.username !== user.username) {
			const existing = await UsersService.getRecordByUsername(body.username)

			if (existing) {
				return errors.conflict('Username is already taken')
			}
		}

		const nextRoles =
			body.roles ??
			(body.role !== undefined ? [body.role] : undefined)

		if (nextRoles) {
			const roleUpdate = await assignUserRoles(id, nextRoles, actorId)

			if ('code' in roleUpdate) return roleUpdate
		}

		const patch: Partial<DbUser> = {
			updatedAt: new Date(),
		}

		if (body.username !== undefined) patch.username = body.username
		if (body.displayName !== undefined) patch.displayName = body.displayName
		if (body.password) patch.passwordHash = await hashPassword(body.password)

		const [updated] = await db
			.update(users)
			.set(patch)
			.where(eq(users.id, id))
			.returning()

		return toPublicUser(updated!)
	}

	static async remove(id: string, actorId: string) {
		if (id === actorId) {
			return errors.badRequest('You cannot delete your own account')
		}

		const user = await UsersService.getRecordById(id)

		if (!user) {
			return errors.notFound('User not found')
		}

		if (await AuthorizationService.userHasRole(id, SYSTEM_ROLE_ADMIN)) {
			const adminCount = await AuthorizationService.countUsersWithRole(
				SYSTEM_ROLE_ADMIN,
			)

			if (adminCount <= 1) {
				return errors.badRequest('At least one admin account must remain')
			}
		}

		await db.delete(users).where(eq(users.id, id))

		return { ok: true as const }
	}

	static async updateProfile(userId: string, body: UpdateProfileBody) {
		const user = await UsersService.getRecordById(userId)

		if (!user) {
			return errors.notFound('User not found')
		}

		if (body.password) {
			if (!body.currentPassword) {
				return errors.badRequest(
					'Current password is required to set a new password',
				)
			}

			if (!(await verifyPassword(body.currentPassword, user.passwordHash))) {
				return errors.unauthorized('Current password is incorrect')
			}
		}

		const patch: Partial<DbUser> = {
			updatedAt: new Date(),
		}

		if (body.displayName !== undefined) patch.displayName = body.displayName
		if (body.password) patch.passwordHash = await hashPassword(body.password)

		const [updated] = await db
			.update(users)
			.set(patch)
			.where(eq(users.id, userId))
			.returning()

		return toPublicUser(updated!)
	}

	static async toAuthUser(user: DbUser | UserPublic) {
		const roles =
			'roles' in user && Array.isArray(user.roles)
				? user.roles
				: await AuthorizationService.getUserRoleSlugs(user.id)

		return {
			id: user.id,
			username: user.username,
			displayName: user.displayName,
			avatarUrl: user.avatarUrl,
			role: pickPrimaryRole(roles),
		}
	}

	static async updateAvatar(userId: string, file: File) {
		const user = await UsersService.getRecordById(userId)

		if (!user) {
			return errors.notFound('User not found')
		}

		try {
			const avatarUrl = await saveAvatarFile(userId, file)

			const [updated] = await db
				.update(users)
				.set({ avatarUrl, updatedAt: new Date() })
				.where(eq(users.id, userId))
				.returning()

			return toPublicUser(updated!)
		} catch (error) {
			return errors.badRequest(
				error instanceof Error ? error.message : 'Could not save avatar',
			)
		}
	}

	static async removeAvatar(userId: string) {
		const user = await UsersService.getRecordById(userId)

		if (!user) {
			return errors.notFound('User not found')
		}

		await deleteAvatarFile(user.avatarUrl)

		const [updated] = await db
			.update(users)
			.set({ avatarUrl: null, updatedAt: new Date() })
			.where(eq(users.id, userId))
			.returning()

		return toPublicUser(updated!)
	}
}
