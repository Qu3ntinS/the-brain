import type { AnyApiReferenceConfiguration } from '@scalar/types/api-reference'
import {
	brainScalarEmbeddedLayoutCss,
	brainScalarThemeCss,
} from '@shared/brain-scalar-theme'

export const brainScalarConfig: AnyApiReferenceConfiguration = {
	url: '/api/docs/json',
	theme: 'none',
	forceDarkModeState: 'dark',
	hideDarkModeToggle: true,
	layout: 'modern',
	customCss: `${brainScalarThemeCss}\n\n${brainScalarEmbeddedLayoutCss}`,
	customFetch: ((input, init) =>
		fetch(input, {
			...init,
			credentials: 'include',
		})) as typeof fetch,
	authentication: {
		preferredSecurityScheme: 'bearerAuth',
	},
}
