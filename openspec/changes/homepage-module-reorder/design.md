## TodoSection 数据结构

### 草稿合并到 todos

```typescript
type DraftTodo = {
  key: 'draft',          // 固定 key，便于关闭与去重
  type: 'draft',
  drafts: Array<{
    key: 'draft_create_action' | 'draft_create_mistake' | 'draft_create_law' | 'draft_create_inspiration',
    label: '正确的事' | '错误的事' | '规律' | '灵感'
  }>,
  count: number
}

type ReviewTodo  = { key: string, type: 'review',  count: number }
type MigrateTodo = { key: string, type: 'migrate', count: number }
type OverdueTodo = { key: string, type: 'overdue', action: { name }, days: number }

type Todo = DraftTodo | ReviewTodo | MigrateTodo | OverdueTodo
```

### 排序规则

`TodoSection` 内顺序：

1. `type=draft` 卡片（若存在 → 永远第一位）
2. 按 `getTodos` 返回顺序（mock/服务端决定）

### 渲染分支

H5 `TodoSection`：

```jsx
const renderTodo = (todo) => {
  if (todo.type === 'draft') {
    return (
      <span>
        <FileEdit size={14} className="todo-icon" />
        您有 <strong>{todo.count}</strong> 条未完成录入
        （{todo.drafts.map(d => d.label).join('、')}）
      </span>
    )
  }
  if (todo.type === 'review')  return <span><ClipboardList .../>...</span>
  if (todo.type === 'migrate') return <span><Sparkles .../>...</span>
  if (todo.type === 'overdue') return <span><Clock .../>...</span>
  return null
}
```

点击 draft 卡片 → 触发 `onResume?.(drafts[0].key)`，逻辑沿用现 DraftReminder。

关闭 draft 卡片 → 清除全部 4 个 draft key + 标记本会话不再展示。

## 模块顺序实现

### H5

`HomePage.jsx` 重排：

```jsx
<div className="page-body">
  {loading ? <Loading rows={4} /> : (
    <>
      {/* 模块零 */}
      <EvolutionJourney stages={stages} />
      <SmartSuggestion suggestion={suggestion} onAction={handleSuggestionAction} />

      {/* 模块一 */}
      <DataDashboard stats={stats} onSwitchTab={onSwitchTab} />

      {/* 模块二 */}
      <QuickActions ... />

      {/* 模块三 */}
      <TodoSection todos={todosWithDraft} onDismiss={...} onMigrateClick={...} onResumeDraft={...} />

      {/* 模块四 */}
      <RankSection categories={categories} onSwitchTab={onSwitchTab} />
    </>
  )}
</div>
```

`DraftReminder` 组件**删除**，逻辑迁入 `TodoSection`。

### 小程序

`pages/index/index.vue` 模板：

```vue
<template>
  <view class="page-home">
    <view class="page-header">...</view>

    <!-- 模块零 -->
    <evolution-journey :stages="stages" />
    <smart-suggestion :suggestion="suggestion" @action="handleSuggestionAction" />

    <!-- 模块一 -->
    <data-dashboard :stats="stats" @switch-tab="handleSwitchTab" />

    <!-- 模块二 -->
    <quick-actions ... />

    <!-- 模块三 -->
    <todo-section :todos="todosWithDraft" @dismiss="..." @migrate="..." @resume-draft="..." />

    <!-- 模块四 -->
    <rank-section :categories="categories" @switch-tab="handleSwitchTab" />
  </view>
</template>
```

新增四个组件：`components/EvolutionJourney.vue` / `components/SmartSuggestion.vue` / `components/DataDashboard.vue` / `components/TodoSection.vue`，从单文件页面中拆出。

## 小程序新增模块的 mock 与真实 API

| H5 mock 接口 | 小程序对应 |
|-------------|------------|
| `api.getEvolutionProgress()` | `api.evolution.progress()` |
| `api.getSmartSuggestion()` | `api.suggestions.smart()` |
| `api.getTodos()`（含 draft 合并） | `api.todos.list()`（小程序由前端在 onLoad 后合并 draft） |

**草稿合并实现位置**：

- H5：`HomePage.jsx` 在 `loadData` 后扫 `localStorage` 4 个 key，合成一条 `DraftTodo` push 到 `todos[0]`
- 小程序：`pages/index/index.vue` 用 `uni.getStorageSync` 同样处理

抽出共用 `scanDrafts()` 工具：

```typescript
const DRAFT_KEYS = [
  { key: 'draft_create_action', label: '正确的事' },
  { key: 'draft_create_mistake', label: '错误的事' },
  { key: 'draft_create_law', label: '规律' },
  { key: 'draft_create_inspiration', label: '灵感' }
]

function scanDrafts(storage): DraftTodo | null {
  const drafts = DRAFT_KEYS.filter(({ key }) => {
    const v = storage.getItem ? storage.getItem(key) : storage.getStorageSync(key)
    return v && v !== '{}' && v !== 'null'
  })
  if (drafts.length === 0) return null
  return { key: 'draft', type: 'draft', drafts, count: drafts.length }
}
```

## 关闭交互

`TodoSection` 关闭按钮统一行为：

- `type=draft` → 调 `onClearDrafts()` 清 4 个 storage key + 本会话隐藏
- 其他 → 调 `onDismiss(key)` 服务端记关闭

## 视觉样式

DraftReminder 当前样式 `.draft-reminder` 与 `.todo-card` 已经接近。归位后：

- 移除 `.draft-reminder*` 系列样式
- `.todo-card` 内部以 `data-type="draft"` 微调（图标颜色变 muted-blue）

## 兼容性

- 现有 `DraftReminder` 引用：仅在 `HomePage.jsx` 一处，归位时同步删除 import 与使用
- 现有 `TodoSection` 接口：扩展，加 `onResumeDraft`、`onClearDrafts` 两个 prop
- 现有 `getTodos` mock：保持原签名，由前端做 draft 合并（避免 mock 改动牵动其他页面）

## 验证

- [ ] H5 首页模块顺序与 doc 10.4.1 完全一致
- [ ] 小程序首页模块顺序与 doc 10.4.1 完全一致（双端视觉走查同步）
- [ ] 草稿存在时 TodoSection 第一张卡是 draft 卡片，关闭后整个 TodoSection 重排
- [ ] 草稿不存在时 draft 卡片不出现
- [ ] 删除 `DraftReminder.jsx`（如有独立文件）后 build 不报错
- [ ] 小程序新增三个模块 onLoad 拉数据正常，loading 期间不闪
