## Why

当前首页将数据看板、快捷操作、待办、榜单平铺展示，用户无法感知产品的递进设计逻辑（记录→验证→提炼→固化→迭代）。每个操作完成后只有 Toast 提示，缺少"下一步该做什么"的引导，导致整个使用流程感觉割裂、不通顺。需要让用户在首页就能看到自己处于方法论进化的哪个阶段，并在每次操作后获得有意义的下一步建议。

## What Changes

**首页改造：**
- 新增"进化旅程"进度模块，展示用户在 5 个阶段的当前进度（记录正确的事 → 执行验证 → 提炼规律 → 固化 SOP → 复盘迭代），用实心/空心圆点 + 数据标注
- 新增"下一步建议"智能卡片，根据用户当前数据状态动态推荐下一步操作，带跳转按钮
- 保留快捷操作区和待办提醒，但移到进化旅程和建议卡片下方
- 移除原有的数据看板（三列统计），其信息已被进化旅程覆盖

**操作后上下文跳转：**
- 打卡成功后弹出"查看详情 / 提炼规律"选项，替代纯 Toast
- 创建规律成功后弹出"关联到 SOP？"引导
- SOP 执行完成后展示本次执行汇总（执行了哪些动作、各自成功/失败、整体成功率）

## Capabilities

### New Capabilities
- `evolution-journey`: 首页进化旅程进度展示（5 阶段进度计算与渲染）
- `smart-suggestion`: 首页智能建议卡片（根据数据状态动态生成下一步推荐）
- `post-action-guide`: 操作后上下文跳转引导（打卡后选项、创建规律后引导、SOP 执行汇总）

### Modified Capabilities
<!-- 无现有 spec 需要修改 -->

## Impact

- 重构文件：`methodology-evolver-h5/src/pages/HomePage.jsx`（首页结构重排）
- 修改文件：`methodology-evolver-h5/src/pages/CardLibPage.jsx`（打卡成功后弹出选项）
- 修改文件：`methodology-evolver-h5/src/pages/SopPage.jsx`（SOP 执行完展示汇总）
- 可能新增文件：`src/components/EvolutionJourney.jsx`、`src/components/SmartSuggestion.jsx`、`src/components/PostActionGuide.jsx`、`src/components/SopExecSummary.jsx`
- 修改文件：`methodology-evolver-h5/src/mock.js`（新增进度计算 API、建议生成 API）
- 修改文件：`methodology-evolver-h5/src/App.css`（新增进化旅程、建议卡片、汇总页样式）
- 无新增外部依赖
