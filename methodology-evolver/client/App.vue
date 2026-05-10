<template>
  <div id="app" :class="{ dark: isDarkMode }">
    <router-view />
  </div>
</template>

<script>
export default {
  computed: {
    isDarkMode() {
      return this.$store.state.isDarkMode
    }
  },
  onLaunch() {
    // 检查主题模式
    this.checkTheme()
    // 检查登录状态
    this.checkLogin()
  },
  methods: {
    checkTheme() {
      const darkMode = uni.getStorageSync('darkMode') || 0
      this.$store.commit('SET_DARK_MODE', darkMode === 2 ? this.getSystemTheme() : darkMode === 1)
    },
    getSystemTheme() {
      const sysInfo = uni.getSystemInfoSync()
      return sysInfo.theme === 'dark'
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
</style>
