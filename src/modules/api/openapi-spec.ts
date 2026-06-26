import { toOpenAPISchema } from '@elysiajs/openapi'
import type { Elysia } from 'elysia'
import type { OpenAPIV3 } from 'openapi-types'
import type { UserRole } from '../../lib/user-role'
import { openApiDocumentation, openApiExclude } from './openapi-config'

type AnyElysia = Elysia<any, any, any, any, any, any, any>

let appRef: AnyElysia | null = null
let cachedSpec: OpenAPIV3.Document | null = null
let cachedRouteCount = 0

const adminOnlyTags = new Set(['Users'])

export const bindOpenApiApp = (app: AnyElysia) => {
	appRef = app
	cachedSpec = null
	cachedRouteCount = 0
}

const buildFullSpec = (): OpenAPIV3.Document => {
	if (!appRef) {
		throw new Error('OpenAPI app is not bound yet')
	}

	if (cachedSpec && cachedRouteCount === appRef.routes.length) {
		return cachedSpec
	}

	const { paths, components } = toOpenAPISchema(
		appRef,
		openApiExclude,
	)

	cachedRouteCount = appRef.routes.length
	cachedSpec = {
		openapi: '3.0.3',
		...openApiDocumentation,
		paths: {
			...paths,
			...openApiDocumentation.paths,
		},
		components: {
			...openApiDocumentation.components,
			schemas: {
				...components.schemas,
				...openApiDocumentation.components?.schemas,
			},
		},
	}

	return cachedSpec
}

const isAdminOnlyPath = (path: string) => path.startsWith('/api/users')

const isAdminOnlyOperation = (operation: OpenAPIV3.OperationObject) =>
	operation.tags?.some((tag) => adminOnlyTags.has(tag)) ?? false

export const filterOpenApiSpecForRole = (
	spec: OpenAPIV3.Document,
	role: UserRole,
): OpenAPIV3.Document => {
	if (role === 'admin') return spec

	const paths = Object.fromEntries(
		Object.entries(spec.paths ?? {}).flatMap(([path, item]) => {
			if (!item || isAdminOnlyPath(path)) return []

			const methods = Object.fromEntries(
				Object.entries(item).filter(([, operation]) => {
					if (!operation || typeof operation !== 'object') return true

					return !isAdminOnlyOperation(operation as OpenAPIV3.OperationObject)
				}),
			)

			if (Object.keys(methods).length === 0) return []

			return [[path, methods]]
		}),
	)

	const tags = spec.tags?.filter((tag) => !adminOnlyTags.has(tag.name))

	return {
		...spec,
		paths,
		tags,
	}
}

export const getOpenApiSpecForRole = (role: UserRole) =>
	filterOpenApiSpecForRole(buildFullSpec(), role)
