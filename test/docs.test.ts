import { describe, expect, it } from 'bun:test'

const { createApp } = await import('../src/app')

const adminPaths = [
	'/api/access/permissions',
	'/api/access/roles',
	'/api/access/roles/{id}',
	'/api/access/users/{id}',
	'/api/access/users/{id}/grants',
	'/api/access/users/{id}/roles',
	'/api/auth/login',
	'/api/auth/logout',
	'/api/auth/me',
	'/api/auth/me/avatar',
	'/api/auth/refresh',
	'/api/health',
	'/api/ping',
	'/api/users/',
	'/api/users/{id}',
	'/uploads/*',
]

const userPaths = [
	'/api/auth/login',
	'/api/auth/logout',
	'/api/auth/me',
	'/api/auth/me/avatar',
	'/api/auth/refresh',
	'/api/health',
	'/api/ping',
	'/uploads/*',
]

describe('docs', () => {
	const app = createApp()

	async function login(username: string, password: string) {
		const response = await app.handle(
			new Request('http://localhost/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			}),
		)

		expect(response.status).toBe(200)

		const body = await response.json()
		return body.accessToken as string
	}

	async function createRegularUser() {
		const adminToken = await login('admin', 'test-password')

		const response = await app.handle(
			new Request('http://localhost/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${adminToken}`,
				},
				body: JSON.stringify({
					username: 'docs-user',
					password: 'test-password-123',
					role: 'user',
				}),
			}),
		)

		expect(response.status).toBe(200)
	}

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
		const accessToken = await login('admin', 'test-password')

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

	it('shows all API routes to admins', async () => {
		const accessToken = await login('admin', 'test-password')

		const response = await app.handle(
			new Request('http://localhost/api/docs/json', {
				headers: { Authorization: `Bearer ${accessToken}` },
			}),
		)

		const spec = await response.json()
		const paths = Object.keys(spec.paths).sort()

		expect(paths).toEqual(adminPaths)
	})

	it('hides admin routes from regular users', async () => {
		await createRegularUser()
		const accessToken = await login('docs-user', 'test-password-123')

		const response = await app.handle(
			new Request('http://localhost/api/docs/json', {
				headers: { Authorization: `Bearer ${accessToken}` },
			}),
		)

		expect(response.status).toBe(200)

		const spec = await response.json()
		const paths = Object.keys(spec.paths).sort()

		expect(paths).toEqual(userPaths)
		expect(spec.tags?.map((tag: { name: string }) => tag.name)).not.toContain(
			'Users',
		)
		expect(spec.tags?.map((tag: { name: string }) => tag.name)).not.toContain(
			'Access',
		)
	})

	it('allows /api/docs with a session cookie', async () => {
		const loginResponse = await app.handle(
			new Request('http://localhost/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: 'admin',
					password: 'test-password',
				}),
			}),
		)
		const cookie = loginResponse.headers.get('set-cookie')

		expect(cookie).toContain('brain_token=')

		const response = await app.handle(
			new Request('http://localhost/api/docs', {
				headers: { Cookie: cookie ?? '' },
			}),
		)

		expect(response.status).toBe(200)
	})
})
