<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { PencilIcon, PlusIcon, ShieldIcon, Trash2Icon } from '@lucide/vue'
import PermissionPicker from '@/components/dashboard/PermissionPicker.vue'
import {
	createRole,
	deleteRole,
	listPermissions,
	listRoles,
	updateRole,
	type Permission,
	type Role,
	type RoleFormInput,
} from '@/composables/useAccess'
import { usePermissions } from '@/composables/usePermissions'
import { toastError, toastErrorFrom, toastSuccess } from '@/lib/toast'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
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
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const loading = ref(true)
const dialogOpen = ref(false)
const deleteOpen = ref(false)
const saving = ref(false)
const editingRole = ref<Role | null>(null)
const deletingRole = ref<Role | null>(null)

const { hasPermission } = usePermissions()
const canWrite = computed(() => hasPermission('roles:write'))

const emptyForm = (): RoleFormInput => ({
	slug: '',
	name: '',
	description: '',
	permissions: [],
})

const form = reactive<RoleFormInput>(emptyForm())

const dialogTitle = computed(() =>
	editingRole.value ? 'Edit role' : 'Create role',
)

function resetForm(role?: Role | null) {
	Object.assign(form, emptyForm())

	if (role) {
		form.slug = role.slug
		form.name = role.name
		form.description = role.description ?? ''
		form.permissions = [...role.permissions]
	}
}

async function loadData() {
	loading.value = true

	try {
		const [roleRows, permissionRows] = await Promise.all([
			listRoles(),
			listPermissions(),
		])
		roles.value = roleRows
		permissions.value = permissionRows
	} catch (err) {
		toastErrorFrom(err, 'Could not load roles.')
	} finally {
		loading.value = false
	}
}

function openCreate() {
	if (!canWrite.value) return
	editingRole.value = null
	resetForm()
	dialogOpen.value = true
}

function openEdit(role: Role) {
	if (!canWrite.value || role.isSystem) return
	editingRole.value = role
	resetForm(role)
	dialogOpen.value = true
}

function openDelete(role: Role) {
	if (!canWrite.value || role.isSystem) return
	deletingRole.value = role
	deleteOpen.value = true
}

function validateForm(): string | null {
	const slug = form.slug.trim()
	const name = form.name.trim()

	if (!editingRole.value) {
		if (!/^[a-z0-9-]{2,32}$/.test(slug)) {
			return 'Slug must be 2–32 lowercase letters, numbers, or hyphens.'
		}
	}

	if (name.length < 2) {
		return 'Name must be at least 2 characters.'
	}

	return null
}

async function onSave() {
	const validationError = validateForm()
	if (validationError) {
		toastError(validationError)
		return
	}

	saving.value = true

	try {
		if (editingRole.value) {
			await updateRole(editingRole.value.id, {
				name: form.name,
				description: form.description,
				permissions: form.permissions,
			})
			toastSuccess('Role updated.')
		} else {
			await createRole(form)
			toastSuccess('Role created.')
		}

		dialogOpen.value = false
		await loadData()
	} catch (err) {
		toastErrorFrom(err, 'Could not save role.')
	} finally {
		saving.value = false
	}
}

async function onDelete() {
	if (!deletingRole.value) return

	saving.value = true

	try {
		await deleteRole(deletingRole.value.id)
		toastSuccess('Role deleted.')
		deleteOpen.value = false
		deletingRole.value = null
		await loadData()
	} catch (err) {
		toastErrorFrom(err, 'Could not delete role.')
	} finally {
		saving.value = false
	}
}

onMounted(() => {
	void loadData()
})
</script>

