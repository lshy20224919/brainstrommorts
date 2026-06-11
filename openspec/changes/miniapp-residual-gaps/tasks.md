## Tasks

### Phase 1: 灵感 direction 数据契约（最高优先级）

- [x] 1.1 [MP] `client/src/utils/api.js` mock：`createInspiration` / `updateInspiration` 接受 direction  *(mock create/update 已 spread data)*
- [x] 1.2 [MP] mock 种子数据补 direction 字段
- [x] 1.3 [MP] `client/src/utils/migrations.js` 实现 `migrateInspirationsV2` 老数据回填
- [x] 1.4 [MP] App.vue `onLaunch` 跑迁移
- [x] 1.5 [MP] `pages/inspiration/create.vue` 增加方向 pill 选择 + 必填校验
- [x] 1.6 [MP] 灵感"修改方向"通过 card/index actionsheet 提供（无独立编辑页）
- [x] 1.7 [MP] 灵感卡片 `_badge` 显示「正向/负向」
- [x] 1.8 [MP] `_direction_inferred=true` 显示「待确认方向」徽章
- [x] 1.9 [MP] 编辑后 `_direction_inferred:false` 清除标记
- [x] 1.10 [双端] 字段命名/取值（'positive'/'negative'）与 H5 一致

### Phase 2: 深色模式三档

- [x] 2.1 [MP] `pages/profile/index.vue` 替换布尔 switch 为三档 segment
- [x] 2.2 [MP] storage key 从 `darkMode` 改为 `theme`，值集合 `light|dark|auto`（兼容回填老 key）
- [x] 2.3 [MP] App.vue `onLaunch` 调 `applyTheme()` 初始化
- [x] 2.4 [MP] `auto` 模式下 `uni.onThemeChange` 监听
- [x] 2.5 [MP] `uni.setNavigationBarColor` 同步导航栏色
- [~] 2.6 [MP] 全局 SCSS 变量切换适配  *(已通过 .dark class + variables.scss 双模式适配)*
- [x] 2.7 [双端] H5 与小程序展示一致

### Phase 3: 移除「退出登录」

- [x] 3.1 [MP] `pages/profile/index.vue` 删除「退出登录」按钮 + logout method
- [x] 3.2 [MP] grep 全局确认无其他位置展示该入口（仅 store/index.js 保留 action 但无引用）
- [x] 3.3 [MP] 保留 `pages/login/index.vue` 但确认未被引用（仅 pages.json 注册）

### Phase 4: SVG 图标接入

- [x] 4.1 [MP] 11 个 lucide SVG 内联在 icon.vue 组件
- [x] 4.2 [MP] 创建 `client/src/components/icon.vue` 通用组件（base64 SVG → image src）
- [x] 4.3 [MP] `pages/index/index.vue` 快捷操作 emoji 替换为 `<app-icon>`
- [x] 4.4 [MP] `pages/index/index.vue` 待办提醒 emoji 替换
- [x] 4.5 [MP] `pages/law/create.vue` 类型 emoji ✅⚠️ 替换
- [~] 4.6 [MP] `pages/mistake/create.vue` 已无 emoji（无需替换）
- [x] 4.7 [MP] `pages/card/index.vue` 空状态 emoji 替换
- [x] 4.8 [MP] 分类默认图标改 `◇`（与 H5 一致）
- [~] 4.9 [双端] 双端截图对照检查图标视觉一致  *(待环境就绪后人工验证)*

### Phase 5: 排版细节

- [x] 5.1 [MP] `pages/card/index.vue` filter-bar 改 nowrap 单行（item flex-shrink:0）
- [x] 5.2 [MP] `overflow-x:auto` 支持长内容横向滚动
- [x] 5.3 [MP] `static/variables.scss` 增加 `$accent-color`（已有 `$danger-color`）
- [x] 5.4 [MP] sub-tab pill 选中色改用变量（$positive-color / $negative-color）
- [~] 5.5 [MP] 其他列表页 filter-bar 同步整改  *(其他页面无 filter-bar，跳过)*

### Phase 6: 编译与回归

- [~] 6.1 [MP] HBuilderX 编译微信小程序  *(跳过：node_modules 未安装)*
- [~] 6.2 [MP] 微信开发者工具：模拟器深色模式切换主题  *(待环境就绪后人工验证)*
- [~] 6.3 [MP] 微信开发者工具：创建灵感必填方向  *(待环境就绪后人工验证)*
- [~] 6.4 [MP] 老数据 `_direction_inferred` 角标显示与清除  *(待环境就绪后人工验证)*
- [~] 6.5 [双端] 视觉走查：双端首页 / 卡片库 / 个人中心截图对比  *(待环境就绪后人工验证)*

## 依赖关系

- Phase 1 是数据契约级，最优先
- Phase 4（SVG）可与 Phase 1/2/3 并行
- Phase 5 可并行
- Phase 6 在最后

## 估算

- Phase 1: 1 天
- Phase 2: 0.5 天
- Phase 3: 0.1 天
- Phase 4: 1 天
- Phase 5: 0.4 天
- Phase 6: 0.5 天

合计约 3.5 天小程序工作量。
