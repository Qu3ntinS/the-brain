import { docsInfo } from './docs-page'

export const openApiDocumentation = {
	info: docsInfo,
	tags: [
		{ name: 'Auth', description: 'JWT authentication' },
		{ name: 'Users', description: 'User management' },
		{ name: 'Access', description: 'Roles, permissions, and user grants' },
		{ name: 'System', description: 'Health & utilities' },
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http' as const,
				scheme: 'bearer' as const,
				bearerFormat: 'JWT',
			},
		},
	},
}

export const openApiExclude = {
	paths: ['/assets/*'],
}
