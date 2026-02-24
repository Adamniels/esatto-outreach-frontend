import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '../services/auth'
import Dashboard from '../views/Dashboard.vue'
import Prospects from '../views/Prospects.vue'
import ProspectDetail from '../views/ProspectDetail.vue'
import PendingProspects from '../views/PendingProspects.vue'
import UserSettings from '../views/UserSettings.vue'
import CompanySettings from '../views/CompanySettings.vue'
import Invite from '../views/Invite.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import AcceptInvite from '../views/AcceptInvite.vue'

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
    path: '/accept-invite',
    name: 'AcceptInvite',
    component: AcceptInvite,
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
    path: '/invite',
    name: 'Invite',
    component: Invite,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'UserSettings',
    component: UserSettings,
    meta: { requiresAuth: true }
  },
  {
    path: '/company-settings',
    name: 'CompanySettings',
    component: CompanySettings,
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