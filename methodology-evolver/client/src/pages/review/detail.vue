<template>
  <view class="page-review-detail">
    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <block v-else-if="review">
      <!-- 基本信息 -->
      <view class="review-header">
        <view class="header-top">
          <text class="review-title">{{ review.review_title }}</text>
          <view class="review-status" :class="statusClass">
            {{ statusText }}
          </view>
        </view>
        <view class="review-meta">
          <text class="meta-item">📅 {{ formatDate(review.review_date) }}</text>
          <text class="meta-item">⏱️ {{ review.duration || 0 }}分钟</text>
        </view>
      </view>

      <!-- 复盘类型 -->
      <view class="section">
        <view class="section-title">复盘类型</view>
        <view class="type-tags">
          <text 
            class="type-tag" 
            :class="{ active: review.review_type === 1 }"
          >📊 日复盘</text>
          <text 
            class="type-tag" 
            :class="{ active: review.review_type === 2 }"
          >📅 周复盘</text>
          <text 
            class="type-tag" 
            :class="{ active: review.review_type === 3 }"
          >📆 月复盘</text>
        </view>
      </view>

      <!-- 做得好的地方 -->
      <view class="section">
        <view class="section-title">✅ 做得好的地方</view>
        <view class="content-box">
          <text v-if="review.good_parts && isSensitiveHidden('review-good-' + review.review_id)" class="sensitive-mask" @tap.stop="revealSensitive('review-good-' + review.review_id)">点击查看</text>
          <text v-else-if="review.good_parts">{{ review.good_parts }}</text>
          <text class="placeholder" v-else>暂无内容</text>
        </view>
      </view>

      <!-- 需要改进的地方 -->
      <view class="section">
        <view class="section-title">🔧 需要改进的地方</view>
        <view class="content-box">
          <text v-if="review.improve_parts && isSensitiveHidden('review-improve-' + review.review_id)" class="sensitive-mask" @tap.stop="revealSensitive('review-improve-' + review.review_id)">点击查看</text>
          <text v-else-if="review.improve_parts">{{ review.improve_parts }}</text>
          <text class="placeholder" v-else>暂无内容</text>
        </view>
      </view>

      <!-- 规律验证 -->
      <view class="section" v-if="review.law_verifications">
        <view class="section-title">📋 规律验证</view>
        <view class="verification-list">
          <view 
            class="verification-item"
            v-for="v in review.law_verifications" 
            :key="v.law_id"
          >
            <view class="v-header">
              <text class="v-type" :class="{ positive: v.law_type === 1, negative: v.law_type === 2 }">
                {{ v.law_type === 1 ? '正向' : '负向' }}
              </text>
              <text class="v-result" :class="{ success: v.verify_result === 1 }">
                {{ v.verify_result === 1 ? '✓ 符合' : '✗ 不符合' }}
              </text>
            </view>
            <text class="v-desc">{{ v.law_desc }}</text>
          </view>
        </view>
      </view>

      <!-- 动作迭代快照 -->
      <view class="section" v-if="actionSnapshots.length > 0">
        <view class="section-header">
          <text class="section-title">🔄 动作迭代快照</text>
        </view>
        <view class="snapshot-list">
          <view 
            class="snapshot-item"
            v-for="snap in actionSnapshots" 
            :key="snap.action_id"
          >
            <view class="snap-action">
              <text class="snap-name">{{ snap.action_name }}</text>
              <text class="snap-change" :class="changeClass(snap.iteration_type)">
                {{ changeText(snap.iteration_type) }}
              </text>
            </view>
            <view class="snap-detail">
              <text>成功率: {{ snap.old_rate || 0 }}% → {{ snap.new_rate || 0 }}%</text>
              <text>权重: {{ snap.old_weight || 0 }} → {{ snap.new_weight || 0 }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-btn" @tap="doEdit">
          <text>📝</text>
          <text>编辑</text>
        </view>
        <view class="action-btn" @tap="doDelete">
          <text>🗑️</text>
          <text>删除</text>
        </view>
      </view>
    </block>

    <!-- 空状态 -->
    <view class="empty-page" v-else>
      <text>复盘记录不存在</text>
      <view class="btn btn-primary" @tap="goBack">返回</view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import sensitiveMixin from '@/mixins/sensitive.js'

export default {
  mixins: [sensitiveMixin],
  data() {
    return {
      loading: true,
      reviewId: null,
      review: null,
      actionSnapshots: []
    }
  },
  
  computed: {
    statusText() {
      if (!this.review) return ''
      const statusMap = {
        0: '进行中',
        1: '已完成',
        2: '已归档'
      }
      return statusMap[this.review.status] || '未知'
    },
    statusClass() {
      if (!this.review) return ''
      const classMap = {
        0: 'ongoing',
        1: 'completed',
        2: 'archived'
      }
      return classMap[this.review.status] || ''
    }
  },
  
  onLoad(options) {
    this.reviewId = options.id
    this.fetchDetail()
  },
  
  methods: {
    async fetchDetail() {
      this.loading = true
      try {
        const res = await api.reviews.detail(this.reviewId)
        this.review = res.data
        this.actionSnapshots = res.data.action_snapshots || []
      } catch (e) {
        console.error('获取详情失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
    
    changeClass(type) {
      const classMap = {
        1: 'up',    // 固化
        2: 'up',    // 优化
        3: 'down',  // 降级
        4: 'danger' // 淘汰
      }
      return classMap[type] || ''
    },
    
    changeText(type) {
      const textMap = {
        1: '固化',
        2: '优化',
        3: '降级',
        4: '淘汰'
      }
      return textMap[type] || '变更'
    },
    
    doEdit() {
      uni.navigateTo({ url: `/pages/review/edit?id=${this.reviewId}` })
    },
    
    doDelete() {
      uni.showModal({
        title: '确认删除',
        content: '删除后不可恢复',
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.reviews.delete(this.reviewId)
              uni.showToast({ title: '删除成功', icon: 'success' })
              setTimeout(() => {
                uni.navigateBack()
              }, 1000)
            } catch (e) {
              console.error('删除失败', e)
            }
          }
        }
      })
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss">
@import '@/static/variables.scss';

.page-review-detail {
  min-height: 100vh;
  background-color: $bg-color;
  padding: 24rpx;
  padding-bottom: 180rpx;
}

.loading {
  padding: 100rpx;
  text-align: center;
  color: $text-light;
}

/* 头部 */
.review-header {
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.review-title {
  font-size: 36rpx;
  font-weight: bold;
  color: $text-color;
  flex: 1;
}

.review-status {
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  
  &.ongoing {
    background-color: rgba($warning-color, 0.15);
    color: $warning-color;
  }
  
  &.completed {
    background-color: rgba($success-color, 0.15);
    color: $success-color;
  }
  
  &.archived {
    background-color: rgba($text-light, 0.15);
    color: $text-light;
  }
}

.review-meta {
  display: flex;
  gap: 24rpx;
  
  .meta-item {
    font-size: 24rpx;
    color: $text-light;
  }
}

/* 区块 */
.section {
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: $text-color;
  margin-bottom: 20rpx;
}

.section-header .section-title {
  margin-bottom: 0;
}

/* 类型标签 */
.type-tags {
  display: flex;
  gap: 16rpx;
}

.type-tag {
  padding: 12rpx 24rpx;
  background-color: $bg-color;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: $text-light;
  
  &.active {
    background-color: $primary-color;
    color: #ffffff;
  }
}

/* 内容框 */
.content-box {
  padding: 20rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  
  text {
    font-size: 28rpx;
    color: $text-color;
    line-height: 1.8;
  }
  
  .placeholder {
    color: $text-light;
  }
}

/* 规律验证 */
.verification-list {
  .verification-item {
    padding: 20rpx 0;
    border-bottom: 1px solid $border-color;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.v-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.v-type {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  
  &.positive {
    background-color: rgba($success-color, 0.15);
    color: $success-color;
  }
  
  &.negative {
    background-color: rgba($danger-color, 0.15);
    color: $danger-color;
  }
}

.v-result {
  font-size: 24rpx;
  color: $danger-color;
  
  &.success {
    color: $success-color;
  }
}

.v-desc {
  font-size: 26rpx;
  color: $text-color;
}

/* 动作快照 */
.snapshot-list {
  .snapshot-item {
    padding: 20rpx;
    background-color: $bg-color;
    border-radius: 12rpx;
    margin-bottom: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.snap-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.snap-name {
  font-size: 28rpx;
  font-weight: bold;
  color: $text-color;
}

.snap-change {
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  
  &.up {
    background-color: rgba($success-color, 0.15);
    color: $success-color;
  }
  
  &.down {
    background-color: rgba($warning-color, 0.15);
    color: $warning-color;
  }
  
  &.danger {
    background-color: rgba($danger-color, 0.15);
    color: $danger-color;
  }
}

.snap-detail {
  display: flex;
  gap: 24rpx;
  
  text {
    font-size: 22rpx;
    color: $text-light;
  }
}

/* 操作按钮 */
.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 60rpx;
  padding: 24rpx 30rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  background-color: $card-bg;
  border-top: 1px solid $border-color;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  text:first-child {
    font-size: 40rpx;
    margin-bottom: 4rpx;
  }
  
  text:last-child {
    font-size: 22rpx;
    color: $text-color;
  }
}

.btn {
  padding: 20rpx 40rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  
  &.btn-primary {
    background-color: $primary-color;
    color: #ffffff;
  }
}

/* 空状态 */
.empty-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 30rpx;
  
  text {
    font-size: 28rpx;
    color: $text-light;
  }
}
</style>
