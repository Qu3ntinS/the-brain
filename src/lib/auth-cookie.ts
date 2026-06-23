export const AUTH_COOKIE = 'brain_token'

export function parseCookieToken(cookieHeader: string | null): string | null {
	if (!cookieHeader) return null

	for (const part of cookieHeader.split(';')) {
		const [name, ...rest] = part.trim().split('=')
		if (name === AUTH_COOKIE) {
			return decodeURIComponent(rest.join('='))
		}
	}

	return null
}

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

export function buildAuthCookie(token: string, expiresIn: string): string {
	const maxAge = expiresInSeconds(expiresIn)
	const secure =
		process.env.NODE_ENV === 'production' ? '; Secure' : ''

	return `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`
}

export function clearAuthCookie(): string {
	const secure =
		process.env.NODE_ENV === 'production' ? '; Secure' : ''

	return `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
}
