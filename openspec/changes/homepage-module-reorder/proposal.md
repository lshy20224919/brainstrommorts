## Why

需求文档（doc 10.4.1）明确规定首页五个模块的呈现顺序：

```
模块零：进化时间轴 (EvolutionJourney) + 智能建议 (SmartSuggestion)
模块一：数据看板 (DataDashboard)
模块二：快捷操作 (QuickActions)
模块三：待办提醒 (TodoSection，含草稿未完成提醒)
模块四：我的榜单 (RankSection)
```

实际现状偏离严重：

| 端 | 当前顺序 | 偏离点 |
|----|----------|--------|
| H5 | DataDashboard → EvolutionJourney → SmartSuggestion → QuickActions → DraftReminder → TodoSection → RankSection | 模块零被拆成两块；DraftReminder 是独立组件，没并入 TodoSection |
| 小程序 | DataDashboard → QuickActions → TodoSection → RankSection | 完全缺失 EvolutionJourney / SmartSuggestion / DraftReminder 三个模块 |

小程序为终态、H5 与小程序功能不能有任何区别 → 必须双端对齐到 doc 规定的顺序与归属。

## What Changes

### 1. 顺序对齐（双端）

按 doc 10.4.1 严格排序：

```
┌──────────────────────────────────────┐
│  page-header                         │
├──────────────────────────────────────┤
│ 模块零                                │
│  ┌────────────────────────────────┐  │
│  │ EvolutionJourney（进化时间轴） │  │
│  ├────────────────────────────────┤  │
│  │ SmartSuggestion（智能建议）    │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│ 模块一 DataDashboard（数据看板）      │
├──────────────────────────────────────┤
│ 模块二 QuickActions（快捷操作）       │
├──────────────────────────────────────┤
│ 模块三 TodoSection（待办提醒）        │
│  ├ 草稿未完成提醒（最多1张）           │
│  ├ 复盘待办                           │
│  ├ 迁移推荐                           │
│  └ 久未执行提醒                       │
├──────────────────────────────────────┤
│ 模块四 RankSection（我的榜单）        │
└──────────────────────────────────────┘
```

### 2. DraftReminder 归位为 TodoSection 第一类卡片（双端）

**当前**：H5 的 `DraftReminder` 是独立组件，挂在 QuickActions 与 TodoSection 之间。

**目标**：作为 `TodoSection` 内部第一种 todo type（`type: 'draft'`），统一卡片样式与交互。

**好处**：
- 与其他 todo 卡片视觉一致（统一关闭按钮、统一点击响应）
- 数量控制集中（同一时刻 TodoSection 内最多 N 张卡）
- 双端 todo 数据结构统一

### 3. 小程序补齐三个缺失模块

| 模块 | 数据源 | UI 复用 |
|------|--------|---------|
| EvolutionJourney | `api.evolution.progress()` | 参考 H5 `EvolutionJourney.jsx` 重写为 Vue |
| SmartSuggestion | `api.suggestion.smart()` | 参考 H5 `SmartSuggestion.jsx` |
| DraftReminder（并入 todos） | localStorage / uni storage 扫描 4 个 draft key | 进入 TodoSection 第一项 |

### 4. todos 数据合并草稿来源（双端）

`getTodos()` 返回结构调整：

```typescript
type Todo =
  | { key: 'draft', type: 'draft', drafts: Array<{ key, label }>, count }
  | { key: string, type: 'review' | 'migrate' | 'overdue', ... }
```

草稿提醒由前端在 `getTodos()` 调用后本地扫描合并，或由 `getTodos()` mock 内部读取后返回。

## Why Now

- doc 10.4.1 是"最终定稿"对模块顺序的硬约束
- cardlib-redesign 已完成，cardlib 三 Tab 结构稳定，此时调整首页对其他页面无影响
- DraftReminder 当前重复实现（逻辑游离），越早归并越省后续改动

## Non-goals

- 不改各模块内部内容（SmartSuggestion 的建议规则、EvolutionJourney 阶段定义保持）
- 不调整 RankSection 内部交互（独立追踪）
- 不动数据看板四宫格（feature-alignment 处理跳转）
- 不引入新的 todo 类型（draft 是已有功能的归位，非新增）
