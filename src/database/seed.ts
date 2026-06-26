import { eq } from 'drizzle-orm'
import { env } from '../config/env'
import { hashPassword, verifyPassword } from '../lib/password'
import { db } from './client'
import { users } from './schema'
import {
	ensureAdminUserRoles,
	migrateLegacyUserRoles,
	syncAccessCatalog,
} from './seed-access'

export const seedAdminUser = async () => {
	await syncAccessCatalog()

	const passwordHash = await hashPassword(env.adminPassword)

	const [existing] = await db
		.select()
		.from(users)
		.where(eq(users.username, env.adminUsername))
		.limit(1)

	if (existing) {
		const patch: Partial<typeof users.$inferInsert> = {
			updatedAt: new Date(),
		}

		if (!(await verifyPassword(env.adminPassword, existing.passwordHash))) {
			patch.passwordHash = passwordHash
		}

		const [updated] = await db
			.update(users)
			.set(patch)
			.where(eq(users.username, env.adminUsername))
			.returning()

		await ensureAdminUserRoles((updated ?? existing).id)
		await migrateLegacyUserRoles()

		return updated ?? existing
	}

	const [created] = await db
		.insert(users)
		.values({
			id: crypto.randomUUID(),
			username: env.adminUsername,
			passwordHash,
			updatedAt: new Date(),
		})
		.returning()

	await ensureAdminUserRoles(created!.id)
	await migrateLegacyUserRoles()

	return created
}
