import { status } from 'elysia'
import type { ApiErrorBody } from '../models/shared'

const error = (code: number, body: ApiErrorBody) => status(code, body)

export const errors = {
	unauthorized: (message = 'Missing or invalid credentials') =>
		error(401, { error: 'Unauthorized', message }),

	forbidden: (message = 'Admin access required') =>
		error(403, { error: 'Forbidden', message }),

	notFound: (message = 'Not found') =>
		error(404, { error: 'Not Found', message }),

	conflict: (message: string) =>
		error(409, { error: 'Conflict', message }),

	badRequest: (message: string) =>
		error(400, { error: 'Bad Request', message }),

	invalidCredentials: () =>
		error(401, {
			error: 'Unauthorized',
			message: 'Invalid username or password',
		}),
} as const
