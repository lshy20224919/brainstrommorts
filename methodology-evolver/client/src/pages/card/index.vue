<template>
  <view class="page-card">
    <!-- 一级Tab -->
    <view class="top-tabs">
      <view class="top-tab" :class="{ active: primaryTab === 'behavior' }" @tap="switchPrimaryTab('behavior')">
        <text>行为 ({{ actionCount + mistakeCount }})</text>
      </view>
      <view class="top-tab" :class="{ active: primaryTab === 'law' }" @tap="switchPrimaryTab('law')">
        <text>规律 ({{ positiveLawCount + negativeLawCount }})</text>
      </view>
      <view class="top-tab" :class="{ active: primaryTab === 'inspiration' }" @tap="switchPrimaryTab('inspiration')">
        <text>灵感 ({{ positiveInspCount + negativeInspCount }})</text>
      </view>
    </view>

    <!-- 二级Pill切换 -->
    <view class="sub-tab-bar">
      <view v-if="primaryTab === 'behavior'" class="sub-tab-pill positive" :class="{ active: subTab === 'action' }" @tap="subTab = 'action'">
        <text>正确的事 ({{ actionCount }})</text>
      </view>
      <view v-if="primaryTab === 'behavior'" class="sub-tab-pill negative" :class="{ active: subTab === 'mistake' }" @tap="subTab = 'mistake'">
        <text>错误的事 ({{ mistakeCount }})</text>
      </view>
      <view v-if="primaryTab === 'law'" class="sub-tab-pill positive" :class="{ active: subTab === 'positive' }" @tap="subTab = 'positive'">
        <text>正向 ({{ positiveLawCount }})</text>
      </view>
      <view v-if="primaryTab === 'law'" class="sub-tab-pill negative" :class="{ active: subTab === 'negative' }" @tap="subTab = 'negative'">
        <text>负向 ({{ negativeLawCount }})</text>
      </view>
      <view v-if="primaryTab === 'inspiration'" class="sub-tab-pill positive" :class="{ active: subTab === 'positive' }" @tap="subTab = 'positive'">
        <text>正向 ({{ positiveInspCount }})</text>
      </view>
      <view v-if="primaryTab === 'inspiration'" class="sub-tab-pill negative" :class="{ active: subTab === 'negative' }" @tap="subTab = 'negative'">
        <text>负向 ({{ negativeInspCount }})</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" @tap="showCategoryPicker = true">
        <text>{{ selectedCategory ? selectedCategory.name : '全部分类' }}</text>
        <text class="arrow">▼</text>
      </view>
      <view class="filter-item" @tap="cycleSortOption" v-if="sortOptions.length > 1">
        <text>{{ currentSortLabel }}</text>
        <text class="arrow">▼</text>
      </view>
    </view>

    <!-- 卡片列表 -->
    <scroll-view class="card-list" scroll-y :refresher-enabled="true" :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <!-- 统一卡片 -->
      <view class="unified-card" v-for="item in displayList" :key="item._key" :style="{ borderLeftColor: item._borderColor }" @tap="onCardTap(item)" @longpress="onCardLongPress(item)">
        <view class="unified-card-row1">
          <text v-if="item._sensitiveId && isSensitiveHidden(item._sensitiveId)" class="sensitive-mask" @tap.stop="revealSensitive(item._sensitiveId)">点击查看</text>
          <text v-else class="unified-card-title">{{ item._title }}</text>
          <text class="unified-card-badge" :class="item._badgeClass" v-if="item._badge">{{ item._badge }}</text>
        </view>
        <view class="unified-card-row2">
          <text>{{ item._meta }}</text>
        </view>
        <view class="unified-card-row3">
          <text>{{ item._data }}</text>
        </view>
      </view>

      <view class="empty" v-if="!loading && displayList.length === 0">
        <view class="empty-icon"><app-icon :name="emptyIcon" :size="56" color="#9CA3AF" /></view>
        <text class="empty-text">{{ emptyText }}</text>
      </view>
    </scroll-view>

    <!-- 悬浮新增按钮 -->
    <view class="fab" @tap="goToCreate">
      <app-icon name="plus" :size="24" color="#FFFFFF" />
    </view>

    <!-- 操作菜单 -->
    <view class="modal" v-if="showSheet" @tap="showSheet = false">
      <view class="action-sheet" @tap.stop>
        <view class="action-item" v-for="(act, idx) in sheetActions" :key="idx" :class="{ danger: act.danger }" @tap="act.handler">
          <text>{{ act.label }}</text>
        </view>
        <view class="action-item cancel" @tap="showSheet = false">
          <text>取消</text>
        </view>
      </view>
    </view>

    <!-- 打卡弹窗 -->
    <view class="modal" v-if="showCheckinModal" @tap="closeCheckin">
      <view class="modal-content checkin-modal" @tap.stop>
        <text class="modal-title">打卡 - {{ checkinAction ? checkinAction.action_name : '' }}</text>
        <view class="checkin-result">
          <view class="result-btn success" :class="{ active: checkinResult === 1 }" @tap="checkinResult = 1">
            <text>✅ 成功</text>
          </view>
          <view class="result-btn fail" :class="{ active: checkinResult === 2 }" @tap="checkinResult = 2">
            <text>❌ 失败</text>
          </view>
        </view>
        <input class="checkin-remark" v-model="checkinRemark" placeholder="备注（可选）" maxlength="200" />
        <view class="modal-actions">
          <view class="btn btn-outline" @tap="closeCheckin">取消</view>
          <view class="btn btn-primary" :class="{ disabled: !checkinResult }" @tap="submitCheckin">确认打卡</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import AppIcon from '@/components/icon.vue'
