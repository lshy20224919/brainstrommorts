## Why

H5 版方法论进化器的五个 Tab 页面中，个人中心（ProfilePage）是唯一未实现的页面，目前仅有占位文字。用户需要一个集中管理分类、系统设置和数据概览的入口，补齐后 H5 演示版即可完整交付。

## What Changes

- 新增完整的 ProfilePage 组件，替换当前占位符
- 新增用户信息卡片（头像、昵称、使用天数）
- 新增数据概览区（总动作数、总规律数、累计打卡次数）
- 新增通用设置区（智能迁移开关、避雷弹窗开关、深色模式三档选择器）
- 新增分类管理区（页面内展开折叠，支持新增、改名、排序）
- 新增数据管理区（云端备份、数据还原的模拟交互流程）
- 新增关于区（版本号展示）
- 扩展 mock.js 数据层，增加 settings 和 categories CRUD 相关 mock API

## Capabilities

### New Capabilities
- `profile-settings`: 个人中心通用设置（开关项、深色模式选择器）及用户信息展示
- `category-management`: 分类管理（内联展开，支持新增、改名、排序操作）
- `data-management`: 数据备份还原模拟交互（loading 动画 → 成功/失败提示）

### Modified Capabilities
<!-- 无现有 spec 需要修改 -->

## Impact

- 文件变更：`methodology-evolver-h5/src/pages/ProfilePage.jsx`（重写）
- 文件变更：`methodology-evolver-h5/src/mock.js`（新增 settings/categories API）
- 文件变更：`methodology-evolver-h5/src/App.css`（新增 profile 页面样式）
- 无新增依赖，无 API 变更，无破坏性改动
