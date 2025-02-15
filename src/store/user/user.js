import { defineStore } from 'pinia'
import MagicMathData from '@/constants/MagicMathData'
export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userId: '',
    userName: '',
    userRole: '',
    userAuth: []
  }),

  getters: {
    isLoggedIn: (state) => {
      return state.isTokenValid()
    },
    getUserInfo: (state) => ({
      userId: state.userId,
      userName: state.userName,
      userRole: state.userRole
    })
  },

  actions: {
    // 设置带过期时间的 token
    setTokenWithExpiry(token) {
      const tokenInfo = {
        value: token,
        expiry: new Date().getTime() + MagicMathData.tokenExpiry // 3天后过期
      }
      // 分开存储 token 和过期时间
      localStorage.setItem('user_token', token)
      localStorage.setItem('token_expiry', tokenInfo.expiry.toString())
      this.token = token
    },

    // 获取 token（如果过期返回 null）
    getToken() {
      const token = localStorage.getItem('user_token')
      const expiry = localStorage.getItem('token_expiry')

      if (!token || !expiry) return null

      if (new Date().getTime() > parseInt(expiry)) {
        // token 已过期，清除信息
        this.clearUserInfo()
        return null
      }
      return token
    },

    // 设置用户信息
    setUserInfo(data) {
      // 设置带过期时间的 token
      this.setTokenWithExpiry(data.user_token)

      // 设置其他用户信息
      this.userId = data.user_id
      this.userName = data.user_name
      this.userAuth = data.user_auth || []

      // 保存其他信息到 localStorage
      localStorage.setItem('user_id', data.user_id)
      localStorage.setItem('user_name', data.user_name)
      localStorage.setItem('user_auth', JSON.stringify(data.user_auth))

    },

    // 清除用户信息
    clearUserInfo() {
      this.token = ''
      this.userId = ''
      this.userName = ''
      this.userAuth = []

      localStorage.removeItem('user_token')
      localStorage.removeItem('token_expiry')
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_name')
      localStorage.removeItem('user_auth')
    },

    // 检查 token 是否有效
    isTokenValid() {
      return !!this.getToken()
    }
  },

  // 开启数据持久化
  persist: true
})