import sensitiveMixin from '@/mixins/sensitive.js'

export default {
  components: { AppIcon },
  mixins: [sensitiveMixin],
  data() {
    return {
      primaryTab: 'behavior',
      subTab: 'action',
      loading: false,
      refreshing: false,
      cardList: [],
      mistakeList: [],
      lawList: [],
      inspirationList: [],
      categories: [],
      selectedCategory: null,
      selectedSort: 'weight',
      showCategoryPicker: false,
      showSheet: false,
      sheetActions: [],
      showCheckinModal: false,
      checkinAction: null,
      checkinResult: null,
      checkinRemark: ''
    }
  },

  computed: {
    actionCount() { return this.cardList.filter(a => a.status !== 1).length },
    mistakeCount() { return this.mistakeList.filter(m => m.status === 0).length },
    positiveLawCount() { return this.lawList.filter(l => l.law_type === 1).length },
    negativeLawCount() { return this.lawList.filter(l => l.law_type === 2).length },
    positiveInspCount() { return this.inspirationList.filter(i => i.direction === 'positive').length },
    negativeInspCount() { return this.inspirationList.filter(i => i.direction === 'negative').length },

    sortOptions() {
      if (this.primaryTab === 'behavior' && this.subTab === 'action') return [['weight', '主观权重'], ['exec_count', '执行次数'], ['success_rate', '成功率']]
      if (this.primaryTab === 'behavior' && this.subTab === 'mistake') return [['weight', '主观权重']]
      if (this.primaryTab === 'law') return [['weight', '主观权重'], ['trigger_count', '触发次数']]
      return [['time', '创建时间']]
    },
    currentSortLabel() {
      const opt = this.sortOptions.find(o => o[0] === this.selectedSort)
      return opt ? opt[1] : this.sortOptions[0][1]
    },
    emptyIcon() {
      if (this.primaryTab === 'behavior') return this.subTab === 'action' ? 'list' : 'ban'
      if (this.primaryTab === 'law') return 'lightbulb'
      return 'lightbulb'
    },
    emptyText() {
      if (this.primaryTab === 'behavior') return this.subTab === 'action' ? '暂无正确的事' : '暂无错误的事'
      if (this.primaryTab === 'law') return `暂无${this.subTab === 'positive' ? '正向' : '负向'}规律`
      return `暂无${this.subTab === 'positive' ? '正向' : '负向'}灵感`
    },

    displayList() {
      if (this.primaryTab === 'behavior' && this.subTab === 'action') {
        let list = this.cardList.filter(a => a.status !== 1)
        if (this.selectedCategory) list = list.filter(a => a.category_id === this.selectedCategory.id)
        list.sort((a, b) => {
          if (this.selectedSort === 'exec_count') return b.exec_count - a.exec_count
          if (this.selectedSort === 'success_rate') return (b.success_rate || 0) - (a.success_rate || 0)
          return (b.subjective_weight || 0) - (a.subjective_weight || 0)
        })
        list = [...list.filter(a => a.pinned), ...list.filter(a => !a.pinned)]
        return list.map(a => ({
          ...a, _key: 'a_' + a.action_id, _title: a.action_name,
          _badge: a.pinned ? '置顶' : null, _badgeClass: 'badge-pinned',
          _meta: this.getCategoryName(a.category_id),
          _data: `执行 ${a.exec_count} 次 · 成功率 ${a.success_rate ? a.success_rate + '%' : '暂无'}`,
          _borderColor: this.getCategoryColor(a.category_id), _type: 'action'
        }))
      }
      if (this.primaryTab === 'behavior' && this.subTab === 'mistake') {
        let list = this.mistakeList.filter(m => m.status === 0)
        if (this.selectedCategory) list = list.filter(m => m.category_id === this.selectedCategory.id)
        list.sort((a, b) => (b.subjective_weight || 0) - (a.subjective_weight || 0))
        list = [...list.filter(m => m.pinned), ...list.filter(m => !m.pinned)]
        return list.map(m => ({
          ...m, _key: 'm_' + m.id, _title: m.name,
          _badge: '红线', _badgeClass: 'badge-redline',
          _meta: this.getCategoryName(m.category_id),
          _data: `权重 ${m.subjective_weight} · 关联 ${(m.related_law_ids || []).length} 条规律`,
          _borderColor: '#FF6B35', _type: 'mistake'
        }))
      }
      if (this.primaryTab === 'law') {
        const type = this.subTab === 'positive' ? 1 : 2
        let list = this.lawList.filter(l => l.law_type === type)
        if (this.selectedCategory) list = list.filter(l => l.category_id === this.selectedCategory.id)
        list.sort((a, b) => {
          if (this.selectedSort === 'trigger_count') return (b.trigger_count || 0) - (a.trigger_count || 0)
          return (b.subjective_weight || 0) - (a.subjective_weight || 0)
        })
        return list.map(l => ({
          ...l, _key: 'l_' + l.id, _title: l.law_desc || l.name,
          _badge: null, _badgeClass: '',
          _meta: this.getCategoryName(l.category_id) + (l.related_action_name ? ` · 关联：${l.related_action_name}` : ''),
          _data: `触发 ${l.trigger_count || 0} 次 · 权重 ${l.subjective_weight || 0}`,
          _borderColor: type === 1 ? '#36D399' : '#F87272', _type: 'law'
        }))
      }
      if (this.primaryTab === 'inspiration') {
        const dir = this.subTab
        let list = this.inspirationList.filter(i => i.direction === dir && i.status === 0)
        if (this.selectedCategory) list = list.filter(i => i.category_id === this.selectedCategory.id)
        list.sort((a, b) => new Date(b.created_time) - new Date(a.created_time))
        return list.map(i => ({
          ...i, _key: 'i_' + i.id, _title: i.desc,
          _sensitiveId: 'insp-' + i.id,
          _badge: i._direction_inferred ? '待确认方向' : (dir === 'positive' ? '正向' : '负向'),
          _badgeClass: i._direction_inferred ? 'inferred' : (dir === 'positive' ? 'positive' : 'negative'),
          _meta: (this.getCategoryName(i.category_id) || '') + (i.source ? ` · 来源：${i.source}` : ''),
          _data: this.formatTime(i.created_time),
          _borderColor: dir === 'positive' ? '#FBBF24' : '#A78BFA', _type: 'inspiration'
        }))
      }
      return []
    }
  },

  onLoad(options) {
    if (options.tab) this.primaryTab = options.tab
    this.fetchAll()
  },

  onShow() {
    const pending = uni.getStorageSync('cardlib:pending-tab')
    if (pending && pending.primaryTab) {
      this.primaryTab = pending.primaryTab
      if (pending.subTab) {
        this.subTab = pending.subTab
      } else if (pending.primaryTab === 'behavior') {
        this.subTab = 'action'
      } else if (pending.primaryTab === 'law') {
        this.subTab = 'positive'
      }
      this.selectedCategory = null
      this.selectedSort = 'weight'
      uni.removeStorageSync('cardlib:pending-tab')
    }
  },

  methods: {
    switchPrimaryTab(tab) {
      this.primaryTab = tab
      this.selectedCategory = null
      this.selectedSort = 'weight'
      if (tab === 'behavior') this.subTab = 'action'
      else this.subTab = 'positive'
    },
    cycleSortOption() {
      const idx = this.sortOptions.findIndex(o => o[0] === this.selectedSort)
      const next = (idx + 1) % this.sortOptions.length
      this.selectedSort = this.sortOptions[next][0]
    },
    getCategoryName(id) {
      const cat = this.categories.find(c => c.id === id)
      return cat ? `${cat.icon || '◇'} ${cat.name}` : ''
    },
    getCategoryColor(id) {
      const cat = this.categories.find(c => c.id === id)
      return cat ? (cat.color || '#9CA3AF') : '#9CA3AF'
    },
    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      return `${d.getMonth() + 1}/${d.getDate()}`
    },

    async fetchAll() {
      this.loading = true
      await Promise.all([this.fetchCategories(), this.fetchActions(), this.fetchMistakes(), this.fetchLaws(), this.fetchInspirations()])
      this.loading = false
    },
    async fetchCategories() {
      try { const res = await api.categories.list(); this.categories = res.data || [] } catch (e) { console.error(e) }
    },
    async fetchActions() {
      try { const res = await api.actions.list({ status: 0 }); this.cardList = res.data?.list || res.data || [] } catch (e) { console.error(e) }
    },
    async fetchMistakes() {
      try { const res = await api.mistakes.list({ status: 0 }); this.mistakeList = res.data || [] } catch (e) { console.error(e) }
    },
    async fetchLaws() {
      try { const res = await api.laws.list(); this.lawList = res.data || [] } catch (e) { console.error(e) }
    },
    async fetchInspirations() {
      try { const res = await api.inspirations.list({ status: 0 }); this.inspirationList = res.data || [] } catch (e) { console.error(e) }
    },

    onRefresh() {
      this.refreshing = true
      this.fetchAll().finally(() => { this.refreshing = false })
    },

    onCardTap(item) {
      if (item._type === 'action') {
        uni.navigateTo({ url: `/pages/card/detail?id=${item.action_id}` })
      }
    },
    onCardLongPress(item) {
      if (item._type === 'action') this.showActionActions(item)
      else if (item._type === 'mistake') this.showMistakeActions(item)
      else if (item._type === 'law') this.showLawActions(item)
      else if (item._type === 'inspiration') this.showInspirationActions(item)
    },

    showActionActions(item) {
      this.sheetActions = [
        { label: '打卡', handler: () => { this.showSheet = false; this.checkinAction = item; this.checkinResult = null; this.checkinRemark = ''; this.showCheckinModal = true } },
        { label: '编辑', handler: () => { this.showSheet = false; uni.navigateTo({ url: `/pages/card/edit?id=${item.action_id}` }) } },
        { label: item.pinned ? '取消置顶' : '置顶', handler: async () => { this.showSheet = false; await api.actions.update(item.action_id, { pinned: item.pinned ? 0 : 1 }); this.fetchActions() } },
        { label: '归档', handler: async () => { this.showSheet = false; await api.actions.archive(item.action_id); uni.showToast({ title: '已归档', icon: 'success' }); this.fetchActions() } },
        { label: '删除', danger: true, handler: () => { this.showSheet = false; this.confirmDelete(() => api.actions.delete(item.action_id), this.fetchActions) } }
      ]
      this.showSheet = true
    },
    showMistakeActions(item) {
      this.sheetActions = [
        { label: '编辑', handler: () => { this.showSheet = false; uni.navigateTo({ url: `/pages/mistake/edit?id=${item.id}` }) } },
        { label: item.pinned ? '取消置顶' : '置顶', handler: async () => { this.showSheet = false; await api.mistakes.update(item.id, { pinned: item.pinned ? 0 : 1 }); this.fetchMistakes() } },
        { label: '淘汰', danger: true, handler: async () => { this.showSheet = false; await api.mistakes.update(item.id, { status: 2 }); uni.showToast({ title: '已淘汰', icon: 'success' }); this.fetchMistakes() } },
        { label: '删除', danger: true, handler: () => { this.showSheet = false; this.confirmDelete(() => api.mistakes.delete(item.id), this.fetchMistakes) } }
      ]
      this.showSheet = true
    },
    showLawActions(item) {
      this.sheetActions = [
        { label: '编辑', handler: () => { this.showSheet = false; uni.navigateTo({ url: `/pages/law/edit?id=${item.id}` }) } },
        { label: '淘汰', danger: true, handler: async () => { this.showSheet = false; await api.laws.update(item.id, { status: 2 }); uni.showToast({ title: '已淘汰', icon: 'success' }); this.fetchLaws() } },
        { label: '删除', danger: true, handler: () => { this.showSheet = false; this.confirmDelete(() => api.laws.delete(item.id), this.fetchLaws) } }
      ]
      this.showSheet = true
    },
    showInspirationActions(item) {
      const flipDir = item.direction === 'positive' ? 'negative' : 'positive'
      const flipLabel = item._direction_inferred
        ? `确认为${item.direction === 'positive' ? '正向' : '负向'}灵感`
        : `改为${flipDir === 'positive' ? '正向' : '负向'}灵感`
      const onConfirm = async () => {
        this.showSheet = false
        await api.inspirations.update(item.id, { direction: item.direction, _direction_inferred: false })
        uni.showToast({ title: '已确认', icon: 'success' })
        this.fetchInspirations()
      }
      const onFlip = async () => {
        this.showSheet = false
        await api.inspirations.update(item.id, { direction: flipDir, _direction_inferred: false })
        uni.showToast({ title: '已修改', icon: 'success' })
        this.fetchInspirations()
      }
      this.sheetActions = [
        ...(item._direction_inferred ? [{ label: flipLabel, handler: onConfirm }, { label: `改为${flipDir === 'positive' ? '正向' : '负向'}灵感`, handler: onFlip }] : [{ label: flipLabel, handler: onFlip }]),
        { label: '转为正确的事', handler: async () => { this.showSheet = false; await api.inspirations.convert(item.id, { target_type: 'action' }); uni.showToast({ title: '已转化', icon: 'success' }); this.fetchInspirations() } },
        { label: '转为错误的事', handler: async () => { this.showSheet = false; await api.inspirations.convert(item.id, { target_type: 'mistake' }); uni.showToast({ title: '已转化', icon: 'success' }); this.fetchInspirations() } },
        { label: '转为规律', handler: async () => { this.showSheet = false; await api.inspirations.convert(item.id, { target_type: 'law' }); uni.showToast({ title: '已转化', icon: 'success' }); this.fetchInspirations() } },
        { label: '删除', danger: true, handler: () => { this.showSheet = false; this.confirmDelete(() => api.inspirations.delete(item.id), this.fetchInspirations) } }
      ]
      this.showSheet = true
    },

    confirmDelete(deleteFn, refreshFn) {
      uni.showModal({
        title: '确认删除', content: '删除后不可恢复',
        success: async (res) => { if (res.confirm) { await deleteFn(); uni.showToast({ title: '已删除', icon: 'success' }); refreshFn() } }
      })
    },

    goToCreate() {
      if (this.primaryTab === 'behavior' && this.subTab === 'action') uni.navigateTo({ url: '/pages/card/create' })
      else if (this.primaryTab === 'behavior' && this.subTab === 'mistake') uni.navigateTo({ url: '/pages/mistake/create' })
      else if (this.primaryTab === 'law') uni.navigateTo({ url: '/pages/law/create' })
      else uni.navigateTo({ url: '/pages/inspiration/create' })
    },

    closeCheckin() { this.showCheckinModal = false; this.checkinAction = null },
    async submitCheckin() {
      if (!this.checkinResult) { uni.showToast({ title: '请选择结果', icon: 'none' }); return }
      try {
        await api.actions.checkin(this.checkinAction.action_id, { exec_result: this.checkinResult, exec_remark: this.checkinRemark })
        uni.showToast({ title: '打卡成功', icon: 'success' })
        this.closeCheckin()
        this.fetchActions()
      } catch (e) { console.error(e) }
    }
  }
}
</script>

