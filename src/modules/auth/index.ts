import { Elysia, t } from 'elysia'
import { AuthorizationService } from '../../lib/auth/authorization'
import { clearSessionCookie } from '../../lib/auth-cookie'
import { errors } from '../../lib/http-errors'
import { jwtAuth } from '../../plugins/jwt-auth'
import { UsersService } from '../users/service'
import * as AuthModel from './model'
import { AuthService } from './service'

export const authModule = new Elysia({ prefix: '/auth', name: 'auth' })
	.use(jwtAuth)
	.model({
		'auth.login': AuthModel.loginBody,
		'auth.token': AuthModel.tokenResponse,
		'auth.me': AuthModel.meResponse,
		'auth.profile': AuthModel.updateProfileBody,
		'auth.error': AuthModel.errorResponse,
		'auth.ok': AuthModel.okResponse,
	})
	.post(
		'/login',
		async ({ body, jwt, cookie }) => {
			const user = await AuthService.validateCredentials(body)
			if ('code' in user) return user

			return AuthService.establishSession(jwt, cookie.brain_token, user)
		},
		{
			body: 'auth.login',
			response: {
				200: 'auth.token',
				401: 'auth.error',
			},
			detail: {
				summary: 'Login',
				description: 'Exchange credentials for a JWT and session cookie',
				tags: ['Auth'],
			},
		},
	)
	.post(
		'/refresh',
		async ({ user, jwt, cookie }) => {
			const profile = await UsersService.getById(user.id)

			if (!profile) {
				return errors.unauthorized()
			}

			return AuthService.establishSession(
				jwt,
				cookie.brain_token,
				await UsersService.toAuthUser(profile),
			)
		},
		{
			isAuth: true,
			response: {
				200: 'auth.token',
				401: 'auth.error',
			},
			detail: {
				summary: 'Refresh session',
				description:
					'Issues a new JWT and refreshes the browser session cookie',
				tags: ['Auth'],
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.get(
		'/me',
		async ({ user }) => {
			const profile = await UsersService.getById(user.id)

			if (!profile) {
				return errors.notFound('User not found')
			}

			const access = await AuthorizationService.resolveAccess(user.id)

			return {
				...profile,
				permissions: access.permissions,
			}
		},
		{
			isAuth: true,
			response: {
				200: 'auth.me',
				401: 'auth.error',
				404: 'auth.error',
			},
			detail: {
				summary: 'Current user',
				description: 'Returns the authenticated user profile from the database',
				tags: ['Auth'],
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.patch(
		'/me',
		async ({ user, body, jwt, cookie }) => {
			const updated = await UsersService.updateProfile(user.id, body)

			if ('code' in updated) return updated

			await AuthService.reissueSession(
				jwt,
				cookie.brain_token,
				await UsersService.toAuthUser(updated),
			)

			const access = await AuthorizationService.resolveAccess(user.id)

			return {
				...updated,
				permissions: access.permissions,
			}
		},
		{
			isAuth: true,
			body: 'auth.profile',
			response: {
				200: 'auth.me',
				400: 'auth.error',
				401: 'auth.error',
				404: 'auth.error',
			},
			detail: {
				summary: 'Update profile',
				description:
					'Update display name and/or password for the current user',
				tags: ['Auth'],
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.post(
		'/me/avatar',
		async ({ user, body, jwt, cookie }) => {
			const updated = await UsersService.updateAvatar(user.id, body.avatar)

			if ('code' in updated) return updated

			await AuthService.reissueSession(
				jwt,
				cookie.brain_token,
				await UsersService.toAuthUser(updated),
			)

			const access = await AuthorizationService.resolveAccess(user.id)

			return {
				...updated,
				permissions: access.permissions,
			}
		},
		{
			isAuth: true,
			body: t.Object({
				avatar: t.File({
					type: 'image',
					maxSize: '2m',
				}),
			}),
			response: {
				200: 'auth.me',
				400: 'auth.error',
				401: 'auth.error',
				404: 'auth.error',
			},
			detail: {
				summary: 'Upload profile avatar',
				tags: ['Auth'],
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.delete(
		'/me/avatar',
		async ({ user, jwt, cookie }) => {
			const updated = await UsersService.removeAvatar(user.id)

			if ('code' in updated) return updated

			await AuthService.reissueSession(
				jwt,
				cookie.brain_token,
				await UsersService.toAuthUser(updated),
			)

			const access = await AuthorizationService.resolveAccess(user.id)

			return {
				...updated,
				permissions: access.permissions,
			}
		},
		{
			isAuth: true,
			response: {
				200: 'auth.me',
				401: 'auth.error',
				404: 'auth.error',
			},
			detail: {
				summary: 'Remove profile avatar',
				tags: ['Auth'],
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.post(
		'/logout',
		({ cookie }) => {
			clearSessionCookie(cookie.brain_token)

			return { ok: true as const }
		},
		{
			response: {
				200: 'auth.ok',
			},
			detail: {
				summary: 'Logout',
				description: 'Clears the session cookie',
				tags: ['Auth'],
			},
		},
	)
