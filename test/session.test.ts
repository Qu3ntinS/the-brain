import { describe, expect, it } from 'bun:test'

process.env.JWT_SECRET = 'test-jwt-secret'
process.env.ADMIN_PASSWORD = 'test-password'
process.env.ADMIN_USERNAME = 'admin'

const { createApp } = await import('../src/app')

describe('session', () => {
	const app = createApp()

	async function loginCookie() {
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

		return login.headers.get('set-cookie') ?? ''
	}

	it('blocks /api/auth/refresh without a session', async () => {
		const response = await app.handle(
			new Request('http://localhost/api/auth/refresh', { method: 'POST' }),
		)

		expect(response.status).toBe(401)
	})

	it('refreshes the session cookie', async () => {
		const cookie = await loginCookie()

		const response = await app.handle(
			new Request('http://localhost/api/auth/refresh', {
				method: 'POST',
				headers: { Cookie: cookie },
			}),
		)

		expect(response.status).toBe(200)
		const body = await response.json()
		expect(body.tokenType).toBe('Bearer')
		expect(response.headers.get('set-cookie')).toContain('brain_token=')
	})
})
