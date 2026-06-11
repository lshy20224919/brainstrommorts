<template>
  <view class="pin-keypad">
    <view class="pin-dots">
      <view
        v-for="i in length"
        :key="i"
        class="pin-dot"
        :class="{ filled: value.length >= i }"
      />
    </view>
    <view class="pin-keys">
      <view
        v-for="k in keys"
        :key="k"
        class="pin-key"
        :class="{ disabled }"
        @tap="handleNum(k)"
      >{{ k }}</view>
      <view class="pin-key pin-key-empty" />
      <view class="pin-key" :class="{ disabled }" @tap="handleNum('0')">0</view>
      <view class="pin-key pin-key-del" :class="{ disabled }" @tap="handleDel">⌫</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PinKeypad',
  props: {
    length: { type: Number, default: 6 },
    value: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return { keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] }
  },
  methods: {
    handleNum(n) {
      if (this.disabled) return
      if (this.value.length >= this.length) return
      this.$emit('input', this.value + n)
    },
    handleDel() {
      if (this.disabled) return
      if (this.value.length === 0) return
      this.$emit('input', this.value.slice(0, -1))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/static/variables.scss';

.pin-keypad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}
.pin-dots {
  display: flex;
  gap: 28rpx;
  margin: 16rpx 0;
}
.pin-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background-color: $border-color;
  &.filled { background-color: $text-color; }
}
.pin-keys {
  display: grid;
  grid-template-columns: repeat(3, 128rpx);
  gap: 24rpx;
}
.pin-key {
  width: 128rpx;
  height: 112rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  color: $text-color;
  &.disabled { opacity: 0.4; }
}
.pin-key-empty { background-color: transparent; }
.pin-key-del { color: $text-light; font-size: 36rpx; }
</style>
