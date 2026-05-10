<template>
  <view class="page-edit-action">
    <!-- 标题 -->
    <view class="page-header">
      <text class="page-title">编辑动作</text>
    </view>

    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 表单 -->
    <view class="form" v-else>
      <!-- 动作名称 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>动作名称</text>
        </view>
        <input 
          class="form-input" 
          v-model="form.action_name" 
          placeholder="如：低吸高抛、每日晨跑"
          maxlength="30"
        />
        <text class="form-hint">{{ form.action_name.length }}/30</text>
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

      <!-- 主观权重 -->
      <view class="form-item">
        <view class="form-label">
          <text>主观权重</text>
          <text class="label-hint">(1-10分)</text>
        </view>
        <view class="weight-selector">
          <view 
            class="weight-btn" 
            v-for="w in [1,2,3,4,5,6,7,8,9,10]" 
            :key="w"
            :class="{ active: form.subjective_weight == w }"
            @tap="form.subjective_weight = w"
          >
            {{ w }}
          </view>
        </view>
        <view class="weight-desc">
          <text v-if="form.subjective_weight <= 3">一般重要</text>
          <text v-else-if="form.subjective_weight <= 6">比较重要</text>
          <text v-else-if="form.subjective_weight <= 8">很重要</text>
          <text v-else>极其重要</text>
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-item">
        <view class="form-label">
          <text>备注说明</text>
        </view>
        <textarea 
          class="form-textarea" 
          v-model="form.remark" 
          placeholder="补充说明这个动作的具体做法或注意事项"
          maxlength="200"
        />
        <text class="form-hint">{{ form.remark.length }}/200</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="form-actions" v-if="!loading">
      <view class="btn btn-cancel" @tap="cancel">取消</view>
      <view 
        class="btn btn-primary" 
        :class="{ disabled: !canSubmit }"
        @tap="submit"
      >保存</view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      actionId: null,
      loading: true,
      categories: [],
      form: {
        action_name: '',
        category_id: null,
        subjective_weight: 5,
        remark: ''
      }
    }
  },
  
  computed: {
    selectedCategoryName() {
      const cat = this.categories.find(c => c.category_id === this.form.category_id)
      return cat ? cat.category_name : ''
    },
    canSubmit() {
      return this.form.action_name.trim().length > 0 && this.form.category_id
    }
  },
  
  onLoad(options) {
    this.actionId = options.id
    this.loadCategories()
    this.loadActionDetail()
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
    
    async loadActionDetail() {
      try {
        const res = await api.actions.detail(this.actionId)
        const action = res.data
        this.form = {
          action_name: action.action_name,
          category_id: action.category_id,
          subjective_weight: action.subjective_weight || 5,
          remark: action.remark || ''
        }
      } catch (e) {
        console.error('获取详情失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    
    onCategoryChange(e) {
      const index = e.detail.value
      this.form.category_id = this.categories[index].category_id
    },
    
    cancel() {
      uni.showModal({
        title: '确认取消',
        content: '是否放弃未保存的修改？',
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
        await api.actions.update(this.actionId, {
          action_name: this.form.action_name.trim(),
          category_id: this.form.category_id,
          subjective_weight: this.form.subjective_weight,
          remark: this.form.remark.trim()
        })
        
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      } catch (e) {
        console.error('保存失败', e)
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/static/variables.scss';

.page-edit-action {
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
  }
}

.loading {
  padding: 100rpx;
  text-align: center;
  color: $text-light;
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

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: $text-color;
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

.weight-selector {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.weight-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-color;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: $text-color;
  
  &.active {
    background-color: $primary-color;
    color: #ffffff;
  }
}

.weight-desc {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: $text-light;
  text-align: center;
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
