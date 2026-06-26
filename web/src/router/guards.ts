import type { RouteLocationNormalized } from 'vue-router'
import { sessionState, waitForSession } from '@/composables/useSession'

export async function authGuard(to: RouteLocationNormalized) {
	if (!to.meta.requiresAuth) return true

	await waitForSession()

	if (sessionState.user) return true

	return {
		name: 'login',
		query: { next: to.fullPath },
	}
}

export async function permissionGuard(to: RouteLocationNormalized) {
	const required = to.meta.requiresPermission

	if (typeof required !== 'string') return true

	await waitForSession()

	if (
		(sessionState.user?.permissions as readonly string[] | undefined)?.includes(
			required,
		)
	) {
		return true
	}

	return { name: 'dashboard' }
}

export async function guestGuard(to: RouteLocationNormalized) {
	if (to.name !== 'login') return true

	await waitForSession()

	if (!sessionState.user) return true

	const next =
		typeof to.query.next === 'string' && to.query.next.startsWith('/')
			? to.query.next
			: '/dashboard'

	return next
}
