<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { BadgeCheckIcon, ImageIcon } from '@lucide/vue'
import UserAvatar from '@/components/dashboard/UserAvatar.vue'
import {
	reloadProfile,
	removeAvatar,
	updateProfile,
	uploadAvatar,
} from '@/composables/useUsers'
import { sessionState } from '@/composables/useSession'
import { toastError, toastErrorFrom } from '@/lib/toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const success = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const form = reactive({
	displayName: '',
	password: '',
	currentPassword: '',
})

const profile = computed(() => sessionState.user)
const displayLabel = computed(
	() => profile.value?.displayName || profile.value?.username || 'Account',
)

onMounted(async () => {
	loading.value = true

	try {
		await reloadProfile()
		form.displayName = profile.value?.displayName ?? ''
	} catch {
		toastError('Could not load profile.')
	} finally {
		loading.value = false
	}
})

async function onSubmit() {
	saving.value = true
	success.value = ''

	try {
		await updateProfile({
			displayName: form.displayName,
			password: form.password,
			currentPassword: form.currentPassword,
		})

		form.password = ''
		form.currentPassword = ''
		form.displayName = profile.value?.displayName ?? ''
		success.value = 'Profile updated.'
	} catch (err) {
		toastErrorFrom(err, 'Could not update profile.')
	} finally {
		saving.value = false
	}
}

function openFilePicker() {
	fileInput.value?.click()
}

async function onAvatarSelected(event: Event) {
	const input = event.target as HTMLInputElement
	const file = input.files?.[0]
	input.value = ''

	if (!file) return

	uploading.value = true
	success.value = ''

	try {
		await uploadAvatar(file)
		success.value = 'Profile picture updated.'
	} catch (err) {
		toastErrorFrom(err, 'Could not upload profile picture.')
	} finally {
		uploading.value = false
	}
}

async function onRemoveAvatar() {
	uploading.value = true
	success.value = ''

	try {
		await removeAvatar()
		success.value = 'Profile picture removed.'
	} catch (err) {
		toastErrorFrom(err, 'Could not remove profile picture.')
	} finally {
		uploading.value = false
	}
}
</script>

<template>
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h2 class="font-display text-2xl font-bold tracking-tight">Profile</h2>
			<p class="text-sm text-muted-foreground">
				Update your picture, display name, and password.
			</p>
		</div>

		<Card class="border-border/60 bg-card/90">
			<CardHeader>
				<CardTitle class="font-display">Profile picture</CardTitle>
				<CardDescription>JPG, PNG, WEBP, or GIF up to 2 MB.</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-col gap-4 sm:flex-row sm:items-center">
				<template v-if="loading">
					<Skeleton class="size-20 rounded-lg" />
				</template>
				<template v-else>
					<UserAvatar
						:avatar-url="profile?.avatarUrl"
						:label="displayLabel"
						class="size-20"
						fallback-class="text-lg"
					/>
					<div class="flex flex-wrap gap-2">
						<input
							ref="fileInput"
							type="file"
							accept="image/png,image/jpeg,image/webp,image/gif"
							class="hidden"
							@change="onAvatarSelected"
						/>
						<Button
							type="button"
							variant="outline"
							:disabled="uploading"
							@click="openFilePicker"
						>
							<ImageIcon data-icon="inline-start" />
							{{ uploading ? 'Uploading…' : 'Upload picture' }}
						</Button>
						<Button
							v-if="profile?.avatarUrl"
							type="button"
							variant="ghost"
							:disabled="uploading"
							@click="onRemoveAvatar"
						>
							Remove
						</Button>
					</div>
				</template>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90">
			<CardHeader>
				<CardTitle class="font-display">Account</CardTitle>
				<CardDescription>Your sign-in details and role.</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-col gap-4">
				<template v-if="loading">
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-40" />
				</template>
				<template v-else-if="profile">
					<div class="flex flex-wrap items-center gap-2">
						<Badge variant="outline">@{{ profile.username }}</Badge>
						<Badge variant="secondary" class="capitalize">
							{{ profile.role }}
						</Badge>
					</div>
					<p class="text-xs text-muted-foreground">User ID {{ profile.id }}</p>
				</template>
			</CardContent>
		</Card>

		<form @submit.prevent="onSubmit">
			<Card class="border-brain-pink/20 bg-card/90">
				<CardHeader>
					<CardTitle class="font-display">Edit profile</CardTitle>
					<CardDescription>
						Leave password fields empty to keep your current password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<Field>
							<FieldLabel for="displayName">Display name</FieldLabel>
							<Input
								id="displayName"
								v-model="form.displayName"
								autocomplete="nickname"
								placeholder="How you appear in the dashboard"
							/>
							<FieldDescription>Optional label shown in the sidebar.</FieldDescription>
						</Field>
						<Field>
							<FieldLabel for="currentPassword">Current password</FieldLabel>
							<Input
								id="currentPassword"
								v-model="form.currentPassword"
								type="password"
								autocomplete="current-password"
							/>
							<FieldDescription>
								Required only when changing your password.
							</FieldDescription>
						</Field>
						<Field>
							<FieldLabel for="password">New password</FieldLabel>
							<Input
								id="password"
								v-model="form.password"
								type="password"
								autocomplete="new-password"
								minlength="8"
							/>
						</Field>
					</FieldGroup>
				</CardContent>
				<CardFooter class="flex flex-col items-start gap-3">
					<p v-if="success" class="flex items-center gap-2 text-sm text-brain-teal">
						<BadgeCheckIcon />
						{{ success }}
					</p>
					<Button type="submit" :disabled="saving || loading">
						{{ saving ? 'Saving…' : 'Save changes' }}
					</Button>
				</CardFooter>
			</Card>
		</form>
	</div>
</template>
