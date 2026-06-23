import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { apiModule } from './modules/api'
import { spaModule } from './modules/spa'

export const createApp = () =>
	new Elysia()
		.use(
			cors({
				origin: true,
				methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
				allowedHeaders: ['Content-Type', 'Authorization'],
				credentials: true,
			}),
		)
		.use(apiModule)
		.use(spaModule)

export type App = ReturnType<typeof createApp>
