<template>
  <view class="page-profile">
    <!-- 用户信息 -->
    <view class="user-info">
      <view class="user-avatar">
        <text class="avatar-text">{{ userInitial }}</text>
      </view>
      <view class="user-detail">
        <text class="user-name">方法论进化者</text>
        <text class="user-date">使用 {{ useDays }} 天</text>
      </view>
    </view>

    <!-- 设置列表 -->
    <view class="settings-group">
      <view class="settings-title">通用设置</view>
      
      <view class="settings-item" @tap="toggleSmartMigrate">
        <text class="settings-label">智能迁移推荐</text>
        <switch :checked="settings.smart_migrate_on" @change="onSmartMigrateChange" />
      </view>
      
      <view class="settings-item" @tap="toggleWarningPopup">
        <text class="settings-label">负向避雷提醒</text>
        <switch :checked="settings.warning_popup_on" @change="onWarningPopupChange" />
      </view>
      
      <view class="settings-item theme-item">
        <text class="settings-label">深色模式</text>
        <view class="theme-segment">
          <view
            v-for="opt in themeOptions"
            :key="opt.value"
            class="theme-seg-btn"
            :class="{ active: theme === opt.value }"
            @tap="setTheme(opt.value)"
          >{{ opt.label }}</view>
        </view>
      </view>
    </view>

    <view class="settings-group">
      <view class="settings-title">隐私设置</view>

      <view class="settings-item">
        <text class="settings-label">解锁密码</text>
        <view class="privacy-row-actions">
          <view v-if="lockEnabled" class="privacy-edit-btn" @tap="onChangePin">修改</view>
          <switch :checked="lockEnabled" @change="onLockToggle" />
        </view>
      </view>

      <view class="settings-item">
        <text class="settings-label">敏感内容隐藏</text>
        <switch :checked="sensitiveHidden" @change="onSensitiveToggle" />
      </view>

      <view class="settings-hint">本地软隐私：数据不上传，可阻止他人快速翻看。忘记密码将清空全部本地数据。</view>
    </view>

    <view class="settings-group">
      <view class="settings-title">分类管理</view>
      
      <view class="settings-item" @tap="goToCategories">
        <text class="settings-label">分类设置</text>
        <text class="settings-arrow">›</text>
      </view>
    </view>

    <view class="settings-group">
      <view class="settings-title">数据管理</view>
      
      <view class="settings-item" @tap="doBackup">
        <text class="settings-label">云端备份</text>
        <text class="settings-arrow">›</text>
      </view>
      
      <view class="settings-item" @tap="doRestore">
        <text class="settings-label">数据还原</text>
        <text class="settings-arrow">›</text>
      </view>
      
      <view class="settings-item" @tap="showDataStats">
        <text class="settings-label">数据统计</text>
        <text class="settings-value">{{ dataStats.total }}条记录</text>
      </view>
    </view>

    <view class="settings-group">
      <view class="settings-title">关于</view>
      
      <view class="settings-item">
        <text class="settings-label">版本</text>
        <text class="settings-value">v1.0.0</text>
      </view>
    </view>

    <!-- 退出登录已移除：本应用仅本地存储，无需账号 -->
    <pin-modal :visible="!!pinMode" :mode="pinMode || 'set'" @close="pinMode = null" @success="onPinSuccess" />
  </view>
</template>

<script>
import api from '@/utils/api.js'
import PinModal from '@/components/pin-modal.vue'
import { getLockEnabled, getSensitiveHidden, setSensitiveHidden, onPrivacyChange } from '@/utils/privacy.js'

