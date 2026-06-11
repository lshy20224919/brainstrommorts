## inspirations.direction 数据迁移

### 字段规格

```typescript
// 与 H5 mock 完全一致
type Inspiration = {
  id: number,
  desc: string,
  source: '书籍' | '视频' | '聊天' | '播客' | '文章' | '自己想到的',
  category_id: number,
  direction: 1 | 2,         // 1=正向, 2=负向，必填
  status: 0 | 1 | 2,
  create_time: string
}
```

### 老数据迁移

由于小程序当前未存 direction，所有现存灵感都视为「未设置」。

策略：

```javascript
// utils/migrations.js
export function migrateInspirationsV2(inspirations) {
  return inspirations.map(i =>
    i.direction
      ? i
      : { ...i, direction: 1, _direction_inferred: true }  // 默认正向，标记
  )
}
```

`pages/card/index.vue` 灵感 Tab 渲染时，对 `_direction_inferred=true` 的项加角标「待确认方向」，点击进编辑页确认后清除标记。

### UI 变更

`pages/inspiration/create.vue`：

```vue
<view class="form-group">
  <text class="label">方向 *</text>
  <view class="direction-picker">
    <view
      class="direction-pill"
      :class="{ active: form.direction === 1, positive: form.direction === 1 }"
      @tap="form.direction = 1"
    >
      <icon name="trending-up" />正向
    </view>
    <view
      class="direction-pill"
      :class="{ active: form.direction === 2, negative: form.direction === 2 }"
      @tap="form.direction = 2"
    >
      <icon name="trending-down" />负向
    </view>
  </view>
</view>
```

提交校验：`if (!form.direction) { uni.showToast({ title: '请选择方向', icon: 'none' }); return }`

## 深色模式三档

### Settings 存储

```javascript
// 配置项
uni.setStorageSync('theme', 'light' | 'dark' | 'auto')

// 应用
function applyTheme() {
  const theme = uni.getStorageSync('theme') || 'auto'
  const actual = theme === 'auto'
    ? uni.getSystemInfoSync().theme  // 'light' | 'dark'
    : theme
  // 触发全局 CSS 变量切换（H5 与小程序处理方式略不同）
}

// 监听系统主题（auto 模式才生效）
uni.onThemeChange(({ theme }) => {
  if (uni.getStorageSync('theme') === 'auto') {
    applyActualTheme(theme)
  }
})
```

### UI

```vue
<view class="form-group">
  <text class="label">主题</text>
  <view class="segment">
    <view :class="{ active: theme === 'light' }" @tap="setTheme('light')">浅色</view>
    <view :class="{ active: theme === 'dark' }"  @tap="setTheme('dark')">深色</view>
    <view :class="{ active: theme === 'auto' }"  @tap="setTheme('auto')">跟随系统</view>
  </view>
</view>
```

### CSS 变量切换机制

小程序 page-meta + scoped CSS 较弱，建议：

- 用 `uni.setNavigationBarColor` 同步导航栏色
- 全局 SCSS 用 `$bg-color`、`$text-color`、`$card-bg`，每个文件读全局变量
- App.vue 在 `onLaunch` 注入主题 class 到根 view（uni-app 不直接支持，可通过 globalData + 重渲染）

## SVG 图标接入

### 资源准备

从 `lucide-static` npm 包提取所需 SVG 文件，放入 `client/src/static/icons/`：

```
client/src/static/icons/
  circle-plus.svg
  shield-x.svg
  circle-check.svg
  trending-up.svg
  trending-down.svg
  sparkles.svg
  clipboard-list.svg
  clock.svg
  alert-triangle.svg
  inbox.svg
  bar-chart.svg
```

### 通用图标组件

`client/src/components/icon.vue`：

```vue
<template>
  <image
    :src="iconPath"
    :style="{ width: size + 'rpx', height: size + 'rpx' }"
    mode="aspectFit"
  />
</template>

<script>
export default {
  props: {
    name: String,
    size: { type: [Number, String], default: 28 }
  },
  computed: {
    iconPath() {
      return `/static/icons/${this.name}.svg`
    }
  }
}
</script>
```

使用：`<icon name="circle-plus" :size="32" />`

### 图标尺寸映射

| H5 lucide size | 小程序 icon size (rpx) |
|----------------|-----------------------|
| 14             | 28 rpx                |
| 16             | 32 rpx                |
| 20             | 40 rpx                |
| 24             | 48 rpx                |

## 「退出登录」处理

```vue
<!-- 删除 -->
<button class="logout-btn" @tap="logout">退出登录</button>
```

```javascript
// 删除
methods: { logout() { ... } }
```

如本 change 实施前小程序还有 token 检查中间件等账号相关代码，本 change 不动它们（避免范围扩散），仅去掉用户可见入口。账号体系完整剥离单独开 change。

## filter-bar 横向

`pages/card/index.vue` 与其他列表页：

```scss
.filter-bar {
  display: flex;
  flex-direction: row;     // 改为横向
  gap: 16rpx;
  flex-wrap: nowrap;
  overflow-x: auto;        // 长内容横向滚动
}

.filter-item {
  flex-shrink: 0;          // 不压缩
}
```

## sub-tab pill 颜色变量化

`client/src/static/variables.scss` 增加：

```scss
$accent-color: #36D399;    // 与 H5 --accent 一致
$danger-color: #F87272;    // 与 H5 --danger 一致
```

页面：

```scss
.sub-tab-pill.active {
  background: $accent-color;     // 而非硬编码
}
.sub-tab-pill.danger.active {
  background: $danger-color;
}
```

## 验证

- [ ] 灵感创建必须选方向才能提交
- [ ] 老数据带 `_direction_inferred` 角标，编辑后消失
- [ ] 三档主题切换实时生效
- [ ] 跟随系统模式：模拟器切换深色模式后小程序跟随
- [ ] 个人中心无「退出登录」按钮
- [ ] 所有原 emoji 位置由 SVG 图标渲染
- [ ] 图标视觉与 H5 lucide 保持一对一
- [ ] cardlib filter-bar 单行横向
- [ ] sub-tab 选中色为 #36D399 / #F87272
