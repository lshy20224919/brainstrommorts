import Vue from 'vue'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false

// 全局样式
import './static/index.scss'

const app = new Vue({
  store,
  ...App
})

// 挂载应用
app.$mount()

// 动态设置状态栏颜色
uni.getSystemInfo({
  success: (info) => {
    const theme = uni.getStorageSync('darkMode') ? 'dark' : 'light'
    if (info.statusBarStyle === 'dark' || theme === 'dark') {
      uni.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#162238'
      })
    }
  }
})
