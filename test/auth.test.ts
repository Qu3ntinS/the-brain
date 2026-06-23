import { describe, expect, it } from 'bun:test'

process.env.JWT_SECRET = 'test-jwt-secret'
process.env.ADMIN_PASSWORD = 'test-password'
process.env.ADMIN_USERNAME = 'admin'

const { createApp } = await import('../src/app')

describe('auth', () => {
	const app = createApp()

	it('rejects invalid credentials', async () => {
		const response = await app.handle(
			new Request('http://localhost/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: 'admin', password: 'wrong' }),
			}),
		)

		expect(response.status).toBe(401)
	})

	it('returns a JWT on valid login', async () => {
		const response = await app.handle(
			new Request('http://localhost/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: 'admin',
					password: 'test-password',
				}),
			}),
		)

		expect(response.status).toBe(200)
		const body = await response.json()
		expect(body.tokenType).toBe('Bearer')
		expect(body.accessToken).toBeString()

		const meResponse = await app.handle(
			new Request('http://localhost/api/auth/me', {
				headers: { Authorization: `Bearer ${body.accessToken}` },
			}),
		)

		expect(meResponse.status).toBe(200)
		const me = await meResponse.json()
		expect(me.username).toBe('admin')
	})

	it('protects /api/auth/me without token', async () => {
		const response = await app.handle(
			new Request('http://localhost/api/auth/me'),
		)

		expect(response.status).toBe(401)
	})

	it('accepts /api/auth/me with a session cookie', async () => {
		const login = await app.handle(
			new Request('http://localhost/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: 'admin',
					password: 'test-password',
				}),
			}),
		)
		const cookie = login.headers.get('set-cookie')

		const meResponse = await app.handle(
			new Request('http://localhost/api/auth/me', {
				headers: { Cookie: cookie ?? '' },
			}),
		)

		expect(meResponse.status).toBe(200)
		const me = await meResponse.json()
		expect(me.username).toBe('admin')
	})
})
