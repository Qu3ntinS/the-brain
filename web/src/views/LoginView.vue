<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { login, syncSession } from '@/composables/useSession'
import { toastError } from '@/lib/toast'

const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)

onMounted(async () => {
	if (await syncSession()) {
		const next =
			typeof route.query.next === 'string' && route.query.next.startsWith('/')
				? route.query.next
				: '/dashboard'
		await router.replace(next)
	}
})

async function onSubmit() {
	loading.value = true

	try {
		const ok = await login(username.value, password.value)

		if (!ok) {
			toastError('Invalid username or password.')
			return
		}

		const next =
			typeof route.query.next === 'string' && route.query.next.startsWith('/')
				? route.query.next
				: '/dashboard'

		await router.replace(next)
	} catch {
		toastError('Could not reach The Brain. Try again.')
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<div class="relative z-[2] grid min-h-screen place-items-center px-6 py-12">
		<div
			class="w-full max-w-md rounded-2xl border border-brain-pink/25 bg-brain-surface/90 p-8 shadow-[0_24px_64px_rgba(0,0,0,0.45)] backdrop-blur-md"
		>
			<h1 class="font-display text-3xl font-bold">Sign in</h1>
			<p class="mt-1 mb-6 text-sm text-brain-muted">Private access to The Brain.</p>

			<form class="flex flex-col gap-4" @submit.prevent="onSubmit">
				<label class="flex flex-col gap-1.5 text-left text-sm text-brain-muted">
					Username
					<input
						v-model="username"
						class="rounded-xl border border-brain-muted/25 bg-brain-bg/80 px-3.5 py-3 text-brain-text outline-none focus:border-brain-teal/45 focus:ring-2 focus:ring-brain-teal/35"
						autocomplete="username"
						required
					/>
				</label>

				<label class="flex flex-col gap-1.5 text-left text-sm text-brain-muted">
					Password
					<input
						v-model="password"
						class="rounded-xl border border-brain-muted/25 bg-brain-bg/80 px-3.5 py-3 text-brain-text outline-none focus:border-brain-teal/45 focus:ring-2 focus:ring-brain-teal/35"
						type="password"
						autocomplete="current-password"
						required
					/>
				</label>

				<button
					class="mt-1 inline-flex justify-center rounded-full bg-gradient-to-br from-brain-pink to-[#c44dff] px-5 py-3 text-sm font-medium text-white shadow-[0_8px_32px_rgba(255,107,203,0.35)] transition hover:scale-[1.04] disabled:opacity-60"
					type="submit"
					:disabled="loading"
				>
					{{ loading ? 'Signing in…' : 'Log in' }}
				</button>
			</form>

			<RouterLink class="mt-5 inline-block text-sm text-brain-muted hover:text-brain-teal" to="/">
				← Back to The Brain
			</RouterLink>
		</div>
	</div>
</template>
