<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ActivityIcon, HeartPulseIcon, RadioIcon } from '@lucide/vue'
import { api } from '@/lib/api'
import { sessionState } from '@/composables/useSession'
import { Badge } from '@/components/ui/badge'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type Health = {
	status: string
	service: string
	timestamp: string
}

type Ping = {
	message: string
	userId: string
}

const health = ref<Health | null>(null)
const ping = ref<Ping | null>(null)
const healthError = ref(false)
const pingError = ref(false)
const loadingHealth = ref(true)
const loadingPing = ref(true)

async function loadHealth() {
	loadingHealth.value = true
	healthError.value = false

	const { data, error } = await api.api.health.get()

	loadingHealth.value = false

	if (error || !data) {
		healthError.value = true
		return
	}

	health.value = data
}

async function loadPing() {
	loadingPing.value = true
	pingError.value = false

	const { data, error } = await api.api.ping.get()

	loadingPing.value = false

	if (error || !data) {
		pingError.value = true
		return
	}

	ping.value = data
}

onMounted(() => {
	void loadHealth()
	void loadPing()
})
</script>

<template>
	<div class="flex flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h2 class="font-display text-2xl font-bold tracking-tight">
				Your hub at a glance
			</h2>
			<p class="text-sm text-muted-foreground">
				Session, health, and a live ping from The Brain API.
			</p>
		</div>

		<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			<Card class="border-brain-pink/20 bg-card/90">
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-sm font-medium">Session</CardTitle>
					<RadioIcon class="text-brain-pink" />
				</CardHeader>
				<CardContent class="flex flex-col gap-2">
					<p class="text-2xl font-semibold">{{ sessionState.user?.username }}</p>
					<p class="text-xs text-muted-foreground">
						ID {{ sessionState.user?.id }}
					</p>
					<Badge variant="secondary" class="w-fit">Authenticated</Badge>
				</CardContent>
			</Card>

			<Card class="border-brain-teal/20 bg-card/90">
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-sm font-medium">API health</CardTitle>
					<HeartPulseIcon class="text-brain-teal" />
				</CardHeader>
				<CardContent class="flex flex-col gap-2">
					<template v-if="loadingHealth">
						<Skeleton class="h-8 w-24" />
						<Skeleton class="h-4 w-full" />
					</template>
					<template v-else-if="healthError">
						<p class="text-sm text-destructive">Unreachable</p>
					</template>
					<template v-else-if="health">
						<p class="text-2xl font-semibold capitalize">{{ health.status }}</p>
						<p class="text-xs text-muted-foreground">{{ health.service }}</p>
						<p class="text-[11px] text-muted-foreground">{{ health.timestamp }}</p>
					</template>
				</CardContent>
			</Card>

			<Card class="border-brain-gold/25 bg-card/90 md:col-span-2 xl:col-span-1">
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-sm font-medium">Protected ping</CardTitle>
					<ActivityIcon class="text-brain-gold" />
				</CardHeader>
				<CardContent class="flex flex-col gap-2">
					<template v-if="loadingPing">
						<Skeleton class="h-8 w-full" />
						<Skeleton class="h-4 w-20" />
					</template>
					<template v-else-if="pingError">
						<p class="text-sm text-destructive">Ping failed</p>
					</template>
					<template v-else-if="ping">
						<p class="text-sm leading-relaxed">{{ ping.message }}</p>
						<Badge variant="outline" class="w-fit border-brain-gold/40 text-brain-gold">
							user {{ ping.userId.slice(0, 8) }}…
						</Badge>
					</template>
				</CardContent>
			</Card>
		</div>

		<Card class="border-border/60 bg-card/80">
			<CardHeader>
				<CardTitle class="font-display">Quick links</CardTitle>
				<CardDescription>Jump into API tools and the public landing page.</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-wrap gap-3">
				<RouterLink
					class="inline-flex items-center rounded-md border border-brain-pink/30 bg-brain-pink/10 px-4 py-2 text-sm font-medium text-brain-pink transition hover:bg-brain-pink/20"
					to="/dashboard/docs"
				>
					Open API docs
				</RouterLink>
				<a
					class="inline-flex items-center rounded-md border border-brain-teal/30 bg-brain-teal/10 px-4 py-2 text-sm font-medium text-brain-teal transition hover:bg-brain-teal/20"
					href="/api/health"
				>
					Health JSON
				</a>
			</CardContent>
		</Card>
	</div>
</template>
