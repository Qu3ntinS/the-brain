import { api } from '@/lib/api'
import { readApiError } from '@/lib/api-error'

export type Permission = {
	id: string
	slug: string
	name: string
	description: string | null
	category: string | null
}

export type Role = {
	id: string
	slug: string
	name: string
	description: string | null
	isSystem: boolean
	permissions: string[]
	createdAt: string
	updatedAt: string
}

export type UserGrant = {
	permission: string
	effect: 'allow' | 'deny'
}

export type UserAccess = {
	userId: string
	roles: string[]
	permissions: string[]
	grants: UserGrant[]
}

export type RoleFormInput = {
	slug: string
	name: string
	description: string
	permissions: string[]
}

export async function listPermissions(): Promise<Permission[]> {
	const { data, error } = await api.api.access.permissions.get()

	if (error || !data) {
		throw new Error(readApiError(error, data, 'Could not load permissions'))
	}

	return (data as unknown as { permissions: Permission[] }).permissions
}

export async function listRoles(): Promise<Role[]> {
	const { data, error } = await api.api.access.roles.get()

	if (error || !data) {
		throw new Error(readApiError(error, data, 'Could not load roles'))
	}

	return (data as unknown as { roles: Role[] }).roles
}

export async function createRole(input: RoleFormInput): Promise<Role> {
	const description = input.description.trim()

	const { data, error } = await api.api.access.roles.post({
		slug: input.slug.trim(),
		name: input.name.trim(),
		...(description ? { description } : {}),
		permissions: input.permissions,
	})

	if (error || !data || 'error' in data) {
		throw new Error(readApiError(error, data, 'Could not create role'))
	}

	return data
}

export async function updateRole(
	id: string,
	input: Partial<Omit<RoleFormInput, 'slug'>>,
): Promise<Role> {
	const body: {
		name?: string
		description?: string | null
		permissions?: string[]
	} = {}

	if (input.name !== undefined) body.name = input.name.trim()

	if (input.description !== undefined) {
		body.description = input.description.trim() || null
	}

	if (input.permissions !== undefined) body.permissions = input.permissions

	const { data, error } = await api.api.access.roles({ id }).patch(body)

	if (error || !data || 'error' in data) {
		throw new Error(readApiError(error, data, 'Could not update role'))
	}

	return data
}

export async function deleteRole(id: string): Promise<void> {
	const { data, error } = await api.api.access.roles({ id }).delete()

	if (error || !data || ('error' in data && data.error)) {
		throw new Error(readApiError(error, data, 'Could not delete role'))
	}
}

export async function getUserAccess(userId: string): Promise<UserAccess> {
	const { data, error } = await api.api.access.users({ id: userId }).get()

	if (error || !data || 'error' in data) {
		throw new Error(readApiError(error, data, 'Could not load user access'))
	}

	return data
}

export async function setUserRoles(
	userId: string,
	roles: string[],
): Promise<UserAccess> {
	const { data, error } = await api.api.access.users({ id: userId }).roles.put({
		roles,
	})

	if (error || !data || 'error' in data) {
		throw new Error(readApiError(error, data, 'Could not update user roles'))
	}

	return data
}

export async function setUserGrants(
	userId: string,
	grants: UserGrant[],
): Promise<UserAccess> {
	const { data, error } = await api.api.access.users({ id: userId }).grants.put({
		grants,
	})

	if (error || !data || 'error' in data) {
		throw new Error(readApiError(error, data, 'Could not update user grants'))
	}

	return data
}
