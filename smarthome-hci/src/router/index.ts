
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      redirect: () => {
        const token = localStorage.getItem('token')
        return token ? '/homes' : '/login'
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot',
      component: () => import('@/views/ForgotPasswordView.vue'),
    },
    {
      path: '/verify-account',
      name: 'verify-account',
      component: () => import('@/views/VerifyAccountView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
    },
    {
      path: '/homes',
      name: 'homes',
      component: () => import('@/views/HomesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'rooms',
          name: 'rooms',
          component: () => import('@/views/RoomsView.vue'),
        },
        {
          path: 'devices',
          name: 'devices',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'stats',
          name: 'stats',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'homes/:homeId',
          name: 'home-detail',
          component: () => import('@/views/DashboardView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  } else if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    return { name: 'homes' }
  } else if (to.name === 'verify-account' && !to.query.email) {
    return { name: 'register' }
  } else if (to.name === 'reset-password' && !to.query.email) {
    return { name: 'forgot' }
  }
})

export default router
