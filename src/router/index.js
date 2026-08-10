import { createRouter, createWebHistory } from 'vue-router'
import MenuView    from '../views/MenuView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import AdminView   from '../views/AdminView.vue'

const routes = [
  {
    path: '/',
    name: 'menu',
    component: MenuView,
    meta: { title: 'Belchiken — Commandez en ligne' },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView,
    meta: { title: 'Belchiken — Passer commande' },
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { title: 'Belchiken — Administration' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta?.title ?? 'Belchiken'
})

export default router
