## 灵感 `_direction_inferred`

### 字段语义

- 类型：`boolean`，可选字段（缺省视为 false）
- 含义：方向是迁移时机器推断的（默认填 `'positive'`），用户尚未明确认领
- 与 `direction` 关系：永远成对，`direction` 必填，`_direction_inferred` 标志 direction 是否可信

### 迁移路径（H5 端）

H5 当前 storage 版本号 `DATA_VERSION = 4`（`src/mock.js:107` 附近）。本 change 不升 DATA_VERSION——因为 H5 mock seed 自带 direction，**只对老用户 storage 有效**：

```javascript
// src/mock.js 内迁移函数
function migrateInspirationsInferred(data) {
  if (!Array.isArray(data.inspirations)) return
  for (const i of data.inspirations) {
    if (!i.direction) {
      i.direction = 'positive'
      i._direction_inferred = true
    }
  }
}
```

迁移在 `loadFromStorage` 流程里跑一次，幂等（已带 direction 的不动）。不需要单独的 `migrations.js` 文件——H5 没有现成的迁移模块，且这一项极简，就近写在 mock.js。

### UI 变更

**徽章（CardLibPage 灵感卡片）**：

```jsx
{inspiration._direction_inferred && (
  <span className="card-badge badge-inferred">待确认方向</span>
)}
{!inspiration._direction_inferred && inspiration.direction === 'positive' && (
  <span className="card-badge badge-positive">正向</span>
)}
{!inspiration._direction_inferred && inspiration.direction === 'negative' && (
  <span className="card-badge badge-negative">负向</span>
)}
```

CSS（App.css）：`.badge-inferred` 用虚线边框 + 灰色字（与正负向区分），文案宽度足够容纳「待确认方向」5 个字。

**长按菜单（CardLibPage 灵感长按）**：

参考 MP `pages/card/index.vue:354-371` 的逻辑：

```jsx
if (item._direction_inferred) {
  // 待确认状态：提供确认 / 翻转两个动作
  menu = [
    { label: `确认为${item.direction === 'positive' ? '正向' : '负向'}`, onClick: confirmDirection },
    { label: `改为${item.direction === 'positive' ? '负向' : '正向'}灵感`, onClick: flipDirection },
    ...原有菜单
  ]
} else {
  // 已确认：保持原菜单（含「翻转方向」单项）
}
```

`confirmDirection` 与 `flipDirection` 都写 `_direction_inferred=false`。

**编辑后清除**：

`CreateInspirationModal.jsx` 在编辑模式提交时强制 `_direction_inferred=false`（用户进编辑表单看过 direction 字段就视为认可）。

## SOP `is_auto_generated`

### 字段语义

- 类型：`0 | 1`（与 MP 一致用 number 0/1，不用 boolean——保留小程序 schema 兼容）
- 含义：1 = 系统/复盘自动生成的 SOP，0 = 用户手动创建
- 影响：仅 UI 徽章；不影响 CRUD、执行、删除逻辑

### Seed 数据

`src/mock.js` 现 sops 数组：所有现存条目补 `is_auto_generated: 0`，**新增**或选其中一条改为 `is_auto_generated: 1`（与 MP `mock/index.js:201` 的「智能 SOP」语义同步）。

### UI 变更

`SopPage.jsx`：SOP 卡片标题行：

```jsx
<div className="sop-card-title-row">
  <span className="sop-card-name">{sop.name}</span>
  {sop.is_auto_generated === 1 && (
    <span className="sop-tag sop-tag-smart">智能</span>
  )}
</div>
```

CSS：复用现有 `.tag` 样式或新增 `.sop-tag-smart`，颜色用 `var(--accent)`（暖色），与 MP `tag-positive` 视觉对应。

## 已对齐确认（防误报清单）

以下项在多次审计中被怀疑为差异，**已确认双端对齐**，记在此防止后续审计重复误报：

| 项目 | H5 位置 | MP 位置 | 备注 |
|------|---------|---------|------|
| 自定义榜单显示数量 modal | `HomePage.jsx` 内 | `RankSection.vue:51-63` | 双端都有完整 modal + `getRankConfig`/`updateRankConfig` API |
| 个人中心数据统计 | `ProfilePage.jsx:175` 「{totalRecords} 条记录」 | `profile/index.vue:85` 「{{ dataStats.total }}条记录」 | 双端都是单行文字，无差 |
| FAB 悬浮按钮位置 | CardLib / Sop / Review 三页 | CardLib / Sop 两页（Review 页用顶部 inline） | 复盘端入口形态差异是 `feature-alignment` 已知决定，非缺陷 |
| 详情页形态 | DetailPanel 侧滑组件 | `pages/*/detail.vue` 独立页 | 平台习惯差异，非功能差 |
| 单位 / 变量 | px + CSS variable | rpx + SCSS variable | 平台规范差异 |
| 图标实现 | lucide-react | `app-icon` 组件（base64 SVG data URI） | 等效，源都是 lucide |

## 数据流图（灵感字段）

```
用户灵感数据
  │
  ├─ 从 storage 读
  │   └─ migrateInspirationsInferred()  ← 仅缺 direction 时介入
  │       └─ direction='positive' + _direction_inferred=true
  │
  ├─ 渲染卡片
  │   └─ _direction_inferred=true → 「待确认方向」徽章 + 特殊长按菜单
  │
  └─ 用户操作（确认 / 翻转 / 编辑提交）
      └─ _direction_inferred=false
```

## 不做事项

- 不删除 `_direction_inferred` 字段在 storage 持久化（保留以便日后双端 import/export 不丢字段）
- 不改 MP 端任何代码
- 不引入 v5 DATA_VERSION（迁移函数幂等，无需 bump）
