<template>
  <view class="page-retired">
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @tap="onTabChange(tab.key)"
      >{{ tab.label }}</view>
    </view>

    <scroll-view class="list" scroll-y @scrolltolower="loadMore">
      <view
        class="card"
        v-for="item in items"
        :key="item.type + '-' + item.id"
      >
        <view class="card-info">
          <text class="card-type">{{ typeLabel(item.type) }}</text>
          <text class="card-name">{{ item.name }}</text>
          <text class="card-cat" v-if="item.category_name">{{ item.category_name }}</text>
          <text class="card-time" v-if="item.retired_time">淘汰于 {{ formatDate(item.retired_time) }}</text>
        </view>
        <view class="card-actions">
          <text class="restore-btn" @tap="restoreItem(item)">还原</text>
          <text class="delete-btn" @tap="permanentDelete(item)">永久删除</text>
        </view>
      </view>

      <view class="empty" v-if="!loading && items.length === 0">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无淘汰记录</text>
      </view>

      <view class="loading-more" v-if="loading">加载中...</view>
      <view class="no-more" v-if="!loading && noMore && items.length > 0">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      activeTab: 'all',
      tabs: [
        { key: 'all', label: '全部' },
        { key: 'action', label: '行动' },
        { key: 'law', label: '规律' },
        { key: 'mistake', label: '常犯错' }
      ],
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      loading: false,
      noMore: false
    }
  },

  onLoad() {
    this.fetchList(true)
  },

  methods: {
    typeLabel(type) {
      const map = { action: '行动', law: '规律', mistake: '常犯错' }
      return map[type] || type
    },

    formatDate(d) {
      const dt = new Date(d)
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
    },

    onTabChange(key) {
      if (this.activeTab === key) return
      this.activeTab = key
      this.fetchList(true)
    },

    async fetchList(reset = false) {
      if (this.loading) return
      this.loading = true
      if (reset) {
        this.page = 1
        this.items = []
        this.noMore = false
      }
      try {
        const params = { page: this.page, page_size: this.pageSize }
        if (this.activeTab !== 'all') params.type = this.activeTab
        const res = await api.reviews.retiredItems(params)
        const list = (res.data && res.data.list) || []
        this.total = (res.data && res.data.total) || 0
        if (reset) {
          this.items = list
        } else {
          this.items = this.items.concat(list)
        }
        if (this.items.length >= this.total) this.noMore = true
      } catch (e) {
        console.error('加载失败', e)
      } finally {
        this.loading = false
      }
    },

    loadMore() {
      if (this.noMore || this.loading) return
      this.page += 1
      this.fetchList(false)
    },

    restoreItem(item) {
      uni.showModal({
        title: '确认还原',
        content: `还原「${item.name}」？`,
        success: async (mres) => {
          if (!mres.confirm) return
          try {
            await api.reviews.restoreItem(item.type, item.id)
            uni.showToast({ title: '已还原', icon: 'success' })
            this.fetchList(true)
          } catch (e) {
            console.error('还原失败', e)
          }
        }
      })
    },

    permanentDelete(item) {
      uni.showModal({
        title: '永久删除？',
        content: `「${item.name}」将被彻底删除，此操作不可恢复`,
        confirmColor: '#B85C4A',
        success: (res) => {
          if (!res.confirm) return
          uni.showModal({
            title: '再次确认',
            content: '确定要永久删除吗？',
            success: async (res2) => {
              if (!res2.confirm) return
              try {
                await api.reviews.permanentDeleteItem(item.type, item.id)
                uni.showToast({ title: '已删除', icon: 'success' })
                this.fetchList(true)
              } catch (e) {
                console.error('删除失败', e)
              }
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
@import '@/static/variables.scss';

.page-retired {
  min-height: 100vh;
  background-color: $bg-color;
  display: flex;
  flex-direction: column;
}

.tab-bar {
  display: flex;
  background-color: $card-bg;
  border-bottom: 1px solid $border-color;
}

.tab-item {
  flex: 1;
  padding: 24rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: $text-light;
  position: relative;

  &.active {
    color: $primary-color;
    font-weight: bold;
  }

  &.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 30%;
    right: 30%;
    height: 4rpx;
    background-color: $primary-color;
    border-radius: 2rpx;
  }
}

.list {
  flex: 1;
  padding: 24rpx;
}

.card {
  background-color: $card-bg;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-right: 20rpx;
}

.card-type {
  font-size: 22rpx;
  color: $primary-color;
  margin-bottom: 6rpx;
}

.card-name {
  font-size: 28rpx;
  color: $text-color;
  margin-bottom: 6rpx;
}

.card-cat {
  font-size: 22rpx;
  color: $text-light;
}

.card-time {
  font-size: 22rpx;
  color: $text-light;
  margin-top: 6rpx;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .restore-btn {
    font-size: 24rpx;
    color: $primary-color;
    padding: 8rpx 16rpx;
    border: 1px solid $primary-color;
    border-radius: 6rpx;
    text-align: center;
  }

  .delete-btn {
    font-size: 24rpx;
    color: $danger-color;
    padding: 8rpx 16rpx;
    border: 1px solid $danger-color;
    border-radius: 6rpx;
    text-align: center;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx;

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: $text-light;
  }
}

.loading-more, .no-more {
  text-align: center;
  font-size: 24rpx;
  color: $text-light;
  padding: 24rpx 0;
}
</style>
