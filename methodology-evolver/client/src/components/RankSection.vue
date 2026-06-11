<template>
  <view class="rank-section">
    <view class="rank-header">
      <text class="section-title">我的榜单</text>
      <view class="rank-config-btn" @tap="openConfig">自定义</view>
    </view>

    <view class="rank-dots">
      <view
        v-for="(tab, i) in rankTabs"
        :key="tab.key"
        class="rank-dot"
        :class="{ active: rankIndex === i }"
        @tap="rankIndex = i"
      />
    </view>
    <text class="rank-tab-label">{{ rankTabs[rankIndex].label }}</text>

    <swiper :current="rankIndex" @change="onRankSwipe" class="rank-swiper">
      <swiper-item v-for="tab in rankTabs" :key="tab.key">
        <view class="rank-list" v-if="rankings[tab.key] && rankings[tab.key].length > 0">
          <view
            class="rank-item"
            v-for="(item, index) in rankings[tab.key]"
            :key="item.id"
            @tap="onItemTap(tab.key)"
          >
            <view class="rank-num" :class="{ top3: index < 3 }">{{ index + 1 }}</view>
            <view class="rank-info">
              <text class="rank-name">{{ tab.key === 'action' ? (item.action_name || item.name) : (tab.key === 'mistake' ? item.name : item.law_desc) }}</text>
              <text class="rank-category">{{ item.category_name || getCategoryName(item.category_id) }}</text>
            </view>
            <view class="rank-stats">
              <template v-if="tab.key === 'action'">
                <text class="rank-count">{{ item.exec_count || 0 }} 次</text>
                <text class="rank-rate" :class="{ high: (item.success_rate || 0) >= 60 }">
                  {{ item.success_rate != null ? item.success_rate + '%' : '暂无' }}
                </text>
              </template>
              <text v-else-if="tab.key === 'mistake'" class="rank-count">权重 {{ item.subjective_weight || 0 }}</text>
              <text v-else class="rank-count">触发 {{ item.trigger_count || 0 }} 次</text>
            </view>
          </view>
        </view>
        <view class="rank-empty" v-else>
          <text>暂无数据</text>
        </view>
      </swiper-item>
    </swiper>

    <view class="modal-mask" v-if="showConfig" @tap.stop="showConfig = false">
      <view class="modal-box" @tap.stop>
        <text class="modal-title">自定义榜单显示数量</text>
        <view class="form-group" v-for="tab in rankTabs" :key="tab.key">
          <text class="form-label">{{ tab.label }}</text>
          <input class="form-input" type="number" v-model="configDraft[tab.key]" />
        </view>
        <view class="modal-actions">
          <view class="btn btn-outline" @tap="showConfig = false">取消</view>
          <view class="btn btn-primary" @tap="saveConfig">确认</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

const RANK_TABS = [
  { key: 'action', label: '正确的事' },
  { key: 'mistake', label: '错误的事' },
  { key: 'positive_law', label: '正向规律' },
  { key: 'negative_law', label: '负向规律' }
]

