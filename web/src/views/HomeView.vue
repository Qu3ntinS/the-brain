<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BrainLogo from '@/components/BrainLogo.vue'
import { sessionState } from '@/composables/useSession'

const isAuthed = computed(() => !!sessionState.user)
</script>

<template>
	<div
		class="relative z-[2] mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-between px-6 py-12"
	>
		<div
			class="inline-flex animate-[float_4s_ease-in-out_infinite] items-center gap-2 rounded-full border border-brain-teal/35 bg-brain-surface/70 px-3.5 py-1.5 text-xs uppercase tracking-[0.08em] text-brain-teal backdrop-blur-md"
		>
			<span
				class="size-1.5 animate-pulse rounded-full bg-brain-teal shadow-[0_0_12px_var(--color-brain-teal)]"
			/>
			personal api · central hub
		</div>

		<main class="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
			<BrainLogo />

			<h1
				class="font-display text-[clamp(3rem,12vw,6.5rem)] leading-[0.95] font-extrabold tracking-[-0.03em] text-transparent drop-shadow-[0_0_40px_rgba(255,107,203,0.25)] bg-gradient-to-br from-brain-text via-brain-pink to-brain-teal bg-clip-text"
			>
				The Brain
			</h1>

			<p class="max-w-[34ch] text-[clamp(1.05rem,3vw,1.35rem)] leading-relaxed text-brain-muted">
				The Brain for <em class="font-medium text-brain-gold not-italic">everything</em> I build.
			</p>

			<div class="mt-2 flex flex-wrap justify-center gap-3">
				<RouterLink
					v-if="isAuthed"
					class="inline-flex items-center rounded-full bg-gradient-to-br from-brain-pink to-[#c44dff] px-5 py-3 text-sm font-medium text-white shadow-[0_8px_32px_rgba(255,107,203,0.35)] transition hover:scale-[1.04]"
					to="/dashboard"
				>
					Dashboard
				</RouterLink>
				<RouterLink
					v-else
					class="inline-flex items-center rounded-full bg-gradient-to-br from-brain-pink to-[#c44dff] px-5 py-3 text-sm font-medium text-white shadow-[0_8px_32px_rgba(255,107,203,0.35)] transition hover:scale-[1.04]"
					to="/login"
				>
					Log in
				</RouterLink>
				<a
					class="inline-flex items-center rounded-full border border-brain-teal/40 bg-brain-teal/10 px-5 py-3 text-sm font-medium text-brain-teal transition hover:scale-[1.04] hover:bg-brain-teal/20"
					href="/api/health"
				>
					Health check
				</a>
			</div>
		</main>

		<footer class="pt-8 text-sm text-brain-muted">Crafted with ❤️ by Quentin</footer>
	</div>
</template>

<style scoped>
@keyframes float {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-4px);
	}
}
</style>
