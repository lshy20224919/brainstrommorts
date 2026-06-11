<template>
  <view class="lockscreen">
    <view class="lockscreen-card">
      <text class="lockscreen-title">输入解锁密码</text>
      <text class="pin-error">{{ isLocked ? `请等待 ${remaining}s` : (error || ' ') }}</text>
      <pin-keypad :length="pinLength" :value="pin" :disabled="isLocked" @input="onInput" />
      <view class="lockscreen-forget" @tap="handleForget">忘记密码？</view>
    </view>
  </view>
</template>

<script>
import PinKeypad from '@/components/pin-keypad.vue'
import { verifyPin, bumpFailedCount, resetFailedCount, getLockState, clearAllAppData, clearPin } from '@/utils/privacy.js'

const PIN_LENGTH = 6

export default {
  components: { PinKeypad },
  data() {
    return {
      pinLength: PIN_LENGTH,
      pin: '',
      error: '',
      lockedUntil: 0,
      now: Date.now(),
      _timerId: null
    }
  },
  computed: {
    isLocked() { return this.lockedUntil > this.now },
    remaining() { return Math.max(0, Math.ceil((this.lockedUntil - this.now) / 1000)) }
  },
  onLoad() {
    const { until } = getLockState()
    if (until > Date.now()) {
      this.lockedUntil = until
      this.startTimer()
    }
  },
  onUnload() {
    this.stopTimer()
  },
  methods: {
    startTimer() {
      this.stopTimer()
      this._timerId = setInterval(() => {
        const t = Date.now()
        this.now = t
        if (t >= this.lockedUntil) {
          this.lockedUntil = 0
          resetFailedCount()
          this.stopTimer()
        }
      }, 1000)
    },
    stopTimer() {
      if (this._timerId) { clearInterval(this._timerId); this._timerId = null }
    },
    onInput(v) {
      if (this.isLocked) return
      this.error = ''
      this.pin = v
      if (v.length === PIN_LENGTH) {
        if (verifyPin(v)) {
          resetFailedCount()
          const app = getApp()
          if (app) app.globalData.unlocked = true
          uni.reLaunch({ url: '/pages/index/index' })
        } else {
          const { count, until } = bumpFailedCount()
          this.pin = ''
          if (until > 0) {
            this.lockedUntil = until
            this.now = Date.now()
            this.error = '错误次数过多，请稍候再试'
            this.startTimer()
          } else {
            this.error = `密码错误（${5 - count} 次后将锁定）`
          }
        }
      }
    },
    handleForget() {
      uni.showModal({
        title: '忘记密码',
        content: '将清空全部本地数据，无法恢复，确定继续？',
        success: (res) => {
          if (!res.confirm) return
          clearPin()
          clearAllAppData()
          const app = getApp()
          if (app) app.globalData.unlocked = true
          uni.reLaunch({ url: '/pages/index/index' })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/static/variables.scss';

.lockscreen {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: $bg-color;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.lockscreen-card {
  width: 640rpx;
  background-color: $card-bg;
  border-radius: 24rpx;
  padding: 56rpx 32rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.lockscreen-title {
  font-size: 34rpx;
  font-weight: 600;
  color: $text-color;
  margin-bottom: 16rpx;
}
.pin-error {
  font-size: 24rpx;
  color: $danger-color;
  min-height: 36rpx;
  margin-bottom: 16rpx;
}
.lockscreen-forget {
  margin-top: 32rpx;
  font-size: 26rpx;
  color: $text-light;
  padding: 12rpx 24rpx;
}
</style>
