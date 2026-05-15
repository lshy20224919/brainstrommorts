## 1. 数据持久化层

- [x] 1.1 mock.js 增加 DATA_VERSION 常量和 localStorage 读写逻辑（启动加载 + 变更保存）
- [x] 1.2 增加 api.resetAllData() 方法清除 localStorage 并恢复默认数据
- [x] 1.3 个人中心增加"重置数据"按钮调用 resetAllData
- [x] 1.4 mock.js 增加迁移相关 API（api.migrateCard、api.getMigrateRecommendations、api.acceptMigration、api.dismissMigration）
- [x] 1.5 mock.js 增加避雷检测 API（api.checkNegativeLaws(categoryId) 返回需弹窗的负向规律列表）
- [x] 1.6 mock.js 增加规律编辑 API（api.updateLaw(id, data)）
- [x] 1.7 mock.js 增加弹窗记录存储（popupLog 记录 24h 内已弹窗的规律 ID）

## 2. 共享 UI 组件

- [x] 2.1 创建 src/components/Modal.jsx（通用弹窗容器，支持 title/children/onClose）
- [x] 2.2 创建 src/components/ActionSheet.jsx（底部操作菜单，支持 actions 数组/disabled/danger）
- [x] 2.3 创建 src/components/Toast.jsx + ToastContext（全局 Toast Provider，支持 success/error/info）
- [x] 2.4 创建 src/components/ConfirmDialog.jsx（确认对话框，支持 title/content/onConfirm/onCancel）
- [x] 2.5 创建 src/components/Loading.jsx（骨架屏/loading 占位组件）
- [x] 2.6 创建 src/components/CheckinModal.jsx（共享打卡弹窗，支持预选动作模式和选择动作模式）
- [x] 2.7 创建 src/components/CreateActionModal.jsx（共享新增/编辑正确的事弹窗）
- [x] 2.8 创建 src/components/CreateLawModal.jsx（共享新增/编辑规律弹窗，支持 initial 预填）

## 3. 草稿保存 Hook

- [x] 3.1 创建 src/hooks/useDraft.js（localStorage 草稿读写 + 500ms debounce + 清除方法）
- [x] 3.2 在 CreateActionModal 中集成 useDraft
- [x] 3.3 在 CreateLawModal 中集成 useDraft

## 4. App 层改造

- [x] 4.1 App.jsx 挂载 ToastProvider 包裹全部内容
- [x] 4.2 App.css 新增共享组件样式（Modal/ActionSheet/Toast/ConfirmDialog/Loading 动效）

## 5. HomePage 重构

- [x] 5.1 移除 HomePage 内联的 AddActionModal、AddLawModal、CheckinModal 组件
- [x] 5.2 替换为共享组件引用
- [x] 5.3 替换所有 alert() 为 toast 调用
- [x] 5.4 增加页面加载 Loading 状态

## 6. CardLibPage 重构

- [x] 6.1 移除 CardLibPage 内联的 CheckinModal、CreateActionModal、CreateLawModal、ActionMenu、LawMenu 组件
- [x] 6.2 替换为共享组件引用（Modal/ActionSheet/CheckinModal/CreateActionModal/CreateLawModal）
- [x] 6.3 替换所有 alert() 为 toast 调用
- [x] 6.4 增加页面加载 Loading 状态

## 7. 负向避雷弹窗

- [x] 7.1 创建 src/components/WarningPopup.jsx（避雷提醒弹窗，红色警告样式，展示规律列表）
- [x] 7.2 在共享 CheckinModal 中集成避雷检测逻辑（确认打卡前调用 checkNegativeLaws）
- [x] 7.3 实现"不再提醒"按钮逻辑（设置 popup_enabled=0）
- [x] 7.4 实现 24h 不重复弹窗逻辑（读写 popupLog）

## 8. 迁移功能

- [x] 8.1 创建 src/components/MigrateModal.jsx（迁移弹窗，展示目标分类选择列表）
- [x] 8.2 CardLibPage ActionSheet 中"迁移"选项改为可用，点击弹出 MigrateModal
- [x] 8.3 实现迁移执行逻辑（调用 api.migrateCard，刷新列表，toast 提示）
- [x] 8.4 创建 src/components/MigrateRecommendModal.jsx（智能迁移推荐列表弹窗）
- [x] 8.5 首页待办区"迁移推荐"点击弹出推荐弹窗，支持采纳/忽略

## 9. 规律编辑

- [x] 9.1 CardLibPage LawMenu 增加"编辑"选项
- [x] 9.2 点击编辑弹出 CreateLawModal（传入 initial 数据预填）
- [x] 9.3 保存时调用 api.updateLaw 更新数据

## 10. 微动效

- [x] 10.1 App.css 增加 Toast slide-in/slide-out 动画 keyframes
- [x] 10.2 App.css 增加 ActionSheet slide-up/slide-down 动画
- [x] 10.3 App.css 增加打卡成功对勾动画（scale 弹跳效果）
- [x] 10.4 App.css 增加卡片入场 fade-in + slide-down 动画
- [x] 10.5 在 CheckinModal 提交成功后触发对勾动画
- [x] 10.6 在新增卡片成功后为新卡片添加入场动画 class
