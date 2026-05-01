
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
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
      path: '/homes',
      name: 'homes',
      component: () => import('@/views/HomesView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
  ],
})

export default router
