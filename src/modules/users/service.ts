import { asc, count, eq } from 'drizzle-orm'
import { db } from '../../database/client'
import { users } from '../../database/schema'
import { errors } from '../../lib/http-errors'
import { hashPassword, verifyPassword } from '../../lib/password'
import { deleteAvatarFile, saveAvatarFile } from '../../lib/avatar-storage'
import type { UserRole } from '../../lib/user-role'
import type {
	CreateUserBody,
	UpdateProfileBody,
	UpdateUserBody,
	UserPublic,
} from './model'

type DbUser = typeof users.$inferSelect

const toPublicUser = (user: DbUser): UserPublic => ({
	id: user.id,
	username: user.username,
	displayName: user.displayName,
	avatarUrl: user.avatarUrl,
	role: user.role,
	createdAt: user.createdAt.toISOString(),
	updatedAt: user.updatedAt.toISOString(),
})

export abstract class UsersService {
	static toPublic(user: DbUser): UserPublic {
		return toPublicUser(user)
	}

	static async list() {
		const rows = await db
			.select()
			.from(users)
			.orderBy(asc(users.createdAt))

		return rows.map(toPublicUser)
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

		const [created] = await db
			.insert(users)
			.values({
				id: crypto.randomUUID(),
				username: body.username,
				displayName: body.displayName ?? null,
				role: body.role ?? 'user',
				passwordHash,
				updatedAt: new Date(),
			})
			.returning()

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

		if (body.role && body.role !== user.role) {
			const demoteCheck = await UsersService.ensureAdminRemains(user, body.role)

			if ('code' in demoteCheck) return demoteCheck
		}

		if (id === actorId && body.role && body.role !== 'admin') {
			return errors.badRequest('You cannot remove your own admin role')
		}

		const patch: Partial<DbUser> = {
			updatedAt: new Date(),
		}

		if (body.username !== undefined) patch.username = body.username
		if (body.displayName !== undefined) patch.displayName = body.displayName
		if (body.role !== undefined) patch.role = body.role
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

		if (user.role === 'admin') {
			const adminCheck = await UsersService.ensureAdminRemains(user, 'user')

			if ('code' in adminCheck) return adminCheck
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

	static toAuthUser(user: DbUser | UserPublic) {
		return {
			id: user.id,
			username: user.username,
			displayName: user.displayName,
			avatarUrl: user.avatarUrl,
			role: user.role as UserRole,
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

	private static async ensureAdminRemains(user: DbUser, nextRole: UserRole) {
		if (user.role !== 'admin' || nextRole === 'admin') {
			return { ok: true as const }
		}

		const [result] = await db
			.select({ total: count() })
			.from(users)
			.where(eq(users.role, 'admin'))

		if ((result?.total ?? 0) <= 1) {
			return errors.badRequest('At least one admin account must remain')
		}

		return { ok: true as const }
	}
}
