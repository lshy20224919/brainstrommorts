## Why

H5 版方法论进化器五个页面已搭建完成，但存在三类问题使其无法作为完整演示交付：1) 弹窗/反馈组件不统一，HomePage 和 CardLibPage 各自实现了重复的打卡弹窗和新增弹窗，alert() 与自定义弹窗混用；2) 产品核心差异化功能缺失——负向避雷提醒和跨场景迁移完全未实现，产品故事讲不完整；3) 刷新即丢数据，演示者无法提前准备数据，体验断裂。

## What Changes

**Phase 1: 基础体验统一**
- 抽取共享 UI 组件：Modal、ActionSheet、Toast、ConfirmDialog
- 去重打卡弹窗和新增弹窗（HomePage/CardLibPage 共用同一组件）
- 全局 Toast 系统替代所有 alert() 调用
- 页面初始加载增加 skeleton/loading 状态

**Phase 2: 核心功能补齐**
- 新增负向避雷弹窗：打卡时检测同分类负向规律，触发警告提醒
- 新增手动迁移功能：长按菜单 → 选择目标分类 → 复制生成新卡片
- 新增智能迁移推荐：首页待办区"迁移推荐"可展开查看推荐列表并一键采纳
- 新增规律编辑功能：长按规律卡片可编辑描述、分类、权重等字段

**Phase 3: 体验增强**
- mock 数据 localStorage 持久化（刷新不丢失所有操作）
- 表单草稿自动保存（弹窗关闭后重新打开可恢复未提交内容）
- 操作成功微动效反馈（打卡成功动画、新增卡片入场动画）

## Capabilities

### New Capabilities
- `shared-ui`: 共享 UI 组件库（Modal、ActionSheet、Toast、ConfirmDialog、Loading skeleton）
- `negative-law-warning`: 负向避雷弹窗（打卡/录入时触发同分类负向规律提醒）
- `card-migration`: 卡片迁移功能（手动迁移 + 智能迁移推荐采纳）
- `data-persistence`: 数据持久化（localStorage 存储 mock 数据 + 表单草稿自动保存）
- `micro-feedback`: 操作微反馈（Toast 动效、打卡成功动画、卡片入场动画）

### Modified Capabilities
<!-- 无现有 spec 需要修改 -->

## Impact

- 重构文件：`HomePage.jsx`（移除内联弹窗组件，改用共享组件）
- 重构文件：`CardLibPage.jsx`（移除内联弹窗组件，新增迁移/编辑规律功能）
- 新增文件：`src/components/Modal.jsx`、`Toast.jsx`、`ActionSheet.jsx`
- 新增文件：`src/hooks/useToast.js`、`useDraft.js`
- 重构文件：`mock.js`（增加 localStorage 持久化层、迁移 API、避雷检测 API）
- 修改文件：`App.css`（新增共享组件样式、动效 keyframes）
- 修改文件：`App.jsx`（挂载 Toast Provider）
- 无新增外部依赖
