export const TEST_USERNAMES = ['test-user', 'docs-user', 'support-user'] as const

/** Custom roles created in access tests — removed after each run. */
export const TEST_ROLE_SLUGS = ['support'] as const

/** Profile patch applied in users.test.ts — revert after tests if still set. */
export const TEST_ADMIN_DISPLAY_NAME = 'Brain Admin'
