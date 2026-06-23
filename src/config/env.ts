const required = (key: string): string => {
	const value = process.env[key]
	if (!value) throw new Error(`Missing required environment variable: ${key}`)
	return value
}

export const env = {
	port: Number(process.env.PORT ?? 3000),
	jwtSecret: required('JWT_SECRET'),
	jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
	adminUsername: process.env.ADMIN_USERNAME ?? 'admin',
	adminPassword: required('ADMIN_PASSWORD'),
} as const