<style lang="scss">
@import '@/static/variables.scss';

.page-card { min-height: 100vh; background-color: $bg-color; }

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

.sub-tab-bar {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background-color: $card-bg;
  border-bottom: 1px solid $border-color;
}
.sub-tab-pill {
  flex: 1;
  padding: 14rpx 0;
  border-radius: 40rpx;
  border: 1px solid $border-color;
  background: #F9FAFB;
  font-size: 26rpx;
  color: $text-light;
  text-align: center;
  &.positive.active { background: rgba(54, 211, 153, 0.1); border-color: $positive-color; color: $positive-color; font-weight: bold; }
  &.negative.active { background: rgba(248, 114, 114, 0.1); border-color: $negative-color; color: $negative-color; font-weight: bold; }
}

.filter-bar {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  background-color: $card-bg;
  padding: 16rpx 24rpx;
  border-bottom: 1px solid $border-color;
  -webkit-overflow-scrolling: touch;
}
.filter-item {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
  height: 56rpx;
  font-size: 26rpx;
  color: $text-color;
  .arrow { margin-left: 8rpx; font-size: 20rpx; color: $text-light; }
}

.card-list { height: calc(100vh - 260rpx); padding: 24rpx; }

.unified-card {
  background-color: $card-bg;
  border-radius: 12rpx;
  padding: 24rpx 24rpx 20rpx 28rpx;
  margin-bottom: 20rpx;
  border-left: 6rpx solid #E5E7EB;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}
.unified-card-row1 {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10rpx;
  gap: 12rpx;
}
.unified-card-title {
  font-size: 30rpx;
  font-weight: bold;
  color: $text-color;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.unified-card-badge {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  flex-shrink: 0;
  &.badge-pinned { color: $primary-color; background: rgba(22, 34, 56, 0.08); }
  &.badge-redline { color: #FF6B35; background: rgba(255, 107, 53, 0.1); }
  &.positive { color: #B45309; background: rgba(251, 191, 36, 0.15); }
  &.negative { color: #6D28D9; background: rgba(167, 139, 250, 0.15); }
  &.inferred { color: #F59E0B; background: rgba(245, 158, 11, 0.15); border: 1rpx dashed #F59E0B; }
}
.unified-card-row2 {
  font-size: 24rpx;
  color: $text-light;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.unified-card-row3 { font-size: 26rpx; color: $text-light; }

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
  .fab-icon { font-size: 48rpx; line-height: 1; color: #ffffff; font-weight: bold; }
}

.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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
  &:last-child { border-bottom: none; }
  &.danger { color: $danger-color; }
  &.cancel { color: $text-light; margin-top: 10rpx; }
}

.checkin-modal {
  width: 600rpx;
  background-color: $card-bg;
  border-radius: 24rpx;
  padding: 40rpx;
  align-self: center;
}
.modal-content { align-self: center; }
.modal-title { display: block; font-size: 32rpx; font-weight: bold; color: $text-color; text-align: center; margin-bottom: 40rpx; }
.checkin-result { display: flex; gap: 30rpx; margin-bottom: 30rpx; }
.result-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  border: 2px solid transparent;
  font-size: 28rpx;
  &.success.active { background-color: rgba(54, 211, 153, 0.1); border-color: $success-color; color: $success-color; }
  &.fail.active { background-color: rgba(248, 114, 114, 0.1); border-color: $danger-color; color: $danger-color; }
}
.checkin-remark { width: 100%; padding: 20rpx 24rpx; background-color: $bg-color; border-radius: 12rpx; font-size: 28rpx; margin-bottom: 30rpx; }
.modal-actions { display: flex; gap: 20rpx; }
.btn { flex: 1; padding: 24rpx; border-radius: 40rpx; text-align: center; font-size: 28rpx; }
.btn-primary { background-color: $primary-color; color: #ffffff; &.disabled { opacity: 0.5; } }
.btn-outline { border: 1px solid $border-color; color: $text-color; }

.empty { text-align: center; padding: 120rpx 0; }
.empty-icon { font-size: 80rpx; display: block; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: $text-light; }
</style>
