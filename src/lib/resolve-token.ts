import type { PermissionSlug } from '../lib/auth/permissions'
import { pickPrimaryRole } from '../lib/auth/authorization'

type JwtLike = {
	verify: (token: string) => Promise<unknown>
}

export async function resolveToken(jwt: JwtLike, token: string | null | undefined) {
	if (!token) return null

	const payload = await jwt.verify(token)
	if (!payload || typeof payload !== 'object') return null

	const record = payload as Record<string, unknown>
	if (typeof record.sub !== 'string') return null
	if (typeof record.username !== 'string') return null

	const role =
		typeof record.role === 'string' && record.role.length > 0
			? record.role
			: pickPrimaryRole([])

	const displayName =
		record.displayName === null || typeof record.displayName === 'string'
			? (record.displayName as string | null)
			: null

	const avatarUrl =
		record.avatarUrl === null || typeof record.avatarUrl === 'string'
			? (record.avatarUrl as string | null)
			: null

	return {
		token,
		user: {
			id: record.sub,
			username: record.username,
			displayName,
			avatarUrl,
			role,
		},
	}
}
