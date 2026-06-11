<template>
  <div id="app" :class="{ dark: isDarkMode }">
    <router-view />
  </div>
</template>

<script>
import { mockDB } from './src/utils/mock.js'
import migrations from './src/utils/migrations.js'
import { getLockEnabled } from './src/utils/privacy.js'

export default {
  globalData: {
    unlocked: false
  },
  computed: {
    isDarkMode() {
      return this.$store.state.isDarkMode
    }
  },
  onLaunch() {
    // 跑数据迁移（直方向回填等）
    try { migrations.run(mockDB) } catch (e) { console.error('migrations failed', e) }
    // 检查主题模式
    this.checkTheme()
    // 检查登录状态
    this.checkLogin()
    // 锁屏拦截：本地软隐私
    this.checkLock()
  },
  methods: {
    checkTheme() {
      // 新 key: 'theme' (light|dark|auto)；老 key 'darkMode' 兼容回填
      let theme = uni.getStorageSync('theme')
      if (!theme) {
        const old = uni.getStorageSync('darkMode')
        if (old === 1) theme = 'dark'
        else if (old === 2) theme = 'auto'
        else theme = 'light'
        uni.setStorageSync('theme', theme)
      }
      this.applyTheme(theme)
      // auto 模式下监听系统主题切换
      if (theme === 'auto' && uni.onThemeChange) {
        uni.onThemeChange(({ theme: sys }) => {
          if (uni.getStorageSync('theme') === 'auto') {
            this.$store.commit('SET_DARK_MODE', sys === 'dark')
          }
        })
      }
    },
    applyTheme(theme) {
      const isDark = theme === 'dark' || (theme === 'auto' && this.getSystemTheme())
      this.$store.commit('SET_DARK_MODE', isDark)
      try {
        uni.setNavigationBarColor({
          frontColor: isDark ? '#ffffff' : '#000000',
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff'
        })
      } catch (e) {}
    },
    getSystemTheme() {
      try {
        const sysInfo = uni.getSystemInfoSync()
        return sysInfo.theme === 'dark'
      } catch (e) { return false }
    },
    async checkLogin() {
      const token = uni.getStorageSync('token')
      if (token) {
        try {
          const res = await this.$api.auth.check()
          if (res.data) {
            this.$store.commit('SET_USER', res.data)
          }
        } catch (e) {
          // token无效，清除
          uni.removeStorageSync('token')
        }
      }
    },
    checkLock() {
      if (getLockEnabled() && !this.$options.globalData.unlocked) {
        uni.reLaunch({ url: '/pages/lock/index' })
      }
    }
  }
}
</script>

<style lang="scss">
@import './static/variables.scss';

page {
  background-color: $bg-color;
  color: $text-color;
  font-size: 28rpx;
  line-height: 1.5;
}

view, text, scroll-view {
  box-sizing: border-box;
}

.container {
  padding: 24rpx;
}

/* 卡片样式 */
.card {
  background-color: $card-bg;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

/* 按钮样式 */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  
  &.btn-primary {
    background-color: $primary-color;
    color: #ffffff;
  }
  
  &.btn-success {
    background-color: $success-color;
    color: #ffffff;
  }
  
  &.btn-danger {
    background-color: $danger-color;
    color: #ffffff;
  }
  
  &.btn-outline {
    background-color: transparent;
    border: 1px solid $border-color;
    color: $text-color;
  }
}

/* 输入框样式 */
.input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background-color: $bg-color;
  border-radius: 44rpx;
  border: 1px solid $border-color;
  font-size: 28rpx;
  
  &:focus {
    border-color: $primary-color;
  }
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
  color: $text-light;
  
  &-icon {
    font-size: 120rpx;
    margin-bottom: 24rpx;
  }
  
  &-text {
    font-size: 28rpx;
    color: $text-light;
  }
}

/* 加载状态 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
}

/* 深色模式适配 */
.dark {
  page {
    background-color: $dark-bg-color;
    color: $dark-text-color;
  }

  .card {
    background-color: $dark-card-bg;
  }

  .btn-outline {
    border-color: $dark-border-color;
    color: $dark-text-color;
  }

  .input {
    background-color: $dark-bg-color;
    border-color: $dark-border-color;
    color: $dark-text-color;
  }
}

/* 敏感内容遮罩 */
.sensitive-mask {
  display: inline-block;
  background-color: rgba(120, 120, 120, 0.18);
  color: $text-light;
  border-radius: 8rpx;
  padding: 4rpx 20rpx;
  font-size: 24rpx;
}
</style>
