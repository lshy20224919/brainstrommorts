<template>
  <view class="page-login">
    <!-- Logo区域 -->
    <view class="logo-section">
      <view class="logo-box">
        <text class="logo-icon">🧠</text>
      </view>
      <text class="app-name">方法论进化器</text>
      <text class="app-slogan">让每一次行动都有迹可循</text>
    </view>

    <!-- 登录方式 -->
    <view class="login-section">
      <!-- 微信一键登录 -->
      <button 
        class="btn-wechat" 
        :loading="wechatLoading"
        @tap="handleWechatLogin"
      >
        <text class="btn-icon">微信</text>
        <text class="btn-text">微信一键登录</text>
      </button>

      <!-- 手机号登录 -->
      <button class="btn-phone" @tap="showPhoneLogin">
        <text class="btn-icon">📱</text>
        <text class="btn-text">手机号登录</text>
      </button>

      <!-- 游客体验 -->
      <view class="btn-guest" @tap="handleGuestLogin">
        <text>游客体验</text>
      </view>
    </view>

    <!-- 协议 -->
    <view class="agreement">
      <text>登录即表示同意</text>
      <text class="link" @tap="showUserAgreement">《用户协议》</text>
      <text>和</text>
      <text class="link" @tap="showPrivacyPolicy">《隐私政策》</text>
    </view>

    <!-- 手机号登录弹窗 -->
    <view class="modal-mask" v-if="showPhoneModal" @tap="closePhoneModal">
      <view class="phone-modal" @tap.stop>
        <view class="modal-header">
          <text>手机号登录</text>
          <text class="close-btn" @tap="closePhoneModal">✕</text>
        </view>
        <view class="modal-body">
          <view class="input-group">
            <input 
              class="phone-input" 
              v-model="phoneNumber" 
              type="number"
              placeholder="请输入手机号"
              maxlength="11"
            />
          </view>
          <view class="input-group verify-group">
            <input 
              class="code-input" 
              v-model="verifyCode" 
              type="number"
              placeholder="验证码"
              maxlength="6"
            />
            <view 
              class="send-code" 
              :class="{ disabled: counting }"
              @tap="sendVerifyCode"
            >
              {{ counting ? `${countdown}s` : '获取验证码' }}
            </view>
          </view>
          <button 
            class="btn-login" 
            :disabled="!canPhoneLogin"
            @tap="handlePhoneLogin"
          >登录</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      wechatLoading: false,
      showPhoneModal: false,
      phoneNumber: '',
      verifyCode: '',
      countdown: 0,
      counting: false
    }
  },
  
  computed: {
    canPhoneLogin() {
      return /^1[3-9]\d{9}$/.test(this.phoneNumber) && this.verifyCode.length >= 4
    }
  },
  
  methods: {
    // 微信登录
    handleWechatLogin() {
      this.wechatLoading = true
      
      // uni-app微信登录
      uni.getProvider({
        service: 'oauth',
        success: (res) => {
          if (res.provider.includes('weixin')) {
            uni.login({
              provider: 'weixin',
              success: (loginRes) => {
                this.wechatLoginRequest(loginRes.code)
              },
              fail: () => {
                this.wechatLoading = false
                uni.showToast({ title: '微信登录失败', icon: 'none' })
              }
            })
          } else {
            this.wechatLoading = false
            uni.showToast({ title: '请使用微信打开', icon: 'none' })
          }
        },
        fail: () => {
          this.wechatLoading = false
          uni.showToast({ title: '获取登录方式失败', icon: 'none' })
        }
      })
    },
    
    async wechatLoginRequest(code) {
      try {
        const res = await api.auth.wechatLogin({ code })
        this.handleLoginSuccess(res.data)
      } catch (e) {
        this.wechatLoading = false
        console.error('微信登录失败', e)
        uni.showToast({ title: '登录失败，请重试', icon: 'none' })
      }
    },
    
    // 手机号登录
    showPhoneLogin() {
      this.showPhoneModal = true
      this.phoneNumber = ''
      this.verifyCode = ''
    },
    
    closePhoneModal() {
      this.showPhoneModal = false
    },
    
    async sendVerifyCode() {
      if (this.counting) return
      
      if (!/^1[3-9]\d{9}$/.test(this.phoneNumber)) {
        uni.showToast({ title: '请输入正确手机号', icon: 'none' })
        return
      }
      
      try {
        await api.auth.sendVerifyCode({ phone: this.phoneNumber })
        uni.showToast({ title: '验证码已发送', icon: 'success' })
        
        this.counting = true
        this.countdown = 60
        const timer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) {
            this.counting = false
            clearInterval(timer)
          }
        }, 1000)
      } catch (e) {
        uni.showToast({ title: '发送失败，请重试', icon: 'none' })
      }
    },
    
    async handlePhoneLogin() {
      if (!this.canPhoneLogin) return
      
      try {
        const res = await api.auth.phoneLogin({
          phone: this.phoneNumber,
          code: this.verifyCode
        })
        this.handleLoginSuccess(res.data)
      } catch (e) {
        uni.showToast({ title: '登录失败', icon: 'none' })
      }
    },
    
    // 游客模式
    handleGuestLogin() {
      uni.setStorageSync('isGuest', true)
      uni.switchTab({ url: '/pages/index/index' })
    },
    
    // 登录成功处理
    handleLoginSuccess(data) {
      this.wechatLoading = false
      
      // 保存token和用户信息
      uni.setStorageSync('token', data.token)
      uni.setStorageSync('userInfo', data.user_info)
      uni.setStorageSync('isGuest', false)
      
      uni.showToast({ title: '登录成功', icon: 'success' })
      
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 1000)
    },
    
    showUserAgreement() {
      uni.showModal({
        title: '用户协议',
        content: '这里是用户协议内容...',
        showCancel: false
      })
    },
    
    showPrivacyPolicy() {
      uni.showModal({
        title: '隐私政策',
        content: '这里是隐私政策内容...',
        showCancel: false
      })
    }
  }
}
</script>

