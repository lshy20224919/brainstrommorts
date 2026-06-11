## Tasks

### Phase 1: 现状摸底

- [x] 1.1 [MP] grep `class="page-review"` 与 `class="page-sop"` 找出所有错位文件
- [x] 1.2 [MP] 检查 `pages/sop/detail.vue`（如存在）与 `pages/review/detail.vue` 是否也错位
- [x] 1.3 [MP] 全文 grep `'/pages/sop'` 与 `'/pages/review'` 列出所有跳转点
- [~] 1.4 [MP] 提交一个 baseline commit "chore: before sop/review route rename"  *(未做：执行未要求)*

### Phase 2: 文件内容互换

- [x] 2.1 [MP] 互换 `pages/sop/index.vue` 与 `pages/review/index.vue` 内容
- [N/A] 2.2 [MP] 若 detail 页错位，同步互换 `pages/sop/detail.vue` 与 `pages/review/detail.vue`  *(无需：sop 无 detail.vue，review/detail.vue class=page-review-detail 正确)*
- [x] 2.3 [MP] 互换后逐文件 Read 验证 template 与文件路径语义一致

### Phase 3: 跳转校正

- [x] 3.1 [MP] 修正错配的 SOP 跳转（指向 `/pages/sop/...`）  *(无需修：互换前所有跳转字符串路径正确，互换后语义自然对齐)*
- [x] 3.2 [MP] 修正错配的复盘跳转（指向 `/pages/review/...`）  *(无需修：同上)*
- [x] 3.3 [MP] 校验 detail 跳转 `?id=` 参数仍正确传递

> **遗留**：以下三个跳转目标未在 pages.json 注册，留给后续 change 处理：
> - `/pages/sop/detail` 与 `/pages/sop/create`（feature-alignment 或 SOP 子页面专项）
> - `/pages/review/retired`（feature-alignment Phase 3.7 处理）

### Phase 4: pages.json 校验

- [x] 4.1 [MP] 确认 `pages/sop/index` 标题为「SOP模板」
- [x] 4.2 [MP] 确认 `pages/review/index` 标题为「复盘中心」
- [x] 4.3 [MP] tabBar 配置 pagePath 与 text 一一对应

### Phase 5: 编译与手测

- [~] 5.1 [MP] HBuilderX 编译微信小程序通过  *(跳过：node_modules 未安装，互换为纯模板搬运，前后语法等价)*
- [~] 5.2 [MP] 微信开发者工具：tabBar「SOP」→ SOP 列表  *(待环境就绪后人工验证)*
- [~] 5.3 [MP] 微信开发者工具：tabBar「复盘」→ 复盘中心  *(同上)*
- [~] 5.4 [MP] 点击 SOP 列表项进 SOP 详情  *(同上，且 sop/detail 待建)*
- [~] 5.5 [MP] 点击复盘历史项进复盘详情  *(同上)*
- [x] 5.6 [MP] grep 无残留 `/pages/sop` 指向复盘 / `/pages/review` 指向 SOP

### Phase 6: 提交

- [~] 6.1 [MP] commit "refactor(routes): swap sop/review file contents to match path semantics"  *(留给用户决定提交时机)*

## 依赖关系

无外部依赖。建议在 feature-alignment 实施前完成（避免 feature-alignment 的复盘新功能写错位置）。

## 估算

- Phase 1: 0.25 天
- Phase 2: 0.25 天
- Phase 3: 0.5 天
- Phase 4: 0.1 天
- Phase 5: 0.25 天

合计约 1.5 天小程序工作量。
