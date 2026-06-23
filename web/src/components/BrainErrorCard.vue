<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { brainErrorDefaults } from '@shared/brain-error'

defineProps<{
	status: number
	message: string
	backHref?: string
	backLabel?: string
}>()
</script>

<template>
	<div class="relative z-[2] grid min-h-screen place-items-center p-8">
		<div
			class="w-full max-w-md rounded-2xl border border-brain-pink/25 bg-[rgba(26,10,62,0.85)] p-8 text-center shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
		>
			<p
				class="font-display text-5xl leading-none font-extrabold text-transparent bg-gradient-to-br from-brain-text from-0% via-brain-pink via-45% to-brain-teal to-100% bg-clip-text"
			>
				{{ status }}
			</p>
			<p class="my-4 mb-6 leading-relaxed text-brain-muted">
				{{ message }}
			</p>
			<RouterLink
				v-if="(backHref ?? brainErrorDefaults.backHref).startsWith('/')"
				class="inline-flex rounded-full border border-brain-teal/35 px-4 py-2.5 text-sm font-medium text-brain-teal no-underline"
				:to="backHref ?? brainErrorDefaults.backHref"
			>
				{{ backLabel ?? brainErrorDefaults.backLabel }}
			</RouterLink>
			<a
				v-else
				class="inline-flex rounded-full border border-brain-teal/35 px-4 py-2.5 text-sm font-medium text-brain-teal no-underline"
				:href="backHref ?? brainErrorDefaults.backHref"
			>
				{{ backLabel ?? brainErrorDefaults.backLabel }}
			</a>
		</div>
	</div>
</template>
