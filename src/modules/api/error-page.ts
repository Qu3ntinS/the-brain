import {
	brainErrorDefaults,
	brainErrorPageHtml as renderBrainErrorPageHtml,
} from '../../../shared/brain-error'

const prefersHtml = (accept: string | null) => {
	if (!accept) return true
	if (accept.includes('application/json')) return false
	return accept.includes('text/html') || accept.includes('*/*')
}

type ResponseSet = {
	status?: number | string
	headers: Record<string, string | number>
}

export const mapApiError = (code: number | string, error: unknown) => {
	if (code === 'NOT_FOUND') {
		return {
			status: 404,
			message: brainErrorDefaults.messages.notFound,
		}
	}

	const status = typeof code === 'number' ? code : 500
	const message =
		error instanceof Error
			? error.message
			: typeof error === 'object' &&
				  error &&
				  'message' in error &&
				  typeof error.message === 'string'
				? error.message
				: 'Something went wrong'

	return { status, message }
}

export const formatErrorResponse = ({
	status,
	message,
	request,
	set,
}: {
	status: number
	message: string
	request: Request
	set: ResponseSet
}) => {
	set.status = status

	if (!prefersHtml(request.headers.get('accept'))) {
		return {
			error: status === 401 ? 'Unauthorized' : status === 404 ? 'Not Found' : 'Error',
			message,
		}
	}

	set.headers['content-type'] = 'text/html; charset=utf-8'
	return renderBrainErrorPageHtml(status, message)
}

export const apiErrorHandler = ({
	code,
	error,
	set,
	request,
}: {
	code: number | string
	error: unknown
	set: ResponseSet
	request: Request
}) => {
	const mapped = mapApiError(code, error)

	return formatErrorResponse({
		status: mapped.status,
		message: mapped.message,
		request,
		set,
	})
}

export const apiNotFoundHandler = ({
	set,
	request,
}: {
	set: ResponseSet
	request: Request
}) =>
	formatErrorResponse({
		status: 404,
		message: brainErrorDefaults.messages.notFound,
		request,
		set,
	})
