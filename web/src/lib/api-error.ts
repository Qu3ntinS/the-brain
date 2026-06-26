type ApiErrorPayload = {
	error?: string
	message?: string
}

type EdenValidationError = ApiErrorPayload & {
	summary?: string
}

type EdenError = {
	status?: number
	value?: EdenValidationError
}

export const readApiError = (
	error: EdenError | null | undefined,
	data: unknown,
	fallback: string,
) => {
	if (data && typeof data === 'object' && 'message' in data) {
		const message = (data as ApiErrorPayload).message
		if (typeof message === 'string' && message.length > 0) {
			return message
		}
	}

	const message = error?.value?.message
	if (typeof message === 'string' && message.length > 0) {
		return message
	}

	return fallback
}
