import { Elysia, t } from 'elysia'
import { jwtAuth } from '../../plugins/jwt-auth'

export const apiModule = new Elysia({ prefix: '/api', name: 'api' })
	.use(jwtAuth)
	.get(
		'/health',
		() => ({
			status: 'ok',
			service: 'the-brain',
			timestamp: new Date().toISOString(),
		}),
		{
			detail: {
				summary: 'Health check',
				tags: ['System'],
			},
		},
	)
	.get(
		'/ping',
		({ user }) => ({
			message: `Hey ${user.username}, The Brain hears you loud and clear.`,
			userId: user.id,
		}),
		{
			isAuth: true,
			response: {
				200: t.Object({
					message: t.String(),
					userId: t.String(),
				}),
			},
			detail: {
				summary: 'Protected ping',
				description: 'Example protected route — requires Bearer JWT',
				tags: ['System'],
				security: [{ bearerAuth: [] }],
			},
		},
	)
