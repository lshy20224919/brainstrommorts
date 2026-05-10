<template>
  <view class="page-card">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" @tap="showCategoryPicker = true">
        <text>{{ selectedCategory ? selectedCategory.category_name : '全部分类' }}</text>
        <text class="arrow">▼</text>
      </view>
      <view class="filter-item" @tap="showTypePicker = true">
        <text>{{ typeLabel }}</text>
        <text class="arrow">▼</text>
      </view>
      <view class="filter-item" @tap="showSortPicker = true">
        <text>{{ sortLabel }}</text>
        <text class="arrow">▼</text>
      </view>
    </view>

    <!-- 卡片列表 -->
    <scroll-view 
      class="card-list" 
      scroll-y 
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view 
        class="card-item" 
        v-for="item in cardList" 
        :key="item.action_id"
        @tap="goToDetail(item.action_id)"
        @longpress="showActions(item)"
      >
        <view class="card-header">
          <text class="card-name">{{ item.action_name }}</text>
          <view class="card-tags">
            <text class="tag tag-positive" v-if="item.pinned">置顶</text>
            <text class="tag tag-archived" v-if="item.status === 1">已归档</text>
          </view>
        </view>
        
        <view class="card-info">
          <text class="card-category">{{ item.category_name }}</text>
          <text class="card-rate" :class="{ high: item.success_rate >= 60 }">
            {{ item.success_rate ? item.success_rate + '%' : '暂无数据' }}
          </text>
        </view>
        
        <view class="card-stats">
          <text>执行 {{ item.exec_count }} 次</text>
          <text>成功 {{ item.success_count }} / 失败 {{ item.fail_count }}</text>
        </view>
        
        <view class="card-action" catchtap="showQuickCheckin(item)">
          <text>打卡</text>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="noMore && cardList.length > 0">
        <text>— 没有更多了 —</text>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="!loading && cardList.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无动作</text>
        <text class="empty-desc">点击右下角按钮创建第一个动作</text>
      </view>
    </scroll-view>

    <!-- 悬浮新增按钮 -->
    <view class="fab" @tap="goToCreate">
      <text class="fab-icon">+</text>
    </view>

    <!-- 长按操作菜单 -->
    <view class="modal" v-if="showActionSheet" @tap="closeActionSheet">
      <view class="action-sheet" @tap.stop>
        <view class="action-item" @tap="goToDetail(currentItem.action_id)">
          <text>查看详情</text>
        </view>
        <view class="action-item" @tap="showCheckin(currentItem)">
          <text>打卡</text>
        </view>
        <view class="action-item" @tap="goToEdit(currentItem)">
          <text>编辑</text>
        </view>
        <view class="action-item" @tap="showMigrate(currentItem)">
          <text>迁移</text>
        </view>
        <view class="action-item" v-if="currentItem.status !== 1" @tap="archiveItem(currentItem)">
          <text>归档</text>
        </view>
        <view class="action-item danger" @tap="deleteItem(currentItem)">
          <text>删除</text>
        </view>
        <view class="action-item cancel" @tap="closeActionSheet">
          <text>取消</text>
        </view>
      </view>
    </view>

    <!-- 打卡弹窗 -->
    <view class="modal" v-if="showCheckinModal" @tap="closeCheckin">
      <view class="modal-content checkin-modal" @tap.stop>
        <text class="modal-title">打卡 - {{ checkinAction ? checkinAction.action_name : '' }}</text>
        
        <view class="checkin-result">
          <view 
            class="result-btn success" 
            :class="{ active: checkinResult === 1 }"
            @tap="checkinResult = 1"
          >
            <text>✅</text>
            <text>成功</text>
          </view>
          <view 
            class="result-btn fail" 
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
          maxlength="200"
        />

        <view class="modal-actions">
          <view class="btn btn-outline" @tap="closeCheckin">取消</view>
          <view 
            class="btn btn-primary" 
            :class="{ disabled: !checkinResult }"
            @tap="submitCheckin"
          >确认打卡</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      loading: false,
      refreshing: false,
      noMore: false,
      cardList: [],
      page: 1,
      pageSize: 20,
      
      // 筛选
      selectedCategory: null,
      selectedType: null,
      selectedSort: 'exec_count',
      
      showCategoryPicker: false,
      showTypePicker: false,
      showSortPicker: false,
      
      // 操作菜单
      showActionSheet: false,
      currentItem: null,
      
      // 打卡
      showCheckinModal: false,
      checkinAction: null,
      checkinResult: null,
      checkinRemark: ''
    }
  },
  
  computed: {
    typeLabel() {
      const map = {
        null: '全部类型',
        0: '正常',
        1: '已归档',
        2: '已淘汰'
      }
      return map[this.selectedType] || '全部类型'
    },
    sortLabel() {
      const map = {
        exec_count: '按执行次数',
        success_rate: '按成功率',
        weight: '按权重'
      }
      return map[this.selectedSort] || '按执行次数'
    }
  },
  
  onLoad(options) {
    if (options.sort) {
      this.selectedSort = options.sort
    }
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
    
    async fetchList(reset = false) {
      if (this.loading) return
      if (reset) {
        this.page = 1
        this.noMore = false
      }
      
      this.loading = true
      try {
        const params = {
          page: this.page,
          page_size: this.pageSize,
          sort_by: this.selectedSort
        }
        if (this.selectedCategory) {
          params.category_id = this.selectedCategory.category_id
        }
        if (this.selectedType !== null) {
          params.status = this.selectedType
        }
        
        const res = await api.actions.list(params)
        const list = res.data.list || []
        
        if (reset) {
          this.cardList = list
        } else {
          this.cardList = [...this.cardList, ...list]
        }
        
        if (list.length < this.pageSize) {
          this.noMore = true
        }
        
        this.page++
      } catch (e) {
        console.error('获取列表失败', e)
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },
    
    loadMore() {
      if (!this.noMore) {
        this.fetchList()
      }
    },
    
    onRefresh() {
      this.refreshing = true
      this.fetchList(true)
    },
    
    goToDetail(id) {
      this.closeActionSheet()
      uni.navigateTo({ url: `/pages/card/detail?id=${id}` })
    },
    
    goToCreate() {
      uni.navigateTo({ url: '/pages/card/create' })
    },
    
    goToEdit(item) {
      this.closeActionSheet()
      uni.navigateTo({ url: `/pages/card/edit?id=${item.action_id}` })
    },
    
    showActions(item) {
      this.currentItem = item
      this.showActionSheet = true
    },
    
    closeActionSheet() {
      this.showActionSheet = false
      this.currentItem = null
    },
    
    showCheckin(item) {
      this.closeActionSheet()
      this.checkinAction = item
      this.checkinResult = null
      this.checkinRemark = ''
      this.showCheckinModal = true
    },
    
    closeCheckin() {
      this.showCheckinModal = false
      this.checkinAction = null
    },
    
    async submitCheckin() {
      if (!this.checkinResult) {
        uni.showToast({ title: '请选择结果', icon: 'none' })
        return
      }
      
      try {
        await api.actions.checkin(this.checkinAction.action_id, {
          exec_result: this.checkinResult,
          exec_remark: this.checkinRemark
        })
        
        uni.showToast({ title: '打卡成功', icon: 'success' })
        this.closeCheckin()
        this.fetchList(true)
      } catch (e) {
        console.error('打卡失败', e)
      }
    },
    
    showMigrate(item) {
      this.closeActionSheet()
      uni.navigateTo({ url: `/pages/card/migrate?id=${item.action_id}&type=action` })
    },
    
    async archiveItem(item) {
      this.closeActionSheet()
      try {
        await api.actions.archive(item.action_id)
        uni.showToast({ title: '归档成功', icon: 'success' })
        this.fetchList(true)
      } catch (e) {
        console.error('归档失败', e)
      }
    },
    
    async deleteItem(item) {
      this.closeActionSheet()
      if (item.exec_count > 0) {
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
              await api.actions.delete(item.action_id)
              uni.showToast({ title: '删除成功', icon: 'success' })
              this.fetchList(true)
            } catch (e) {
              console.error('删除失败', e)
            }
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
@import '@/static/variables.scss';

.page-card {
  min-height: 100vh;
  background-color: $bg-color;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  background-color: $card-bg;
  padding: 20rpx 24rpx;
  border-bottom: 1px solid $border-color;
  position: sticky;
  top: 0;
  z-index: 10;
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

/* 卡片列表 */
.card-list {
  height: calc(100vh - 100rpx);
  padding: 24rpx;
}

.card-item {
  background-color: $card-bg;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.card-name {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-color;
}

.card-tags {
  display: flex;
  gap: 10rpx;
}

.card-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.card-category {
  font-size: 24rpx;
  color: $text-light;
}

.card-rate {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-light;
  
  &.high {
    color: $success-color;
  }
}

.card-stats {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: $text-light;
}

.card-action {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  padding: 8rpx 24rpx;
  background-color: $primary-color;
  color: #ffffff;
  border-radius: 20rpx;
  font-size: 24rpx;
}

/* 悬浮按钮 */
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

/* 操作菜单 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
}

.action-sheet {
  width: 100%;
  background-color: $card-bg;
  border-radius: 24rpx 24rpx 0 0;
  padding: 20rpx 0;
}

.action-item {
  padding: 30rpx;
  text-align: center;
  font-size: 30rpx;
  color: $text-color;
  border-bottom: 1px solid $border-color;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.danger {
    color: $danger-color;
  }
  
  &.cancel {
    color: $text-light;
    margin-top: 10rpx;
  }
}

/* 打卡弹窗 */
.checkin-modal {
  width: 600rpx;
  background-color: $card-bg;
  border-radius: 24rpx;
  padding: 40rpx;
}

.modal-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: $text-color;
  text-align: center;
  margin-bottom: 40rpx;
}

.checkin-result {
  display: flex;
  gap: 30rpx;
  margin-bottom: 30rpx;
}

.result-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  border: 2px solid transparent;
  
  &.success {
    color: $success-color;
    
    &.active {
      background-color: rgba(54, 211, 153, 0.1);
      border-color: $success-color;
    }
  }
  
  &.fail {
    color: $danger-color;
    
    &.active {
      background-color: rgba(248, 114, 114, 0.1);
      border-color: $danger-color;
    }
  }
}

.checkin-remark {
  width: 100%;
  padding: 20rpx 24rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-bottom: 30rpx;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
}

.btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 40rpx;
  text-align: center;
  font-size: 28rpx;
}

.btn-primary {
  background-color: $primary-color;
  color: #ffffff;
  
  &.disabled {
    opacity: 0.5;
  }
}

.btn-outline {
  border: 1px solid $border-color;
  color: $text-color;
}
</style>
