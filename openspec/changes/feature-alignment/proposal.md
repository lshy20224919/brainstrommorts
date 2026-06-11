## Why

H5 与小程序两端对照需求文档（最终定稿）存在功能缺口。其中四类缺口紧密相关，统一在本 change 处理：

1. **复盘迭代操作** —— 双端均不支持 day/custom 周期，且 H5 无新建复盘流程
2. **淘汰库** —— 双端复盘中心均缺失「淘汰库」section（doc 10.3.4 / 10.4.4 强制要求）
3. **避雷弹窗** —— 创建动作/错误时未检测同分类负向规律（doc 业务规则）
4. **数据看板跳转** —— H5 看板已支持，小程序看板数字仍不可点击（doc 10.4.1）

灵感转化流程在 cardlib-redesign 中已实现，本 change 仅做双端验证，不再单列。

小程序为最终上线版本。**H5 与小程序功能必须完全一致**，因此本 change 的每一项任务都覆盖双端。

## What Changes

### 1. 复盘新建（双端）

**周期支持四档**：日复盘 / 周复盘 / 月复盘 / 自定义起止时间。

**流程**：选周期 → 自动拉取该周期内 actions/checkins/laws 数据 → 逐条对方法论判定（固化/优化/降级/淘汰）→ 提交生成快照版本。

**入口**：复盘中心顶部「新建复盘」卡片。

**接口（双端 mock 与真实 API 都需提供）**：
- `createReview({ cycle, start_time, end_time })` → 返回 review_id 与待判定列表
- `submitReviewIteration(review_id, decisions[])` → 生成快照
- `getReviewPeriodData({ start_time, end_time })` → 返回该周期的 actions/checkins/mistakes/laws 聚合

### 2. 淘汰库（双端）

复盘中心新增「淘汰库」section，展示 status=2（已淘汰）的 actions/laws/mistakes。

**操作**：还原（status 改回 0）/ 永久删除（物理删除）。

**入口**：复盘中心，常驻底部 section，标题「淘汰库」+「查看全部 ›」二次入口跳转完整列表页。

**接口**：
- `getRetiredItems({ type?, page, page_size })`
- `restoreItem(type, id)`
- `permanentDeleteItem(type, id)`

### 3. 避雷弹窗（双端）

创建「正确的事」或「错误的事」时，提交前先调用 `checkNegativeLaws(category_id)`，若命中：

- 弹出避雷提醒，列出负向规律
- 用户选择「知道了，继续」或「返回修改」
- 24 小时去重（同分类 24h 内已弹过则不再弹）

**复用**：H5 已在 `CreateMistakeModal` 实现，本任务对齐 `CreateActionModal` 与小程序两端三个入口。

### 4. 数据看板跳转（小程序补齐）

H5 已实现，本任务仅小程序：四宫格数字点击跳转卡片库对应 Tab/sub-tab：

- 正确的事 → 卡片库 行为/正确的事
- 错误的事 → 卡片库 行为/错误的事
- 正向规律 → 卡片库 规律/正向
- 负向规律 → 卡片库 规律/负向

## Why Now

`feature-alignment` 之前作为 H5-only proposal 写在 `methodology-evolver-h5/openspec/changes/`。在确认小程序为终态后，这份 proposal 需要：

1. 迁移到顶层 openspec（双端共用）
2. Task 1 扩充 day/custom + 淘汰库（原 proposal 漏写）
3. 所有任务标注双端实施位置

## Non-goals

- 不做 SOP 智能推荐（doc 10.4.3 H5 阶段不实现，小程序文档允许但不在本批次）
- 不做事件原始流水表（v2）
- 不做榜单点击跳转（低优先级，独立追踪）
- 不做 cardlib 信息架构（已在 cardlib-redesign 完成）
