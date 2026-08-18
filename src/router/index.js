import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { label: 'HOME', code: '00' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { label: 'ABOUT', code: '01' },
  },
  {
    path: '/blog',
    name: 'blog',
    component: () => import('../views/BlogView.vue'),
    meta: { label: 'BLOG', code: '02' },
  },
  {
    path: '/blog/:id',
    name: 'post',
    component: () => import('../views/PostView.vue'),
    meta: { label: 'BLOG', code: '02', hideInNav: true },
  },
  {
    path: '/kids',
    name: 'kids',
    component: () => import('../views/KidsView.vue'),
    meta: { label: 'KIDS', code: '03' },
  },
  {
    path: '/kids/:id',
    name: 'kid',
    component: () => import('../views/KidView.vue'),
    meta: { label: 'KIDS', code: '03', hideInNav: true },
  },
  {
    path: '/font-preview',
    name: 'font-preview',
    component: () => import('../views/FontPreviewView.vue'),
    meta: { label: 'FONTS', code: '—', hideInNav: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { label: 'ADMIN', code: 'CTRL', hideInNav: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
