## Why

doc 10.4.5 个人中心明确包含「隐私设置」模块，要求两项能力：

1. **本地解锁密码**（PIN）：开启后进入应用需输密码
2. **敏感记录隐藏开关**：开启后卡片库默认折叠 remark / 灵感原文

双端均缺失：

- H5 `ProfilePage.jsx` 无该 section
- 小程序 `pages/profile/index.vue` 无该 section

由于该功能涉及本地存储密码 hash 与全局渲染过滤，需要双端同步设计、同步实施，独立成 change 比较清晰。

## What Changes

### 1. 个人中心新增「隐私设置」模块（双端）

```
个人中心
├─ 主题
├─ 分类管理
├─ 数据管理（备份/导入）
└─ 隐私设置                       ← 新增
   ├─ 解锁密码    [开关] [修改]
   └─ 敏感内容隐藏 [开关]
```

### 2. 解锁密码（PIN）

**规格**：

- 4-6 位数字
- 存储格式：`SHA-256(salt + pin)`，salt 在首次设置时随机生成
- 存储位置：H5 `localStorage`，小程序 `uni.setStorageSync`
- 不上传服务端、不上传云

**开启流程**：

```
开关 OFF → ON
   ↓
弹「设置密码」对话框（输入两次匹配）
   ↓
保存 hash + salt + enabled=true
```

**关闭流程**：

```
开关 ON → OFF
   ↓
弹「输入当前密码」确认
   ↓
匹配通过 → 清除 hash/salt，enabled=false
```

**修改密码**：

```
点「修改」按钮
   ↓
弹三段式表单：旧密码 / 新密码 / 确认新密码
   ↓
旧密码匹配 + 新密码两次一致 → 写入新 hash
```

**冷启动校验**：

- H5：App.jsx 顶层判断 `privacy.lockEnabled`，若开启展示全屏 PIN 输入页，校验通过才渲染主路由
- 小程序：App.vue `onLaunch` 同样判断，跳转 `pages/lock/index`，校验通过才 reLaunch 到首页
- 输错 5 次：锁定 60 秒后才能再试（单纯防误，不做远程锁）

### 3. 敏感内容隐藏开关

**规格**：

- storage key：`privacy.sensitiveHidden`（boolean）
- 开启后影响范围：
  - 卡片库 remark / 灵感原文 → 默认折叠为「点击查看」
  - 详情页 remark / 灵感原文 → 同上
  - 复盘页历史快照备注 → 同上
- 关闭后所有内容直接展示

**实现机制**：

- 双端各提供 `useSensitivePrivacy()` hook（H5）/ `mixins/sensitive.js`（小程序），返回 `isHidden` 与 `reveal(id)` 临时显示
- 临时显示仅本会话有效，刷新后恢复折叠

### 4. 安全边界（坦诚标注）

**本机 PIN 不是安全边界**。它防止：

- 朋友/家人随手翻阅
- 演示时不小心暴露内容

它**不防**：

- 设备越狱后直读 storage
- 浏览器开发者工具读 localStorage
- 小程序解包读 storage

doc 10.4.5 的隐私设置定位是「本地软隐私」，本 change 实现与该定位匹配；不引入 KDF 多轮迭代、不引入加密存储（避免误导用户）。

## Why Now

- 与 `feature-alignment` / `homepage-module-reorder` / `miniapp-residual-gaps` 并行，覆盖 doc 10.4.5 最后一块缺口
- 涉及全局状态（lock screen 拦截），越早建立越简单。后期插入需要改 App 顶层结构

## Non-goals

- 不做指纹/Face ID（uni-app 跨端兼容差，且非 doc 要求）
- 不做云同步密码（违反单机本地定位）
- 不做密码强度校验（4-6 位数字本身已是 weak constraint）
- 不做强加密存储（与软隐私定位不符）
- 不做密码找回流程（开启时强制提示「忘记密码 = 清空数据」）
