<template>
  <view class="page-review-edit">
    <!-- 标题 -->
    <view class="page-header">
      <text class="page-title">编辑复盘</text>
    </view>

    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 表单 -->
    <view class="form" v-else>
      <!-- 复盘标题 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>复盘标题</text>
        </view>
        <input 
          class="form-input" 
          v-model="form.review_title" 
          placeholder="如：2026年5月第1周复盘"
          maxlength="50"
        />
      </view>

      <!-- 复盘类型 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>复盘类型</text>
        </view>
        <view class="type-selector">
          <view 
            class="type-btn" 
            :class="{ active: form.review_type === 1 }"
            @tap="form.review_type = 1"
          >📊 日复盘</view>
          <view 
            class="type-btn" 
            :class="{ active: form.review_type === 2 }"
            @tap="form.review_type = 2"
          >📅 周复盘</view>
          <view 
            class="type-btn" 
            :class="{ active: form.review_type === 3 }"
            @tap="form.review_type = 3"
          >📆 月复盘</view>
        </view>
      </view>

      <!-- 复盘日期 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>复盘日期</text>
        </view>
        <picker mode="date" :value="form.review_date" @change="onDateChange">
          <view class="picker-box">
            <text>{{ form.review_date || '请选择日期' }}</text>
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 做得好的地方 -->
      <view class="form-item">
        <view class="form-label">
          <text>做得好的地方</text>
        </view>
        <textarea 
          class="form-textarea" 
          v-model="form.good_parts" 
          placeholder="总结本次做得好的方面"
          maxlength="1000"
        />
        <text class="form-hint">{{ form.good_parts.length }}/1000</text>
      </view>

      <!-- 需要改进的地方 -->
      <view class="form-item">
        <view class="form-label">
          <text>需要改进的地方</text>
        </view>
        <textarea 
          class="form-textarea" 
          v-model="form.improve_parts" 
          placeholder="反思需要改进的方面"
          maxlength="1000"
        />
        <text class="form-hint">{{ form.improve_parts.length }}/1000</text>
      </view>

      <!-- 下一步计划 -->
      <view class="form-item">
        <view class="form-label">
          <text>下一步计划</text>
        </view>
        <textarea 
          class="form-textarea" 
          v-model="form.next_plan" 
          placeholder="制定接下来的行动计划"
          maxlength="1000"
        />
        <text class="form-hint">{{ form.next_plan.length }}/1000</text>
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
      reviewId: null,
      loading: true,
      form: {
        review_title: '',
        review_type: 1,
        review_date: '',
        good_parts: '',
        improve_parts: '',
        next_plan: ''
      }
    }
  },
  
  computed: {
    canSubmit() {
      return this.form.review_title.trim().length > 0 && this.form.review_date
    }
  },
  
  onLoad(options) {
    this.reviewId = options.id
    if (!this.reviewId) {
      this.loading = false
      return
    }
    this.loadReviewDetail()
  },
  
  methods: {
    async loadReviewDetail() {
      try {
        const res = await api.reviews.detail(this.reviewId)
        const review = res.data
        this.form = {
          review_title: review.review_title || '',
          review_type: review.review_type || 1,
          review_date: review.review_date ? review.review_date.split('T')[0] : '',
          good_parts: review.good_parts || '',
          improve_parts: review.improve_parts || '',
          next_plan: review.next_plan || ''
        }
      } catch (e) {
        console.error('获取详情失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    
    onDateChange(e) {
      this.form.review_date = e.detail.value
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
        await api.reviews.update(this.reviewId, {
          review_title: this.form.review_title.trim(),
          review_type: this.form.review_type,
          review_date: this.form.review_date,
          good_parts: this.form.good_parts.trim(),
          improve_parts: this.form.improve_parts.trim(),
          next_plan: this.form.next_plan.trim()
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

.page-review-edit {
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
  min-height: 160rpx;
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
  
  .arrow {
    font-size: 36rpx;
    color: $text-light;
  }
}

.type-selector {
  display: flex;
  gap: 16rpx;
}

.type-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-color;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: $text-color;
  border: 3px solid transparent;
  
  &.active {
    border-color: $primary-color;
    background-color: rgba($primary-color, 0.1);
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
