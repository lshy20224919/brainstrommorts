## 1. 数据层

- [x] 1.1 mock.js 新增 api.getEvolutionProgress() 返回 5 阶段达成状态和数据
- [x] 1.2 mock.js 新增 api.getSmartSuggestion() 按优先级规则返回当前建议

## 2. 进化旅程组件

- [x] 2.1 创建 src/components/EvolutionJourney.jsx（横向 5 步进度条）
- [x] 2.2 实现阶段圆点（实心/空心）+ 连接线（实线/虚线）
- [x] 2.3 实现阶段标签和数据标注

## 3. 智能建议组件

- [x] 3.1 创建 src/components/SmartSuggestion.jsx（建议卡片）
- [x] 3.2 实现建议文案 + 操作按钮渲染
- [x] 3.3 实现按钮跳转逻辑（打开弹窗 / 切换 Tab）

## 4. 操作后引导组件

- [x] 4.1 创建 src/components/PostActionGuide.jsx（底部浮层，支持按钮列表 + 自动消失）
- [x] 4.2 在 HomePage 打卡成功后弹出"查看详情 / 提炼规律"浮层
- [x] 4.3 在 HomePage 创建规律成功后弹出"关联到 SOP？"浮层
- [x] 4.4 实现浮层 3 秒自动消失逻辑

## 5. SOP 执行汇总

- [x] 5.1 创建 src/components/SopExecSummary.jsx（全屏执行汇总页）
- [x] 5.2 展示 SOP 名称、执行动作列表（名称 + 成功/失败）、整体成功率
- [x] 5.3 在 SopPage 执行完成后展示汇总页替代纯 Toast

## 6. 首页重构

- [x] 6.1 HomePage 移除原有 StatsBoard 组件
- [x] 6.2 HomePage 顶部接入 EvolutionJourney 组件
- [x] 6.3 EvolutionJourney 下方接入 SmartSuggestion 组件
- [x] 6.4 保留快捷操作区和待办提醒在建议卡片下方
- [x] 6.5 接入 PostActionGuide 浮层逻辑

## 7. 样式

- [x] 7.1 App.css 新增进化旅程样式（进度条、圆点、连接线、标签）
- [x] 7.2 App.css 新增智能建议卡片样式
- [x] 7.3 App.css 新增底部浮层样式（滑入/滑出动画）
- [x] 7.4 App.css 新增 SOP 执行汇总页样式
