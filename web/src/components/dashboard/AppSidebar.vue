<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
	BookOpenIcon,
	LayoutDashboardIcon,
	LogOutIcon,
} from '@lucide/vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
} from '@/components/ui/sidebar'
import { logout, sessionState } from '@/composables/useSession'

const route = useRoute()
const router = useRouter()

const user = computed(() => sessionState.user)
const initials = computed(() =>
	(user.value?.username ?? '?').slice(0, 2).toUpperCase(),
)

async function onLogout() {
	await logout()
	await router.push('/login')
}
</script>

<template>
	<Sidebar collapsible="icon" variant="inset">
		<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						size="lg"
						as-child
						tooltip="The Brain"
						class="data-[active=true]:bg-transparent group-data-[collapsible=icon]:justify-center!"
					>
						<RouterLink to="/dashboard">
							<div
								class="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brain-surface ring-1 ring-brain-pink/30 group-data-[collapsible=icon]:size-8"
							>
								<img
									src="/assets/brain-logo.png"
									alt=""
									class="size-6 shrink-0 object-contain group-data-[collapsible=icon]:size-6"
									width="24"
									height="24"
								/>
							</div>
							<div
								class="grid flex-1 gap-0.5 leading-none group-data-[collapsible=icon]:hidden"
							>
								<span class="truncate font-display font-semibold">The Brain</span>
								<span class="truncate text-xs text-muted-foreground">Dashboard</span>
							</div>
						</RouterLink>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>

		<SidebarContent>
			<SidebarGroup>
				<SidebarGroupLabel>Navigation</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								as-child
								tooltip="Overview"
								:is-active="route.name === 'dashboard'"
							>
								<RouterLink to="/dashboard">
									<LayoutDashboardIcon />
									<span>Overview</span>
								</RouterLink>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>

		<SidebarFooter>
			<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								as-child
								tooltip="API docs"
								:is-active="route.name === 'dashboard-docs'"
							>
								<RouterLink to="/dashboard/docs">
									<BookOpenIcon />
									<span>API docs</span>
								</RouterLink>
							</SidebarMenuButton>
						</SidebarMenuItem>
			</SidebarMenu>

			<SidebarSeparator />

			<SidebarMenu>
				<SidebarMenuItem>
					<div
						class="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center"
					>
						<Avatar class="size-8 shrink-0">
							<AvatarFallback class="bg-brain-pink/20 text-brain-pink">
								{{ initials }}
							</AvatarFallback>
						</Avatar>
						<div
							class="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden"
						>
							<span class="truncate text-sm font-medium">{{ user?.username }}</span>
							<Badge variant="secondary" class="mt-0.5 w-fit text-[10px]">
								Admin
							</Badge>
						</div>
					</div>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuButton tooltip="Log out" @click="onLogout">
						<LogOutIcon />
						<span>Log out</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarFooter>

		<SidebarRail />
	</Sidebar>
</template>
