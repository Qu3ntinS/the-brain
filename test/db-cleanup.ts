import { eq, inArray } from 'drizzle-orm'
import { db } from '../src/database/client'
import { users } from '../src/database/schema'
import { deleteAvatarFile } from '../src/lib/avatar-storage'
import { TEST_ADMIN_DISPLAY_NAME, TEST_USERNAMES } from './test-data'

export const cleanupTestDatabase = async () => {
	const testUsers = await db
		.select()
		.from(users)
		.where(inArray(users.username, [...TEST_USERNAMES]))

	for (const user of testUsers) {
		await deleteAvatarFile(user.avatarUrl)
	}

	if (testUsers.length > 0) {
		await db
			.delete(users)
			.where(inArray(users.username, [...TEST_USERNAMES]))
	}

	const adminUsername = process.env.ADMIN_USERNAME ?? 'admin'
	const [admin] = await db
		.select()
		.from(users)
		.where(eq(users.username, adminUsername))
		.limit(1)

	if (admin?.displayName === TEST_ADMIN_DISPLAY_NAME) {
		await db
			.update(users)
			.set({
				displayName: null,
				updatedAt: new Date(),
			})
			.where(eq(users.id, admin.id))
	}
}
