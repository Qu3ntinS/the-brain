<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
	getUserAccess,
	listPermissions,
	listRoles,
	setUserGrants,
	setUserRoles,
	type Permission,
	type Role,
	type UserGrant,
} from '@/composables/useAccess'
import { toastErrorFrom, toastSuccess } from '@/lib/toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Field,
	FieldDescription,
	FieldLegend,
	FieldSet,
} from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
	userId: string | null
	username: string | null
}>()

const emit = defineEmits<{
	saved: []
}>()

const loading = ref(false)
const saving = ref(false)
const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const selectedRoles = ref<string[]>([])
const grantEffects = reactive<Record<string, 'inherit' | 'allow' | 'deny'>>({})

const title = computed(() =>
	props.username ? `Access for @${props.username}` : 'User access',
)

async function loadData() {
	if (!props.userId) return

	loading.value = true

	try {
		const [allRoles, allPermissions, access] = await Promise.all([
			listRoles(),
			listPermissions(),
			getUserAccess(props.userId),
		])

		roles.value = allRoles
		permissions.value = allPermissions
		selectedRoles.value = [...access.roles]

		for (const permission of allPermissions) {
			const grant = access.grants.find(
				(entry) => entry.permission === permission.slug,
			)
			grantEffects[permission.slug] = grant?.effect ?? 'inherit'
		}
	} catch (err) {
		toastErrorFrom(err, 'Could not load user access.')
		open.value = false
	} finally {
		loading.value = false
	}
}

watch(
	() => [open.value, props.userId] as const,
	([isOpen, userId]) => {
		if (isOpen && userId) void loadData()
	},
)

function toggleRole(slug: string, checked: boolean) {
	const next = new Set(selectedRoles.value)

	if (checked) next.add(slug)
	else next.delete(slug)

	selectedRoles.value = [...next]
}

function buildGrants(): UserGrant[] {
	return permissions.value.flatMap((permission) => {
		const effect = grantEffects[permission.slug]
		return effect === 'allow' || effect === 'deny'
			? [{ permission: permission.slug, effect }]
			: []
	})
}

async function onSaveRoles() {
	if (!props.userId || selectedRoles.value.length === 0) return

	saving.value = true

	try {
		await setUserRoles(props.userId, selectedRoles.value)
		toastSuccess('User roles updated.')
		emit('saved')
	} catch (err) {
		toastErrorFrom(err, 'Could not save user roles.')
	} finally {
		saving.value = false
	}
}

async function onSaveGrants() {
	if (!props.userId) return

	saving.value = true

	try {
		await setUserGrants(props.userId, buildGrants())
		toastSuccess('User grants updated.')
		emit('saved')
	} catch (err) {
		toastErrorFrom(err, 'Could not save user grants.')
	} finally {
		saving.value = false
	}
}
</script>

<template>
	<Dialog v-model:open="open">
		<DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
			<DialogHeader>
				<DialogTitle>{{ title }}</DialogTitle>
				<DialogDescription>
					Assign roles or direct feature grants. Grants override role permissions.
				</DialogDescription>
			</DialogHeader>

			<template v-if="loading">
				<div class="flex flex-col gap-3">
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-32 w-full" />
				</div>
			</template>

			<Tabs v-else default-value="roles">
				<TabsList class="grid w-full grid-cols-2">
					<TabsTrigger value="roles">Roles</TabsTrigger>
					<TabsTrigger value="grants">Direct grants</TabsTrigger>
				</TabsList>

				<TabsContent value="roles" class="flex flex-col gap-4">
					<FieldSet>
						<FieldLegend>Assigned roles</FieldLegend>
						<FieldDescription>
							At least one role is required.
						</FieldDescription>
						<div class="flex flex-col gap-3">
							<Field
								v-for="role in roles"
								:key="role.slug"
								orientation="horizontal"
							>
								<Checkbox
									:id="`role-${role.slug}`"
									:model-value="selectedRoles.includes(role.slug)"
									@update:model-value="toggleRole(role.slug, $event === true)"
								/>
								<div class="flex flex-col gap-1">
									<div class="flex flex-wrap items-center gap-2">
										<Label :for="`role-${role.slug}`">{{ role.name }}</Label>
										<Badge v-if="role.isSystem" variant="secondary">
											System
										</Badge>
									</div>
									<span class="text-xs text-muted-foreground">
										{{ role.description || role.slug }}
									</span>
								</div>
							</Field>
						</div>
					</FieldSet>

					<DialogFooter>
						<Button
							:disabled="saving || selectedRoles.length === 0"
							@click="onSaveRoles"
						>
							{{ saving ? 'Saving…' : 'Save roles' }}
						</Button>
					</DialogFooter>
				</TabsContent>

				<TabsContent value="grants" class="flex flex-col gap-4">
					<FieldSet>
						<FieldLegend>Feature overrides</FieldLegend>
						<FieldDescription>
							Allow or deny individual permissions regardless of roles.
						</FieldDescription>
						<div class="flex flex-col gap-3">
							<Field
								v-for="permission in permissions"
								:key="permission.slug"
								orientation="horizontal"
								class="items-center justify-between gap-4"
							>
								<div class="flex min-w-0 flex-col gap-0.5">
									<span class="font-medium">{{ permission.name }}</span>
									<span class="truncate font-mono text-[11px] text-muted-foreground">
										{{ permission.slug }}
									</span>
								</div>
								<Select v-model="grantEffects[permission.slug]">
									<SelectTrigger class="w-36">
										<SelectValue placeholder="Inherit" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="inherit">Inherit</SelectItem>
											<SelectItem value="allow">Allow</SelectItem>
											<SelectItem value="deny">Deny</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</Field>
						</div>
					</FieldSet>

					<DialogFooter>
						<Button :disabled="saving" @click="onSaveGrants">
							{{ saving ? 'Saving…' : 'Save grants' }}
						</Button>
					</DialogFooter>
				</TabsContent>
			</Tabs>
		</DialogContent>
	</Dialog>
</template>
