import { createStore } from 'vuex'
import Cookies from 'js-cookie'
import api from '@/utils/api'

export default createStore({
  state: {
    user: null,
    token: Cookies.get('token') || null,
    wallets: [],
    currentWallet: null,
    loading: false
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        Cookies.set('token', token, { expires: 7 })
      } else {
        Cookies.remove('token')
      }
    },
    
    SET_WALLETS(state, wallets) {
      state.wallets = wallets
    },
    
    SET_CURRENT_WALLET(state, wallet) {
      state.currentWallet = wallet
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    UPDATE_WALLET_BALANCE(state, { walletId, balance }) {
      const wallet = state.wallets.find(w => w.id == walletId) // 使用 == 避免类型问题
      if (wallet) {
        wallet.balance = balance
      }
      if (state.currentWallet && state.currentWallet.id == walletId) {
        state.currentWallet.balance = balance
      }
    },
    
    UPDATE_WALLET_BACKGROUND(state, { walletId, backgroundImage }) {
      console.log('更新钱包背景 - ID:', walletId, '背景:', backgroundImage.substring(0, 50) + '...')
      const wallet = state.wallets.find(w => w.id == walletId) // 使用 == 避免类型问题
      if (wallet) {
        wallet.background_image = backgroundImage
        console.log('钱包背景已更新:', wallet.name)
      } else {
        console.log('未找到钱包，ID:', walletId, '现有钱包:', state.wallets.map(w => ({ id: w.id, name: w.name })))
      }
      if (state.currentWallet && state.currentWallet.id == walletId) {
        state.currentWallet.background_image = backgroundImage
      }
    },
    
    ADD_WALLET(state, wallet) {
      state.wallets.push(wallet)
    }
  },
  
  actions: {
    // 用户登录
    async login({ commit }, { username, password }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.post('/auth/login', { username, password })
        
        if (response.data.code === 200) {
          const { token, user } = response.data.data
          commit('SET_TOKEN', token)
          commit('SET_USER', user)
          return { success: true }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        return { success: false, message: error.message || '登录失败' }
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 演示登录
    async demoLogin({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.post('/auth/demo-login')
        
        if (response.data.code === 200) {
          const { token, user } = response.data.data
          commit('SET_TOKEN', token)
          commit('SET_USER', user)
          return { success: true }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        return { success: false, message: error.message || '登录失败' }
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 用户登出
    logout({ commit }) {
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
      commit('SET_WALLETS', [])
      commit('SET_CURRENT_WALLET', null)
    },
    
    // 获取用户钱包列表
    async fetchWallets({ commit, state }) {
      try {
        commit('SET_LOADING', true)
        
        // 检查用户是否已登录
        if (!state.user || !state.user.id) {
          console.error('用户未登录')
          return
        }
        
        const response = await api.get('/wallet/list', {
          params: { userId: state.user.id }
        })
        
        if (response.data.code === 200) {
          commit('SET_WALLETS', response.data.data)
        }
      } catch (error) {
        console.error('获取钱包列表失败:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 创建钱包
    async createWallet({ commit, state }, walletData) {
      try {
        commit('SET_LOADING', true)
        
        // 检查用户是否已登录
        if (!state.user || !state.user.id) {
          return { success: false, message: '用户未登录，请重新登录' }
        }
        
        const response = await api.post('/wallet/create', {
          ...walletData,
          userId: state.user.id
        })
        
        if (response.data.code === 200) {
          commit('ADD_WALLET', response.data.data)
          return { success: true }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        return { success: false, message: error.message || '创建钱包失败' }
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 转入资金
    async transferIn({ commit }, { walletId, amount, description }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.post('/wallet/transfer-in', {
          walletId,
          amount,
          description
        })
        
        if (response.data.code === 200) {
          // 重新获取钱包详情更新余额
          const walletResponse = await api.get('/wallet/detail', {
            params: { walletId }
          })
          if (walletResponse.data.code === 200) {
            commit('UPDATE_WALLET_BALANCE', {
              walletId,
              balance: walletResponse.data.data.balance
            })
          }
          return { success: true }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        return { success: false, message: error.message || '转入失败' }
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 转出资金
    async transferOut({ commit }, { walletId, amount, description }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.post('/wallet/transfer-out', {
          walletId,
          amount,
          description
        })
        
        if (response.data.code === 200) {
          // 重新获取钱包详情更新余额
          const walletResponse = await api.get('/wallet/detail', {
            params: { walletId }
          })
          if (walletResponse.data.code === 200) {
            commit('UPDATE_WALLET_BALANCE', {
              walletId,
              balance: walletResponse.data.data.balance
            })
          }
          return { success: true }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        return { success: false, message: error.message || '转出失败' }
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  
  getters: {
    isAuthenticated: state => !!state.token,
    personalWallets: state => state.wallets.filter(w => w.type === 1),
    coupleWallets: state => state.wallets.filter(w => w.type === 2)
  }
})
