import { t } from 'elysia'

export const errorResponse = t.Object({
	error: t.String(),
	message: t.String(),
})

export const okResponse = t.Object({
	ok: t.Literal(true),
})

export type ApiErrorBody = typeof errorResponse.static
