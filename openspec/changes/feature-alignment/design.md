## 复盘新建流程（双端）

### UI 流程

```
复盘中心
├─ 顶部卡片：[+ 新建复盘]
│   └─ 点击 → 弹出「新建复盘」对话框
│
└─ 历史快照列表 / 淘汰库 / ...

新建复盘对话框
┌────────────────────────────────────────┐
│  选择复盘周期                           │
│  [日][周][月][自定义]                   │  ← 四档 pill，互斥
├────────────────────────────────────────┤
│  开始时间：[YYYY-MM-DD]                 │
│  结束时间：[YYYY-MM-DD]                 │  ← 选周期时自动填充，自定义可改
├────────────────────────────────────────┤
│            [取消]  [下一步：判定]       │
└────────────────────────────────────────┘

判定页面
┌────────────────────────────────────────┐
│  本期数据：N 个动作 · M 次打卡 · K 条规律  │
├────────────────────────────────────────┤
│  动作：晨跑                             │
│   ⚪ 固化  ⚪ 优化  ⚪ 降级  ⚪ 淘汰    │
│   备注：[              ]                │
├────────────────────────────────────────┤
│  规律：早起后立刻喝水 ...                │
│   ⚪ 固化  ⚪ 优化  ⚪ 降级  ⚪ 淘汰    │
├────────────────────────────────────────┤
│       [上一步]   [生成快照]             │
└────────────────────────────────────────┘
```

### 周期默认起止时间

| 周期 | 起止规则 |
|------|----------|
| 日 | 今天 00:00 - 今天 23:59 |
| 周 | 本周一 00:00 - 今天（或本周日 23:59） |
| 月 | 本月 1 号 00:00 - 今天 |
| 自定义 | 默认 7 天前 - 今天，可改 |

### 判定语义

| 判定 | 数据动作 |
|------|----------|
| 固化 | status 不变；记入 review_snapshot.kept |
| 优化 | status 不变；产生一条 review_iteration_record，备注必填 |
| 降级 | subjective_weight 降 1（最小 1）；记入 review_snapshot.demoted |
| 淘汰 | status 改为 2；记入 review_snapshot.retired |

## 淘汰库（双端）

### 布局

```
复盘中心
├─ 新建复盘
├─ 复盘历史 (snapshots grid)
└─ 淘汰库
    ├─ 标题行：[淘汰库]   [查看全部 ›]
    ├─ 列表（默认显示 5 条 / 类型混合按时间倒序）
    │   ├─ [ACTION] 动作名             [还原] [永久删除]
    │   ├─ [LAW]    规律描述            [还原] [永久删除]
    │   └─ [MISTAKE] 错误名             [还原] [永久删除]
    └─ 空状态：「暂无淘汰记录」
```

### 「查看全部」页面

- 路由：H5 `/review/retired`，小程序 `pages/review/retired`
- 三个 Tab：动作 / 规律 / 错误
- 列表项含 type badge / 名称 / 淘汰时间 / 操作按钮

### 操作语义

- **还原**：弹确认 → 调 `restoreItem(type, id)` → 该项 status 改回 0
- **永久删除**：弹双重确认（"此操作不可恢复"）→ 调 `permanentDeleteItem(type, id)` → 物理删除

## 避雷弹窗（双端）

### 触发位置

| 入口 | 当前状态 | 需补齐 |
|------|----------|--------|
| H5 CreateActionModal | 未接入 | 接入 |
| H5 CreateMistakeModal | 已接入 | 验证 |
| H5 CheckinModal | 已接入 | 验证 |
| 小程序 创建动作 | 未接入 | 接入 |
| 小程序 创建错误 | 未接入 | 接入 |
| 小程序 打卡 | 待确认 | 接入或验证 |

### 24 小时去重逻辑

- 存储位置：H5 `localStorage[negative_warn_dismissed_<category_id>]`，小程序 `uni.setStorage`
- 值：dismiss 时间戳
- 检查：当前时间 - 存储时间 < 24h，则跳过弹窗

### 弹窗 UI（已在 H5 CreateMistakeModal 中实现，小程序对齐）

```
┌─ ⚠ 该分类下有负向规律提醒 ─────────────┐
│  · 负向规律 1                          │
│  · 负向规律 2                          │
├────────────────────────────────────────┤
│      [返回修改]    [知道了，继续]        │
└────────────────────────────────────────┘
```

## 数据看板跳转（小程序补齐）

### Tab 切换约定

H5 通过 `onSwitchTab('card', { primaryTab, subTab })` 实现，小程序通过 `uni.switchTab` + `getCurrentPages()[1].setData(...)` 或事件总线实现。

| 数字 | primaryTab | subTab |
|------|-----------|--------|
| action_count | behavior | action |
| mistake_count | behavior | mistake |
| positive_law_count | law | positive |
| negative_law_count | law | negative |

小程序由于 `uni.switchTab` 不能传参，需要通过 `uni.$emit('cardlib:switch-tab', payload)` + cardlib 页面 `onShow` 监听完成。

## API 契约

### Mock（H5）与真实接口（小程序）必须对齐

```typescript
// 复盘
createReview(input: {
  cycle: 'day' | 'week' | 'month' | 'custom',
  start_time: string,  // ISO date
  end_time: string
}): Promise<{
  review_id: string,
  period: { start_time, end_time, cycle },
  pending_items: Array<{
    type: 'action' | 'mistake' | 'law',
    id: number,
    name: string,
    stats: { ... }
  }>
}>

submitReviewIteration(review_id, decisions: Array<{
  type, id,
  decision: 'keep' | 'optimize' | 'demote' | 'retire',
  remark?: string
}>): Promise<{ snapshot_version: string }>

// 淘汰库
getRetiredItems(input: {
  type?: 'action' | 'mistake' | 'law',
  page?: number,
  page_size?: number
}): Promise<{ list: RetiredItem[], total: number }>

restoreItem(type, id): Promise<void>
permanentDeleteItem(type, id): Promise<void>
```

## 验证

### 双端均需通过

- [ ] 新建复盘流程跑通四种周期
- [ ] 判定四种语义正确落库（H5 mock / 小程序 API）
- [ ] 淘汰库列出已淘汰项；还原/永久删除流转正确
- [ ] 创建动作/错误命中负向规律时弹窗，"知道了，继续"后 24h 不再弹
- [ ] 小程序首页四个数字点击进入卡片库正确 Tab

### 不破坏已有

- [ ] H5 已有的复盘可视化（StatsOverview / Heatmap / Radar / EvolutionTree）保持
- [ ] 小程序已有的「智能推荐 SOP」`is_auto_generated` 标签不变（doc 10.4.3 在小程序允许）

## 风险与边界

- **小程序 switchTab 限参**：四宫格跳转用事件总线方案，需在卡片库 `onShow` 反复读 storage 并清理
- **批量永久删除**：本次仅支持单条删除；批量在后续 v2
- **判定离线性**：本期数据快照在 createReview 时定格，提交判定阶段不再变化（防止用户判定时新数据干扰）
