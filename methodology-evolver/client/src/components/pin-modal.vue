<template>
  <view class="pin-modal-mask" v-if="visible" @tap="$emit('close')">
    <view class="pin-modal-box" @tap.stop>
      <text class="pin-modal-title">{{ title }}</text>
      <text class="pin-error">{{ error || ' ' }}</text>
      <pin-keypad :length="pinLength" :value="currentPin" @input="onInput" />
      <view class="pin-modal-actions">
        <view class="btn btn-outline" @tap="$emit('close')">取消</view>
      </view>
    </view>
  </view>
</template>

<script>
import PinKeypad from './pin-keypad.vue'
import { setPin, clearPin, verifyPin } from '@/utils/privacy.js'

const PIN_LENGTH = 6

export default {
  name: 'PinModal',
  components: { PinKeypad },
  props: {
    visible: { type: Boolean, default: false },
    mode: { type: String, default: 'set' }
  },
  data() {
    return {
      pinLength: PIN_LENGTH,
      step: 0,
      pin1: '',
      pin2: '',
      pin3: '',
      error: ''
    }
  },
  watch: {
    visible(v) {
      if (v) this.reset()
    },
    mode() { this.reset() }
  },
  computed: {
    title() {
      const titles = {
        set: ['设置解锁密码', '请再次输入'],
        change: ['请输入当前密码', '设置新密码', '请再次输入'],
        disable: ['请输入当前密码以关闭']
      }
      return (titles[this.mode] || [])[this.step] || ''
    },
    currentPin() {
      if (this.mode === 'set') return this.step === 0 ? this.pin1 : this.pin2
      if (this.mode === 'change') return this.step === 0 ? this.pin1 : this.step === 1 ? this.pin2 : this.pin3
      return this.pin1
    }
  },
  methods: {
    reset() {
      this.step = 0
      this.pin1 = ''
      this.pin2 = ''
      this.pin3 = ''
      this.error = ''
    },
    onInput(v) {
      this.error = ''
      if (this.mode === 'set') { this.step === 0 ? (this.pin1 = v) : (this.pin2 = v) }
      else if (this.mode === 'change') {
        if (this.step === 0) this.pin1 = v
        else if (this.step === 1) this.pin2 = v
        else this.pin3 = v
      } else this.pin1 = v
      if (v.length === PIN_LENGTH) setTimeout(() => this.advance(v), 50)
    },
    advance(v) {
      if (this.mode === 'set' && this.step === 0) { this.step = 1; return }
      if (this.mode === 'set' && this.step === 1) {
        if (v !== this.pin1) { this.error = '两次密码不一致'; this.pin2 = ''; return }
        setPin(this.pin1)
        this.$emit('success', '已开启解锁密码')
        this.$emit('close')
        return
      }
      if (this.mode === 'change' && this.step === 0) {
        if (!verifyPin(v)) { this.error = '密码错误'; this.pin1 = ''; return }
        this.step = 1
        return
      }
      if (this.mode === 'change' && this.step === 1) { this.step = 2; return }
      if (this.mode === 'change' && this.step === 2) {
        if (v !== this.pin2) { this.error = '两次密码不一致'; this.pin3 = ''; return }
        setPin(this.pin2)
        this.$emit('success', '密码已更新')
        this.$emit('close')
        return
      }
      if (this.mode === 'disable') {
        if (!verifyPin(v)) { this.error = '密码错误'; this.pin1 = ''; return }
        clearPin()
        this.$emit('success', '已关闭解锁密码')
        this.$emit('close')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/static/variables.scss';

.pin-modal-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 999;
}
.pin-modal-box {
  width: 600rpx;
  background-color: $card-bg;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pin-modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-color;
  margin-bottom: 16rpx;
}
.pin-error {
  font-size: 24rpx;
  color: $danger-color;
  min-height: 36rpx;
  margin-bottom: 16rpx;
}
.pin-modal-actions { margin-top: 32rpx; }
.btn {
  padding: 20rpx 48rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
}
.btn-outline {
  border: 1rpx solid $border-color;
  color: $text-color;
}
</style>
