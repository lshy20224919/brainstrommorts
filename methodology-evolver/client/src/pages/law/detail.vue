<template>
  <view class="page-law-detail">
    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <block v-else-if="law">
      <!-- 基本信息 -->
      <view class="detail-header">
        <view class="law-type-badge" :class="{ positive: law.law_type === 1, negative: law.law_type === 2 }">
          {{ law.law_type === 1 ? '正向规律' : '负向规律' }}
        </view>
        <text class="law-desc">{{ law.law_desc }}</text>
        <view class="law-meta">
          <view class="meta-item">
            <text>📂</text>
            <text>{{ law.category_name }}</text>
          </view>
          <view class="meta-item" v-if="law.applicable_scenes">
            <text>🎯</text>
            <text>{{ law.applicable_scenes }}</text>
          </view>
        </view>
      </view>

      <!-- 统计数据 -->
      <view class="stats-card">
        <view class="stats-grid">
          <view class="stats-item">
            <text class="stats-value">{{ law.success_count || 0 }}</text>
            <text class="stats-label">验证成功</text>
          </view>
          <view class="stats-item fail">
            <text class="stats-value">{{ law.fail_count || 0 }}</text>
            <text class="stats-label">验证失败</text>
          </view>
          <view class="stats-item">
            <text class="stats-value">{{ law.verify_count || 0 }}</text>
            <text class="stats-label">验证次数</text>
          </view>
          <view class="stats-item">
            <text class="stats-value">{{ law.confidence_level || 0 }}%</text>
            <text class="stats-label">置信度</text>
          </view>
        </view>
      </view>

      <!-- 关联动作 -->
      <view class="section" v-if="relatedAction">
        <view class="section-header">
          <text class="section-title">关联动作</text>
        </view>
        <view class="action-card" @tap="goToAction(relatedAction.action_id)">
          <text class="action-name">{{ relatedAction.action_name }}</text>
          <text class="action-arrow">›</text>
        </view>
      </view>

      <!-- 验证记录 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">验证记录</text>
        </view>
        <view class="verify-list" v-if="verifyRecords.length > 0">
          <view 
            class="verify-item" 
            v-for="record in verifyRecords" 
            :key="record.verify_id"
          >
            <view class="verify-result" :class="{ success: record.verify_result === 1, fail: record.verify_result === 2 }">
              {{ record.verify_result === 1 ? '✓ 符合' : '✗ 不符合' }}
            </view>
            <view class="verify-content">
              <text class="verify-remark" v-if="record.verify_remark">{{ record.verify_remark }}</text>
              <text class="verify-time">{{ formatTime(record.verify_time) }}</text>
            </view>
          </view>
        </view>
        <view class="empty" v-else>
          <text>暂无验证记录</text>
        </view>
        
        <!-- 快速验证 -->
        <view class="quick-verify">
          <view class="section-subtitle">快速验证</view>
          <view class="verify-buttons">
            <view 
              class="verify-btn success" 
              :class="{ active: verifyResult === 1 }"
              @tap="verifyResult = 1"
            >
              ✓ 符合
            </view>
            <view 
              class="verify-btn fail" 
              :class="{ active: verifyResult === 2 }"
              @tap="verifyResult = 2"
            >
              ✗ 不符合
            </view>
          </view>
          <view 
            class="btn btn-primary" 
            :class="{ disabled: !verifyResult }"
            @tap="submitVerify"
          >提交验证</view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-btn" @tap="goToEdit">
          <text>📝</text>
          <text>编辑</text>
        </view>
        <view class="action-btn danger" @tap="doDelete">
          <text>🗑️</text>
          <text>删除</text>
        </view>
      </view>
    </block>

    <!-- 空状态 -->
    <view class="empty-page" v-else>
      <text>规律不存在</text>
      <view class="btn btn-primary" @tap="goBack">返回</view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      loading: true,
      lawId: null,
      law: null,
      relatedAction: null,
      verifyRecords: [],
      verifyResult: null
    }
  },
  
  onLoad(options) {
    this.lawId = options.id
    this.fetchDetail()
  },
  
  methods: {
    async fetchDetail() {
      this.loading = true
      try {
        const res = await api.laws.detail(this.lawId)
        this.law = res.data
        this.relatedAction = res.data.related_action
        this.verifyRecords = res.data.verify_records || []
      } catch (e) {
        console.error('获取详情失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    
    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    },
    
    goToAction(actionId) {
      uni.navigateTo({ url: `/pages/card/detail?id=${actionId}` })
    },
    
    goToEdit() {
      uni.navigateTo({ url: `/pages/law/edit?id=${this.lawId}` })
    },
    
    async submitVerify() {
      if (!this.verifyResult) {
        uni.showToast({ title: '请选择验证结果', icon: 'none' })
        return
      }
      
      try {
        await api.laws.verify(this.lawId, {
          verify_result: this.verifyResult
        })
        
        uni.showToast({ title: '提交成功', icon: 'success' })
        this.verifyResult = null
        this.fetchDetail()
      } catch (e) {
        console.error('提交失败', e)
      }
    },
    
    doDelete() {
      uni.showModal({
        title: '确认删除',
        content: '删除后不可恢复',
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.laws.delete(this.lawId)
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

.page-law-detail {
  min-height: 100vh;
  background-color: $bg-color;
  padding: 24rpx;
  padding-bottom: 200rpx;
}

.loading {
  padding: 100rpx;
  text-align: center;
  color: $text-light;
}

/* 头部 */
.detail-header {
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.law-type-badge {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  margin-bottom: 16rpx;
  
  &.positive {
    background-color: rgba($success-color, 0.15);
    color: $success-color;
  }
  
  &.negative {
    background-color: rgba($danger-color, 0.15);
    color: $danger-color;
  }
}

.law-desc {
  display: block;
  font-size: 32rpx;
  color: $text-color;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.law-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: $text-light;
}

/* 统计卡片 */
.stats-card {
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.stats-item {
  text-align: center;
  
  .stats-value {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 4rpx;
  }
  
  .stats-label {
    font-size: 22rpx;
    color: $text-light;
  }
  
  &.fail .stats-value {
    color: $danger-color;
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
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: $text-color;
}

.section-subtitle {
  font-size: 26rpx;
  color: $text-color;
  margin-bottom: 16rpx;
}

/* 关联动作 */
.action-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  
  .action-name {
    font-size: 28rpx;
    color: $text-color;
  }
  
  .action-arrow {
    font-size: 36rpx;
    color: $text-light;
  }
}

/* 验证记录 */
.verify-list {
  margin-bottom: 30rpx;
  
  .verify-item {
    display: flex;
    align-items: flex-start;
    padding: 20rpx 0;
    border-bottom: 1px solid $border-color;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.verify-result {
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  margin-right: 16rpx;
  
  &.success {
    background-color: rgba($success-color, 0.15);
    color: $success-color;
  }
  
  &.fail {
    background-color: rgba($danger-color, 0.15);
    color: $danger-color;
  }
}

.verify-content {
  flex: 1;
  
  .verify-remark {
    display: block;
    font-size: 26rpx;
    color: $text-color;
    margin-bottom: 4rpx;
  }
  
  .verify-time {
    font-size: 22rpx;
    color: $text-light;
  }
}

.quick-verify {
  border-top: 1px solid $border-color;
  padding-top: 20rpx;
}

.verify-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.verify-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-color;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: 3px solid transparent;
  
  &.success.active {
    border-color: $success-color;
    background-color: rgba($success-color, 0.1);
    color: $success-color;
  }
  
  &.fail.active {
    border-color: $danger-color;
    background-color: rgba($danger-color, 0.1);
    color: $danger-color;
  }
}

.btn {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  font-size: 30rpx;
  
  &.btn-primary {
    background-color: $primary-color;
    color: #ffffff;
    
    &.disabled {
      opacity: 0.5;
    }
  }
}

.empty {
  text-align: center;
  padding: 40rpx;
  color: $text-light;
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
  
  &.danger text:last-child {
    color: $danger-color;
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