export default {
  name: 'RankSection',
  props: { categories: { type: Array, default: () => [] } },
  data() {
    return {
      rankTabs: RANK_TABS,
      rankIndex: 0,
      rankings: { action: [], mistake: [], positive_law: [], negative_law: [] },
      rankConfig: { action: 5, mistake: 5, positive_law: 5, negative_law: 5 },
      showConfig: false,
      configDraft: {}
    }
  },
  mounted() {
    this.loadConfig().then(() => this.loadRankings())
  },
  methods: {
    async loadConfig() {
      try {
        const res = await api.stats.rankConfig()
        this.rankConfig = res.data || this.rankConfig
      } catch (e) {}
    },
    async loadRankings() {
      try {
        const [action, mistake, positive_law, negative_law] = await Promise.all([
          api.stats.ranking({ type: 'action', limit: this.rankConfig.action }),
          api.stats.ranking({ type: 'mistake', limit: this.rankConfig.mistake }),
          api.stats.ranking({ type: 'positive_law', limit: this.rankConfig.positive_law }),
          api.stats.ranking({ type: 'negative_law', limit: this.rankConfig.negative_law })
        ])
        this.rankings = {
          action: action.data || [],
          mistake: mistake.data || [],
          positive_law: positive_law.data || [],
          negative_law: negative_law.data || []
        }
      } catch (e) {}
    },
    onRankSwipe(e) { this.rankIndex = e.detail.current },
    openConfig() {
      this.configDraft = { ...this.rankConfig }
      this.showConfig = true
    },
    async saveConfig() {
      await api.stats.updateRankConfig(this.configDraft)
      this.rankConfig = { ...this.configDraft }
      this.showConfig = false
      this.loadRankings()
    },
    getCategoryName(id) {
      const c = (this.categories || []).find(c => c.id === id)
      return c ? c.name : ''
    },
    onItemTap(tabKey) {
      const tabMap = {
        action: { primaryTab: 'behavior', subTab: 'action' },
        mistake: { primaryTab: 'behavior', subTab: 'mistake' },
        positive_law: { primaryTab: 'law', subTab: 'positive' },
        negative_law: { primaryTab: 'law', subTab: 'negative' }
      }
      uni.setStorageSync('cardlib:pending-tab', { ...tabMap[tabKey], ts: Date.now() })
      uni.switchTab({ url: '/pages/card/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/static/variables.scss';

.rank-section {
  background-color: $card-bg;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}
.rank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-color;
}
.rank-config-btn {
  font-size: 24rpx;
  color: $primary-color;
  border: 1rpx solid $primary-color;
  border-radius: 8rpx;
  padding: 6rpx 16rpx;
}
.rank-dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.rank-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: $border-color;
  &.active { background-color: $primary-color; }
}
.rank-tab-label {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: $primary-color;
  text-align: center;
  margin-bottom: 20rpx;
}
.rank-swiper { height: 400rpx; }
.rank-list { display: flex; flex-direction: column; }
.rank-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $border-color;
  &:last-child { border-bottom: none; }
}
.rank-num {
  width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
  background-color: $bg-color;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: $text-light;
  margin-right: 20rpx;
  flex-shrink: 0;
  &.top3 { background-color: $primary-color; color: #ffffff; }
}
.rank-info { flex: 1; min-width: 0; }
.rank-info .rank-name {
  display: block;
  font-size: 28rpx;
  color: $text-color;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rank-info .rank-category { font-size: 22rpx; color: $text-light; }
.rank-stats { text-align: right; flex-shrink: 0; }
.rank-stats .rank-count { display: block; font-size: 22rpx; color: $text-light; }
.rank-stats .rank-rate {
  font-size: 28rpx;
  font-weight: bold;
  color: $text-light;
  &.high { color: $success-color; }
}
.rank-empty {
  text-align: center;
  padding: 60rpx 0;
  font-size: 28rpx;
  color: $text-light;
}
.modal-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; align-items: flex-end;
  z-index: 999;
}
.modal-box {
  width: 100%;
  background-color: $card-bg;
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-title {
  display: block; font-size: 36rpx; font-weight: bold;
  color: $text-color; text-align: center; margin-bottom: 40rpx;
}
.form-group { margin-bottom: 30rpx; }
.form-label {
  display: block; font-size: 26rpx; color: $text-light; margin-bottom: 12rpx;
}
.form-input {
  width: 100%; padding: 20rpx 24rpx;
  background-color: $bg-color; border-radius: 12rpx;
  font-size: 28rpx; color: $text-color;
}
.modal-actions {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 20rpx; margin-top: 40rpx;
}
.btn {
  padding: 28rpx; border-radius: 40rpx;
  text-align: center; font-size: 30rpx; font-weight: 600;
}
.btn-outline { border: 1rpx solid $border-color; color: $text-color; }
.btn-primary { background-color: $primary-color; color: #ffffff; }
</style>
