import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { userRoles } from '../lib/user-role'

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	displayName: text('display_name'),
	avatarUrl: text('avatar_url'),
	role: text('role', { enum: userRoles }).notNull().default('user'),
	passwordHash: text('password_hash').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull(),
})
