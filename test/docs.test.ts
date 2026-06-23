import { describe, expect, it } from 'bun:test'

process.env.JWT_SECRET = 'test-jwt-secret'
process.env.ADMIN_PASSWORD = 'test-password'
process.env.ADMIN_USERNAME = 'admin'

const { createApp } = await import('../src/app')

describe('docs', () => {
	const app = createApp()

	it('blocks /docs without a token', async () => {
		const response = await app.handle(new Request('http://localhost/docs'))

		expect(response.status).toBe(401)
	})

	it('blocks /docs/json without a token', async () => {
		const response = await app.handle(
			new Request('http://localhost/docs/json'),
		)

		expect(response.status).toBe(401)
	})

	it('allows /docs with a valid token', async () => {
		const login = await app.handle(
			new Request('http://localhost/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: 'admin',
					password: 'test-password',
				}),
			}),
		)
		const { accessToken } = await login.json()

		const response = await app.handle(
			new Request('http://localhost/docs', {
				headers: { Authorization: `Bearer ${accessToken}` },
			}),
		)

		expect(response.status).toBe(200)
		expect(response.headers.get('content-type')).toContain('text/html')
	})

	it('allows /docs with a session cookie', async () => {
		const login = await app.handle(
			new Request('http://localhost/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: 'admin',
					password: 'test-password',
				}),
			}),
		)
		const cookie = login.headers.get('set-cookie')

		expect(cookie).toContain('brain_token=')

		const response = await app.handle(
			new Request('http://localhost/docs', {
				headers: { Cookie: cookie ?? '' },
			}),
		)

		expect(response.status).toBe(200)
	})
})
