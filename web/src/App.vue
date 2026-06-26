<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import 'vue-sonner/style.css'
import '@shared/brain-sonner-theme.css'
import SynapseBackground from '@/components/SynapseBackground.vue'
import { Toaster } from '@/components/ui/sonner'

const route = useRoute()
const showLandingFx = computed(() => !route.meta.dashboard)
</script>

<template>
	<div class="relative min-h-screen overflow-x-hidden">
		<template v-if="showLandingFx">
			<div
				class="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_20%,rgba(255,107,203,0.18),transparent_55%),radial-gradient(ellipse_60%_40%_at_80%_70%,rgba(0,245,212,0.12),transparent_50%),radial-gradient(circle_at_50%_100%,rgba(255,224,102,0.08),transparent_40%),var(--color-brain-bg)]"
			/>
			<SynapseBackground />
		</template>
		<RouterView />
		<Toaster />
	</div>
</template>
