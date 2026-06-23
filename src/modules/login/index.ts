import { Elysia } from 'elysia'
import { loginPageHtml } from './page'

export const loginModule = new Elysia({ name: 'login' }).get(
	'/login',
	({ set }) => {
		set.headers['content-type'] = 'text/html; charset=utf-8'
		return loginPageHtml
	},
	{
		detail: {
			summary: 'Login page',
			description: 'Sign in to access protected areas',
			tags: ['App'],
		},
	},
)
