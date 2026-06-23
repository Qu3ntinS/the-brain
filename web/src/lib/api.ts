import { treaty } from '@elysiajs/eden'
import type { App } from '@brain/export/app-type'

const apiOrigin =
	typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin

export const api = treaty<App>(apiOrigin, {
	fetch: {
		credentials: 'include',
	},
})

export type ApiClient = typeof api
