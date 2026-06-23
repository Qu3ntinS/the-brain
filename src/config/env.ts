const required = (key: string): string => {
	const value = process.env[key]
	if (!value) throw new Error(`Missing required environment variable: ${key}`)
	return value
}

const parseOrigins = (value: string | undefined) => {
	if (!value) return true as const

	const origins = value
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean)

	return origins.length === 1 ? origins[0]! : origins
}

export const env = {
	port: Number(process.env.PORT ?? 3000),
	nodeEnv: process.env.NODE_ENV ?? 'development',
	jwtSecret: required('JWT_SECRET'),
	jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
	adminUsername: process.env.ADMIN_USERNAME ?? 'admin',
	adminPassword: required('ADMIN_PASSWORD'),
	corsOrigin:
		process.env.NODE_ENV === 'production'
			? parseOrigins(process.env.CORS_ORIGIN)
			: true,
} as const
