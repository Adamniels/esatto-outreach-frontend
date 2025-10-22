import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Prospects from '../views/Prospects.vue'
import ProspectDetail from '../views/ProspectDetail.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router