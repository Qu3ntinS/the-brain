import { computed } from 'vue'
import { sessionState } from '@/composables/useSession'

export function usePermissions() {
	const permissions = computed(() => sessionState.user?.permissions ?? [])

	const hasPermission = (slug: string) =>
		(permissions.value as readonly string[]).includes(slug)

	return {
		permissions,
		hasPermission,
	}
}
