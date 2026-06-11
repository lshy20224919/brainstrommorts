<template>
  <view class="page-review">
    <!-- 新建复盘 -->
    <view class="create-review" @tap="showCreateModal = true">
      <text class="create-icon">📊</text>
      <text class="create-text">新建复盘</text>
    </view>

    <!-- 复盘历史 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">复盘历史</text>
      </view>

      <view class="review-list">
        <view
          class="review-card"
          v-for="item in reviewList"
          :key="item.review_id"
          @tap="goToReview(item.review_id)"
        >
          <view class="review-header">
            <text class="review-version">{{ item.snapshot_version }}</text>
            <text class="tag tag-positive" v-if="item.has_snapshot">快照</text>
          </view>
          <text class="review-cycle">{{ formatCycle(item.review_cycle) }}</text>
          <text class="review-date">{{ formatDate(item.create_time) }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="!loading && reviewList.length === 0">
        <text class="empty-icon">📊</text>
        <text class="empty-text">暂无复盘记录</text>
        <text class="empty-desc">开始第一次复盘，优化您的方法论</text>
      </view>
    </view>

    <!-- 淘汰库 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">淘汰库</text>
        <text class="section-more" @tap="goToRetired">查看全部 ›</text>
      </view>

      <view class="retired-list">
        <view
          class="retired-card"
          v-for="item in retiredItems"
          :key="item.type + '-' + item.id"
        >
          <view class="retired-info">
            <text class="retired-type">{{ typeLabel(item.type) }}</text>
            <text class="retired-name">{{ item.name }}</text>
            <text class="retired-cat" v-if="item.category_name">{{ item.category_name }}</text>
          </view>
          <view class="retired-actions">
            <text class="restore-btn" @tap="restoreItem(item)">还原</text>
            <text class="delete-btn" @tap="permanentDelete(item)">永久删除</text>
          </view>
        </view>
        <view class="empty" v-if="retiredItems.length === 0">
          <text class="empty-text">暂无淘汰记录</text>
        </view>
      </view>
    </view>

    <!-- 新建复盘弹窗 -->
    <view class="modal" v-if="showCreateModal" @tap="showCreateModal = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">新建复盘</text>

        <view class="cycle-picker">
          <view
            class="cycle-item"
            :class="{ active: reviewCycle === 'day' }"
            @tap="onCycleChange('day')"
          >日复盘</view>
          <view
            class="cycle-item"
            :class="{ active: reviewCycle === 'week' }"
            @tap="onCycleChange('week')"
          >周复盘</view>
          <view
            class="cycle-item"
            :class="{ active: reviewCycle === 'month' }"
            @tap="onCycleChange('month')"
          >月复盘</view>
          <view
            class="cycle-item"
            :class="{ active: reviewCycle === 'custom' }"
            @tap="onCycleChange('custom')"
          >自定义</view>
        </view>

        <view class="date-range" v-if="reviewCycle === 'custom'">
          <view class="date-item">
            <text>开始时间</text>
            <picker mode="date" :value="startDate" @change="onStartDateChange">
              <text>{{ startDate }}</text>
            </picker>
          </view>
          <view class="date-item">
            <text>结束时间</text>
            <picker mode="date" :value="endDate" @change="onEndDateChange">
              <text>{{ endDate }}</text>
            </picker>
          </view>
        </view>
        <view class="date-range-hint" v-else>
          <text>复盘范围：{{ startDate }} ~ {{ endDate }}</text>
        </view>

        <view class="modal-actions">
          <view class="btn btn-outline" @tap="showCreateModal = false">取消</view>
          <view class="btn btn-primary" @tap="createReview">创建复盘</view>
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
      loading: false,
      reviewList: [],
      retiredItems: [],
      showCreateModal: false,
      reviewCycle: 'week',
      startDate: '',
      endDate: ''
    }
  },

  onLoad() {
    this.setDefaultDates()
    this.fetchList()
    this.fetchRetired()
  },

  methods: {
    setDefaultDates() {
      this.applyCycleDefaults(this.reviewCycle)
    },

    applyCycleDefaults(cycle) {
      const now = new Date()
      this.endDate = this.formatDateForPicker(now)
      if (cycle === 'day') {
        this.startDate = this.endDate
      } else if (cycle === 'month') {
        const past = new Date(now)
        past.setDate(past.getDate() - 30)
        this.startDate = this.formatDateForPicker(past)
      } else {
        const past = new Date(now)
        past.setDate(past.getDate() - 7)
        this.startDate = this.formatDateForPicker(past)
      }
    },

    onCycleChange(cycle) {
      this.reviewCycle = cycle
      if (cycle !== 'custom') {
        this.applyCycleDefaults(cycle)
      }
    },

    formatDateForPicker(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },

    formatCycle(cycle) {
      const map = { day: '日复盘', week: '周复盘', month: '月复盘', custom: '自定义' }
      return map[cycle] || cycle
    },

    formatDate(date) {
      const d = new Date(date)
      return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    },

    async fetchList() {
      this.loading = true
      try {
        const res = await api.reviews.list()
        this.reviewList = res.data || []
      } catch (e) {
        console.error('获取复盘列表失败', e)
      } finally {
        this.loading = false
      }
    },

    async fetchRetired() {
      try {
        const res = await api.reviews.retiredItems({ page: 1, page_size: 5 })
        this.retiredItems = (res.data && res.data.list) || []
      } catch (e) {
        console.error('获取淘汰列表失败', e)
      }
    },

    typeLabel(type) {
      const map = { action: '行动', law: '规律', mistake: '常犯错' }
      return map[type] || type
    },

    onStartDateChange(e) {
      this.startDate = e.detail.value
    },

    onEndDateChange(e) {
      this.endDate = e.detail.value
    },

    async createReview() {
      if (this.reviewCycle === 'custom' && new Date(this.startDate) > new Date(this.endDate)) {
        uni.showToast({ title: '开始时间不能晚于结束时间', icon: 'none' })
        return
      }
      try {
        const res = await api.reviews.create({
          review_cycle: this.reviewCycle,
          start_time: this.startDate,
          end_time: this.endDate
        })

        uni.showToast({ title: '复盘创建成功', icon: 'success' })
        this.showCreateModal = false
        this.fetchList()

        // 跳转到复盘详情
        uni.navigateTo({ url: `/pages/review/detail?id=${res.data.review_id || res.data.id}` })
      } catch (e) {
        console.error('创建复盘失败', e)
      }
    },

    goToReview(id) {
      uni.navigateTo({ url: `/pages/review/detail?id=${id}` })
    },

    goToRetired() {
      uni.navigateTo({ url: '/pages/review/retired' })
    },

    async restoreItem(item) {
      uni.showModal({
        title: '确认还原',
        content: `还原「${item.name}」？`,
        success: async (mres) => {
          if (!mres.confirm) return
          try {
            await api.reviews.restoreItem(item.type, item.id)
            uni.showToast({ title: '已还原', icon: 'success' })
            this.fetchRetired()
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
                this.fetchRetired()
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

.page-review {
  min-height: 100vh;
  background-color: $bg-color;
  padding: 24rpx;
}

/* 新建复盘入口 */
.create-review {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $primary-color;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;

  .create-icon {
    font-size: 48rpx;
    margin-right: 16rpx;
  }

  .create-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #ffffff;
  }
}

/* 区块 */
.section {
  margin-bottom: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-color;
  }

  .section-more {
    font-size: 26rpx;
    color: $primary-color;
  }
}

/* 复盘列表 */
.review-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.review-card {
  background-color: $card-bg;
  border-radius: 12rpx;
  padding: 24rpx;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.review-version {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-color;
}

.review-cycle {
  font-size: 24rpx;
  color: $text-light;
  margin-bottom: 8rpx;
}

.review-date {
  font-size: 22rpx;
  color: $text-light;
}

/* 淘汰库 */
.retired-list {
  background-color: $card-bg;
  border-radius: 12rpx;
  overflow: hidden;
}

.retired-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1px solid $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.retired-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-right: 20rpx;
}

.retired-type {
  font-size: 22rpx;
  color: $primary-color;
  margin-bottom: 4rpx;
}

.retired-cat {
  font-size: 22rpx;
  color: $text-light;
  margin-top: 4rpx;
}

.retired-name {
  font-size: 28rpx;
  color: $text-light;
}

.retired-actions {
  display: flex;
  gap: 20rpx;

  .restore-btn {
    font-size: 24rpx;
    color: $primary-color;
  }

  .delete-btn {
    font-size: 24rpx;
    color: $danger-color;
  }
}

/* 弹窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 600rpx;
  background-color: $card-bg;
  border-radius: 24rpx;
  padding: 40rpx;
}

.modal-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: $text-color;
  text-align: center;
  margin-bottom: 40rpx;
}

.cycle-picker {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.cycle-item {
  flex: 1;
  padding: 20rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  text-align: center;
  font-size: 28rpx;
  color: $text-color;

  &.active {
    background-color: $primary-color;
    color: #ffffff;
  }
}

.date-range {
  margin-bottom: 30rpx;
}

.date-range-hint {
  margin-bottom: 30rpx;
  text-align: center;

  text {
    font-size: 24rpx;
    color: $text-light;
  }
}

.date-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  margin-bottom: 12rpx;

  text {
    font-size: 28rpx;
    color: $text-color;
  }
}

.modal-actions {
  display: flex;
  gap: 20rpx;
}

.btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 40rpx;
  text-align: center;
  font-size: 28rpx;
}

.btn-primary {
  background-color: $primary-color;
  color: #ffffff;
}

.btn-outline {
  border: 1px solid $border-color;
  color: $text-color;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 60rpx;

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: $text-color;
    margin-bottom: 12rpx;
  }

  .empty-desc {
    font-size: 24rpx;
    color: $text-light;
    text-align: center;
  }
}
</style>
