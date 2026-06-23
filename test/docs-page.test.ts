import { describe, expect, it } from 'bun:test'
import { injectBrainFavicon } from '../src/modules/api/docs-page'

describe('docs page', () => {
	it('injects favicon tags into scalar html', () => {
		const html = injectBrainFavicon(`<!doctype html>
<html>
  <head>
    <title>Test</title>
  </head>
</html>`)

		expect(html).toContain('rel="icon"')
		expect(html).toContain('/assets/brain-logo.png')
	})
})
