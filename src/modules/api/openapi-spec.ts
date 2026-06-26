import { toOpenAPISchema } from '@elysiajs/openapi'
import type { Elysia } from 'elysia'
import type { OpenAPIV3 } from 'openapi-types'
import type { PermissionSlug } from '../../lib/auth/permissions'
import { PERMISSIONS } from '../../lib/auth/permissions'
import { openApiDocumentation, openApiExclude } from './openapi-config'

type AnyElysia = Elysia<any, any, any, any, any, any, any>

type OperationWithPermission = OpenAPIV3.OperationObject & {
	permission?: PermissionSlug
}

let appRef: AnyElysia | null = null
let cachedSpec: OpenAPIV3.Document | null = null
let cachedRouteCount = 0

const tagFallbackPermission: Record<string, PermissionSlug> = {
	Users: PERMISSIONS.USERS_READ,
	Access: PERMISSIONS.ROLES_READ,
}

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

const requiredPermissionForOperation = (
	operation: OperationWithPermission,
): PermissionSlug | null => {
	if (operation.permission) return operation.permission

	const tag = operation.tags?.find((name) => tagFallbackPermission[name])

	return tag ? tagFallbackPermission[tag]! : null
}

export const filterOpenApiSpecForPermissions = (
	spec: OpenAPIV3.Document,
	permissions: PermissionSlug[],
): OpenAPIV3.Document => {
	const allowed = new Set(permissions)

	const paths = Object.fromEntries(
		Object.entries(spec.paths ?? {}).flatMap(([path, item]) => {
			if (!item) return []

			const methods = Object.fromEntries(
				Object.entries(item).filter(([, operation]) => {
					if (!operation || typeof operation !== 'object') return true

					const required = requiredPermissionForOperation(
						operation as OperationWithPermission,
					)

					if (!required) return true

					return allowed.has(required)
				}),
			)

			if (Object.keys(methods).length === 0) return []

			return [[path, methods]]
		}),
	)

	const tags = spec.tags?.filter((tag) => {
		const required = tagFallbackPermission[tag.name]
		return !required || allowed.has(required)
	})

	return {
		...spec,
		paths,
		tags,
	}
}

export const getOpenApiSpecForPermissions = (permissions: PermissionSlug[]) =>
	filterOpenApiSpecForPermissions(buildFullSpec(), permissions)

/** @deprecated Use getOpenApiSpecForPermissions */
export const getOpenApiSpecForRole = (_role: string) => buildFullSpec()
