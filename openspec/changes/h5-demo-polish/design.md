## Context

H5 版方法论进化器是一个 React + Vite 单页应用，5 个 Tab 页面各自独立管理状态，数据层为内存中的 mock.js 对象。当前存在以下技术债：

- 弹窗组件在 HomePage（`modal-overlay` + `modal`）和 CardLibPage（`modal-mask` + `modal-box`）各有一套实现
- 打卡弹窗在两个页面各写了一份，逻辑几乎相同
- 操作反馈混用 `alert()` 和自定义弹窗
- 无全局状态管理，页面间无法共享 Toast 等 UI 状态

## Goals / Non-Goals

**Goals:**
- 建立共享组件层，所有页面复用同一套 Modal/Toast/ActionSheet
- 补齐负向避雷和迁移两个核心功能，使产品演示故事完整
- 数据持久化到 localStorage，演示者可提前准备数据
- 操作反馈一致且有质感

**Non-Goals:**
- 不引入状态管理库（Redux/Zustand），用 React Context 足够
- 不实现真实后端对接
- 不实现深色模式实际切换（仅保留 UI）
- 不做路由系统改造（保持 Tab 切换模式）
- 不做性能优化（虚拟列表等）

## Decisions

### 1. 共享组件放在 src/components/ 目录

**选择**：新建 `src/components/` 目录，放置 Modal、Toast、ActionSheet、CheckinModal、CreateActionModal、CreateLawModal 等共享组件。

**替代方案**：继续在各页面内联。

**理由**：当前两个页面有 3 个重复组件（打卡弹窗、新增正确的事弹窗、新增规律弹窗），后续迁移弹窗也需要复用。抽取后代码量减少约 300 行，且新功能开发不再重复。

### 2. Toast 使用 React Context + Portal 实现

**选择**：创建 ToastContext，在 App.jsx 顶层挂载 ToastProvider，任何组件通过 `useToast()` hook 调用。Toast 渲染在 body 层级的 Portal 中。

**替代方案**：事件总线（EventEmitter）。

**理由**：React Context 是 React 生态标准做法，无需额外依赖，类型安全，且 Toast 的生命周期天然跟随 React 组件树。

### 3. localStorage 持久化采用"启动时加载 + 变更时写入"模式

**选择**：mock.js 启动时尝试从 localStorage 读取完整数据，读取失败则用默认数据。每次 API 调用修改数据后，自动将整个 mockApi 序列化写入 localStorage。

**替代方案**：仅持久化 diff（增量）。

**理由**：mock 数据量极小（< 50KB），全量序列化无性能问题，实现简单可靠。增量方案需要维护变更日志，复杂度不值得。提供 `api.resetAllData()` 方法用于清除 localStorage 恢复默认数据。

### 4. 负向避雷弹窗在打卡确认前触发

**选择**：用户点击"确认打卡"时，先检测该动作所属分类下是否有负向规律（且 popup_enabled=1），如有则先弹出避雷提醒，用户可选择"继续打卡"或"取消"。

**替代方案**：选择动作时立即触发。

**理由**：打卡确认前触发更符合"最后一道防线"的产品定位，且不会在用户浏览列表时频繁打扰。同一规律 24 小时内只提醒一次（记录在 localStorage）。

### 5. 迁移功能复制而非移动

**选择**：迁移 = 在目标分类下创建一份副本，原卡片保留不变。副本的 exec_count 等统计数据归零。迁移记录写入 migrate_log。

**理由**：需求文档明确要求"复制生成新卡片，原卡片保留"。

### 6. 草稿保存使用 localStorage + 弹窗 key

**选择**：每个弹窗类型有唯一 key（如 `draft_create_action`），表单字段变化时 debounce 500ms 写入 localStorage，弹窗打开时读取恢复，提交成功后清除。

**理由**：简单有效，无需额外状态管理。debounce 避免频繁写入。

## Risks / Trade-offs

- **localStorage 容量** → mock 数据 < 50KB，远低于 5MB 限制，无风险
- **数据版本兼容** → 如果 mock 数据结构变更，旧 localStorage 数据可能不兼容。通过 version 字段检测，不兼容时自动清除并用默认数据。Mitigation: 提供"重置数据"按钮
- **组件重构影响面大** → 涉及 HomePage 和 CardLibPage 两个大文件的弹窗代码移除。Mitigation: 逐步替换，先抽取组件，再逐页面替换引用
- **避雷弹窗可能打扰** → 同一规律 24h 内只弹一次 + 用户可永久关闭单条规律的提醒
