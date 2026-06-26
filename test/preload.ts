process.env.JWT_SECRET = 'test-jwt-secret'
process.env.ADMIN_PASSWORD = 'test-password'
process.env.ADMIN_USERNAME = 'admin'

const { seedAdminUser } = await import('../src/database/seed')
await seedAdminUser()
