import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    // 用户状态
    token: uni.getStorageSync('token') || '',
    userId: uni.getStorageSync('userId') || null,
    
    // 主题
    isDarkMode: false,
    
    // 草稿
    drafts: {},
    
    // 缓存
    categories: [],
    actions: [],
    laws: []
  },
  
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      uni.setStorageSync('token', token)
    },
    
    SET_USER(state, user) {
      state.userId = user.userId
      uni.setStorageSync('userId', user.userId)
    },
    
    SET_DARK_MODE(state, isDark) {
      state.isDarkMode = isDark
      uni.setStorageSync('darkMode', isDark ? 1 : 0)
    },
    
    SET_CATEGORIES(state, categories) {
      state.categories = categories
    },
    
    SET_ACTIONS(state, actions) {
      state.actions = actions
    },
    
    SET_LAWS(state, laws) {
      state.laws = laws
    },
    
    UPDATE_ACTION(state, action) {
      const index = state.actions.findIndex(a => a.action_id === action.action_id)
      if (index > -1) {
        state.actions.splice(index, 1, action)
      } else {
        state.actions.unshift(action)
      }
    },
    
    SAVE_DRAFT(state, { key, data }) {
      state.drafts[key] = {
        data,
        time: Date.now()
      }
      uni.setStorageSync(`draft_${key}`, JSON.stringify({
        data,
        time: Date.now()
      }))
    },
    
    CLEAR_DRAFT(state, key) {
      delete state.drafts[key]
      uni.removeStorageSync(`draft_${key}`)
    },
    
    LOAD_DRAFTS(state) {
      // 加载所有草稿
      const keys = ['action', 'event', 'law']
      keys.forEach(key => {
        const saved = uni.getStorageSync(`draft_${key}`)
        if (saved) {
          try {
            state.drafts[key] = JSON.parse(saved)
          } catch (e) {}
        }
      })
    }
  },
  
  actions: {
    async login({ commit }, code) {
      const res = await uni.request({
        url: `${getApp().globalData.apiBase}/auth/login`,
        method: 'POST',
        data: { code }
      })
      
      if (res.data.code === 200) {
        commit('SET_TOKEN', res.data.data.token)
        commit('SET_USER', res.data.data)
        return res.data.data
      }
      throw new Error(res.data.message)
    },
    
    async fetchCategories({ commit }) {
      const res = await uni.request({
        url: `${getApp().globalData.apiBase}/categories`,
        method: 'GET'
      })
      
      if (res.data.code === 200) {
        commit('SET_CATEGORIES', res.data.data)
        return res.data.data
      }
      throw new Error(res.data.message)
    },
    
    async fetchActions({ commit }, params = {}) {
      const res = await uni.request({
        url: `${getApp().globalData.apiBase}/actions`,
        method: 'GET',
        data: params
      })
      
      if (res.data.code === 200) {
        if (params.page === 1) {
          commit('SET_ACTIONS', res.data.data.list)
        } else {
          commit('SET_ACTIONS', [...state.actions, ...res.data.data.list])
        }
        return res.data.data
      }
      throw new Error(res.data.message)
    },
    
    logout({ commit }) {
      commit('SET_TOKEN', '')
      commit('SET_USER', null)
      uni.clearStorageSync()
    }
  }
})

export default store