export default {
  components: { PinModal },
  data() {
    return {
      settings: {
        smart_migrate_on: true,
        warning_popup_on: true
      },
      theme: 'light',
      themeOptions: [
        { value: 'light', label: '浅色' },
        { value: 'dark', label: '深色' },
        { value: 'auto', label: '跟随系统' }
      ],
      useDays: 1,
      dataStats: {
        total: 0
      },
      lockEnabled: false,
      sensitiveHidden: false,
      pinMode: null,
      _privacyOff: null
    }
  },
  
  computed: {
    userInitial() {
      return '我'
    }
  },
  
  onLoad() {
    this.fetchSettings()
    this.fetchDataStats()
    this.lockEnabled = getLockEnabled()
    this.sensitiveHidden = getSensitiveHidden()
    this._privacyOff = onPrivacyChange(() => {
      this.lockEnabled = getLockEnabled()
      this.sensitiveHidden = getSensitiveHidden()
    })
  },

  onUnload() {
    if (this._privacyOff) this._privacyOff()
  },
  
  methods: {
    async fetchSettings() {
      try {
        const res = await api.auth.getSettings()
        this.settings = res.data || this.settings
        this.theme = uni.getStorageSync('theme') || 'light'
      } catch (e) {
        console.error('获取设置失败', e)
      }
    },
    
    async fetchDataStats() {
      try {
        const res = await api.stats.dashboard()
        this.dataStats.total = (res.data.total_actions || 0) + (res.data.negative_law_count || 0)
      } catch (e) {
        console.error('获取数据统计失败', e)
      }
    },
    
    async onSmartMigrateChange(e) {
      this.settings.smart_migrate_on = e.detail.value
      await this.updateSettings()
    },
    
    async onWarningPopupChange(e) {
      this.settings.warning_popup_on = e.detail.value
      await this.updateSettings()
    },
    
    setTheme(value) {
      if (value === this.theme) return
      this.theme = value
      uni.setStorageSync('theme', value)
      const isDark = value === 'dark' || (value === 'auto' && this.getSystemTheme())
      this.$store.commit('SET_DARK_MODE', isDark)
      try {
        uni.setNavigationBarColor({
          frontColor: isDark ? '#ffffff' : '#000000',
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff'
        })
      } catch (e) {}
    },

    getSystemTheme() {
      try {
        const sysInfo = uni.getSystemInfoSync()
        return sysInfo.theme === 'dark'
      } catch (e) { return false }
    },
    
    async updateSettings() {
      try {
        await api.auth.updateSettings(this.settings)
        uni.showToast({ title: '设置已更新', icon: 'success' })
      } catch (e) {
        console.error('更新设置失败', e)
      }
    },
    
    goToCategories() {
      uni.navigateTo({ url: '/pages/profile/categories' })
    },
    
    async doBackup() {
      uni.showModal({
        title: '确认备份',
        content: '是否将本地数据加密备份到云端？',
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '备份中...' })
            try {
              const result = await api.storage.backup()
              uni.hideLoading()
              uni.showToast({ title: '备份成功', icon: 'success' })
            } catch (e) {
              uni.hideLoading()
              console.error('备份失败', e)
            }
          }
        }
      })
    },
    
    doRestore() {
      uni.showModal({
        title: '数据还原',
        content: '还原将覆盖当前数据，是否继续？',
        success: (res) => {
          if (res.confirm) {
            // TODO: 实现文件选择和还原
            uni.showToast({ title: '请选择备份文件', icon: 'none' })
          }
        }
      })
    },
    
    showDataStats() {
      uni.showModal({
        title: '数据统计',
        content: `总动作数: ${this.dataStats.total}\n数据将持续积累，方法论越用越强大`,
        showCancel: false
      })
    },

    onLockToggle(e) {
      this.pinMode = e.detail.value ? 'set' : 'disable'
    },
    onChangePin() { this.pinMode = 'change' },
    onSensitiveToggle(e) { setSensitiveHidden(e.detail.value) },
    onPinSuccess(msg) { uni.showToast({ title: msg, icon: 'success' }) }
  }
}
</script>

<style lang="scss">
@import '@/static/variables.scss';

.page-profile {
  min-height: 100vh;
  background-color: $bg-color;
  padding: 24rpx;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  background-color: $primary-color;
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  
  .avatar-text {
    font-size: 48rpx;
    color: #ffffff;
    font-weight: bold;
  }
}

.user-detail {
  .user-name {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 8rpx;
  }
  
  .user-date {
    font-size: 26rpx;
    color: $text-light;
  }
}

/* 设置分组 */
.settings-group {
  background-color: $card-bg;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
}

.settings-title {
  padding: 24rpx 30rpx 12rpx;
  font-size: 24rpx;
  color: $text-light;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 30rpx;
  border-bottom: 1px solid $border-color;
  
  &:last-child {
    border-bottom: none;
  }
  
  .settings-label {
    font-size: 30rpx;
    color: $text-color;
  }
  
  .settings-arrow {
    font-size: 36rpx;
    color: $text-light;
  }
  
  .settings-value {
    font-size: 26rpx;
    color: $text-light;
  }
}

/* 三档主题 segment */
.theme-segment {
  display: flex;
  background-color: $bg-color;
  border-radius: 12rpx;
  overflow: hidden;
}

.theme-seg-btn {
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  color: $text-light;

  &.active {
    background-color: $primary-color;
    color: #ffffff;
  }
}

/* 退出登录已移除 */

.privacy-row-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.privacy-edit-btn {
  font-size: 24rpx;
  color: $primary-color;
  border: 1rpx solid $primary-color;
  border-radius: 8rpx;
  padding: 4rpx 16rpx;
}
.settings-hint {
  font-size: 22rpx;
  color: $text-light;
  padding: 16rpx 30rpx 24rpx;
  line-height: 1.5;
}
</style>
