<script setup lang="ts">
import { ref } from 'vue'
import { Skeleton } from '@/components/ui/skeleton'

const logoUrl = '/assets/brain-logo.png'
const logoLoaded = ref(false)
const logoFailed = ref(false)

function onLogoLoad() {
	logoLoaded.value = true
}

function onLogoError() {
	logoFailed.value = true
	logoLoaded.value = true
}
</script>

<template>
	<div
		class="relative mb-1 h-[min(280px,52vw)] w-[min(280px,52vw)] animate-[logo-idle_4s_ease-in-out_infinite] drop-shadow-[0_0_32px_rgba(255,107,203,0.4)] motion-reduce:animate-none"
		:aria-busy="!logoLoaded"
		aria-label="The Brain mascot"
	>
		<Skeleton
			v-if="!logoLoaded"
			class="absolute inset-0 size-full rounded-[28%]"
			aria-hidden="true"
		/>

		<img
			class="size-full object-contain transition-opacity duration-300"
			:class="logoLoaded && !logoFailed ? 'opacity-100' : 'opacity-0'"
			:src="logoUrl"
			alt="The Brain mascot"
			width="280"
			height="280"
			decoding="async"
			@load="onLogoLoad"
			@error="onLogoError"
		/>
	</div>
</template>

<style scoped>
@keyframes logo-idle {
	0%,
	100% {
		transform: translateY(0) scale(1);
	}
	50% {
		transform: translateY(-8px) scale(1.025);
	}
}
</style>
