import { describe, expect, it } from 'bun:test'
import { TEST_ADMIN_DISPLAY_NAME } from './test-data'

const { createApp } = await import('../src/app')

describe('users', () => {
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

	it('requires auth for user list', async () => {
		const response = await app.handle(
			new Request('http://localhost/api/users'),
		)

		expect(response.status).toBe(401)
	})

	it('creates, updates, and deletes a user', async () => {
		const token = await adminToken()

		const create = await app.handle(
			new Request('http://localhost/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					username: 'test-user',
					password: 'test-password-123',
					displayName: 'Test User',
					role: 'user',
				}),
			}),
		)

		expect(create.status).toBe(200)
		const created = await create.json()
		expect(created.username).toBe('test-user')
		expect(created.displayName).toBe('Test User')

		const list = await app.handle(
			new Request('http://localhost/api/users', {
				headers: { Authorization: `Bearer ${token}` },
			}),
		)

		expect(list.status).toBe(200)
		const listed = await list.json()
		expect(listed.users.some((user: { id: string }) => user.id === created.id)).toBe(
			true,
		)

		const update = await app.handle(
			new Request(`http://localhost/api/users/${created.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					displayName: 'Updated User',
				}),
			}),
		)

		expect(update.status).toBe(200)
		const updated = await update.json()
		expect(updated.displayName).toBe('Updated User')

		const remove = await app.handle(
			new Request(`http://localhost/api/users/${created.id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			}),
		)

		expect(remove.status).toBe(200)
	})

	it('updates the current profile', async () => {
		const token = await adminToken()

		const response = await app.handle(
			new Request('http://localhost/api/auth/me', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					displayName: TEST_ADMIN_DISPLAY_NAME,
				}),
			}),
		)

		expect(response.status).toBe(200)
		const body = await response.json()
		expect(body.displayName).toBe(TEST_ADMIN_DISPLAY_NAME)
		expect(body.role).toBe('admin')
	})
})
