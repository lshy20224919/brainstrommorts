<template>
  <view class="page-create-law">
    <!-- 标题 -->
    <view class="page-header">
      <text class="page-title">新建规律</text>
      <text class="page-desc">从成功或失败中提炼可复用的逻辑</text>
    </view>

    <!-- 表单 -->
    <view class="form">
      <!-- 规律类型 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>规律类型</text>
        </view>
        <view class="type-selector">
          <view 
            class="type-btn positive" 
            :class="{ active: form.law_type === 1 }"
            @tap="form.law_type = 1"
          >
            <view class="type-icon"><app-icon name="check" :size="32" :color="form.law_type === 1 ? '#36D399' : '#9CA3AF'" /></view>
            <text class="type-name">正向规律</text>
            <text class="type-desc">成功的经验，值得复用</text>
          </view>
          <view
            class="type-btn negative"
            :class="{ active: form.law_type === 2 }"
            @tap="form.law_type = 2"
          >
            <view class="type-icon"><app-icon name="alert" :size="32" :color="form.law_type === 2 ? '#F87272' : '#9CA3AF'" /></view>
            <text class="type-name">负向规律</text>
            <text class="type-desc">失败的教训，规避重复</text>
          </view>
        </view>
      </view>

      <!-- 规律描述 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>规律描述</text>
        </view>
        <textarea 
          class="form-textarea" 
          v-model="form.law_desc" 
          :placeholder="form.law_type === 1 ? '如：行情震荡期，低吸高抛容错率更高' : '如：情绪化追涨，大概率短期被套'"
          maxlength="500"
        />
        <text class="form-hint">{{ form.law_desc.length }}/500</text>
      </view>

      <!-- 分类选择 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>所属分类</text>
        </view>
        <picker 
          mode="selector" 
          :range="categories" 
          range-key="category_name"
          @change="onCategoryChange"
        >
          <view class="picker-box">
            <text :class="{ placeholder: !form.category_id }">
              {{ selectedCategoryName || '请选择分类' }}
            </text>
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 关联动作 -->
      <view class="form-item">
        <view class="form-label">
          <text>关联动作</text>
          <text class="label-hint">(可选)</text>
        </view>
        <picker 
          mode="selector" 
          :range="actions" 
          range-key="action_name"
          @change="onActionChange"
        >
          <view class="picker-box">
            <text :class="{ placeholder: !form.related_action_id }">
              {{ selectedActionName || '不关联' }}
            </text>
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 适用场景 -->
      <view class="form-item">
        <view class="form-label">
          <text>适用场景</text>
        </view>
        <input 
          class="form-input" 
          v-model="form.applicable_scenes" 
          placeholder="如：A股震荡行情、行情急涨时"
          maxlength="200"
        />
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="form-actions">
      <view class="btn btn-cancel" @tap="cancel">取消</view>
      <view 
        class="btn btn-primary" 
        :class="{ disabled: !canSubmit }"
        @tap="submit"
      >创建</view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import AppIcon from '@/components/icon.vue'

export default {
  components: { AppIcon },
  data() {
    return {
      categories: [],
      actions: [],
      form: {
        law_type: 1, // 默认正向
        law_desc: '',
        category_id: null,
        related_action_id: null,
        applicable_scenes: ''
      }
    }
  },
  
  computed: {
    selectedCategoryName() {
      const cat = this.categories.find(c => c.category_id === this.form.category_id)
      return cat ? cat.category_name : ''
    },
    selectedActionName() {
      const action = this.actions.find(a => a.action_id === this.form.related_action_id)
      return action ? action.action_name : ''
    },
    canSubmit() {
      return this.form.law_desc.trim().length > 0 && this.form.category_id
    }
  },
  
  onLoad() {
    this.loadCategories()
    this.loadActions()
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
    
    async loadActions() {
      try {
        const res = await api.actions.list({ status: 0, page_size: 100 })
        this.actions = [{ action_id: null, action_name: '不关联' }, ...(res.data?.list || [])]
      } catch (e) {
        console.error('获取动作失败', e)
      }
    },
    
    onCategoryChange(e) {
      const index = e.detail.value
      this.form.category_id = this.categories[index].category_id
    },
    
    onActionChange(e) {
      const index = e.detail.value
      this.form.related_action_id = this.actions[index].action_id
    },
    
    cancel() {
      uni.showModal({
        title: '确认取消',
        content: '是否取消创建规律？',
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack()
          }
        }
      })
    },
    
    async submit() {
      if (!this.canSubmit) {
        uni.showToast({ title: '请填写必填项', icon: 'none' })
        return
      }
      
      try {
        await api.laws.create({
          law_type: this.form.law_type,
          law_desc: this.form.law_desc.trim(),
          category_id: this.form.category_id,
          related_action_id: this.form.related_action_id,
          applicable_scenes: this.form.applicable_scenes.trim()
        })
        
        uni.showToast({ title: '创建成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      } catch (e) {
        console.error('创建失败', e)
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/static/variables.scss';

.page-create-law {
  min-height: 100vh;
  background-color: $bg-color;
  padding: 24rpx;
  padding-bottom: 200rpx;
}

.page-header {
  margin-bottom: 40rpx;
  
  .page-title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 12rpx;
  }
  
  .page-desc {
    font-size: 26rpx;
    color: $text-light;
  }
}

.form {
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 30rpx;
}

.form-item {
  margin-bottom: 40rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: $text-color;
  
  .required {
    color: $danger-color;
    margin-right: 8rpx;
  }
  
  .label-hint {
    color: $text-light;
    font-size: 24rpx;
    margin-left: 12rpx;
  }
}

.type-selector {
  display: flex;
  gap: 20rpx;
}

.type-btn {
  flex: 1;
  padding: 30rpx 20rpx;
  background-color: $bg-color;
  border-radius: 16rpx;
  border: 3px solid transparent;
  text-align: center;
  
  .type-icon {
    display: block;
    font-size: 48rpx;
    margin-bottom: 12rpx;
  }
  
  .type-name {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 8rpx;
  }
  
  .type-desc {
    display: block;
    font-size: 22rpx;
    color: $text-light;
  }
  
  &.positive.active {
    border-color: $success-color;
    background-color: rgba($success-color, 0.1);
  }
  
  &.negative.active {
    border-color: $danger-color;
    background-color: rgba($danger-color, 0.1);
  }
}

.form-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 24rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: $text-color;
  line-height: 1.6;
}

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: $text-color;
}

.form-hint {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: $text-light;
  margin-top: 8rpx;
}

.picker-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88rpx;
  padding: 0 24rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: $text-color;
  
  .placeholder {
    color: $text-light;
  }
  
  .arrow {
    font-size: 36rpx;
    color: $text-light;
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
