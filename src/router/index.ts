import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '../services/auth'
import Dashboard from '../views/Dashboard.vue'
import Prospects from '../views/Prospects.vue'
import ProspectDetail from '../views/ProspectDetail.vue'
import PendingProspects from '../views/PendingProspects.vue'
import Settings from '../views/Settings.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/prospects', 
    name: 'Prospects',
    component: Prospects,
    meta: { requiresAuth: true }
  },
  {
    path: '/prospects/pending',
    name: 'PendingProspects',
    component: PendingProspects,
    meta: { requiresAuth: true }
  },
  {
    path: '/prospects/:id',
    name: 'ProspectDetail',
    component: ProspectDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router