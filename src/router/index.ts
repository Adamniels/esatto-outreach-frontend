import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Prospects from '../views/Prospects.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router