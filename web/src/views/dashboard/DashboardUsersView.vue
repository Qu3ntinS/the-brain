<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { PencilIcon, PlusIcon, Trash2Icon, UsersIcon } from '@lucide/vue'
import {
	createUser,
	deleteUser,
	listUsers,
	updateUser,
	type ManagedUser,
	type UserFormInput,
} from '@/composables/useUsers'
import { sessionState } from '@/composables/useSession'
import { toastError, toastErrorFrom } from '@/lib/toast'
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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

const users = ref<ManagedUser[]>([])
const loading = ref(true)
const dialogOpen = ref(false)
const deleteOpen = ref(false)
const saving = ref(false)
const editingUser = ref<ManagedUser | null>(null)
const deletingUser = ref<ManagedUser | null>(null)

const emptyForm = (): UserFormInput => ({
	username: '',
	password: '',
	displayName: '',
	role: 'user',
})

const form = reactive<UserFormInput>(emptyForm())

const dialogTitle = computed(() =>
	editingUser.value ? 'Edit user' : 'Create user',
)

const currentUserId = computed(() => sessionState.user?.id)

function resetForm(user?: ManagedUser | null) {
	Object.assign(form, emptyForm())

	if (user) {
		form.username = user.username
		form.displayName = user.displayName ?? ''
		form.role = user.role
	}
}

async function loadUsers() {
	loading.value = true

	try {
		users.value = await listUsers()
	} catch (err) {
		toastErrorFrom(err, 'Could not load users.')
	} finally {
		loading.value = false
	}
}

function openCreate() {
	editingUser.value = null
	resetForm()
	dialogOpen.value = true
}

function openEdit(user: ManagedUser) {
	editingUser.value = user
	resetForm(user)
	dialogOpen.value = true
}

function openDelete(user: ManagedUser) {
	deletingUser.value = user
	deleteOpen.value = true
}

function validateForm(): string | null {
	const username = form.username.trim()

	if (username.length < 2) {
		return 'Username must be at least 2 characters.'
	}

	if (!editingUser.value) {
		if (form.password.length < 8) {
			return 'Password must be at least 8 characters.'
		}
	} else if (form.password && form.password.length < 8) {
		return 'New password must be at least 8 characters.'
	}

	if (form.role !== 'admin' && form.role !== 'user') {
		return 'Please select a role.'
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
		if (editingUser.value) {
			await updateUser(editingUser.value.id, form)
		} else {
			await createUser(form)
		}

		dialogOpen.value = false
		await loadUsers()
	} catch (err) {
		toastErrorFrom(err, 'Could not save user.')
	} finally {
		saving.value = false
	}
}

async function onDelete() {
	if (!deletingUser.value) return

	saving.value = true

	try {
		await deleteUser(deletingUser.value.id)
		deleteOpen.value = false
		deletingUser.value = null
		await loadUsers()
	} catch (err) {
		toastErrorFrom(err, 'Could not delete user.')
	} finally {
		saving.value = false
	}
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(value))
}

onMounted(() => {
	void loadUsers()
})
</script>

<template>
	<div class="flex flex-col gap-6">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div class="flex flex-col gap-1">
				<h2 class="font-display text-2xl font-bold tracking-tight">Users</h2>
				<p class="text-sm text-muted-foreground">
					Create accounts, assign roles, and manage access.
				</p>
			</div>
			<Button @click="openCreate">
				<PlusIcon data-icon="inline-start" />
				Add user
			</Button>
		</div>

		<Card class="border-border/60 bg-card/90">
			<CardHeader class="flex flex-row items-center justify-between">
				<div class="flex flex-col gap-1">
					<CardTitle class="font-display">All users</CardTitle>
					<CardDescription>{{ users.length }} account(s)</CardDescription>
				</div>
				<UsersIcon class="text-brain-teal" />
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
								<TableHead>User</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Created</TableHead>
								<TableHead class="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow v-for="user in users" :key="user.id">
								<TableCell>
									<div class="flex flex-col gap-0.5">
										<span class="font-medium">
											{{ user.displayName || user.username }}
										</span>
										<span class="text-xs text-muted-foreground">
											@{{ user.username }}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<Badge variant="secondary" class="capitalize">
										{{ user.role }}
									</Badge>
								</TableCell>
								<TableCell class="text-sm text-muted-foreground">
									{{ formatDate(user.createdAt) }}
								</TableCell>
								<TableCell class="text-right">
									<div class="flex justify-end gap-2">
										<Button
											variant="outline"
											size="sm"
											@click="openEdit(user)"
										>
											<PencilIcon data-icon="inline-start" />
											Edit
										</Button>
										<Button
											variant="outline"
											size="sm"
											:disabled="user.id === currentUserId"
											@click="openDelete(user)"
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{{ dialogTitle }}</DialogTitle>
					<DialogDescription>
						{{
							editingUser
								? 'Update account details. Leave password empty to keep it unchanged.'
								: 'Create a new dashboard account.'
						}}
					</DialogDescription>
				</DialogHeader>

				<form @submit.prevent="onSave">
					<FieldGroup>
						<Field>
							<FieldLabel for="username">Username</FieldLabel>
							<Input
								id="username"
								v-model="form.username"
								autocomplete="off"
								required
								minlength="2"
								maxlength="32"
							/>
						</Field>
						<Field>
							<FieldLabel for="displayName">Display name</FieldLabel>
							<Input
								id="displayName"
								v-model="form.displayName"
								autocomplete="off"
								maxlength="64"
							/>
						</Field>
						<Field>
							<FieldLabel for="userPassword">
								{{ editingUser ? 'New password' : 'Password' }}
							</FieldLabel>
							<Input
								id="userPassword"
								v-model="form.password"
								type="password"
								autocomplete="new-password"
								:required="!editingUser"
								minlength="8"
							/>
						</Field>
						<Field>
							<FieldLabel for="role">Role</FieldLabel>
							<Select
								v-model="form.role"
								:key="editingUser?.id ?? 'create'"
							>
								<SelectTrigger id="role">
									<SelectValue placeholder="Select role" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value="user">User</SelectItem>
										<SelectItem value="admin">Admin</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</Field>
					</FieldGroup>

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
					<AlertDialogTitle>Delete user?</AlertDialogTitle>
					<AlertDialogDescription>
						This permanently removes
						<strong>{{ deletingUser?.username }}</strong>. This action cannot be
						undone.
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
