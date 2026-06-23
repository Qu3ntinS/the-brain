import { describe, expect, it } from 'bun:test'

process.env.JWT_SECRET = 'test-jwt-secret'
process.env.ADMIN_PASSWORD = 'test-password'
process.env.ADMIN_USERNAME = 'admin'

const { createApp } = await import('../src/app')

describe('not found', () => {
	const app = createApp()

	it('returns HTML 404 for unknown API routes in the browser', async () => {
		const response = await app.handle(
			new Request('http://localhost/api/irgendwas', {
				headers: { Accept: 'text/html' },
			}),
		)

		expect(response.status).toBe(404)
		expect(response.headers.get('content-type')).toContain('text/html')
		expect(await response.text()).toContain('Not found')
	})

	it('returns JSON 404 for unknown API routes', async () => {
		const response = await app.handle(
			new Request('http://localhost/api/irgendwas', {
				headers: { Accept: 'application/json' },
			}),
		)

		expect(response.status).toBe(404)
		const body = await response.json()
		expect(body.error).toBe('Not Found')
	})

	it('serves the SPA shell for unknown frontend routes', async () => {
		const response = await app.handle(
			new Request('http://localhost/irgendwas', {
				headers: { Accept: 'text/html' },
			}),
		)

		expect(response.status).toBe(200)
		expect(await response.text()).toContain('id="app"')
	})
})
