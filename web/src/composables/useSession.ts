import type { App } from 'vue'
import { computed, reactive } from 'vue'
import { api } from '@/lib/api'
import type { AuthUser } from '@brain/export/auth-type'

const REFRESH_MS = 60 * 60 * 1000

export type { AuthUser }

export const sessionState = reactive({
	user: null as AuthUser | null,
	ready: false,
})

export function waitForSession(): Promise<void> {
	if (sessionState.ready) return Promise.resolve()

	return new Promise((resolve) => {
		const interval = setInterval(() => {
			if (sessionState.ready) {
				clearInterval(interval)
				resolve()
			}
		}, 16)
	})
}

export async function logout(): Promise<void> {
	await api.api.auth.logout.post()
	sessionState.user = null
}

export async function fetchMe(): Promise<AuthUser | null> {
	const { data, error } = await api.api.auth.me.get()

	if (error || !data) {
		sessionState.user = null
		return null
	}

	sessionState.user = {
		id: data.id,
		username: data.username,
		displayName: data.displayName,
		avatarUrl: data.avatarUrl,
		role: data.role,
	}
	return sessionState.user
}

export async function refreshSession(): Promise<boolean> {
	const { error } = await api.api.auth.refresh.post()
	return !error
}

export async function login(username: string, password: string): Promise<boolean> {
	const { error } = await api.api.auth.login.post({ username, password })

	if (error) return false

	await refreshSession()
	await fetchMe()
	return true
}

export async function syncSession(): Promise<boolean> {
	const authed = !!(await fetchMe())

	if (authed) {
		await refreshSession()
	}

	return authed
}

let intervalId: ReturnType<typeof setInterval> | undefined

async function bootstrapSession() {
	await syncSession()
	sessionState.ready = true

	intervalId ??= setInterval(() => {
		void syncSession()
	}, REFRESH_MS)

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') {
			void syncSession()
		}
	})
}

export function installSession(app: App) {
	app.provide('session', {
		user: computed(() => sessionState.user),
		ready: computed(() => sessionState.ready),
		isAuthed: computed(() => !!sessionState.user),
	})

	void bootstrapSession()
}

export function useSession() {
	return {
		state: sessionState,
		login,
		logout,
		syncSession,
		waitForSession,
	}
}
