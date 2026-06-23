import { Elysia } from 'elysia'
import { landingPageHtml } from './page'

export const landingModule = new Elysia({ name: 'landing' }).get(
	'/',
	({ set }) => {
		set.headers['content-type'] = 'text/html; charset=utf-8'
		return landingPageHtml
	},
	{
		detail: {
			summary: 'Landing page',
			description: 'Playful homepage for The Brain API',
			tags: ['App'],
		},
	},
)
