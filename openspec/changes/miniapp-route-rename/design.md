## 错位现状（确认）

```
methodology-evolver/client/src/pages/

  sop/
    index.vue       ❌ <view class="page-review">
                       ├ 「新建复盘」入口
                       ├ 「复盘历史」grid
                       └ 「淘汰库」section
                       调 api.reviews.list / api.reviews.create

  review/
    index.vue       ❌ <view class="page-sop">
                       ├ 「分类筛选」filter-bar
                       └ SOP 列表
                       调 api.sops.list

  review/
    detail.vue      ✅（疑似复盘详情，需确认）

  sop/
    （仅 index.vue，无 detail.vue）
```

## 互换策略

不动文件路径与 pages.json，**只交换两个文件的内容**：

```
Before:
  sop/index.vue       → 复盘 UI
  review/index.vue    → SOP UI

After:
  sop/index.vue       → SOP UI（移过来）
  review/index.vue    → 复盘 UI（移过来）
```

实施方式：

1. 创建临时文件 `sop/index.vue.new`，复制 `review/index.vue` 现内容
2. 用 `sop/index.vue` 现内容覆盖 `review/index.vue`
3. 用 `sop/index.vue.new` 覆盖 `sop/index.vue`
4. 删除临时文件

或更简单：分别 Read 两个文件 → 用 Write 互换内容（无中间文件）。

## 跳转校正清单

需要全文搜索校正的字符串模式：

```bash
# 应去 SOP 列表的（错配可能写成 review）：
grep -rn "url: ['\"]\/pages/review/index" client/src/

# 应去复盘列表的（错配可能写成 sop）：
grep -rn "url: ['\"]\/pages/sop/index" client/src/

# tabBar 配置：
grep -rn '"path": "pages/sop\|"path": "pages/review' client/src/pages.json

# 可能存在的错配跳转：
grep -rn 'sop/detail\|review/detail' client/src/
```

校正规则：

- 链接到「SOP 列表」→ `/pages/sop/index`
- 链接到「复盘中心」→ `/pages/review/index`
- 链接到「SOP 详情」→ `/pages/sop/detail?id=X`（如不存在则跳到列表）
- 链接到「复盘详情」→ `/pages/review/detail?id=X`

## tabBar 校正

`pages.json` 的 tabBar 配置中四项（首页 / 卡片库 / SOP / 复盘 / 个人中心）的 `pagePath` 与 `text` 必须匹配。

```json
{
  "tabBar": {
    "list": [
      { "pagePath": "pages/index/index", "text": "首页" },
      { "pagePath": "pages/card/index", "text": "卡片库" },
      { "pagePath": "pages/sop/index", "text": "SOP" },
      { "pagePath": "pages/review/index", "text": "复盘" },
      { "pagePath": "pages/profile/index", "text": "我的" }
    ]
  }
}
```

文件内容互换后，点击「SOP」tab 进入 SOP 列表，点击「复盘」tab 进入复盘中心，符合直觉。

## 风险

| 风险 | 缓解 |
|------|------|
| 互换过程中文件被覆盖错乱 | 先 git 提交一次，互换后单独 commit |
| 子页面 detail.vue 也错位 | 互换前 grep `class="page-` 与文件名比对，发现错配一并处理 |
| 跳转链接漏改 | grep 全文 + 编译测试 + 手动点击 tabBar 验证 |
| H5 团队成员混淆 | 本 change 仅在小程序代码库内执行，H5 完全不动 |

## 验证

- [ ] 微信开发者工具点 tabBar 「SOP」→ 看到 SOP 列表
- [ ] 微信开发者工具点 tabBar 「复盘」→ 看到复盘中心
- [ ] 创建 SOP / 复盘的入口跳转分别进对应详情
- [ ] 全局 grep 无残留错配跳转
- [ ] git diff 可读：两个文件成对修改
