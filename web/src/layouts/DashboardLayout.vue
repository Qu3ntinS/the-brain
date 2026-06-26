<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/components/dashboard/AppSidebar.vue'
import { Separator } from '@/components/ui/separator'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import { sessionState } from '@/composables/useSession'

const route = useRoute()

const pageTitle = computed(() => {
	if (route.name === 'dashboard-docs') return 'API docs'
	if (route.name === 'dashboard-profile') return 'Profile'
	if (route.name === 'dashboard-users') return 'Users'
	if (route.name === 'dashboard') return 'Overview'
	return 'Dashboard'
})

const fullBleed = computed(() => !!route.meta.fullBleed)

const greeting = computed(
	() =>
		sessionState.user?.displayName ??
		sessionState.user?.username ??
		'there',
)
</script>

<template>
	<SidebarProvider class="relative z-[2] h-svh overflow-hidden">
		<AppSidebar />
		<SidebarInset class="flex h-svh min-h-0 flex-col overflow-hidden bg-background/80 backdrop-blur-sm">
			<header
				class="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-4"
			>
				<SidebarTrigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-4!" />
				<div class="flex min-w-0 flex-1 flex-col">
					<h1 class="truncate font-display text-sm font-semibold">
						{{ pageTitle }}
					</h1>
					<p class="truncate text-xs text-muted-foreground">
						Welcome back, {{ greeting }}
					</p>
				</div>
				<RouterLink
					class="hidden text-xs text-muted-foreground transition hover:text-brain-teal sm:inline"
					to="/"
				>
					← Home
				</RouterLink>
			</header>
			<div
				class="flex min-h-0 flex-1 flex-col"
				:class="fullBleed ? 'overflow-hidden' : 'gap-4 overflow-auto p-4 md:p-6'"
			>
				<RouterView />
			</div>
		</SidebarInset>
	</SidebarProvider>
</template>