<style lang="scss">
@import '@/static/variables.scss';

.page-login {
  min-height: 100vh;
  background: linear-gradient(180deg, #162238 0%, #1a365d 100%);
  display: flex;
  flex-direction: column;
  padding: 120rpx 60rpx 60rpx;
}

/* Logo区域 */
.logo-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo-box {
  width: 160rpx;
  height: 160rpx;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  
  .logo-icon {
    font-size: 80rpx;
  }
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.app-slogan {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* 登录区域 */
.login-section {
  padding-bottom: 40rpx;
}

.btn-wechat, .btn-phone {
  width: 100%;
  height: 96rpx;
  background-color: #07c160;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  border: none;
  
  .btn-icon {
    font-size: 36rpx;
    margin-right: 12rpx;
  }
  
  .btn-text {
    font-size: 32rpx;
    color: #ffffff;
    font-weight: bold;
  }
  
  &::after {
    border: none;
  }
}

.btn-phone {
  background-color: rgba(255, 255, 255, 0.15);
  
  .btn-text {
    color: #ffffff;
  }
}

.btn-guest {
  text-align: center;
  padding: 20rpx;
  
  text {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.6);
  }
}

/* 协议 */
.agreement {
  text-align: center;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  
  .link {
    color: rgba(255, 255, 255, 0.8);
  }
}

/* 手机号弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}

.phone-modal {
  width: 100%;
  background-color: $card-bg;
  border-radius: 32rpx 32rpx 0 0;
  padding-bottom: constant(safe-area-inset-bottom);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 30rpx 30rpx;
  border-bottom: 1px solid $border-color;
  
  text:first-child {
    font-size: 36rpx;
    font-weight: bold;
    color: $text-color;
  }
  
  .close-btn {
    font-size: 40rpx;
    color: $text-light;
    padding: 10rpx;
  }
}

.modal-body {
  padding: 40rpx 30rpx;
}

.input-group {
  margin-bottom: 30rpx;
}

.phone-input, .code-input {
  width: 100%;
  height: 96rpx;
  padding: 0 30rpx;
  background-color: $bg-color;
  border-radius: 16rpx;
  font-size: 30rpx;
  color: $text-color;
}

.verify-group {
  display: flex;
  gap: 20rpx;
}

.code-input {
  flex: 1;
}

.send-code {
  width: 220rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $primary-color;
  color: #ffffff;
  border-radius: 16rpx;
  font-size: 26rpx;
  
  &.disabled {
    background-color: $bg-color;
    color: $text-light;
  }
}

.btn-login {
  width: 100%;
  height: 96rpx;
  background-color: $primary-color;
  border-radius: 48rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &[disabled] {
    opacity: 0.5;
  }
  
  &::after {
    border: none;
  }
}
</style>
