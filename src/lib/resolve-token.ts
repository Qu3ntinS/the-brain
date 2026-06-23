type JwtLike = {
	verify: (token: string) => Promise<unknown>
}

export async function resolveToken(jwt: JwtLike, token: string | null | undefined) {
	if (!token) return null

	const payload = await jwt.verify(token)
	if (!payload || typeof payload !== 'object') return null

	const record = payload as Record<string, unknown>
	if (typeof record.sub !== 'string') return null

	return {
		token,
		user: {
			id: record.sub,
			username: String(record.username ?? ''),
		},
	}
}
