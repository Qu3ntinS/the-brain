import { ScalarRender } from '@elysiajs/openapi/scalar'

export const docsInfo = {
	title: 'The Brain API',
	version: '1.0.0',
	description:
		'Personal API hub — portfolio, side projects, and the lightweight glue.',
} as const

const scalarCdn =
	'https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest/dist/browser/standalone.min.js'

export const brainFaviconTags = `<link rel="icon" href="/assets/brain-logo.png" type="image/png" sizes="512x512" />
    <link rel="apple-touch-icon" href="/assets/brain-logo.png" />`

export const injectBrainFavicon = (html: string) => {
	if (html.includes('rel="icon"')) return html

	return html.replace('<head>', `<head>\n    ${brainFaviconTags}`)
}

export const renderDocsPage = () => {
	const html = ScalarRender(
		docsInfo,
		{
			url: 'docs/json',
			version: 'latest',
			cdn: scalarCdn,
			favicon: '/assets/brain-logo.png',
			authentication: {
				preferredSecurityScheme: 'bearerAuth',
			},
			_integration: 'elysiajs',
		},
	)

	return injectBrainFavicon(html)
}
