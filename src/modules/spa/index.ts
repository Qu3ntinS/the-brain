import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'

export const spaModule = new Elysia({ name: 'spa' })
	.use(
		staticPlugin({
			assets: 'public/assets',
			prefix: '/assets',
		}),
	)
	.use(
		staticPlugin({
			assets: 'public/uploads',
			prefix: '/uploads',
		}),
	)
