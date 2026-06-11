<template>
  <view class="page-index">
    <!-- 模块零：进化旅程 + 智能建议 -->
    <evolution-journey :stages="stages" />
    <smart-suggestion :suggestion="suggestion" @action="onSuggestionAction" />

    <!-- 模块一：数据看板 -->
    <view class="stats-board">
      <view class="stats-board-item" @tap="goToCardLib('behavior', 'action')">
        <text class="stats-board-label">正确的事</text>
        <text class="stats-board-value">{{ stats.action_count || 0 }}</text>
        <text class="stats-board-sub">触发 {{ stats.action_trigger_count || 0 }} 次</text>
      </view>
      <view class="stats-board-item" @tap="goToCardLib('behavior', 'mistake')">
        <text class="stats-board-label">错误的事</text>
        <text class="stats-board-value negative">{{ stats.mistake_count || 0 }}</text>
        <text class="stats-board-sub">红线 {{ stats.mistake_count || 0 }} 条</text>
      </view>
      <view class="stats-board-item" @tap="goToCardLib('law', 'positive')">
        <text class="stats-board-label">正向规律</text>
        <text class="stats-board-value">{{ stats.positive_law_count || 0 }}</text>
        <text class="stats-board-sub">触发 {{ stats.positive_law_trigger_count || 0 }} 次</text>
      </view>
      <view class="stats-board-item" @tap="goToCardLib('law', 'negative')">
        <text class="stats-board-label">负向规律</text>
        <text class="stats-board-value negative">{{ stats.negative_law_count || 0 }}</text>
        <text class="stats-board-sub">触发 {{ stats.negative_law_trigger_count || 0 }} 次</text>
      </view>
    </view>

    <!-- 模块二：快捷操作 -->
    <view class="quick-actions">
      <view class="quick-btn" @tap="goToPage('/pages/card/create?type=action')">
        <view class="quick-icon"><app-icon name="plus" :size="32" color="#162238" /></view>
        <text class="quick-text">正确的事</text>
      </view>
      <view class="quick-btn" @tap="goToPage('/pages/mistake/create')">
        <view class="quick-icon"><app-icon name="ban" :size="32" color="#F87272" /></view>
        <text class="quick-text">错误的事</text>
      </view>
      <view class="quick-btn" @tap="showCheckin">
        <view class="quick-icon"><app-icon name="check" :size="32" color="#36D399" /></view>
        <text class="quick-text">打卡</text>
      </view>
      <view class="quick-btn" @tap="goToPage('/pages/law/create?type=positive')">
        <view class="quick-icon"><app-icon name="trendUp" :size="32" color="#36D399" /></view>
        <text class="quick-text">正向规律</text>
      </view>
      <view class="quick-btn" @tap="goToPage('/pages/law/create?type=negative')">
        <view class="quick-icon"><app-icon name="trendDown" :size="32" color="#F87272" /></view>
        <text class="quick-text">负向规律</text>
      </view>
      <view class="quick-btn" @tap="goToPage('/pages/inspiration/create')">
        <view class="quick-icon"><app-icon name="lightbulb" :size="32" color="#F5A623" /></view>
        <text class="quick-text">灵感捕捉</text>
      </view>
    </view>

    <!-- 模块三：待办提醒（含草稿折叠） -->
    <view class="todo-section" v-if="mergedTodos.length > 0">
      <view
        class="todo-card"
        v-for="todo in mergedTodos"
        :key="todo.key"
        :data-type="todo.type"
      >
        <view class="todo-content" @tap="onTodoTap(todo)">
          <view class="todo-line" v-if="todo.type === 'draft'">
            <app-icon name="alert" :size="20" color="#F5A623" />
            <text>您有 <text class="todo-strong">{{ todo.count }}</text> 条未完成录入（{{ draftLabels(todo.drafts) }}）</text>
            <text class="todo-action">继续填写 →</text>
          </view>
          <view class="todo-line" v-if="todo.type === 'review'">
            <app-icon name="chart" :size="20" color="#162238" />
            <text>您有 <text class="todo-strong">{{ todo.count }}</text> 个正确的事待复盘</text>
          </view>
          <view class="todo-line" v-if="todo.type === 'migrate'">
            <app-icon name="lightbulb" :size="20" color="#F5A623" />
            <text>今日有 <text class="todo-strong">{{ todo.count }}</text> 条迁移推荐</text>
          </view>
          <view class="todo-line" v-if="todo.type === 'overdue'">
            <app-icon name="clock" :size="20" color="#F87272" />
            <text><text class="todo-strong">{{ todo.action_name }}</text> 已 {{ todo.days }} 天未执行</text>
          </view>
        </view>
        <view class="todo-dismiss" @tap.stop="onTodoDismiss(todo)">×</view>
      </view>
    </view>

    <!-- 模块四：榜单 -->
    <rank-section :categories="categories" />

    <!-- 打卡弹窗（保留） -->
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
            <view class="checkin-result-btn success" :class="{ active: checkinResult === 1 }" @tap="checkinResult = 1">
              <app-icon name="check" :size="20" :color="checkinResult === 1 ? '#36D399' : '#9CA3AF'" />
              <text class="result-label">成功</text>
            </view>
            <view class="checkin-result-btn fail" :class="{ active: checkinResult === 2 }" @tap="checkinResult = 2">
              <app-icon name="x" :size="20" :color="checkinResult === 2 ? '#F87272' : '#9CA3AF'" />
              <text class="result-label">失败</text>
            </view>
          </view>
        </view>
        <view class="form-group">
          <text class="form-label">备注（选填）</text>
          <input class="form-input" v-model="checkinRemark" placeholder="最多200字" maxlength="200" />
        </view>
        <view class="modal-actions">
          <view class="btn btn-outline" @tap="closeCheckin">取消</view>
          <view class="btn btn-primary" :class="{ disabled: !selectedAction || !checkinResult }" @tap="submitCheckin">确认打卡</view>
        </view>
      </view>
    </view>

    <view class="loading" v-if="loading"><text>加载中...</text></view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import negativeWarning from '@/mixins/negativeWarning.js'
