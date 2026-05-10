<template>
  <view class="page-migrate">
    <!-- 头部信息 -->
    <view class="migrate-header">
      <text class="header-icon">🔄</text>
      <text class="header-title">迁移 {{ cardType === 'action' ? '动作' : '规律' }}</text>
      <text class="header-desc">将卡片复制到其他分类，实现跨场景复用</text>
    </view>

    <!-- 源卡片信息 -->
    <view class="source-card" v-if="sourceCard">
      <view class="source-label">源卡片</view>
      <view class="source-info">
        <text class="source-name">{{ sourceCard.name || sourceCard.law_desc || sourceCard.action_name }}</text>
        <view class="source-category">
          <text>{{ sourceCard.category_name }}</text>
        </view>
      </view>
    </view>

    <!-- 目标分类选择 -->
    <view class="target-section">
      <view class="section-title">选择目标分类</view>
      <view class="category-list">
        <view 
          class="category-item" 
          v-for="cat in categories" 
          :key="cat.category_id"
          :class="{ disabled: cat.category_id === sourceCard?.category_id, selected: targetCategoryId === cat.category_id }"
          @tap="selectCategory(cat)"
        >
          <text class="category-name">{{ cat.category_name }}</text>
          <text class="category-check" v-if="targetCategoryId === cat.category_id">✓</text>
        </view>
      </view>
    </view>

    <!-- 迁移说明 -->
    <view class="migrate-tip">
      <text>📌 迁移说明</text>
      <text>• 原卡片将保留在原分类</text>
      <text>• 将在目标分类创建新卡片</text>
      <text>• 迁移记录将永久留存</text>
    </view>

    <!-- 操作按钮 -->
    <view class="form-actions">
      <view class="btn btn-cancel" @tap="cancel">取消</view>
      <view 
        class="btn btn-primary" 
        :class="{ disabled: !targetCategoryId }"
        @tap="submit"
      >确认迁移</view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      cardId: null,
      cardType: 'action',
      sourceCard: null,
      categories: [],
      targetCategoryId: null
    }
  },
  
  onLoad(options) {
    this.cardId = options.id
    this.cardType = options.type || 'action'
    this.loadCategories()
    this.loadSourceCard()
  },
  
  methods: {
    async loadCategories() {
      try {
        const res = await api.categories.list()
        this.categories = res.data || []
      } catch (e) {
        console.error('获取分类失败', e)
      }
    },
    
    async loadSourceCard() {
      try {
        if (this.cardType === 'action') {
          const res = await api.actions.detail(this.cardId)
          this.sourceCard = {
            ...res.data,
            category_name: res.data.category_name,
            name: res.data.action_name
          }
        } else {
          const res = await api.laws.list({ law_id: this.cardId })
          if (res.data?.list?.[0]) {
            this.sourceCard = {
              ...res.data.list[0],
              name: res.data.list[0].law_desc
            }
          }
        }
      } catch (e) {
        console.error('获取源卡片失败', e)
      }
    },
    
    selectCategory(cat) {
      if (cat.category_id === this.sourceCard?.category_id) {
        uni.showToast({ title: '不能迁移到同一分类', icon: 'none' })
        return
      }
      this.targetCategoryId = cat.category_id
    },
    
    cancel() {
      uni.navigateBack()
    },
    
    async submit() {
      if (!this.targetCategoryId) {
        uni.showToast({ title: '请选择目标分类', icon: 'none' })
        return
      }
      
      try {
        await api.migrate.execute({
          card_id: this.cardId,
          card_type: this.cardType,
          target_category_id: this.targetCategoryId
        })
        
        uni.showToast({ title: '迁移成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      } catch (e) {
        console.error('迁移失败', e)
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/static/variables.scss';

.page-migrate {
  min-height: 100vh;
  background-color: $bg-color;
  padding: 24rpx;
  padding-bottom: 200rpx;
}

.migrate-header {
  text-align: center;
  padding: 40rpx 0;
  
  .header-icon {
    display: block;
    font-size: 80rpx;
    margin-bottom: 16rpx;
  }
  
  .header-title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 12rpx;
  }
  
  .header-desc {
    font-size: 26rpx;
    color: $text-light;
  }
}

.source-card {
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .source-label {
    font-size: 24rpx;
    color: $text-light;
    margin-bottom: 12rpx;
  }
  
  .source-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .source-name {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-color;
    flex: 1;
  }
  
  .source-category {
    padding: 8rpx 16rpx;
    background-color: $bg-color;
    border-radius: 8rpx;
    font-size: 24rpx;
    color: $text-light;
  }
}

.target-section {
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 20rpx;
  }
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  border: 2px solid transparent;
  
  &.selected {
    border-color: $primary-color;
    background-color: rgba($primary-color, 0.05);
  }
  
  &.disabled {
    opacity: 0.5;
  }
  
  .category-name {
    font-size: 28rpx;
    color: $text-color;
  }
  
  .category-check {
    font-size: 32rpx;
    color: $primary-color;
    font-weight: bold;
  }
}

.migrate-tip {
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
  
  text:first-child {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 16rpx;
  }
  
  text:not(:first-child) {
    display: block;
    font-size: 24rpx;
    color: $text-light;
    line-height: 1.8;
  }
}

.form-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 24rpx 30rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  background-color: $card-bg;
  border-top: 1px solid $border-color;
}

.btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  font-size: 30rpx;
  
  &.btn-cancel {
    background-color: $bg-color;
    color: $text-color;
  }
  
  &.btn-primary {
    background-color: $primary-color;
    color: #ffffff;
    
    &.disabled {
      opacity: 0.5;
    }
  }
}
</style>
