import { status } from 'elysia'
import { env } from '../../config/env'
import { buildAuthCookie } from '../../lib/auth-cookie'
import type { AuthModel } from './model'

type JwtSigner = {
	sign: (payload: { sub: string; username: string }) => Promise<string>
}

export abstract class AuthService {
	static validateCredentials(credentials: AuthModel.loginBody) {
		if (
			credentials.username !== env.adminUsername ||
			credentials.password !== env.adminPassword
		) {
			return status(401, {
				error: 'Unauthorized',
				message: 'Invalid username or password',
			})
		}

		return credentials
	}

	static createUserId(username: string): string {
		return Bun.hash(username).toString(16)
	}

	static async issueSession(jwt: JwtSigner, username: string) {
		const userId = AuthService.createUserId(username)
		const accessToken = await jwt.sign({
			sub: userId,
			username,
		})

		return {
			accessToken,
			user: {
				id: userId,
				username,
			},
		}
	}

	static buildSessionResponse(accessToken: string): AuthModel.tokenResponse {
		return {
			accessToken,
			tokenType: 'Bearer',
			expiresIn: env.jwtExpiresIn,
		}
	}

	static sessionCookie(accessToken: string) {
		return buildAuthCookie(accessToken, env.jwtExpiresIn)
	}
}
