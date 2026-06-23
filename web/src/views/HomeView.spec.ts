import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

describe('HomeView', () => {
	it('shows the personal tagline', () => {
		const router = createRouter({
			history: createWebHistory(),
			routes: [{ path: '/', component: HomeView }],
		})

		const wrapper = mount(HomeView, {
			global: {
				plugins: [router],
			},
		})

		expect(wrapper.text()).toContain('everything')
		expect(wrapper.text()).toContain('The Brain')
	})
})
