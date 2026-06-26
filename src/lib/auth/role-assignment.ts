import { AuthorizationService } from './authorization'
import { SYSTEM_ROLE_ADMIN } from './permissions'
import { errors } from '../http-errors'

export const assignUserRoles = async (
	userId: string,
	roleSlugs: string[],
	actorId: string,
) => {
	if (userId === actorId && !roleSlugs.includes(SYSTEM_ROLE_ADMIN)) {
		const actorIsAdmin = await AuthorizationService.userHasRole(
			actorId,
			SYSTEM_ROLE_ADMIN,
		)

		if (actorIsAdmin) {
			return errors.badRequest('You cannot remove your own admin role')
		}
	}

	const currentRoles = await AuthorizationService.getUserRoleSlugs(userId)

	if (
		currentRoles.includes(SYSTEM_ROLE_ADMIN) &&
		!roleSlugs.includes(SYSTEM_ROLE_ADMIN)
	) {
		const adminCount = await AuthorizationService.countUsersWithRole(
			SYSTEM_ROLE_ADMIN,
		)

		if (adminCount <= 1) {
			return errors.badRequest('At least one admin account must remain')
		}
	}

	const result = await AuthorizationService.setUserRoles(userId, roleSlugs)

	if (!result.ok) {
		return errors.badRequest(result.message)
	}

	return { ok: true as const }
}
