import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Головна • LotteryApp', layout: 'default' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: 'Про автора • LotteryApp', layout: 'default' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Вхід • LotteryApp', layout: 'auth' },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersView.vue'),
    meta: { title: 'Користувачі • LotteryApp', requiresAuth: true, layout: 'default' },
    children: [
      {
        path: ':id/edit',
        name: 'user-edit',
        component: () => import('@/views/UserEditView.vue'),
        meta: { title: 'Редагування користувача', requiresAuth: true, layout: 'default' },
      },
    ],
  },
  {
    path: '/users/:id',
    name: 'user-detail',
    component: () => import('@/views/UserDetailView.vue'),
    props: true,
    meta: { title: 'Деталі користувача', requiresAuth: true, layout: 'default' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '404 • Сторінку не знайдено', layout: 'default' },
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'users' };
  }
});

router.afterEach((to) => {
  document.title = (to.meta.title as string) || 'LotteryApp';
});
