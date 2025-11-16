import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Prospects from '../views/Prospects.vue'
import ProspectDetail from '../views/ProspectDetail.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/prospects', 
    name: 'Prospects',
    component: Prospects
  },
  {
    path: '/prospects/:id',
    name: 'ProspectDetail',
    component: ProspectDetail
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router