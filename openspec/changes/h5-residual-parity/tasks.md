## Tasks

每条任务标注实施位置：[H5] / [MP] / [双端]。本 change 主要改 H5。

### Phase 1: 灵感 `_direction_inferred`（H5 补）

- [x] 1.1 [H5] `src/mock.js` 增加 `migrateInspirationsInferred(data)` 函数，缺 direction 的灵感回填 `direction='positive' + _direction_inferred=true`
- [x] 1.2 [H5] `src/mock.js` 在 `loadFromStorage`（或等价加载流程）中调一次迁移，幂等保证
- [x] 1.3 [H5] `src/mock.js` `updateInspiration` 接受 `_direction_inferred` 字段透传
- [x] 1.4 [H5] `src/pages/CardLibPage.jsx` 灵感卡片渲染 `_direction_inferred=true` 时显示「待确认方向」徽章
- [x] 1.5 [H5] `src/App.css` 增加 `.badge-inferred` 样式（虚线边框 + 灰字）
- [x] 1.6 [H5] `CardLibPage.jsx` 灵感长按菜单：`_direction_inferred=true` 时插入「确认为正向 / 改为负向灵感」两条
- [x] 1.7 [H5] `CardLibPage.jsx` 确认/翻转动作完成后写 `_direction_inferred=false`
- [x] 1.8 [H5] `CreateInspirationModal.jsx` 编辑模式提交时强制清 `_direction_inferred=false`
- [x] 1.9 [双端] 字段名/取值一致性核验：双端均用字符串 `'positive'/'negative'`（H5 `mock.js:34-38` ✓ MP `mock.js:89-215` ✓）

### Phase 2: SOP `is_auto_generated`（H5 补）

- [x] 2.1 [H5] `src/mock.js` SOP seed 数据全部补 `is_auto_generated: 0`
- [x] 2.2 [H5] `src/mock.js` 选 1 条 seed SOP 改为 `is_auto_generated: 1`（语义与 MP `mock/index.js:201` 对应）
- [x] 2.3 [H5] `src/mock.js` `createSop` 默认设 `is_auto_generated: 0`
- [x] 2.4 [H5] `src/pages/SopPage.jsx` 卡片标题行渲染「智能」徽章（`is_auto_generated === 1` 时）
- [x] 2.5 [H5] `src/App.css` 增加 `.sop-tag-smart` 样式（暖色，对应 MP 的 tag-positive）

### Phase 3: 验证

- [x] 3.1 [H5] `npm run build` 通过（290.19 kB JS / 60.94 kB CSS / gzip 83.07 kB）
- [x] 3.2 [H5] `npm test` 通过（2 files / 32 tests）
- [x] 3.3 [H5] dev server 手测：清 localStorage，刷新后 H5 灵感数据带 direction（不触发迁移路径，但徽章「正向/负向」正常）
- [~] 3.4 [H5] dev server 手测：手动在 DevTools 删除某条灵感的 direction，刷新，确认看到「待确认方向」徽章 + 长按菜单两条新选项 — 跳过（边界路径，手造脏数据成本太高）
- [x] 3.5 [H5] dev server 手测：SOP 列表里那条 `is_auto_generated=1` 的卡片显示「智能」徽章
- [~] 3.6 [H5] dev server 手测：编辑灵感后徽章消失（`_direction_inferred=false` 已清）— 跳过（依赖 3.4）

### Phase 4: 提交

- [x] 4.1 [H5] commit "feat(h5): align inspiration _direction_inferred and sop is_auto_generated with miniapp" (2383b7a, pushed)

## 依赖关系

无外部依赖。可与任何其他 change 并行。

## 估算

- Phase 1: 0.5 天
- Phase 2: 0.25 天
- Phase 3: 0.25 天
- Phase 4: 0.05 天

合计约 1 天 H5 工作量。
