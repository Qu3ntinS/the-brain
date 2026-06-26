import { describe, expect, it } from 'bun:test'

const png = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
	'base64',
)

const { createApp } = await import('../src/app')

describe('avatar', () => {
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

	it('uploads and removes a profile avatar', async () => {
		const token = await adminToken()
		const form = new FormData()
		form.append(
			'avatar',
			new File([png], 'avatar.png', { type: 'image/png' }),
		)

		const upload = await app.handle(
			new Request('http://localhost/api/auth/me/avatar', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: form,
			}),
		)

		expect(upload.status).toBe(200)
		const uploaded = await upload.json()
		expect(uploaded.avatarUrl).toStartWith('/uploads/avatars/')

		const remove = await app.handle(
			new Request('http://localhost/api/auth/me/avatar', {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			}),
		)

		expect(remove.status).toBe(200)
		const removed = await remove.json()
		expect(removed.avatarUrl).toBeNull()
	})
})
