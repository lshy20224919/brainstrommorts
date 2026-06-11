## Tasks

每条任务标注实施位置：[H5] / [MP=小程序] / [双端]。

### Phase 1: API/Mock 契约对齐

- [x] 1.1 [H5] mock.js 实现 `createReview` 支持 day/week/month/custom 四档  *(已支持任意 cycle 字符串，无需改)*
- [x] 1.2 [H5] mock.js 实现 `submitReviewIteration`（落 review_iteration_records）  *(已存在)*
- [x] 1.3 [H5] mock.js 实现 `getRetiredItems` / `restoreItem` / `permanentDeleteItem`
- [x] 1.4 [MP] `client/src/utils/api.js` 补 `reviews.retiredItems` / `reviews.restoreItem` / `reviews.permanentDeleteItem` + mock 实现
- [x] 1.5 [双端] mock 与字段命名对齐（H5 status==2、MP is_archived/is_retired/status==2，但返回结构统一）

### Phase 2: 复盘新建（双端）

- [x] 2.1 [H5] `ReviewCreateModal` 周期 pill 增加「日」「自定义」两档
- [x] 2.2 [H5] 自定义档显示起止日期 picker，默认 7 天前-今天
- [x] 2.3 [H5] 周期切换时按规则填充默认起止时间
- [~] 2.4 [H5] 新建判定页面 `ReviewIterationPage`：列表 + 四档 radio + 备注 + 提交  *(已存在，本次不动)*
- [~] 2.5 [H5] 提交后跳转复盘详情页，刷新历史列表  *(已存在)*
- [x] 2.6 [MP] `pages/review/index.vue` 周期 pill 增加「自定义」（已有 day/week/month）
- [x] 2.7 [MP] 自定义档显示起止 picker；非自定义显示只读 hint
- [x] 2.8 [MP] 周期切换时 `applyCycleDefaults` 按规则填充
- [~] 2.9 [MP] 新建判定页面 `pages/review/iteration.vue` 注册路由  *(后续 change：现有 detail.vue 已可承载迭代)*
- [x] 2.10 [MP] 提交后 `uni.navigateTo` 详情页

### Phase 3: 淘汰库（双端）

- [x] 3.1 [H5] `ReviewPage` 增加 `RetiredSection` 组件（默认 5 条 + 「查看全部 ›」）
- [x] 3.2 [H5] 还原确认对话框 + 调 API
- [x] 3.3 [H5] 永久删除双重确认对话框 + 调 API
- [x] 3.4 [H5] 新增 `RetiredFullPage` 内联视图，三 Tab + 全部 Tab
- [x] 3.5 [MP] `pages/review/index.vue` 「淘汰库」section 接通新 API
- [x] 3.6 [MP] 还原 / 永久删除使用 `uni.showModal` 双重确认
- [x] 3.7 [MP] 新增 `pages/review/retired.vue` 三 Tab + 全部 Tab，注册 pages.json

### Phase 4: 避雷弹窗对齐（双端）

- [~] 4.1 [H5] `CreateActionModal` 已有 `api.checkNegativeLaws` + 内嵌警告 UI
- [~] 4.2 [H5] 抽离 `useNegativeWarning(categoryId)` hook  *(可选优化，本次不动)*
- [~] 4.3 [H5] CheckinModal / CreateMistakeModal 已有避雷
- [x] 4.4 [MP] `pages/card/create.vue` 提交前调避雷
- [x] 4.5 [MP] `pages/mistake/create.vue` 同上
- [x] 4.6 [MP] 首页 Quick Checkin 同上
- [x] 4.7 [MP] 抽离 `mixins/negativeWarning.js`
- [x] 4.8 [双端] H5 用 `recordPopup` 24h 去重；MP `mock_popup_log` storage 24h 去重

### Phase 5: 数据看板跳转（小程序补齐）

- [x] 5.1 [MP] `pages/index/index.vue` 四个 stat 项绑定 tap
- [x] 5.2 [MP] tap 时 `uni.setStorageSync('cardlib:pending-tab', { primaryTab, subTab })` + `uni.switchTab`
- [x] 5.3 [MP] `pages/card/index.vue` `onShow` 读 storage，应用后 remove
- [~] 5.4 [MP] 验证四个数字分别跳到正确 sub-tab  *(待环境就绪后人工验证)*

### Phase 6: 验证 & 清理

- [x] 6.1 [H5] `npm run build` 通过（278 KB JS / 59 KB CSS）
- [x] 6.2 [H5] `npm test` 通过（2 files / 32 tests）
- [~] 6.3 [MP] HBuilderX 编译微信小程序  *(跳过：node_modules 未安装)*
- [~] 6.4 [MP] 微信开发者工具手测  *(待环境就绪后人工验证)*
- [~] 6.5 [双端] 旧的 `methodology-evolver-h5/openspec/changes/feature-alignment/` 已标 SUPERSEDED

## 依赖关系

- Phase 1 必须先于 Phase 2/3 完成（API 契约前置）
- Phase 4/5 可与 Phase 2/3 并行
- Phase 6 在最后

## 估算

- Phase 1: 0.5 天
- Phase 2: 1.5 天
- Phase 3: 1 天
- Phase 4: 0.5 天
- Phase 5: 0.5 天
- Phase 6: 0.5 天

合计约 4.5 天双端工作量。
