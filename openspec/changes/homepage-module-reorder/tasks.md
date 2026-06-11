## Tasks

### Phase 1: 共享逻辑抽出

- [x] 1.1 [双端] 抽 `scanDrafts(storage)` 工具：H5 放 `src/utils/drafts.js`，小程序放 `client/src/utils/drafts.js`
- [x] 1.2 [双端] 定义 `DRAFT_KEYS` 常量统一来源
- [x] 1.3 [双端] `Todo` 类型新增 `type: 'draft'` 分支，TS 类型同步（H5）/ JSDoc 同步（小程序）

### Phase 2: H5 首页重排

- [x] 2.1 [H5] `HomePage.jsx` 调整 JSX 顺序：模块零(EvolutionJourney+SmartSuggestion) → 一 → 二 → 三 → 四
- [x] 2.2 [H5] `TodoSection` 增加 `onResumeDraft` / `onClearDrafts` prop
- [x] 2.3 [H5] `TodoSection` `renderTodo` 增加 `type=draft` 分支
- [x] 2.4 [H5] `HomePage.jsx` 在 `loadData` 后调 `buildDraftTodo(localStorage)`，合成 DraftTodo 插到 todos[0]
- [x] 2.5 [H5] 删除独立 `DraftReminder` 组件（已无引用）
- [x] 2.6 [H5] App.css 删 `.draft-reminder*` 样式
- [x] 2.7 [H5] `.todo-card[data-type="draft"]` 微调图标色

### Phase 3: 小程序补三个模块

- [x] 3.1 [MP] `client/src/components/EvolutionJourney.vue` 实现进化时间轴
- [x] 3.2 [MP] `client/src/components/SmartSuggestion.vue` 实现智能建议卡片
- [~] 3.3 [MP] `client/src/components/DataDashboard.vue` 拆出独立组件  *(直接内联在 pages/index/index.vue，4 宫格逻辑较短)*
- [~] 3.4 [MP] `client/src/components/TodoSection.vue` 拆出，含 draft type 分支  *(直接内联在 pages/index/index.vue)*
- [~] 3.5 [MP] `client/src/components/QuickActions.vue` 拆出  *(直接内联在 pages/index/index.vue)*
- [x] 3.6 [MP] `client/src/components/RankSection.vue` 拆出（含榜单 swiper + 配置弹窗）
- [x] 3.7 [MP] `pages/index/index.vue` 改用组件按 doc 顺序拼装
- [x] 3.8 [MP] `client/src/utils/api.js` 补 `evolution.progress` / `suggestions.smart` / `stats.rankConfig`

### Phase 4: 小程序首页串联

- [x] 4.1 [MP] `pages/index/index.vue` `fetchPageData` Promise.all 拉 stats/todos/stages/suggestion
- [x] 4.2 [MP] 计算 draftTodo 后 computed `mergedTodos` 插 todos[0]
- [x] 4.3 [MP] todo type='draft' 点击 `uni.navigateTo` 到对应 draft route
- [x] 4.4 [MP] todo type='draft' × 关闭时 `clearDrafts()` 清 4 个 storage key
- [~] 4.5 [MP] loading 占位  *(沿用文字 loading，与原版一致)*

### Phase 5: 视觉一致性走查

- [~] 5.1 [双端] 双端首页截图对比 doc 模块顺序  *(待环境就绪后人工验证)*
- [~] 5.2 [双端] 首次进入（无草稿）展示 4 张 todo 或空提示  *(待环境就绪后人工验证)*
- [~] 5.3 [双端] 故意写入一条 draft 后刷新，验证 draft 卡片在 TodoSection 第一位  *(待环境就绪后人工验证)*
- [~] 5.4 [双端] 关闭 draft 卡片后页面重排正常  *(待环境就绪后人工验证)*

### Phase 6: 构建与回归

- [x] 6.1 [H5] `npx vite build` 通过（278.36 kB / gzip 78.83 kB）
- [~] 6.2 [MP] HBuilderX 编译微信小程序  *(跳过：node_modules 未安装)*
- [~] 6.3 [双端] 验证 cardlib 入口、复盘入口、个人中心入口均未受影响  *(待环境就绪后人工验证)*

## 依赖关系

- Phase 1 是 Phase 2/3 的前置
- Phase 2 与 Phase 3 可并行
- Phase 4 依赖 Phase 3 完成
- Phase 5/6 在最后

## 估算

- Phase 1: 0.25 天
- Phase 2: 0.5 天
- Phase 3: 1.5 天
- Phase 4: 0.5 天
- Phase 5/6: 0.5 天

合计约 3.25 天双端工作量。
