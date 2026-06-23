import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import DashboardOverviewView from '@/views/dashboard/DashboardOverviewView.vue'
import { sessionState } from '@/composables/useSession'

describe('DashboardOverviewView', () => {
	it('renders overview heading', () => {
		sessionState.user = { id: 'abc', username: 'admin' }
		sessionState.ready = true

		const router = createRouter({
			history: createWebHistory(),
			routes: [{ path: '/', component: DashboardOverviewView }],
		})

		const wrapper = mount(DashboardOverviewView, {
			global: { plugins: [router] },
		})

		expect(wrapper.text()).toContain('Your hub at a glance')
		expect(wrapper.text()).toContain('admin')
	})
})
