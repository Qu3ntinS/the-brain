import { api } from '@/lib/api'
import { readApiError } from '@/lib/api-error'
import { fetchMe, sessionState } from '@/composables/useSession'

export type ManagedUser = {
	id: string
	username: string
	displayName: string | null
	avatarUrl: string | null
	role: 'admin' | 'user'
	createdAt: string
	updatedAt: string
}

export type UserFormInput = {
	username: string
	password: string
	displayName: string
	role: 'admin' | 'user'
}

export async function listUsers(): Promise<ManagedUser[]> {
	const { data, error } = await api.api.users.get()

	if (error || !data) {
		throw new Error(readApiError(error, data, 'Could not load users'))
	}

	return data.users
}

const normalizeRole = (
	role: UserFormInput['role'] | undefined,
): 'admin' | 'user' | undefined =>
	role === 'admin' || role === 'user' ? role : undefined

export async function createUser(input: UserFormInput): Promise<ManagedUser> {
	const displayName = input.displayName.trim()
	const role = normalizeRole(input.role)

	const { data, error } = await api.api.users.post({
		username: input.username.trim(),
		password: input.password,
		...(displayName ? { displayName } : {}),
		...(role ? { role } : {}),
	})

	if (error || !data || 'error' in data) {
		throw new Error(readApiError(error, data, 'Could not create user'))
	}

	return data
}

export async function updateUser(
	id: string,
	input: Partial<UserFormInput>,
): Promise<ManagedUser> {
	const body: {
		username?: string
		password?: string
		displayName?: string | null
		role?: 'admin' | 'user'
	} = {}

	if (input.username !== undefined) body.username = input.username.trim()
	if (input.password) body.password = input.password
	if (input.displayName !== undefined) {
		body.displayName = input.displayName === '' ? null : input.displayName
	}

	const role = normalizeRole(input.role)
	if (role) body.role = role

	const { data, error } = await api.api.users({ id }).patch(body)

	if (error || !data || 'error' in data) {
		throw new Error(readApiError(error, data, 'Could not update user'))
	}

	return data
}

export async function deleteUser(id: string): Promise<void> {
	const { data, error } = await api.api.users({ id }).delete()

	if (error || !data || ('error' in data && data.error)) {
		throw new Error(readApiError(error, data, 'Could not delete user'))
	}
}

export type ProfileInput = {
	displayName: string
	password: string
	currentPassword: string
}

export async function updateProfile(input: ProfileInput): Promise<ManagedUser> {
	const { data, error } = await api.api.auth.me.patch({
		displayName: input.displayName === '' ? null : input.displayName,
		password: input.password || undefined,
		currentPassword: input.currentPassword || undefined,
	})

	if (error || !data || 'error' in data) {
		throw new Error(readApiError(error, data, 'Could not update profile'))
	}

	applySessionUser(data)
	return data
}

export async function uploadAvatar(file: File): Promise<ManagedUser> {
	const formData = new FormData()
	formData.append('avatar', file)

	const response = await fetch('/api/auth/me/avatar', {
		method: 'POST',
		credentials: 'include',
		body: formData,
	})

	const data = await response.json().catch(() => null)

	if (!response.ok) {
		throw new Error(readApiError(null, data, 'Could not upload avatar'))
	}

	applySessionUser(data)
	return data
}

export async function removeAvatar(): Promise<ManagedUser> {
	const { data, error } = await api.api.auth.me.avatar.delete()

	if (error || !data || 'error' in data) {
		throw new Error(readApiError(error, data, 'Could not remove avatar'))
	}

	applySessionUser(data)
	return data
}

export async function reloadProfile(): Promise<ManagedUser | null> {
	const user = await fetchMe()
	return user as ManagedUser | null
}

function applySessionUser(data: ManagedUser) {
	sessionState.user = {
		id: data.id,
		username: data.username,
		displayName: data.displayName,
		avatarUrl: data.avatarUrl,
		role: data.role,
	}
}
