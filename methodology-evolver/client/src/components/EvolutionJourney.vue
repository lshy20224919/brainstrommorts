<template>
  <view class="evo-journey" v-if="stages && stages.length">
    <text class="evo-journey-title">进化旅程</text>
    <view class="evo-journey-track">
      <view
        v-for="(stage, i) in stages"
        :key="stage.key"
        class="evo-journey-step"
        :class="{ done: stage.done }"
      >
        <view class="evo-journey-dot-row">
          <view v-if="i > 0" class="evo-journey-line" :class="{ done: stages[i - 1].done }"></view>
          <view class="evo-journey-dot" :class="{ done: stage.done }">
            <app-icon v-if="stage.done" name="check" :size="16" color="#ffffff" />
          </view>
        </view>
        <text class="evo-journey-label">{{ stage.label }}</text>
        <text class="evo-journey-value">{{ stage.value }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import AppIcon from '@/components/icon.vue'
export default {
  name: 'EvolutionJourney',
  components: { AppIcon },
  props: { stages: { type: Array, default: () => [] } }
}
</script>

<style lang="scss" scoped>
@import '@/static/variables.scss';

.evo-journey {
  background-color: $card-bg;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}
.evo-journey-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $text-color;
  margin-bottom: 24rpx;
}
.evo-journey-track {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.evo-journey-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}
.evo-journey-dot-row {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
  position: relative;
  height: 36rpx;
}
.evo-journey-line {
  position: absolute;
  left: 0;
  right: 50%;
  height: 2rpx;
  background-color: $border-color;
  &.done { background-color: $success-color; }
}
.evo-journey-dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background-color: $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  &.done { background-color: $success-color; }
}
.evo-journey-label {
  font-size: 22rpx;
  color: $text-light;
  margin-top: 12rpx;
}
.evo-journey-value {
  font-size: 22rpx;
  color: $text-color;
  font-weight: 500;
  margin-top: 4rpx;
}
.evo-journey-step.done .evo-journey-label { color: $success-color; }
</style>
