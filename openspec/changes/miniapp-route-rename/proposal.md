## Why

小程序文件命名与实际渲染内容错位：

| pages.json 路径 | 文件 template class | 实际承载页面 | 调用 API |
|----------------|--------------------|---------------|---------|
| `pages/sop/index` | `page-review` | **复盘中心** | `api.reviews.*` |
| `pages/review/index` | `page-sop` | **SOP 模板列表** | `api.sops.*` |

navigationBarTitleText 也同步错配：`pages/sop/index` 标题是「SOP模板」，但页面渲染复盘内容；反之亦然。

**影响**：

1. tabBar 上「SOP」按钮点进去看到的是复盘页（用户体验严重错乱）
2. 任何 `uni.navigateTo({ url: '/pages/sop/index' })` 跳转都会跳到错误页面
3. 二次开发时根据路径找文件会找错
4. 与 H5 路由 `/sop` 与 `/review` 的语义完全相反，双端心智模型不一致

H5 不存在此问题。本 change 只修复小程序，恢复路径 ↔ 内容的语义一致。

## What Changes

### 1. 文件互换

```
pages/sop/index.vue       ← 当前是复盘 → 改为 SOP 实际内容
pages/review/index.vue    ← 当前是 SOP → 改为复盘实际内容
```

操作方式：

- 不重命名文件路径（保持 `pages.json` 与全部跳转链接稳定）
- **互换两个文件的内容**（template / script / style 整体交换）

### 2. pages.json 标题校准

```json
{
  "path": "pages/sop/index",
  "style": { "navigationBarTitleText": "SOP模板", ... }
},
{
  "path": "pages/review/index",
  "style": { "navigationBarTitleText": "复盘中心", ... }
}
```

实际现状已经如此（只是文件内容错配）；交换后标题与内容自然匹配。

### 3. 内部跳转路径校验

排查所有 `uni.navigateTo` / `uni.switchTab` / `uni.redirectTo` 中含 `/pages/sop` 或 `/pages/review` 的跳转：

- 跳 SOP 详情 / 创建 SOP → 应跳 `/pages/sop/...`
- 跳复盘详情 / 新建复盘 → 应跳 `/pages/review/...`

由于过去命名错位，已有跳转可能"将错就错"地用反路径绕到正确页面。这次互换后，这些反向跳转会全部失效，必须逐一校正。

## Why Now

- feature-alignment 的「复盘新建」「淘汰库」要在小程序复盘页扩功能。如果不先修路径错位，所有新增代码都会写到 `pages/sop/index.vue`，进一步固化错位
- 路径错位是数据契约外的纯结构问题，先修风险低、收益清晰
- homepage-module-reorder 不直接依赖此 change，但路径正确后调试更直观

## Non-goals

- 不改 pages.json 路径本身（不重命名）
- 不动 H5（H5 路由正确）
- 不重构页面内部逻辑（只搬运）
- 不动 SOP 详情、创建、复盘详情等子页面（路径已正确）
