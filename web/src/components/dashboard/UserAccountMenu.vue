<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ChevronUpIcon, LogOutIcon, SettingsIcon } from '@lucide/vue'
import UserAvatar from '@/components/dashboard/UserAvatar.vue'
import { Badge } from '@/components/ui/badge'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import { logout, sessionState } from '@/composables/useSession'

const router = useRouter()

const user = computed(() => sessionState.user)
const isAdmin = computed(() => user.value?.role === 'admin')
const displayLabel = computed(
	() => user.value?.displayName || user.value?.username || 'Account',
)

async function onLogout() {
	await logout()
	await router.push('/login')
}
</script>

<template>
	<SidebarMenu>
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<SidebarMenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<UserAvatar
							:avatar-url="user?.avatarUrl"
							:label="displayLabel"
						/>
						<div
							class="grid flex-1 gap-0.5 text-left leading-none group-data-[collapsible=icon]:hidden"
						>
							<span class="truncate font-medium">{{ displayLabel }}</span>
							<span class="truncate text-xs text-muted-foreground">
								@{{ user?.username }}
							</span>
						</div>
						<ChevronUpIcon
							class="ml-auto group-data-[collapsible=icon]:hidden"
						/>
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
					side="top"
					align="end"
					:side-offset="4"
				>
					<DropdownMenuLabel class="p-0 font-normal">
						<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
							<UserAvatar
								:avatar-url="user?.avatarUrl"
								:label="displayLabel"
							/>
							<div class="grid flex-1 gap-0.5 leading-none">
								<span class="truncate font-medium">{{ displayLabel }}</span>
								<span class="truncate text-xs text-muted-foreground">
									@{{ user?.username }}
								</span>
							</div>
							<Badge
								v-if="isAdmin"
								variant="secondary"
								class="shrink-0 text-[10px]"
							>
								Admin
							</Badge>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem as-child>
							<RouterLink to="/dashboard/profile">
								<SettingsIcon data-icon="inline-start" />
								Profile
							</RouterLink>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem @click="onLogout">
						<LogOutIcon data-icon="inline-start" />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	</SidebarMenu>
</template>
