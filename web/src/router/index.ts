import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import DashboardOverviewView from '@/views/dashboard/DashboardOverviewView.vue'
import { authGuard, guestGuard } from './guards'

const DashboardDocsView = () =>
	import('@/views/dashboard/DashboardDocsView.vue')

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/', name: 'home', component: HomeView },
		{ path: '/login', name: 'login', component: LoginView },
		{
			path: '/dashboard',
			component: DashboardLayout,
			meta: { requiresAuth: true, dashboard: true },
			children: [
				{
					path: '',
					name: 'dashboard',
					component: DashboardOverviewView,
				},
				{
					path: 'docs',
					name: 'dashboard-docs',
					component: DashboardDocsView,
					meta: { fullBleed: true },
				},
			],
		},
		{ path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
	],
})

router.beforeEach(async (to) => {
	const guestRedirect = await guestGuard(to)
	if (guestRedirect !== true) return guestRedirect

	return authGuard(to)
})
