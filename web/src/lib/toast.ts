import { toast } from 'vue-sonner'

const toastOptions = {
	position: 'top-right' as const,
}

export function toastError(message: string) {
	toast.error(message, toastOptions)
}

export function toastSuccess(message: string) {
	toast.success(message, toastOptions)
}

export function toastErrorFrom(error: unknown, fallback: string) {
	toastError(error instanceof Error ? error.message : fallback)
}
