## Tasks

### Phase 1: 共享工具

- [x] 1.1 [双端] 抽 `utils/privacy.js`：`getLockEnabled` / `getSensitiveHidden` / `getLockState` 等读 storage 工具
- [x] 1.2 [H5] `crypto.subtle` 实现 `hashPin(pin, salt)` 与 `generateSalt()`（采用纯 JS SHA-256，避免引入依赖且双端共用）
- [x] 1.3 [MP] 引入 `crypto-js` 或自实现 SHA-256；用 `wx.getRandomValues` 生成 salt（采用纯 JS SHA-256，与 H5 共享 `privacy-core.js`）
- [x] 1.4 [双端] 公共事件名约定 `privacy-changed`

### Phase 2: 个人中心 PrivacySection

- [x] 2.1 [H5] `ProfilePage.jsx` 增加 `PrivacySection` 组件
- [x] 2.2 [H5] 实现 `PinModal` 组件（mode = set/change/disable）
- [x] 2.3 [H5] 数字 9 宫格键盘组件 `PinKeypad`
- [x] 2.4 [H5] 6 位 dot indicator 组件
- [x] 2.5 [MP] `pages/profile/index.vue` 增加同款 PrivacySection
- [x] 2.6 [MP] `components/pin-modal.vue` + `components/pin-keypad.vue`
- [x] 2.7 [双端] 切换开关后 dispatch `privacy-changed` 事件

### Phase 3: 锁屏拦截

- [x] 3.1 [H5] `src/components/LockScreen.jsx` 实现锁屏页（含错误次数 + 60s 锁定）
- [x] 3.2 [H5] `App.jsx` 顶层根据 `lockEnabled` 包裹 LockScreen
- [x] 3.3 [H5] 解锁后写入会话 sessionStorage 标记
- [x] 3.4 [MP] `pages/lock/index.vue` 实现锁屏页
- [x] 3.5 [MP] `App.vue` `onLaunch` 判断后 `uni.reLaunch` 锁屏页
- [x] 3.6 [MP] 解锁后 `globalData.unlocked = true` + reLaunch 首页
- [x] 3.7 [MP] pages.json 注册 lock 页面（隐藏不在 tabBar）

### Phase 4: 敏感内容隐藏

- [x] 4.1 [H5] `src/hooks/useSensitivePrivacy.js`
- [x] 4.2 [H5] cardlib 卡片接入 hook（灵感卡片标题即 desc 原文）
- [x] 4.3 [H5] 灵感 desc 区域接入 hook（cardlib 列表 + InspirationDetailPanel）
- [x] 4.4 [H5] 详情页 remark / desc 接入（ActionDetailPanel.exec_remark / MistakeDetailPanel.remark / LawDetailPanel.law_desc / InspirationDetailPanel.desc）
- [x] 4.5 [H5] 复盘历史快照备注接入（ReviewPage.review_summary）
- [x] 4.6 [MP] `mixins/sensitive.js`
- [x] 4.7 [MP] cardlib 卡片接入 mixin（pages/card/index.vue 灵感标题）
- [x] 4.8 [MP] 灵感 / 详情 / 复盘备注接入 mixin（card/detail.vue exec_remark + 关联 law_desc / law/detail.vue law_desc + verify_remark / review/detail.vue good_parts + improve_parts）
- [x] 4.9 [双端] mask 样式一致（灰色背景 + 「点击查看」文案，H5 写在 App.css，小程序写在 App.vue 全局）

### Phase 5: 忘记密码兜底

- [x] 5.1 [双端] 锁屏页底部「忘记密码」二级入口（LockScreen.jsx / pages/lock/index.vue）
- [x] 5.2 [双端] 二次确认对话框「将清空所有本地数据，是否继续？」（H5 用 `confirm()`，小程序用 `uni.showModal`）
- [x] 5.3 [双端] 确认后调 `clearAllAppData()` + `clearPin()` + 进首页

### Phase 6: 验证

- [x] 6.1 [H5] `npm run build` 通过（vite build 1.08s，60.39kB CSS / 288.52kB JS）
- [~] 6.2 [H5] dev server 跑五种流程：设置 / 修改 / 关闭 / 错误锁定 / 忘记密码（需用户在浏览器手测）
- [~] 6.3 [H5] 敏感隐藏开关切换 + reveal 单条（需用户在浏览器手测）
- [~] 6.4 [MP] HBuilderX 编译通过（开发环境无 node_modules，需用户在 HBuilderX 中编译）
- [~] 6.5 [MP] 微信开发者工具同样跑五种流程（需用户在小程序工具中手测）
- [~] 6.6 [双端] 双端 UI 截图对照一致（需用户手测对照）

> [~] 项需要用户在带 GUI 的环境中手动验证。代码层面双端 API、状态机、UI 结构均已对齐。

## 依赖关系

- Phase 1 是 Phase 2/3/4 的前置
- Phase 2/3/4 可并行
- Phase 5/6 在最后

## 估算

- Phase 1: 0.5 天
- Phase 2: 1 天
- Phase 3: 1 天
- Phase 4: 0.5 天
- Phase 5: 0.25 天
- Phase 6: 0.5 天

合计约 3.75 天双端工作量。
