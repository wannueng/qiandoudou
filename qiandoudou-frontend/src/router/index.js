import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// 路由组件
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import WalletDetail from '@/views/WalletDetail.vue'
import CreateWallet from '@/views/CreateWallet.vue'
import Social from '@/views/Social.vue'
import ScriptDetail from '@/views/ScriptDetail.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/wallet/:id',
    name: 'WalletDetail',
    component: WalletDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-wallet',
    name: 'CreateWallet',
    component: CreateWallet,
    meta: { requiresAuth: true }
  },
  {
    path: '/social',
    name: 'Social',
    component: Social,
    meta: { requiresAuth: true }
  },
  {
    path: '/script/:id',
    name: 'ScriptDetail',
    component: ScriptDetail,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = store.getters.isAuthenticated && store.state.user

  console.log('路由守卫:', { 
    to: to.path, 
    requiresAuth, 
    isAuthenticated, 
    hasToken: !!store.state.token,
    hasUser: !!store.state.user 
  })

  if (requiresAuth && !isAuthenticated) {
    console.log('跳转到登录页面')
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    console.log('已登录，跳转到首页')
    next('/home')
  } else {
    console.log('正常访问')
    next()
  }
})

export default router
