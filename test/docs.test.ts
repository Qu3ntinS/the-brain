import { describe, expect, it } from 'bun:test'

process.env.JWT_SECRET = 'test-jwt-secret'
process.env.ADMIN_PASSWORD = 'test-password'
process.env.ADMIN_USERNAME = 'admin'

const { createApp } = await import('../src/app')

describe('docs', () => {
	const app = createApp()

	it('blocks /api/docs without a token', async () => {
		const response = await app.handle(
			new Request('http://localhost/api/docs'),
		)

		expect(response.status).toBe(401)
	})

	it('blocks /api/docs/json without a token', async () => {
		const response = await app.handle(
			new Request('http://localhost/api/docs/json'),
		)

		expect(response.status).toBe(401)
	})

	it('allows /api/docs with a valid token', async () => {
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
		const { accessToken } = await login.json()

		const response = await app.handle(
			new Request('http://localhost/api/docs', {
				headers: { Authorization: `Bearer ${accessToken}` },
			}),
		)

		expect(response.status).toBe(200)
		expect(response.headers.get('content-type')).toContain('text/html')

		const html = await response.text()
		expect(html).toContain('rel="icon"')
		expect(html).toContain('/assets/brain-logo.png')
	})

	it('only documents API routes', async () => {
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
		const { accessToken } = await login.json()

		const response = await app.handle(
			new Request('http://localhost/api/docs/json', {
				headers: { Authorization: `Bearer ${accessToken}` },
			}),
		)

		const spec = await response.json()
		const paths = Object.keys(spec.paths).sort()

		expect(paths).toEqual([
			'/api/auth/login',
			'/api/auth/logout',
			'/api/auth/me',
			'/api/auth/refresh',
			'/api/health',
			'/api/ping',
		])
	})

	it('allows /api/docs with a session cookie', async () => {
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

		expect(cookie).toContain('brain_token=')

		const response = await app.handle(
			new Request('http://localhost/api/docs', {
				headers: { Cookie: cookie ?? '' },
			}),
		)

		expect(response.status).toBe(200)
	})
})
