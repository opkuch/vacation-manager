import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { Role } from '@vm/shared'
import AppLayout from '@/components/ui/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'

// `access` mirrors the API_ROUTES authorization model: a route is open to a
// single role, or to any authenticated user when omitted.
declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    access?: Role
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/features/auth/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', redirect: '/requests' },
      {
        path: 'requests',
        name: 'my-requests',
        component: () => import('@/features/requests/MyRequestsView.vue'),
        meta: { access: Role.Requester },
      },
      {
        path: 'validation',
        name: 'validation',
        component: () => import('@/features/validation/DashboardView.vue'),
        meta: { access: Role.Validator },
      },
      {
        path: 'team',
        name: 'team-planning',
        component: () => import('@/features/team-planning/TeamPlanningView.vue'),
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Cookie may exist while Pinia is empty after a refresh — restore before auth checks.
  await auth.restore()

  if (to.meta.public) {
    return auth.isAuthenticated ? auth.homeRoute : true
  }

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.access && auth.role !== to.meta.access) {
    return auth.homeRoute
  }

  return true
})
