import type { App } from 'vue'
import { computed, reactive } from 'vue'

export type AuthUser = {
	id: string
	username: string
}

const API = '/api'
const REFRESH_MS = 60 * 60 * 1000

export const sessionState = reactive({
	user: null as AuthUser | null,
	ready: false,
})

export async function fetchMe(): Promise<AuthUser | null> {
	const response = await fetch(`${API}/auth/me`, { credentials: 'include' })

	if (!response.ok) {
		sessionState.user = null
		return null
	}

	const user = (await response.json()) as AuthUser
	sessionState.user = user
	return user
}

export async function refreshSession(): Promise<boolean> {
	const response = await fetch(`${API}/auth/refresh`, {
		method: 'POST',
		credentials: 'include',
	})

	return response.ok
}

export async function login(username: string, password: string): Promise<boolean> {
	const response = await fetch(`${API}/auth/login`, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
	})

	if (!response.ok) return false

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
		syncSession,
	}
}
