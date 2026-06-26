<script setup lang="ts">
import { computed } from 'vue'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const props = withDefaults(
	defineProps<{
		avatarUrl?: string | null
		label: string
		class?: string
		fallbackClass?: string
	}>(),
	{
		avatarUrl: null,
		class: '',
		fallbackClass: '',
	},
)

const initials = computed(() => props.label.slice(0, 2).toUpperCase())

const imageSrc = computed(() => {
	if (!props.avatarUrl) return undefined

	const cacheKey = props.avatarUrl.includes('?')
		? props.avatarUrl
		: `${props.avatarUrl}?v=${encodeURIComponent(props.label)}`

	return cacheKey
})
</script>

<template>
	<Avatar :class="cn('size-8 shrink-0 rounded-lg', props.class)">
		<AvatarImage
			v-if="imageSrc"
			:src="imageSrc"
			:alt="`${label} avatar`"
			class="rounded-lg object-cover"
		/>
		<AvatarFallback
			:class="
				cn(
					'rounded-lg bg-brain-pink/20 text-brain-pink',
					props.fallbackClass,
				)
			"
		>
			{{ initials }}
		</AvatarFallback>
	</Avatar>
</template>
