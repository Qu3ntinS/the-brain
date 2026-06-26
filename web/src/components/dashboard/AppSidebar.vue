<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
	BookOpenIcon,
	LayoutDashboardIcon,
	ShieldIcon,
	UsersIcon,
} from '@lucide/vue'
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
import UserAccountMenu from '@/components/dashboard/UserAccountMenu.vue'
import { usePermissions } from '@/composables/usePermissions'

const route = useRoute()
const { hasPermission } = usePermissions()
const canManageUsers = computed(() => hasPermission('users:read'))
const canManageRoles = computed(() => hasPermission('roles:read'))
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
						<SidebarMenuItem v-if="canManageUsers">
							<SidebarMenuButton
								as-child
								tooltip="Users"
								:is-active="route.name === 'dashboard-users'"
							>
								<RouterLink to="/dashboard/users">
									<UsersIcon />
									<span>Users</span>
								</RouterLink>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem v-if="canManageRoles">
							<SidebarMenuButton
								as-child
								tooltip="Roles"
								:is-active="route.name === 'dashboard-roles'"
							>
								<RouterLink to="/dashboard/roles">
									<ShieldIcon />
									<span>Roles</span>
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

			<UserAccountMenu />
		</SidebarFooter>

		<SidebarRail />
	</Sidebar>
</template>
