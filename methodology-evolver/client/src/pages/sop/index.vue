<template>
  <view class="page-sop">
    <!-- 分类筛选 -->
    <view class="filter-bar">
      <view class="filter-item" @tap="showCategoryPicker = true">
        <text>{{ selectedCategory ? selectedCategory.category_name : '全部分类' }}</text>
        <text class="arrow">▼</text>
      </view>
    </view>

    <!-- SOP列表 -->
    <scroll-view class="sop-list" scroll-y>
      <view
        class="sop-card"
        v-for="item in sopList"
        :key="item.sop_id"
        @tap="goToDetail(item.sop_id)"
      >
        <view class="sop-header">
          <text class="sop-name">{{ item.sop_name }}</text>
          <text class="tag tag-positive" v-if="item.is_auto_generated">智能</text>
        </view>
        <text class="sop-category">{{ item.category_name }}</text>
        <view class="sop-meta">
          <text>{{ item.steps ? item.steps.length : 0 }} 个步骤</text>
          <text>执行 {{ item.exec_count }} 次</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="!loading && sopList.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无SOP模板</text>
        <text class="empty-desc">创建第一个做事模板吧</text>
      </view>
    </scroll-view>

    <!-- 悬浮新增按钮 -->
    <view class="fab" @tap="goToCreate">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      loading: false,
      sopList: [],
      selectedCategory: null,
      showCategoryPicker: false,
      categories: []
    }
  },

  onLoad() {
    this.fetchCategories()
    this.fetchList()
  },

  methods: {
    async fetchCategories() {
      try {
        const res = await api.categories.list()
        this.categories = res.data || []
      } catch (e) {
        console.error('获取分类失败', e)
      }
    },

    async fetchList() {
      this.loading = true
      try {
        const params = {}
        if (this.selectedCategory) {
          params.category_id = this.selectedCategory.category_id
        }
        const res = await api.sops.list(params)
        this.sopList = res.data.list || []
      } catch (e) {
        console.error('获取列表失败', e)
      } finally {
        this.loading = false
      }
    },

    goToDetail(id) {
      uni.navigateTo({ url: `/pages/sop/detail?id=${id}` })
    },

    goToCreate() {
      uni.navigateTo({ url: '/pages/sop/create' })
    }
  }
}
</script>

<style lang="scss">
@import '@/static/variables.scss';

.page-sop {
  min-height: 100vh;
  background-color: $bg-color;
}

.filter-bar {
  display: flex;
  background-color: $card-bg;
  padding: 20rpx 24rpx;
  border-bottom: 1px solid $border-color;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: $text-color;

  .arrow {
    margin-left: 8rpx;
    font-size: 20rpx;
    color: $text-light;
  }
}

.sop-list {
  height: calc(100vh - 100rpx);
  padding: 24rpx;
}

.sop-card {
  background-color: $card-bg;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.sop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.sop-name {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-color;
}

.sop-category {
  font-size: 24rpx;
  color: $text-light;
  margin-bottom: 12rpx;
}

.sop-meta {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: $text-light;
}

.fab {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: $primary-color;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(22, 34, 56, 0.3);

  .fab-icon {
    font-size: 48rpx;
    color: #ffffff;
    font-weight: bold;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx;

  .empty-icon {
    font-size: 120rpx;
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
  }
}
</style>