import AppIcon from '@/components/icon.vue'
import EvolutionJourney from '@/components/EvolutionJourney.vue'
import SmartSuggestion from '@/components/SmartSuggestion.vue'
import RankSection from '@/components/RankSection.vue'
import { buildDraftTodo, clearDrafts } from '@/utils/drafts.js'

export default {
  mixins: [negativeWarning],
  components: { AppIcon, EvolutionJourney, SmartSuggestion, RankSection },
  data() {
    return {
      loading: false,
      stats: {},
      todos: [],
      draftTodo: null,
      stages: [],
      suggestion: null,
      categories: [],
      actionsList: [],
      showCheckinModal: false,
      selectedAction: null,
      checkinResult: null,
      checkinRemark: ''
    }
  },
  computed: {
    mergedTodos() {
      return this.draftTodo ? [this.draftTodo, ...this.todos] : this.todos
    }
  },
  onLoad() { this.initData() },
  onShow() { this.fetchPageData() },
  onPullDownRefresh() {
    this.fetchPageData()
    uni.stopPullDownRefresh()
  },
  methods: {
    async initData() {
      try {
        const [actionsRes, catsRes] = await Promise.all([
          api.actions.list({ status: 0, page_size: 100 }),
          api.categories.list()
        ])
        this.actionsList = actionsRes.data.list || actionsRes.data || []
        this.categories = catsRes.data || []
      } catch (e) {
        console.error('初始化失败', e)
      }
    },
    async fetchPageData() {
      this.loading = true
      try {
        const [statsRes, todosRes, stagesRes, sugRes] = await Promise.all([
          api.stats.dashboard(),
          api.stats.todos(),
          api.evolution.progress(),
          api.suggestions.smart()
        ])
        this.stats = statsRes.data || {}
        this.todos = todosRes.data || []
        this.stages = stagesRes.data || []
        this.suggestion = sugRes.data || null
        this.draftTodo = buildDraftTodo()
      } catch (e) {
        console.error('获取首页数据失败', e)
      } finally {
        this.loading = false
      }
    },
    draftLabels(drafts) {
      return (drafts || []).map(d => d.label).join('、')
    },
    onTodoTap(todo) {
      if (todo.type === 'draft') {
        const first = (todo.drafts || [])[0]
        if (first && first.route) uni.navigateTo({ url: first.route })
      } else if (todo.type === 'review') {
        uni.switchTab({ url: '/pages/review/index' })
      } else if (todo.type === 'migrate') {
        uni.switchTab({ url: '/pages/card/index' })
      } else if (todo.type === 'overdue') {
        uni.navigateTo({ url: `/pages/card/detail?id=${todo.action_id}` })
      }
    },
    async onTodoDismiss(todo) {
      if (todo.type === 'draft') {
        clearDrafts()
        this.draftTodo = null
        return
      }
      try {
        await api.stats.dismissTodo({ key: todo.key })
        this.todos = this.todos.filter(t => t.key !== todo.key)
      } catch (e) { console.error('清除待办失败', e) }
    },
    onSuggestionAction(action) {
      if (action === 'create_action') uni.navigateTo({ url: '/pages/card/create?type=action' })
      else if (action === 'checkin') this.showCheckin()
      else if (action === 'create_law') uni.navigateTo({ url: '/pages/law/create?type=positive' })
      else if (action === 'go_sop') uni.switchTab({ url: '/pages/sop/index' })
      else if (action === 'go_review') uni.switchTab({ url: '/pages/review/index' })
    },
    goToPage(url) { uni.navigateTo({ url }) },
    goToCardLib(primaryTab, subTab) {
      uni.setStorageSync('cardlib:pending-tab', { primaryTab, subTab: subTab || null, ts: Date.now() })
      uni.switchTab({ url: '/pages/card/index' })
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
    closeCheckin() { this.showCheckinModal = false },
    onActionSelect(e) { this.selectedAction = this.actionsList[e.detail.value] },
    async submitCheckin() {
      if (!this.selectedAction || !this.checkinResult) {
        uni.showToast({ title: '请选择正确的事和结果', icon: 'none' })
        return
      }
      this.checkNegativeWarning(this.selectedAction.category_id, () => this.doCheckin())
    },
    async doCheckin() {
      try {
        await api.actions.checkin(this.selectedAction.action_id, {
          exec_result: this.checkinResult,
          exec_remark: this.checkinRemark
        })
        uni.showToast({ title: '打卡成功', icon: 'success' })
        this.closeCheckin()
        this.fetchPageData()
      } catch (e) { console.error('打卡失败', e) }
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
  grid-template-columns: repeat(2, 1fr);
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
.stats-board-label { display: block; font-size: 22rpx; color: $text-light; margin-bottom: 8rpx; }
.stats-board-value {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: $text-color;
  line-height: 1;
  margin-bottom: 8rpx;
  &.negative { color: $danger-color; }
}
.stats-board-sub { display: block; font-size: 20rpx; color: $text-light; }

/* 快捷操作区 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-bottom: 30rpx;
}
.quick-btn {
  background-color: $card-bg;
  border-radius: 12rpx;
  padding: 24rpx 8rpx;
  text-align: center;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
  .quick-icon { display: block; font-size: 40rpx; margin-bottom: 8rpx; }
  .quick-text { font-size: 20rpx; color: $text-color; line-height: 1.3; }
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
  border-left: 6rpx solid $danger-color;
}
.todo-card[data-type="draft"] { border-left-color: $accent-color; }
.todo-content { flex: 1; font-size: 28rpx; color: $text-color; }
.todo-line { display: flex; align-items: center; gap: 12rpx; flex-wrap: wrap; }
.todo-strong { color: $primary-color; font-weight: bold; }
.todo-action { font-size: 22rpx; color: $accent-color; font-weight: 600; margin-left: 8rpx; }
.todo-dismiss { font-size: 36rpx; color: $text-light; padding-left: 20rpx; }

/* 弹窗 */
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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
.form-group { margin-bottom: 30rpx; }
.form-label { display: block; font-size: 26rpx; color: $text-light; margin-bottom: 12rpx; }
.form-input {
  width: 100%; padding: 20rpx 24rpx;
  background-color: $bg-color; border-radius: 12rpx;
  font-size: 28rpx; color: $text-color;
}
.picker-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20rpx 24rpx;
  background-color: $bg-color; border-radius: 12rpx;
  font-size: 28rpx; color: $text-color;
  .picker-arrow { color: $text-light; font-size: 24rpx; }
}
.checkin-result-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx; }
.checkin-result-btn {
  padding: 30rpx; border-radius: 12rpx;
  background-color: $bg-color; text-align: center;
  font-size: 30rpx; font-weight: 600; color: $text-light;
  border: 2rpx solid transparent;
  display: flex; align-items: center; justify-content: center; gap: 12rpx;
  .result-label { font-size: 30rpx; }
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
.modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx; margin-top: 40rpx; }
.btn { padding: 28rpx; border-radius: 40rpx; text-align: center; font-size: 30rpx; font-weight: 600; }
.btn-outline { border: 1rpx solid $border-color; color: $text-color; }
.btn-primary { background-color: $primary-color; color: #ffffff; &.disabled { opacity: 0.5; } }
.loading { text-align: center; padding: 40rpx; color: $text-light; font-size: 28rpx; }
</style>

