<template>
  <view class="page-create-inspiration">
    <!-- 标题 -->
    <view class="page-header">
      <text class="page-title">灵感捕捉</text>
      <text class="page-desc">记录未验证的想法，验证后可转化为正确的事/错误的事/规律</text>
    </view>

    <!-- 表单 -->
    <view class="form">
      <!-- 方向 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>方向</text>
        </view>
        <view class="direction-row">
          <view
            class="direction-btn positive"
            :class="{ active: form.direction === 'positive' }"
            @tap="form.direction = 'positive'"
          >正向灵感</view>
          <view
            class="direction-btn negative"
            :class="{ active: form.direction === 'negative' }"
            @tap="form.direction = 'negative'"
          >负向灵感</view>
        </view>
      </view>

      <!-- 内容描述 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>内容描述</text>
        </view>
        <textarea
          class="form-textarea"
          v-model="form.desc"
          placeholder="一句话描述你的灵感想法"
          maxlength="200"
        />
        <text class="form-hint">{{ form.desc.length }}/200</text>
      </view>

      <!-- 来源 -->
      <view class="form-item">
        <view class="form-label">
          <text>来源</text>
          <text class="label-hint">(选填)</text>
        </view>
        <view class="source-tags">
          <view
            class="source-tag"
            v-for="s in sourceOptions"
            :key="s"
            :class="{ active: form.source === s }"
            @tap="selectSource(s)"
          >
            <text>{{ s }}</text>
          </view>
        </view>
      </view>

      <!-- 关联分类 -->
      <view class="form-item">
        <view class="form-label">
          <text>关联分类</text>
          <text class="label-hint">(选填)</text>
        </view>
<!-- PLACEHOLDER_PICKER -->
        <picker
          mode="selector"
          :range="categories"
          range-key="name"
          @change="onCategoryChange"
        >
          <view class="picker-box">
            <text :class="{ placeholder: !form.category_id }">
              {{ selectedCategoryName || '请选择分类（可不选）' }}
            </text>
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="form-actions">
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
      categories: [],
      sourceOptions: ['书籍', '视频', '聊天', '播客', '文章', '自己想到的'],
      form: {
        desc: '',
        source: '',
        category_id: null,
        direction: 'positive'
      }
    }
  },

  computed: {
    selectedCategoryName() {
      const cat = this.categories.find(c => c.id === this.form.category_id)
      return cat ? cat.name : ''
    },
    canSubmit() {
      return this.form.desc.trim().length > 0 && (this.form.direction === 'positive' || this.form.direction === 'negative')
    }
  },

  onLoad() {
    this.loadCategories()
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

    selectSource(s) {
      this.form.source = this.form.source === s ? '' : s
    },

    onCategoryChange(e) {
      const index = e.detail.value
      this.form.category_id = this.categories[index].id
    },

    cancel() {
      uni.navigateBack()
    },

    async submit() {
      if (!this.canSubmit) {
        uni.showToast({ title: '请填写内容描述并选择方向', icon: 'none' })
        return
      }

      try {
        await api.inspirations.create({
          desc: this.form.desc.trim(),
          source: this.form.source || '',
          category_id: this.form.category_id,
          direction: this.form.direction
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

.page-create-inspiration {
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

.direction-row {
  display: flex;
  gap: 16rpx;
}

.direction-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  background-color: $bg-color;
  font-size: 28rpx;
  color: $text-color;
  border: 2rpx solid transparent;

  &.positive.active {
    border-color: #FBBF24;
    background-color: rgba(251, 191, 36, 0.08);
    color: #B45309;
  }

  &.negative.active {
    border-color: #A78BFA;
    background-color: rgba(167, 139, 250, 0.08);
    color: #6D28D9;
  }
}

.source-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.source-tag {
  padding: 16rpx 24rpx;
  background-color: $bg-color;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: $text-color;
  border: 2rpx solid transparent;

  &.active {
    border-color: #F5A623;
    background-color: rgba(245, 166, 35, 0.08);
    color: #F5A623;
  }
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