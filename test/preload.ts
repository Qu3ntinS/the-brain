process.env.JWT_SECRET = 'test-jwt-secret'
process.env.ADMIN_PASSWORD = 'test-password'
process.env.ADMIN_USERNAME = 'admin'

import { afterAll } from 'bun:test'

const { closeDatabase } = await import('../src/database/client')
const { seedAdminUser } = await import('../src/database/seed')
const { cleanupTestDatabase } = await import('./db-cleanup')

await cleanupTestDatabase()
await seedAdminUser()

afterAll(async () => {
	await cleanupTestDatabase()
	await closeDatabase()
})