## Why

`miniapp-residual-gaps` 把小程序补齐到 H5 水平时，给灵感引入了 `_direction_inferred`（待确认方向）半状态字段，给 SOP 引入了 `is_auto_generated`（智能）来源标记。两者都是数据契约级字段，但 H5 没跟进，造成：

| 字段 | H5 | 小程序 | 影响 |
|------|----|--------|------|
| `inspirations._direction_inferred` | 缺 | 有迁移 + 徽章 + 长按确认 | 双端互导/共享 storage 时丢字段；用户在小程序看到的「待确认方向」灵感，导入 H5 后失去标记 |
| `sops.is_auto_generated` | 缺 | seed + 「智能」徽章 | 同上；H5 SOP 列表完全无法区分用户自建 vs 系统建议 |

「双端体验一致」是项目硬约束（同 `miniapp-residual-gaps/proposal.md` 表述），这两个字段都属于残留差异。

为彻底关闭对齐审计，本 change 还把另一轮 H5/MP 视觉对比中**已确认对齐**的项目记录在案（design.md 末尾），避免日后重复误报。

## What Changes

### 1. 灵感 `_direction_inferred`（H5 补）

现状：H5 mock 灵感数据全部 hardcode `direction: 'positive' | 'negative'`，没有迁移路径，长按菜单也没有「确认方向」分支。

变更：

- `src/mock.js`：
  - 增加 `_direction_inferred` 字段定义（boolean，可选）
  - 增加 `migrateInspirationsV1` 类型函数（首次加载老 storage 时跑一次）：缺 direction 的记录回填 `direction='positive' + _direction_inferred=true`
  - `updateInspiration` 接受 `_direction_inferred` 字段
- `src/pages/CardLibPage.jsx`：
  - 灵感卡片渲染时，`_direction_inferred=true` 的项渲染「待确认方向」徽章（虚线边框区分于「正向/负向」实心徽章）
  - 长按菜单：当 `_direction_inferred=true` 时，菜单项变为「确认正向」「改为负向灵感」两条；普通状态下保持原菜单
  - 任一确认/翻转操作后写入 `_direction_inferred=false`
- `src/components/CreateInspirationModal.jsx`：
  - 编辑模式提交时清 `_direction_inferred=false`（与 MP `pages/card/index.vue:359` 行为一致）

### 2. SOP `is_auto_generated`（H5 补）

现状：H5 mock SOP 数据无此字段，列表展示也没区分。

变更：

- `src/mock.js`：
  - SOP seed 数据补 `is_auto_generated: 0`（默认手动）
  - 至少一条 seed SOP 设 `is_auto_generated: 1`，与 MP `mock/index.js:201` 对应
  - `createSop` API 默认设 `is_auto_generated: 0`
- `src/pages/SopPage.jsx`：
  - SOP 卡片标题旁渲染「智能」徽章（仅当 `is_auto_generated === 1`），样式参考 MP 的 `tag tag-positive`
- `src/App.css`：
  - 增加 `.sop-card-smart-tag` 或复用现有 tag 样式

## Why Now

- 这两个字段已在小程序生产代码里（`miniapp-residual-gaps` 已合并进 `ccdae5c`），H5 是「负债端」
- 字段语义还简单（一个 boolean），未来再出现迁移分支时（如 v3）会变复杂
- 修复成本极低（双端各 ~3 个文件），收益是关闭整个 OpenSpec 对齐审计

## Non-goals

- 不引入真正的「智能 SOP 自动生成」流程（`is_auto_generated` 仍是 seed 数据 flag）
- 不动小程序（小程序已是参考实现，本 change 只补 H5）
- 不重新设计灵感方向的「未确认」交互（只复用 MP 的徽章 + 长按菜单方案）
- 不处理 H5 真实老数据迁移路径之外的版本（DATA_VERSION 仅在缺 direction 时介入，不动其他字段）
