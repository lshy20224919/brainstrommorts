<template>
  <view class="page-card">
    <!-- 顶部Tab -->
    <view class="top-tabs">
      <view
        class="top-tab"
        :class="{ active: currentTab === 'action' }"
        @tap="switchTab('action')"
      >
        <text>正确的事</text>
      </view>
      <view
        class="top-tab"
        :class="{ active: currentTab === 'mistake' }"
        @tap="switchTab('mistake')"
      >
        <text>错误的事</text>
      </view>
      <view
        class="top-tab"
        :class="{ active: currentTab === 'law' }"
        @tap="switchTab('law')"
      >
        <text>规律</text>
      </view>
      <view
        class="top-tab"
        :class="{ active: currentTab === 'inspiration' }"
        @tap="switchTab('inspiration')"
      >
        <text>灵感</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar" v-if="currentTab === 'action'">
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

    <!-- 正确的事列表 -->
    <scroll-view
      class="card-list"
      scroll-y
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      v-if="currentTab === 'action'"
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

      <view class="load-more" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="noMore && cardList.length > 0">
        <text>— 没有更多了 —</text>
      </view>

      <view class="empty" v-if="!loading && cardList.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无动作</text>
        <text class="empty-desc">点击右下角按钮创建第一个动作</text>
      </view>
    </scroll-view>

    <!-- 错误的事列表 -->
    <scroll-view
      class="card-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefreshMistakes"
      v-if="currentTab === 'mistake'"
    >
      <view
        class="card-item mistake-card"
        v-for="item in mistakeList"
        :key="item.id"
        @longpress="showMistakeActions(item)"
      >
        <view class="card-header">
          <text class="card-name">{{ item.name }}</text>
          <view class="card-tags">
            <text class="tag tag-danger" v-if="item.pinned">置顶</text>
            <text class="tag tag-archived" v-if="item.status === 1">已归档</text>
            <text class="tag tag-retired" v-if="item.status === 2">已淘汰</text>
          </view>
        </view>

        <view class="card-info">
          <text class="card-category">{{ getCategoryName(item.category_id) }}</text>
          <text class="card-weight">权重 {{ item.subjective_weight }}</text>
        </view>

        <view class="card-remark" v-if="item.remark">
          <text>{{ item.remark }}</text>
        </view>
      </view>

      <view class="empty" v-if="!loading && mistakeList.length === 0">
        <text class="empty-icon">🚫</text>
        <text class="empty-text">暂无错误的事</text>
        <text class="empty-desc">点击右下角按钮定义行为红线</text>
      </view>
    </scroll-view>

    <!-- 规律列表 -->
    <scroll-view
      class="card-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefreshLaws"
      v-if="currentTab === 'law'"
    >
      <view
        class="card-item law-card"
        v-for="item in lawList"
        :key="item.id"
      >
        <view class="card-header">
          <text class="card-name">{{ item.name }}</text>
          <view class="card-tags">
            <text class="tag tag-positive" v-if="!item.is_retired">生效中</text>
            <text class="tag tag-retired" v-if="item.is_retired">已淘汰</text>
          </view>
        </view>
        <view class="card-info">
          <text class="card-category">{{ item.category }}</text>
        </view>
        <view class="card-remark" v-if="item.description">
          <text>{{ item.description }}</text>
        </view>
      </view>

      <view class="empty" v-if="!loading && lawList.length === 0">
        <text class="empty-icon">📐</text>
        <text class="empty-text">暂无规律</text>
        <text class="empty-desc">从首页新建规律</text>
      </view>
    </scroll-view>

    <!-- 灵感列表 -->
    <scroll-view
      class="card-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefreshInspirations"
      v-if="currentTab === 'inspiration'"
    >
      <view
        class="card-item inspiration-card"
        v-for="item in inspirationList"
        :key="item.id"
        @longpress="showInspirationActions(item)"
      >
        <view class="card-header">
          <text class="card-name">{{ item.desc }}</text>
          <view class="card-tags">
            <text class="tag tag-converted" v-if="item.status === 1">已转化</text>
          </view>
        </view>
        <view class="card-info">
          <text class="card-category">{{ item.source || '未标注来源' }}</text>
          <text class="card-time">{{ formatTime(item.created_time) }}</text>
        </view>
      </view>

      <view class="empty" v-if="!loading && inspirationList.length === 0">
        <text class="empty-icon">💡</text>
        <text class="empty-text">暂无灵感</text>
        <text class="empty-desc">点击右下角按钮捕捉灵感</text>
      </view>
    </scroll-view>

    <!-- 灵感长按操作菜单 -->
    <view class="modal" v-if="showInspirationSheet" @tap="closeInspirationSheet">
      <view class="action-sheet" @tap.stop>
        <view class="action-item" @tap="convertInspiration('action')">
          <text>转为正确的事</text>
        </view>
        <view class="action-item" @tap="convertInspiration('mistake')">
          <text>转为错误的事</text>
        </view>
        <view class="action-item" @tap="convertInspiration('law')">
          <text>转为规律</text>
        </view>
        <view class="action-item danger" @tap="deleteInspiration(currentInspiration)">
          <text>删除</text>
        </view>
        <view class="action-item cancel" @tap="closeInspirationSheet">
          <text>取消</text>
        </view>
      </view>
    </view>

    <!-- 悬浮新增按钮 -->
    <view class="fab" @tap="goToCreate">
      <text class="fab-icon">+</text>
    </view>

    <!-- 正确的事长按操作菜单 -->
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

    <!-- 错误的事长按操作菜单 -->
    <view class="modal" v-if="showMistakeSheet" @tap="closeMistakeSheet">
      <view class="action-sheet" @tap.stop>
        <view class="action-item" @tap="togglePinMistake(currentMistake)">
          <text>{{ currentMistake && currentMistake.pinned ? '取消置顶' : '置顶' }}</text>
        </view>
        <view class="action-item" @tap="editMistake(currentMistake)">
          <text>编辑</text>
        </view>
        <view class="action-item" @tap="migrateMistake(currentMistake)">
          <text>迁移</text>
        </view>
        <view class="action-item" v-if="currentMistake && currentMistake.status === 0" @tap="retireMistake(currentMistake)">
          <text>淘汰</text>
        </view>
        <view class="action-item danger" @tap="deleteMistake(currentMistake)">
          <text>删除</text>
        </view>
        <view class="action-item cancel" @tap="closeMistakeSheet">
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
      currentTab: 'action',
      loading: false,
      refreshing: false,
      noMore: false,
      cardList: [],
      mistakeList: [],
      lawList: [],
      inspirationList: [],
      categories: [],
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

      // 错误的事操作菜单
      showMistakeSheet: false,
      currentMistake: null,

      // 打卡
      showCheckinModal: false,
      checkinAction: null,
      checkinResult: null,
      checkinRemark: '',

      // 灵感操作菜单
      showInspirationSheet: false,
      currentInspiration: null
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
    if (options.tab) {
      this.currentTab = options.tab
    }
    this.fetchCategories()
    this.fetchList()
    this.fetchMistakes()
    this.fetchLaws()
    this.fetchInspirations()
  },

  methods: {
    switchTab(tab) {
      this.currentTab = tab
    },

    getCategoryName(categoryId) {
      const cat = this.categories.find(c => c.id === categoryId)
      return cat ? cat.name : ''
    },

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
        const list = res.data.list || res.data || []

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

    async fetchMistakes() {
      try {
        const res = await api.mistakes.list({ status: 0 })
        this.mistakeList = res.data || []
      } catch (e) {
        console.error('获取错误的事失败', e)
      }
    },

    async fetchLaws() {
      try {
        const res = await api.laws.list()
        this.lawList = res.data || []
      } catch (e) {
        console.error('获取规律失败', e)
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

    onRefreshMistakes() {
      this.refreshing = true
      this.fetchMistakes().finally(() => { this.refreshing = false })
    },

    onRefreshLaws() {
      this.refreshing = true
      this.fetchLaws().finally(() => { this.refreshing = false })
    },

    goToDetail(id) {
      this.closeActionSheet()
      uni.navigateTo({ url: `/pages/card/detail?id=${id}` })
    },

    goToCreate() {
      if (this.currentTab === 'mistake') {
        uni.navigateTo({ url: '/pages/mistake/create' })
      } else if (this.currentTab === 'law') {
        uni.navigateTo({ url: '/pages/law/create' })
      } else if (this.currentTab === 'inspiration') {
        uni.navigateTo({ url: '/pages/inspiration/create' })
      } else {
        uni.navigateTo({ url: '/pages/card/create' })
      }
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

    // 错误的事操作
    showMistakeActions(item) {
      this.currentMistake = item
      this.showMistakeSheet = true
    },

    closeMistakeSheet() {
      this.showMistakeSheet = false
      this.currentMistake = null
    },

    async togglePinMistake(item) {
      this.closeMistakeSheet()
      try {
        await api.mistakes.update(item.id, { pinned: item.pinned ? 0 : 1 })
        uni.showToast({ title: item.pinned ? '已取消置顶' : '已置顶', icon: 'success' })
        this.fetchMistakes()
      } catch (e) {
        console.error('操作失败', e)
      }
    },

    editMistake(item) {
      this.closeMistakeSheet()
      // 暂时用toast提示，后续可跳转编辑页
      uni.showToast({ title: '编辑功能开发中', icon: 'none' })
    },

    migrateMistake(item) {
      this.closeMistakeSheet()
      uni.navigateTo({ url: `/pages/card/migrate?id=${item.id}&type=mistake` })
    },

    async retireMistake(item) {
      this.closeMistakeSheet()
      uni.showModal({
        title: '确认淘汰',
        content: '淘汰后该红线将不再显示',
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.mistakes.update(item.id, { status: 2 })
              uni.showToast({ title: '淘汰成功', icon: 'success' })
              this.fetchMistakes()
            } catch (e) {
              console.error('淘汰失败', e)
            }
          }
        }
      })
    },

    async deleteMistake(item) {
      this.closeMistakeSheet()
      uni.showModal({
        title: '确认删除',
        content: '删除后不可恢复',
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.mistakes.delete(item.id)
              uni.showToast({ title: '删除成功', icon: 'success' })
              this.fetchMistakes()
            } catch (e) {
              console.error('删除失败', e)
            }
          }
        }
      })
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
    },

    // 灵感相关方法
    async fetchInspirations() {
      try {
        const res = await api.inspirations.list({ status: 0 })
        this.inspirationList = res.data || []
      } catch (e) {
        console.error('获取灵感列表失败', e)
      }
    },

    onRefreshInspirations() {
      this.refreshing = true
      this.fetchInspirations().finally(() => { this.refreshing = false })
    },

    showInspirationActions(item) {
      this.currentInspiration = item
      this.showInspirationSheet = true
    },

    closeInspirationSheet() {
      this.showInspirationSheet = false
      this.currentInspiration = null
    },

    async convertInspiration(targetType) {
      const item = this.currentInspiration
      this.closeInspirationSheet()
      try {
        await api.inspirations.convert(item.id, { target_type: targetType })
        uni.showToast({ title: '转化成功', icon: 'success' })
        this.fetchInspirations()
      } catch (e) {
        console.error('转化失败', e)
      }
    },

    async deleteInspiration(item) {
      this.closeInspirationSheet()
      uni.showModal({
        title: '确认删除',
        content: '删除后不可恢复',
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.inspirations.delete(item.id)
              uni.showToast({ title: '删除成功', icon: 'success' })
              this.fetchInspirations()
            } catch (e) {
              console.error('删除失败', e)
            }
          }
        }
      })
    },

    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      return `${d.getMonth() + 1}/${d.getDate()}`
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

