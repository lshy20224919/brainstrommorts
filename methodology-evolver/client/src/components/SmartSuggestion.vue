<template>
  <view class="smart-suggestion" v-if="suggestion && !dismissed">
    <view class="smart-suggestion-close" @tap="dismissed = true">×</view>
    <view class="smart-suggestion-icon">
      <app-icon :name="iconName" :size="24" color="#162238" />
    </view>
    <view class="smart-suggestion-body">
      <text class="smart-suggestion-text">{{ suggestion.text }}</text>
      <view
        v-if="suggestion.action"
        class="smart-suggestion-btn"
        @tap="$emit('action', suggestion.action)"
      >去完成 →</view>
    </view>
  </view>
</template>

<script>
import AppIcon from '@/components/icon.vue'
const ICON_MAP = {
  '✏️': 'plus',
  '✅': 'check',
  '💡': 'lightbulb',
  '📌': 'lightbulb',
  '🔄': 'list',
  '🚀': 'trendUp',
  '🎯': 'chart'
}
export default {
  name: 'SmartSuggestion',
  components: { AppIcon },
  props: { suggestion: { type: Object, default: null } },
  data() { return { dismissed: false } },
  computed: {
    iconName() { return ICON_MAP[this.suggestion?.icon] || 'lightbulb' }
  }
}
</script>

<style lang="scss" scoped>
@import '@/static/variables.scss';

.smart-suggestion {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16rpx;
  background-color: $card-bg;
  border: 1rpx solid $border-color;
  border-left: 6rpx solid $primary-color;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}
.smart-suggestion-close {
  position: absolute;
  top: 8rpx;
  right: 16rpx;
  font-size: 32rpx;
  color: $text-light;
  line-height: 1;
  padding: 8rpx;
}
.smart-suggestion-icon {
  flex-shrink: 0;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.smart-suggestion-body {
  flex: 1;
  min-width: 0;
}
.smart-suggestion-text {
  display: block;
  font-size: 26rpx;
  color: $text-color;
  line-height: 1.5;
  margin-bottom: 8rpx;
}
.smart-suggestion-btn {
  display: inline-block;
  font-size: 24rpx;
  color: $primary-color;
  font-weight: 600;
}
</style>
