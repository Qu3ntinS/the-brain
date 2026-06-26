import { toast } from 'vue-sonner'

export function toastError(message: string) {
	toast.error(message)
}

export function toastSuccess(message: string) {
	toast.success(message)
}

export function toastErrorFrom(error: unknown, fallback: string) {
	toastError(error instanceof Error ? error.message : fallback)
}
