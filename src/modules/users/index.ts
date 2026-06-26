import { Elysia, t } from 'elysia'
import { PERMISSIONS } from '../../lib/auth/permissions'
import { errors } from '../../lib/http-errors'
import { jwtAuth } from '../../plugins/jwt-auth'
import * as UsersModel from './model'
import { UsersService } from './service'

export const usersModule = new Elysia({ prefix: '/users', name: 'users' })
	.use(jwtAuth)
	.model({
		'users.public': UsersModel.userPublic,
		'users.list': UsersModel.usersListResponse,
		'users.create': UsersModel.createUserBody,
		'users.update': UsersModel.updateUserBody,
		'users.error': UsersModel.errorResponse,
		'users.ok': UsersModel.okResponse,
	})
	.get(
		'/',
		async () => ({
			users: await UsersService.list(),
		}),
		{
			requirePermission: PERMISSIONS.USERS_READ,
			response: {
				200: 'users.list',
				401: 'users.error',
				403: 'users.error',
			},
			detail: {
				summary: 'List users',
				tags: ['Users'],
				permission: PERMISSIONS.USERS_READ,
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.get(
		'/:id',
		async ({ params: { id } }) => {
			const user = await UsersService.getById(id)

			if (!user) {
				return errors.notFound('User not found')
			}

			return user
		},
		{
			requirePermission: PERMISSIONS.USERS_READ,
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: 'users.public',
				401: 'users.error',
				403: 'users.error',
				404: 'users.error',
			},
			detail: {
				summary: 'Get user',
				tags: ['Users'],
				permission: PERMISSIONS.USERS_READ,
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.post(
		'/',
		async ({ body }) => UsersService.create(body),
		{
			requirePermission: PERMISSIONS.USERS_WRITE,
			body: 'users.create',
			response: {
				200: 'users.public',
				401: 'users.error',
				403: 'users.error',
				409: 'users.error',
			},
			detail: {
				summary: 'Create user',
				tags: ['Users'],
				permission: PERMISSIONS.USERS_WRITE,
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.patch(
		'/:id',
		async ({ params: { id }, body, user }) =>
			UsersService.update(id, body, user.id),
		{
			requirePermission: PERMISSIONS.USERS_WRITE,
			params: t.Object({
				id: t.String(),
			}),
			body: 'users.update',
			response: {
				200: 'users.public',
				400: 'users.error',
				401: 'users.error',
				403: 'users.error',
				404: 'users.error',
				409: 'users.error',
			},
			detail: {
				summary: 'Update user',
				tags: ['Users'],
				permission: PERMISSIONS.USERS_WRITE,
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.delete(
		'/:id',
		async ({ params: { id }, user }) => UsersService.remove(id, user.id),
		{
			requirePermission: PERMISSIONS.USERS_WRITE,
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: 'users.ok',
				400: 'users.error',
				401: 'users.error',
				403: 'users.error',
				404: 'users.error',
			},
			detail: {
				summary: 'Delete user',
				tags: ['Users'],
				permission: PERMISSIONS.USERS_WRITE,
				security: [{ bearerAuth: [] }],
			},
		},
	)
