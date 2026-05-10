<template>
  <view class="page-index">

    <!-- 数据看板：三列，正确的事/正向规律/负向规律 -->
    <view class="stats-board">
      <view class="stats-board-item">
        <text class="stats-board-label">正确的事</text>
        <text class="stats-board-value">{{ stats.action_count || 0 }}</text>
        <text class="stats-board-sub">触发 {{ stats.action_trigger_count || 0 }} 次</text>
      </view>
      <view class="stats-board-item">
        <text class="stats-board-label">正向规律</text>
        <text class="stats-board-value">{{ stats.positive_law_count || 0 }}</text>
        <text class="stats-board-sub">触发 {{ stats.positive_law_trigger_count || 0 }} 次</text>
      </view>
      <view class="stats-board-item">
        <text class="stats-board-label">负向规律</text>
        <text class="stats-board-value negative">{{ stats.negative_law_count || 0 }}</text>
        <text class="stats-board-sub">触发 {{ stats.negative_law_trigger_count || 0 }} 次</text>
      </view>
    </view>

    <!-- 快捷操作区：一行四格 -->
    <view class="quick-actions">
      <view class="quick-btn" @tap="goToPage('/pages/card/create?type=action')">
        <text class="quick-icon">➕</text>
        <text class="quick-text">正确的事</text>
      </view>
      <view class="quick-btn" @tap="goToPage('/pages/law/create?type=positive')">
        <text class="quick-icon">➕</text>
        <text class="quick-text">正向规律</text>
      </view>
      <view class="quick-btn" @tap="goToPage('/pages/law/create?type=negative')">
        <text class="quick-icon">➕</text>
        <text class="quick-text">负向规律</text>
      </view>
      <view class="quick-btn" @tap="showCheckin">
        <text class="quick-icon">✅</text>
        <text class="quick-text">打卡</text>
      </view>
    </view>

    <!-- 待办提醒区：每种独立一张卡片，可手动清除 -->
    <view class="todo-section" v-if="todos.length > 0">
      <view
        class="todo-card"
        v-for="todo in todos"
        :key="todo.key"
      >
        <view class="todo-content" @tap="onTodoTap(todo)">
          <text v-if="todo.type === 'review'">📊 您有 <text class="todo-strong">{{ todo.count }}</text> 个正确的事待复盘</text>
          <text v-if="todo.type === 'migrate'">💡 今日有 <text class="todo-strong">{{ todo.count }}</text> 条迁移推荐</text>
          <text v-if="todo.type === 'overdue'">⏰ <text class="todo-strong">{{ todo.action_name }}</text> 已 {{ todo.days }} 天未执行</text>
        </view>
        <view class="todo-dismiss" @tap="dismissTodo(todo.key)">×</view>
      </view>
    </view>

    <!-- 榜单区：左右滑动，三个榜单 -->
    <view class="rank-section">
      <view class="rank-header">
        <text class="section-title">我的榜单</text>
        <view class="rank-config-btn" @tap="showRankConfig = true">自定义</view>
      </view>

      <!-- 指示点 -->
      <view class="rank-dots">
        <view
          v-for="(tab, i) in rankTabs"
          :key="tab.key"
          class="rank-dot"
          :class="{ active: rankIndex === i }"
          @tap="rankIndex = i"
        />
      </view>

      <!-- 榜单标题 -->
      <text class="rank-tab-label">{{ rankTabs[rankIndex].label }}</text>

      <!-- 榜单列表（通过 swiper 实现左右滑动） -->
      <swiper :current="rankIndex" @change="onRankSwipe" class="rank-swiper">
        <swiper-item v-for="tab in rankTabs" :key="tab.key">
          <view class="rank-list" v-if="rankings[tab.key] && rankings[tab.key].length > 0">
            <view
              class="rank-item"
              v-for="(item, index) in rankings[tab.key]"
              :key="item.id"
            >
              <view class="rank-num" :class="{ top3: index < 3 }">{{ index + 1 }}</view>
              <view class="rank-info">
                <text class="rank-name">{{ tab.key === 'action' ? item.action_name : item.law_desc }}</text>
                <text class="rank-category">{{ item.category_name }}</text>
              </view>
              <view class="rank-stats">
                <text class="rank-count" v-if="tab.key === 'action'">{{ item.exec_count }} 次</text>
                <text class="rank-rate" :class="{ high: item.success_rate >= 60 }" v-if="tab.key === 'action'">
                  {{ item.success_rate != null ? item.success_rate + '%' : '暂无' }}
                </text>
                <text class="rank-count" v-if="tab.key !== 'action'">触发 {{ item.trigger_count }} 次</text>
              </view>
            </view>
          </view>
          <view class="rank-empty" v-else>
            <text>暂无数据</text>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 打卡弹窗 -->
    <view class="modal-mask" v-if="showCheckinModal" @tap.stop="closeCheckin">
      <view class="modal-box" @tap.stop>
        <text class="modal-title">打卡</text>

        <view class="form-group">
          <text class="form-label">选择正确的事 *</text>
          <picker mode="selector" :range="actionsList" range-key="action_name" @change="onActionSelect">
            <view class="picker-row">
              <text>{{ selectedAction ? selectedAction.action_name : '请选择' }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>

        <view class="form-group">
          <text class="form-label">执行结果 *</text>
          <view class="checkin-result-btns">
            <view
              class="checkin-result-btn success"
              :class="{ active: checkinResult === 1 }"
              @tap="checkinResult = 1"
            >✅ 成功</view>
            <view
              class="checkin-result-btn fail"
              :class="{ active: checkinResult === 2 }"
              @tap="checkinResult = 2"
            >❌ 失败</view>
          </view>
        </view>

        <view class="form-group">
          <text class="form-label">备注（选填）</text>
          <input class="form-input" v-model="checkinRemark" placeholder="最多200字" maxlength="200" />
        </view>

        <view class="modal-actions">
          <view class="btn btn-outline" @tap="closeCheckin">取消</view>
          <view
            class="btn btn-primary"
            :class="{ disabled: !selectedAction || !checkinResult }"
            @tap="submitCheckin"
          >确认打卡</view>
        </view>
      </view>
    </view>

    <!-- 自定义榜单数量弹窗 -->
    <view class="modal-mask" v-if="showRankConfig" @tap.stop="showRankConfig = false">
      <view class="modal-box" @tap.stop>
        <text class="modal-title">自定义榜单显示数量</text>
        <view class="form-group" v-for="tab in rankTabs" :key="tab.key">
          <text class="form-label">{{ tab.label }}</text>
          <input class="form-input" type="number" v-model="rankConfigDraft[tab.key]" />
        </view>
        <view class="modal-actions">
          <view class="btn btn-outline" @tap="showRankConfig = false">取消</view>
          <view class="btn btn-primary" @tap="saveRankConfig">确认</view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

const RANK_TABS = [
  { key: 'action', label: '正确的事' },
  { key: 'positive_law', label: '正向规律' },
  { key: 'negative_law', label: '负向规律' }
]

export default {
  data() {
    return {
      loading: false,
      stats: {},
      todos: [],
      actionsList: [],
      rankings: { action: [], positive_law: [], negative_law: [] },
      rankTabs: RANK_TABS,
      rankIndex: 0,
      rankConfig: { action: 5, positive_law: 3, negative_law: 3 },
      rankConfigDraft: {},
      showCheckinModal: false,
      showRankConfig: false,
      selectedAction: null,
      checkinResult: null,
      checkinRemark: ''
    }
  },

  onLoad() {
    this.initData()
  },

  onShow() {
    this.fetchPageData()
  },

  onPullDownRefresh() {
    this.fetchPageData()
    uni.stopPullDownRefresh()
  },

  methods: {
    async initData() {
      try {
        const res = await api.actions.list({ status: 0, page_size: 100 })
        this.actionsList = res.data.list || []
      } catch (e) {
        console.error('获取正确的事列表失败', e)
      }
    },

    async fetchPageData() {
      this.loading = true
      try {
        const [statsRes, todosRes] = await Promise.all([
          api.stats.dashboard(),
          api.stats.todos()
        ])
        this.stats = statsRes.data || {}
        this.todos = todosRes.data || []
        await this.fetchRankings()
      } catch (e) {
        console.error('获取首页数据失败', e)
      } finally {
        this.loading = false
      }
    },

    async fetchRankings() {
      try {
        const [actionRank, positiveLawRank, negativeLawRank] = await Promise.all([
          api.stats.ranking({ type: 'action', limit: this.rankConfig.action }),
          api.stats.ranking({ type: 'positive_law', limit: this.rankConfig.positive_law }),
          api.stats.ranking({ type: 'negative_law', limit: this.rankConfig.negative_law })
        ])
        this.rankings = {
          action: actionRank.data || [],
          positive_law: positiveLawRank.data || [],
          negative_law: negativeLawRank.data || []
        }
      } catch (e) {
        console.error('获取榜单失败', e)
      }
    },

    onRankSwipe(e) {
      this.rankIndex = e.detail.current
    },

    async dismissTodo(key) {
      try {
        await api.stats.dismissTodo({ key })
        this.todos = this.todos.filter(t => t.key !== key)
      } catch (e) {
        console.error('清除待办失败', e)
      }
    },

    onTodoTap(todo) {
      if (todo.type === 'review') uni.switchTab({ url: '/pages/review/index' })
      else if (todo.type === 'migrate') uni.switchTab({ url: '/pages/card/index' })
      else if (todo.type === 'overdue') uni.navigateTo({ url: `/pages/card/detail?id=${todo.action_id}` })
    },

    saveRankConfig() {
      this.rankConfig = { ...this.rankConfigDraft }
      this.showRankConfig = false
      this.fetchRankings()
    },

    goToPage(url) {
      uni.navigateTo({ url })
    },

    showCheckin() {
      if (this.actionsList.length === 0) {
        uni.showToast({ title: '请先创建正确的事', icon: 'none' })
        return
      }
      this.showCheckinModal = true
      this.selectedAction = null
      this.checkinResult = null
      this.checkinRemark = ''
    },

    closeCheckin() {
      this.showCheckinModal = false
    },

    onActionSelect(e) {
      this.selectedAction = this.actionsList[e.detail.value]
    },

    async submitCheckin() {
      if (!this.selectedAction || !this.checkinResult) {
        uni.showToast({ title: '请选择正确的事和结果', icon: 'none' })
        return
      }
      try {
        await api.actions.checkin(this.selectedAction.action_id, {
          exec_result: this.checkinResult,
          exec_remark: this.checkinRemark
        })
        uni.showToast({ title: '打卡成功', icon: 'success' })
        this.closeCheckin()
        this.fetchPageData()
      } catch (e) {
        console.error('打卡失败', e)
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/static/variables.scss';

.page-index {
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 200rpx;
  background-color: $bg-color;
}

/* 数据看板 */
.stats-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.stats-board-item {
  background-color: $card-bg;
  border-radius: 12rpx;
  padding: 24rpx 16rpx;
  text-align: center;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.stats-board-label {
  display: block;
  font-size: 22rpx;
  color: $text-light;
  margin-bottom: 8rpx;
}

.stats-board-value {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: $text-color;
  line-height: 1;
  margin-bottom: 8rpx;

  &.negative {
    color: $danger-color;
  }
}

.stats-board-sub {
  display: block;
  font-size: 20rpx;
  color: $text-light;
}

/* 快捷操作区 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.quick-btn {
  background-color: $card-bg;
  border-radius: 12rpx;
  padding: 24rpx 8rpx;
  text-align: center;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);

  .quick-icon {
    display: block;
    font-size: 40rpx;
    margin-bottom: 8rpx;
  }

  .quick-text {
    font-size: 20rpx;
    color: $text-color;
    line-height: 1.3;
  }
}

/* 待办提醒区 */
.todo-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.todo-card {
  display: flex;
  align-items: center;
  background-color: $card-bg;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.todo-content {
  flex: 1;
  font-size: 28rpx;
  color: $text-color;
}

.todo-strong {
  color: $primary-color;
  font-weight: bold;
}

.todo-dismiss {
  font-size: 36rpx;
  color: $text-light;
  padding-left: 20rpx;
}

/* 榜单区 */
.rank-section {
  background-color: $card-bg;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.rank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-color;
}

.rank-config-btn {
  font-size: 24rpx;
  color: $primary-color;
  border: 1rpx solid $primary-color;
  border-radius: 8rpx;
  padding: 6rpx 16rpx;
}

.rank-dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.rank-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: $border-color;

  &.active {
    background-color: $primary-color;
  }
}

.rank-tab-label {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: $primary-color;
  text-align: center;
  margin-bottom: 20rpx;
}

.rank-swiper {
  height: 400rpx;
}

.rank-list {
  display: flex;
  flex-direction: column;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.rank-num {
  width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
  background-color: $bg-color;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: $text-light;
  margin-right: 20rpx;
  flex-shrink: 0;

  &.top3 {
    background-color: $primary-color;
    color: #ffffff;
  }
}

.rank-info {
  flex: 1;
  min-width: 0;

  .rank-name {
    display: block;
    font-size: 28rpx;
    color: $text-color;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rank-category {
    font-size: 22rpx;
    color: $text-light;
  }
}

.rank-stats {
  text-align: right;
  flex-shrink: 0;

  .rank-count {
    display: block;
    font-size: 22rpx;
    color: $text-light;
  }

  .rank-rate {
    font-size: 28rpx;
    font-weight: bold;
    color: $text-light;

    &.high {
      color: $success-color;
    }
  }
}

.rank-empty {
  text-align: center;
  padding: 60rpx 0;
  font-size: 28rpx;
  color: $text-light;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.modal-box {
  width: 100%;
  background-color: $card-bg;
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: $text-color;
  text-align: center;
  margin-bottom: 40rpx;
}

/* 表单 */
.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: $text-light;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  padding: 20rpx 24rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: $text-color;
}

.picker-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: $text-color;

  .picker-arrow {
    color: $text-light;
    font-size: 24rpx;
  }
}

/* 打卡结果按钮 */
.checkin-result-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.checkin-result-btn {
  padding: 30rpx;
  border-radius: 12rpx;
  background-color: $bg-color;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  color: $text-light;
  border: 2rpx solid transparent;

  &.success.active {
    border-color: $success-color;
    background-color: rgba(54, 211, 153, 0.1);
    color: $success-color;
  }

  &.fail.active {
    border-color: $danger-color;
    background-color: rgba(248, 114, 114, 0.1);
    color: $danger-color;
  }
}

/* 弹窗操作按钮 */
.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-top: 40rpx;
}

.btn {
  padding: 28rpx;
  border-radius: 40rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
}

.btn-outline {
  border: 1rpx solid $border-color;
  color: $text-color;
}

.btn-primary {
  background-color: $primary-color;
  color: #ffffff;

  &.disabled {
    opacity: 0.5;
  }
}

/* 加载 */
.loading {
  text-align: center;
  padding: 40rpx;
  color: $text-light;
  font-size: 28rpx;
}
</style>
