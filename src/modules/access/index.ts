import { Elysia, t } from 'elysia'
import { PERMISSIONS } from '../../lib/auth/permissions'
import { errors } from '../../lib/http-errors'
import { jwtAuth } from '../../plugins/jwt-auth'
import * as AccessModel from './model'
import { AccessService } from './service'

export const accessModule = new Elysia({ prefix: '/access', name: 'access' })
	.use(jwtAuth)
	.model({
		'access.permission': AccessModel.permissionPublic,
		'access.permissions': AccessModel.permissionsListResponse,
		'access.role': AccessModel.rolePublic,
		'access.roles': AccessModel.rolesListResponse,
		'access.createRole': AccessModel.createRoleBody,
		'access.updateRole': AccessModel.updateRoleBody,
		'access.setUserRoles': AccessModel.setUserRolesBody,
		'access.setUserGrants': AccessModel.setUserGrantsBody,
		'access.userAccess': AccessModel.userAccessResponse,
		'access.error': AccessModel.errorResponse,
		'access.ok': AccessModel.okResponse,
	})
	.get(
		'/permissions',
		async () => ({
			permissions: await AccessService.listPermissions(),
		}),
		{
			requirePermission: PERMISSIONS.ROLES_READ,
			response: {
				200: 'access.permissions',
				401: 'access.error',
				403: 'access.error',
			},
			detail: {
				summary: 'List permissions',
				description: 'Permission catalog available for role assignment',
				tags: ['Access'],
				permission: PERMISSIONS.ROLES_READ,
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.get(
		'/roles',
		async () => ({
			roles: await AccessService.listRoles(),
		}),
		{
			requirePermission: PERMISSIONS.ROLES_READ,
			response: {
				200: 'access.roles',
				401: 'access.error',
				403: 'access.error',
			},
			detail: {
				summary: 'List roles',
				tags: ['Access'],
				permission: PERMISSIONS.ROLES_READ,
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.get(
		'/roles/:id',
		async ({ params: { id } }) => {
			const role = await AccessService.getRoleById(id)

			if (!role) {
				return errors.notFound('Role not found')
			}

			return role
		},
		{
			requirePermission: PERMISSIONS.ROLES_READ,
			params: t.Object({ id: t.String() }),
			response: {
				200: 'access.role',
				401: 'access.error',
				403: 'access.error',
				404: 'access.error',
			},
			detail: {
				summary: 'Get role',
				tags: ['Access'],
				permission: PERMISSIONS.ROLES_READ,
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.post(
		'/roles',
		async ({ body }) => AccessService.createRole(body),
		{
			requirePermission: PERMISSIONS.ROLES_WRITE,
			body: 'access.createRole',
			response: {
				200: 'access.role',
				401: 'access.error',
				403: 'access.error',
				409: 'access.error',
			},
			detail: {
				summary: 'Create role',
				tags: ['Access'],
				permission: PERMISSIONS.ROLES_WRITE,
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.patch(
		'/roles/:id',
		async ({ params: { id }, body }) => AccessService.updateRole(id, body),
		{
			requirePermission: PERMISSIONS.ROLES_WRITE,
			params: t.Object({ id: t.String() }),
			body: 'access.updateRole',
			response: {
				200: 'access.role',
				401: 'access.error',
				403: 'access.error',
				404: 'access.error',
			},
			detail: {
				summary: 'Update role',
				tags: ['Access'],
				permission: PERMISSIONS.ROLES_WRITE,
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.delete(
		'/roles/:id',
		async ({ params: { id } }) => AccessService.removeRole(id),
		{
			requirePermission: PERMISSIONS.ROLES_WRITE,
			params: t.Object({ id: t.String() }),
			response: {
				200: 'access.ok',
				401: 'access.error',
				403: 'access.error',
				404: 'access.error',
			},
			detail: {
				summary: 'Delete role',
				tags: ['Access'],
				permission: PERMISSIONS.ROLES_WRITE,
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.get(
		'/users/:id',
		async ({ params: { id } }) => AccessService.getUserAccess(id),
		{
			requirePermission: PERMISSIONS.ROLES_READ,
			params: t.Object({ id: t.String() }),
			response: {
				200: 'access.userAccess',
				401: 'access.error',
				403: 'access.error',
			},
			detail: {
				summary: 'Get user access',
				description: 'Roles, effective permissions, and direct grants for a user',
				tags: ['Access'],
				permission: PERMISSIONS.ROLES_READ,
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.put(
		'/users/:id/roles',
		async ({ params: { id }, body, user }) =>
			AccessService.setUserRoles(id, body.roles, user.id),
		{
			requirePermission: PERMISSIONS.USERS_WRITE,
			params: t.Object({ id: t.String() }),
			body: 'access.setUserRoles',
			response: {
				200: 'access.userAccess',
				400: 'access.error',
				401: 'access.error',
				403: 'access.error',
			},
			detail: {
				summary: 'Set user roles',
				tags: ['Access'],
				permission: PERMISSIONS.USERS_WRITE,
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.put(
		'/users/:id/grants',
		async ({ params: { id }, body }) =>
			AccessService.setUserGrants(id, body.grants),
		{
			requirePermission: PERMISSIONS.GRANTS_WRITE,
			params: t.Object({ id: t.String() }),
			body: 'access.setUserGrants',
			response: {
				200: 'access.userAccess',
				400: 'access.error',
				401: 'access.error',
				403: 'access.error',
			},
			detail: {
				summary: 'Set user permission grants',
				description:
					'Direct allow/deny overrides for individual users (feature flags)',
				tags: ['Access'],
				permission: PERMISSIONS.GRANTS_WRITE,
				security: [{ bearerAuth: [] }],
			},
		},
	)
