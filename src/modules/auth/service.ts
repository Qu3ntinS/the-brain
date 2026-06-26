import { t } from 'elysia'
import { env } from '../../config/env'
import type { SessionCookie } from '../../lib/auth-cookie'
import { setSessionCookie } from '../../lib/auth-cookie'
import { errors } from '../../lib/http-errors'
import { verifyPassword } from '../../lib/password'
import { UsersService } from '../users/service'
import type { LoginBody, TokenResponse } from './model'

type JwtSigner = {
	sign: (payload: {
		sub: string
		username: string
		role: string
		displayName?: string | null
		avatarUrl?: string | null
	}) => Promise<string>
}

export type AuthUserRecord = {
	id: string
	username: string
	displayName: string | null
	avatarUrl: string | null
	role: string
}

export abstract class AuthService {
	static async validateCredentials(credentials: LoginBody) {
		const user = await UsersService.getRecordByUsername(credentials.username)

		if (
			!user ||
			!(await verifyPassword(credentials.password, user.passwordHash))
		) {
			return errors.invalidCredentials()
		}

		return UsersService.toAuthUser(user)
	}

	static async issueSession(jwt: JwtSigner, user: AuthUserRecord) {
		const accessToken = await jwt.sign({
			sub: user.id,
			username: user.username,
			role: user.role,
			displayName: user.displayName,
			avatarUrl: user.avatarUrl,
		})

		return {
			accessToken,
			user: {
				id: user.id,
				username: user.username,
				displayName: user.displayName,
				avatarUrl: user.avatarUrl,
				role: user.role,
			},
		}
	}

	static async reissueSession(
		jwt: JwtSigner,
		cookie: SessionCookie,
		user: AuthUserRecord,
	) {
		const session = await AuthService.issueSession(jwt, user)
		AuthService.applySessionCookie(cookie, session.accessToken)
		return session
	}

	static async establishSession(
		jwt: JwtSigner,
		cookie: SessionCookie,
		user: AuthUserRecord,
	) {
		const session = await AuthService.reissueSession(jwt, cookie, user)
		return AuthService.buildSessionResponse(session.accessToken)
	}

	static buildSessionResponse(accessToken: string): TokenResponse {
		return {
			accessToken,
			tokenType: 'Bearer',
			expiresIn: env.jwtExpiresIn,
		}
	}

	static applySessionCookie(
		cookie: SessionCookie,
		accessToken: string,
	) {
		setSessionCookie(cookie, accessToken, env.jwtExpiresIn)
	}
}
