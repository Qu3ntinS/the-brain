import { describe, expect, it } from 'bun:test'
import { PERMISSIONS } from '../src/lib/auth/permissions'

const { createApp } = await import('../src/app')

describe('access', () => {
	const app = createApp()

	async function adminToken() {
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

		const body = await login.json()
		return body.accessToken as string
	}

	it('lists permissions for admins', async () => {
		const token = await adminToken()

		const response = await app.handle(
			new Request('http://localhost/api/access/permissions', {
				headers: { Authorization: `Bearer ${token}` },
			}),
		)

		expect(response.status).toBe(200)
		const body = await response.json()
		expect(body.permissions.some((p: { slug: string }) => p.slug === PERMISSIONS.USERS_READ)).toBe(true)
	})

	it('creates a custom role with permissions', async () => {
		const token = await adminToken()

		const response = await app.handle(
			new Request('http://localhost/api/access/roles', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					slug: 'support',
					name: 'Support',
					description: 'Can read users',
					permissions: [PERMISSIONS.USERS_READ, PERMISSIONS.DOCS_READ],
				}),
			}),
		)

		expect(response.status).toBe(200)
		const body = await response.json()
		expect(body.slug).toBe('support')
		expect(body.permissions).toContain(PERMISSIONS.USERS_READ)
	})

	it('returns effective permissions on /auth/me', async () => {
		const token = await adminToken()

		const response = await app.handle(
			new Request('http://localhost/api/auth/me', {
				headers: { Authorization: `Bearer ${token}` },
			}),
		)

		expect(response.status).toBe(200)
		const body = await response.json()
		expect(body.permissions).toContain(PERMISSIONS.USERS_WRITE)
		expect(body.roles).toContain('admin')
	})
})
