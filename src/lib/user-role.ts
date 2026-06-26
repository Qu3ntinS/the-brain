export const userRoles = ['admin', 'user'] as const

export type UserRole = (typeof userRoles)[number]

export const isUserRole = (value: string): value is UserRole =>
	userRoles.includes(value as UserRole)
