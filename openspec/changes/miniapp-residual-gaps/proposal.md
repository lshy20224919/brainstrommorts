## Why

H5 已实现 cardlib-redesign / 图标统一 / 模态框统一等改造，小程序未跟进。需求约束：**小程序为终态，与 H5 功能不能有任何区别**。本 change 处理小程序侧剩余的功能与视觉缺口。

数据契约级缺陷（B4）影响双端互通，最优先：

| 编号 | 类别 | 项目 | 影响 |
|------|------|------|------|
| B4 | 数据契约 | 灵感缺 `direction` 字段 | 高（H5↔小程序数据不通） |
| B5 | 功能 | 深色模式仅布尔，应三档 | 中（与 doc 10.4.5 不符） |
| B8 | 功能 | 「退出登录」按钮 | 中（doc 未要求账号体系，单机本地语义冲突） |
| D1 | 视觉 | 快捷操作 emoji ➕🚫✅📈📉💡 | 中（与 H5 lucide 不一致） |
| D2 | 视觉 | 待办提醒 emoji 📊💡⏰ | 中（同上） |
| D3 | 视觉 | 规律类型 emoji ✅⚠️ | 中 |
| D4 | 视觉 | 错误警告 emoji ⚠️ | 中 |
| D5 | 视觉 | 分类默认图标 emoji 📁 | 低 |
| D6 | 视觉 | 卡片库空状态 emoji 📋⛔💡📊 | 低 |
| F1 | 排版 | filter-bar 竖向多行 | 低（与 H5 横向不一致） |
| F2 | 排版 | sub-tab pill 颜色硬编码 | 低 |

> 注：B1（EvolutionJourney）/ B2（SmartSuggestion）/ B3（DraftReminder）已收入 `homepage-module-reorder`，本 change 不重复。
> 注：B6（复盘 day/custom）已收入 `feature-alignment`，本 change 不重复。
> 注：B7（隐私设置）单独由 `privacy-settings` 处理，本 change 不重复。

## What Changes

### B4. inspirations.direction 必填（关键）

**doc 7.1 强制要求**：灵感方向（正向/负向）必填，是数据模型一部分。

变更：

- 数据模型：`inspirations` 新增 `direction` (1=正向, 2=负向)
- 创建 UI：`pages/inspiration/create.vue` 新增方向 pill 选择，必选才能提交
- 编辑 UI：`pages/card/edit.vue`（或灵感专用编辑页）支持改方向
- 详情 UI：列出 direction badge
- API：`createInspiration` / `updateInspiration` 接受 direction；`getInspirations` 返回 direction
- Mock 与种子数据：补 direction 字段，老数据回填默认值（正向）+ 提示用户重设

迁移策略：现有 inspirations 记录回填 `direction=1`（默认正向），用户可在 cardlib 长按重设。

### B5. 深色模式三档（doc 10.4.5）

`pages/profile/index.vue` 把布尔 switch 改为三档 segment：

```
[浅色] [深色] [跟随系统]
```

实现要点：

- 配置存 `uni.setStorageSync('theme', 'light' | 'dark' | 'auto')`
- `auto` 值时通过 `uni.getSystemInfoSync().theme` 决定实际渲染
- 监听系统主题变化（`uni.onThemeChange`）

### B8. 移除「退出登录」

doc 未提及账号体系；项目设定为单机本地。`pages/profile/index.vue` 的「退出登录」按钮直接删除。

如有 `pages/login/index.vue`：保留文件不删除（可能为占位），但首页不再引用、profile 不再有跳转入口。

### D 系列：emoji → lucide 等价图标

小程序无 lucide 包。两种方案：

**方案 A（推荐）**：引入 SVG sprite，与 H5 lucide 同源 SVG（lucide 官网下载或从 lucide-static 提取）

**方案 B**：用 uni-icons / iconfont 找最接近的图标

选 **方案 A**：保证双端图标一对一一致。

涉及替换：

| 位置 | 旧 emoji | 新图标 |
|------|---------|--------|
| 快捷操作 | ➕ 🚫 ✅ 📈 📉 💡 | circle-plus / shield-x / circle-check / trending-up / trending-down / sparkles |
| 待办提醒 | 📊 💡 ⏰ | clipboard-list / sparkles / clock |
| 规律类型 | ✅ ⚠️ | circle (正) / circle (负) 或 trending-up / trending-down |
| 错误警告 | ⚠️ | alert-triangle |
| 分类默认 | 📁 | 改用几何符号 `◇`（与 H5 一致，无需 SVG） |
| 卡片库空状态 | 📋 ⛔ 💡 📊 | inbox / shield-x / sparkles / bar-chart |

### F 系列：排版细节

- F1：filter-bar 改横向单行（与 H5 一致），关键 CSS 调 `flex-direction: row`
- F2：sub-tab pill 选中色用 SCSS 变量 `$accent-color` / `$danger-color`，与 H5 CSS variable 命名同语义

## Why Now

- 与 `feature-alignment` / `homepage-module-reorder` 同期：小程序若不补齐这批，发版即与 H5 失同步
- B4 是数据契约级别，越晚改迁移成本越大（用户灵感数据增加）
- 视觉差异在用户层面最直观，且改动机械

## Non-goals

- 不引入完整 icon font（仅 SVG sprite 按需打包）
- 不重写 H5 已有的 cardlib 信息架构（小程序按已通过的 cardlib-redesign 同步即可，由本 change 跟进）
- 不动详情页弹窗深层交互
- 不做小程序 UI 大规模视觉重设计（按 H5 现状对齐即可）
