<template>
  <view class="page-create-mistake">
    <!-- 标题 -->
    <view class="page-header">
      <text class="page-title">新建错误的事</text>
      <text class="page-desc">定义一条绝对不能干的行为红线</text>
    </view>

    <!-- 表单 -->
    <view class="form">
      <!-- 名称 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>名称</text>
        </view>
        <input
          class="form-input"
          v-model="form.name"
          placeholder="如：追涨杀跌、带情绪做决策"
          maxlength="30"
        />
        <text class="form-hint">{{ form.name.length }}/30</text>
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
          range-key="name"
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
          <text v-if="form.subjective_weight <= 3">一般严重</text>
          <text v-else-if="form.subjective_weight <= 6">比较严重</text>
          <text v-else-if="form.subjective_weight <= 8">很严重</text>
          <text v-else>极其严重</text>
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
          placeholder="补充说明为什么这件事绝对不能做"
          maxlength="200"
        />
        <text class="form-hint">{{ form.remark.length }}/200</text>
      </view>

      <!-- 关联规律 -->
      <view class="form-item">
        <view class="form-label">
          <text>关联规律</text>
          <text class="label-hint">(可多选)</text>
        </view>
        <view class="law-list">
          <view
            class="law-option"
            v-for="law in lawsList"
            :key="law.id"
            :class="{ active: form.related_law_ids.includes(law.id) }"
            @tap="toggleLaw(law.id)"
          >
            <text>{{ law.name }}</text>
          </view>
        </view>
        <view class="law-empty" v-if="lawsList.length === 0">
          <text>暂无可关联的规律</text>
        </view>
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

    <!-- 草稿提示 -->
    <view class="draft-tip" v-if="hasDraft" @tap="loadDraft">
      <text>草稿 检测到未保存的草稿</text>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      categories: [],
      lawsList: [],
      form: {
        name: '',
        category_id: null,
        subjective_weight: 5,
        remark: '',
        related_law_ids: []
      },
      hasDraft: false
    }
  },

  computed: {
    selectedCategoryName() {
      const cat = this.categories.find(c => c.id === this.form.category_id)
      return cat ? cat.name : ''
    },
    canSubmit() {
      return this.form.name.trim().length > 0 && this.form.category_id
    }
  },

  onLoad() {
    this.loadCategories()
    this.loadLaws()
    this.checkDraft()
  },

  onUnload() {
    this.saveDraft()
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

    async loadLaws() {
      try {
        const res = await api.laws.list({ is_retired: false })
        this.lawsList = res.data || []
      } catch (e) {
        console.error('获取规律失败', e)
      }
    },

    onCategoryChange(e) {
      const index = e.detail.value
      this.form.category_id = this.categories[index].id
    },

    toggleLaw(id) {
      const idx = this.form.related_law_ids.indexOf(id)
      if (idx >= 0) {
        this.form.related_law_ids.splice(idx, 1)
      } else {
        this.form.related_law_ids.push(id)
      }
    },

    checkDraft() {
      const draft = uni.getStorageSync('draft_mistake')
      if (draft) {
        this.hasDraft = true
        this.form = { ...this.form, ...JSON.parse(draft) }
      }
    },

    saveDraft() {
      if (this.form.name || this.form.remark) {
        uni.setStorageSync('draft_mistake', JSON.stringify(this.form))
      }
    },

    loadDraft() {
      uni.showModal({
        title: '恢复草稿',
        content: '是否恢复之前未保存的内容？',
        success: (res) => {
          if (res.confirm) {
            const draft = uni.getStorageSync('draft_mistake')
            if (draft) {
              this.form = { ...this.form, ...JSON.parse(draft) }
            }
          }
          this.hasDraft = false
        }
      })
    },

    cancel() {
      uni.showModal({
        title: '确认取消',
        content: '是否保存当前内容为草稿？',
        success: (res) => {
          if (res.confirm) {
            this.saveDraft()
          }
          uni.navigateBack()
        }
      })
    },

    async submit() {
      if (!this.canSubmit) {
        uni.showToast({ title: '请填写必填项', icon: 'none' })
        return
      }

      try {
        await api.mistakes.create({
          name: this.form.name.trim(),
          category_id: this.form.category_id,
          subjective_weight: this.form.subjective_weight,
          remark: this.form.remark.trim(),
          related_law_ids: this.form.related_law_ids
        })

        // 清除草稿
        uni.removeStorageSync('draft_mistake')

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

.page-create-mistake {
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
    background-color: $danger-color;
    color: #ffffff;
  }
}

.weight-desc {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: $text-light;
  text-align: center;
}

.law-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.law-option {
  padding: 16rpx 24rpx;
  background-color: $bg-color;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: $text-color;
  border: 2rpx solid transparent;

  &.active {
    border-color: $primary-color;
    background-color: rgba(22, 34, 56, 0.05);
    color: $primary-color;
  }
}

.law-empty {
  font-size: 24rpx;
  color: $text-light;
  padding: 20rpx 0;
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

.draft-tip {
  position: fixed;
  bottom: 180rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 16rpx 32rpx;
  background-color: $warning-color;
  color: #ffffff;
  border-radius: 30rpx;
  font-size: 24rpx;
}
</style>