<template>
	<div class="flex flex-col gap-6">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div class="flex flex-col gap-1">
				<h2 class="font-display text-2xl font-bold tracking-tight">Roles</h2>
				<p class="text-sm text-muted-foreground">
					Define custom roles and assign permissions to features.
				</p>
			</div>
			<Button v-if="canWrite" @click="openCreate">
				<PlusIcon data-icon="inline-start" />
				Add role
			</Button>
		</div>

		<Card class="border-border/60 bg-card/90">
			<CardHeader class="flex flex-row items-center justify-between">
				<div class="flex flex-col gap-1">
					<CardTitle class="font-display">All roles</CardTitle>
					<CardDescription>{{ roles.length }} role(s)</CardDescription>
				</div>
				<ShieldIcon class="text-brain-teal" />
			</CardHeader>
			<CardContent>
				<template v-if="loading">
					<div class="flex flex-col gap-3">
						<Skeleton class="h-10 w-full" />
						<Skeleton class="h-10 w-full" />
						<Skeleton class="h-10 w-full" />
					</div>
				</template>
				<template v-else>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Role</TableHead>
								<TableHead>Permissions</TableHead>
								<TableHead>Type</TableHead>
								<TableHead v-if="canWrite" class="text-right">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow v-for="role in roles" :key="role.id">
								<TableCell>
									<div class="flex flex-col gap-0.5">
										<span class="font-medium">{{ role.name }}</span>
										<span class="font-mono text-xs text-muted-foreground">
											{{ role.slug }}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<div class="flex flex-wrap gap-1">
										<Badge
											v-for="permission in role.permissions.slice(0, 4)"
											:key="permission"
											variant="outline"
											class="font-mono text-[10px]"
										>
											{{ permission }}
										</Badge>
										<Badge
											v-if="role.permissions.length > 4"
											variant="secondary"
											class="text-[10px]"
										>
											+{{ role.permissions.length - 4 }}
										</Badge>
									</div>
								</TableCell>
								<TableCell>
									<Badge :variant="role.isSystem ? 'secondary' : 'default'">
										{{ role.isSystem ? 'System' : 'Custom' }}
									</Badge>
								</TableCell>
								<TableCell v-if="canWrite" class="text-right">
									<div class="flex justify-end gap-2">
										<Button
											variant="outline"
											size="sm"
											:disabled="role.isSystem"
											@click="openEdit(role)"
										>
											<PencilIcon data-icon="inline-start" />
											Edit
										</Button>
										<Button
											variant="outline"
											size="sm"
											:disabled="role.isSystem"
											@click="openDelete(role)"
										>
											<Trash2Icon data-icon="inline-start" />
											Delete
										</Button>
									</div>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</template>
			</CardContent>
		</Card>

		<Dialog v-model:open="dialogOpen">
			<DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{{ dialogTitle }}</DialogTitle>
					<DialogDescription>
						{{
							editingRole
								? 'Update role details and permissions.'
								: 'Create a reusable role for your application.'
						}}
					</DialogDescription>
				</DialogHeader>

				<form class="flex flex-col gap-6" @submit.prevent="onSave">
					<FieldGroup>
						<Field v-if="!editingRole">
							<FieldLabel for="roleSlug">Slug</FieldLabel>
							<Input
								id="roleSlug"
								v-model="form.slug"
								autocomplete="off"
								placeholder="support"
								pattern="[a-z0-9-]{2,32}"
								required
							/>
						</Field>
						<Field>
							<FieldLabel for="roleName">Name</FieldLabel>
							<Input
								id="roleName"
								v-model="form.name"
								autocomplete="off"
								required
								minlength="2"
								maxlength="64"
							/>
						</Field>
						<Field>
							<FieldLabel for="roleDescription">Description</FieldLabel>
							<Textarea
								id="roleDescription"
								v-model="form.description"
								rows="2"
								maxlength="256"
							/>
						</Field>
					</FieldGroup>

					<PermissionPicker
						v-model="form.permissions"
						:permissions="permissions"
					/>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							@click="dialogOpen = false"
						>
							Cancel
						</Button>
						<Button type="submit" :disabled="saving">
							{{ saving ? 'Saving…' : 'Save' }}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>

		<AlertDialog v-model:open="deleteOpen">
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete role?</AlertDialogTitle>
					<AlertDialogDescription>
						This permanently removes
						<strong>{{ deletingRole?.name }}</strong>. Users with this role will
						lose its permissions.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction :disabled="saving" @click="onDelete">
						{{ saving ? 'Deleting…' : 'Delete' }}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	</div>
</template>
