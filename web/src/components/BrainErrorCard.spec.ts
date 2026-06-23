import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import BrainErrorCard from '@/components/BrainErrorCard.vue'
import { brainErrorDefaults } from '@shared/brain-error'

describe('BrainErrorCard', () => {
	it('matches shared API error copy', () => {
		const router = createRouter({
			history: createWebHistory(),
			routes: [{ path: '/', component: { template: '<div />' } }],
		})

		const wrapper = mount(BrainErrorCard, {
			props: {
				status: 404,
				message: brainErrorDefaults.messages.notFound,
			},
			global: {
				plugins: [router],
			},
		})

		expect(wrapper.text()).toContain('404')
		expect(wrapper.text()).toContain(brainErrorDefaults.messages.notFound)
		expect(wrapper.text()).toContain(brainErrorDefaults.backLabel)
	})
})