/* 顶部Tab */
.top-tabs {
  display: flex;
  background-color: $card-bg;
  border-bottom: 1px solid $border-color;
  position: sticky;
  top: 0;
  z-index: 11;
}

.top-tab {
  flex: 1;
  padding: 24rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: $text-light;
  position: relative;

  &.active {
    color: $primary-color;
    font-weight: bold;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 4rpx;
      background-color: $primary-color;
      border-radius: 2rpx;
    }
  }
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
/* 错误的事卡片 */
.mistake-card {
  border-left: 6rpx solid $danger-color;
}

.card-weight {
  font-size: 24rpx;
  color: $danger-color;
  font-weight: bold;
}

.card-remark {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: $text-light;
  line-height: 1.5;
}

.tag-danger {
  background-color: rgba(248, 114, 114, 0.1);
  color: $danger-color;
}

.tag-retired {
  background-color: rgba(156, 163, 175, 0.1);
  color: $text-light;
}

/* 规律卡片 */
.law-card {
  border-left: 6rpx solid $primary-color;
}

/* 灵感卡片 */
.inspiration-card {
  border-left: 6rpx solid #F5A623;
}

.card-time {
  font-size: 22rpx;
  color: $text-light;
}

.tag-converted {
  background-color: rgba(245, 166, 35, 0.1);
  color: #F5A623;
}
</style>
