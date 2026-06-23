import type { Cookie } from 'elysia'

export const AUTH_COOKIE = 'brain_token'

export function expiresInSeconds(expiresIn: string): number {
	const match = expiresIn.match(/^(\d+)([smhd])$/)
	if (!match) return 60 * 60 * 24 * 7

	const value = Number(match[1])
	const unit = match[2]

	switch (unit) {
		case 's':
			return value
		case 'm':
			return value * 60
		case 'h':
			return value * 60 * 60
		case 'd':
			return value * 60 * 60 * 24
		default:
			return 60 * 60 * 24 * 7
	}
}

export type SessionCookie = Cookie<string | undefined> | Cookie<unknown>

export function setSessionCookie(
	cookie: SessionCookie,
	token: string,
	expiresIn: string,
) {
	cookie.set({
		value: token,
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		maxAge: expiresInSeconds(expiresIn),
		secure: process.env.NODE_ENV === 'production',
	})
}

export function clearSessionCookie(cookie: SessionCookie) {
	cookie.remove()
}
