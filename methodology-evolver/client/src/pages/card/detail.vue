<template>
  <view class="page-detail">
    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <block v-else-if="action">
      <!-- 基本信息 -->
      <view class="detail-header">
        <view class="header-top">
          <text class="action-name">{{ action.action_name }}</text>
          <view class="action-tags">
            <text class="tag tag-positive" v-if="action.pinned">置顶</text>
            <text class="tag tag-archived" v-if="action.status === 1">已归档</text>
          </view>
        </view>
        <view class="action-category">
          <text>📂</text>
          <text>{{ action.category_name }}</text>
        </view>
      </view>

      <!-- 数据统计 -->
      <view class="stats-card">
        <view class="stats-main">
          <view class="stats-rate" :class="{ high: action.success_rate >= 60 }">
            <text class="rate-value">{{ action.success_rate ? action.success_rate + '%' : '暂无' }}</text>
            <text class="rate-label">成功率</text>
          </view>
        </view>
        <view class="stats-grid">
          <view class="stats-item">
            <text class="stats-value">{{ action.exec_count }}</text>
            <text class="stats-label">执行次数</text>
          </view>
          <view class="stats-item success">
            <text class="stats-value">{{ action.success_count }}</text>
            <text class="stats-label">成功</text>
          </view>
          <view class="stats-item fail">
            <text class="stats-value">{{ action.fail_count }}</text>
            <text class="stats-label">失败</text>
          </view>
          <view class="stats-item">
            <text class="stats-value">{{ action.subjective_weight }}</text>
            <text class="stats-label">权重</text>
          </view>
        </view>
      </view>

      <!-- 快捷打卡 -->
      <view class="quick-checkin">
        <text class="section-title">快速打卡</text>
        <view class="checkin-buttons">
          <view 
            class="checkin-btn success" 
            :class="{ active: checkinResult === 1 }"
            @tap="checkinResult = 1"
          >
            <text>✅</text>
            <text>成功</text>
          </view>
          <view 
            class="checkin-btn fail" 
            :class="{ active: checkinResult === 2 }"
            @tap="checkinResult = 2"
          >
            <text>❌</text>
            <text>失败</text>
          </view>
        </view>
        <input 
          class="checkin-remark" 
          v-model="checkinRemark" 
          placeholder="备注（可选）"
        />
        <view 
          class="btn btn-primary checkin-submit" 
          :class="{ disabled: !checkinResult }"
          @tap="submitCheckin"
        >确认打卡</view>
      </view>

      <!-- 执行记录 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">执行记录</text>
          <text class="section-count">{{ records.length }}条</text>
        </view>
        <view class="record-list" v-if="records.length > 0">
          <view 
            class="record-item" 
            v-for="record in records" 
            :key="record.record_id"
          >
            <view class="record-result" :class="{ success: record.exec_result === 1, fail: record.exec_result === 2 }">
              {{ record.exec_result === 1 ? '成功' : '失败' }}
            </view>
            <view class="record-info">
              <text class="record-remark" v-if="record.exec_remark">{{ record.exec_remark }}</text>
              <text class="record-time">{{ formatTime(record.exec_time) }}</text>
            </view>
          </view>
        </view>
        <view class="empty" v-else>
          <text>暂无执行记录</text>
        </view>
      </view>

      <!-- 关联规律 -->
      <view class="section" v-if="relatedLaws.length > 0">
        <view class="section-header">
          <text class="section-title">关联规律</text>
        </view>
        <view class="law-list">
          <view 
            class="law-item" 
            v-for="law in relatedLaws" 
            :key="law.law_id"
          >
            <text class="law-type" :class="{ positive: law.law_type === 1, negative: law.law_type === 2 }">
              {{ law.law_type === 1 ? '正向' : '负向' }}
            </text>
            <text class="law-desc">{{ law.law_desc }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-btn" @tap="goToEdit">
          <text>📝</text>
          <text>编辑</text>
        </view>
        <view class="action-btn" @tap="goToMigrate">
          <text>🔄</text>
          <text>迁移</text>
        </view>
        <view class="action-btn" @tap="doArchive" v-if="action.status === 0">
          <text>📁</text>
          <text>归档</text>
        </view>
        <view class="action-btn danger" @tap="doDelete">
          <text>🗑️</text>
          <text>删除</text>
        </view>
      </view>
    </block>

    <!-- 空状态 -->
    <view class="empty-page" v-else>
      <text>动作不存在</text>
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
      actionId: null,
      action: null,
      records: [],
      relatedLaws: [],
      checkinResult: null,
      checkinRemark: ''
    }
  },
  
  onLoad(options) {
    this.actionId = options.id
    this.fetchDetail()
  },
  
  methods: {
    async fetchDetail() {
      this.loading = true
      try {
        const res = await api.actions.detail(this.actionId)
        this.action = res.data
        this.records = res.data.records || []
        this.relatedLaws = res.data.related_laws || []
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
    
    async submitCheckin() {
      if (!this.checkinResult) {
        uni.showToast({ title: '请选择结果', icon: 'none' })
        return
      }
      
      try {
        await api.actions.checkin(this.actionId, {
          exec_result: this.checkinResult,
          exec_remark: this.checkinRemark
        })
        
        uni.showToast({ title: '打卡成功', icon: 'success' })
        this.checkinResult = null
        this.checkinRemark = ''
        
        // 刷新数据
        this.fetchDetail()
      } catch (e) {
        console.error('打卡失败', e)
      }
    },
    
    goToEdit() {
      uni.navigateTo({ url: `/pages/card/edit?id=${this.actionId}` })
    },
    
    goToMigrate() {
      uni.navigateTo({ url: `/pages/card/migrate?id=${this.actionId}&type=action` })
    },
    
    async doArchive() {
      uni.showModal({
        title: '确认归档',
        content: '归档后该动作将暂停统计，可在淘汰库中还原',
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.actions.archive(this.actionId)
              uni.showToast({ title: '归档成功', icon: 'success' })
              this.fetchDetail()
            } catch (e) {
              console.error('归档失败', e)
            }
          }
        }
      })
    },
    
    doDelete() {
      if (this.action.exec_count > 0) {
        uni.showModal({
          title: '无法删除',
          content: '有执行记录的动作不能直接删除，请先归档',
          showCancel: false
        })
        return
      }
      
      uni.showModal({
        title: '确认删除',
        content: '删除后不可恢复',
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.actions.delete(this.actionId)
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

.page-detail {
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

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.action-name {
  font-size: 40rpx;
  font-weight: bold;
  color: $text-color;
  flex: 1;
}

.action-tags {
  display: flex;
  gap: 10rpx;
}

.action-category {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: $text-light;
}

/* 统计卡片 */
.stats-card {
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.stats-main {
  text-align: center;
  margin-bottom: 30rpx;
}

.stats-rate {
  &.high .rate-value {
    color: $success-color;
  }
  
  .rate-value {
    display: block;
    font-size: 72rpx;
    font-weight: bold;
    color: $text-color;
  }
  
  .rate-label {
    font-size: 26rpx;
    color: $text-light;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  
  &.success .stats-value {
    color: $success-color;
  }
  
  &.fail .stats-value {
    color: $danger-color;
  }
}

/* 快捷打卡 */
.quick-checkin {
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .section-title {
    display: block;
    font-size: 30rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 20rpx;
  }
}

.checkin-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.checkin-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx;
  background-color: $bg-color;
  border-radius: 16rpx;
  border: 3px solid transparent;
  
  text:first-child {
    font-size: 48rpx;
    margin-bottom: 8rpx;
  }
  
  text:last-child {
    font-size: 28rpx;
    color: $text-color;
  }
  
  &.success.active {
    border-color: $success-color;
    background-color: rgba($success-color, 0.1);
  }
  
  &.fail.active {
    border-color: $danger-color;
    background-color: rgba($danger-color, 0.1);
  }
}

.checkin-remark {
  width: 100%;
  padding: 20rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
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
}

.section-count {
  font-size: 24rpx;
  color: $text-light;
}

/* 执行记录 */
.record-list {
  .record-item {
    display: flex;
    align-items: flex-start;
    padding: 20rpx 0;
    border-bottom: 1px solid $border-color;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.record-result {
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

.record-info {
  flex: 1;
  
  .record-remark {
    display: block;
    font-size: 26rpx;
    color: $text-color;
    margin-bottom: 4rpx;
  }
  
  .record-time {
    font-size: 22rpx;
    color: $text-light;
  }
}

/* 规律 */
.law-list {
  .law-item {
    display: flex;
    align-items: flex-start;
    padding: 16rpx 0;
    border-bottom: 1px solid $border-color;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.law-type {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  margin-right: 12rpx;
  
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
  flex: 1;
  font-size: 26rpx;
  color: $text-color;
}

/* 操作按钮 */
.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
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
.empty, .empty-page {
  text-align: center;
  padding: 60rpx;
  color: $text-light;
}

.empty-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30rpx;
}
</style>
