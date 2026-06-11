## 数据模型

### Storage 结构（H5 localStorage / 小程序 uni storage）

```typescript
// 命名空间统一前缀 privacy.*
{
  'privacy.lockEnabled': boolean,
  'privacy.lockHash': string,         // hex SHA-256
  'privacy.lockSalt': string,         // hex 32 字节随机
  'privacy.lockFailedCount': number,  // 当次锁定计数
  'privacy.lockedUntil': number,      // 解锁时间戳
  'privacy.sensitiveHidden': boolean
}
```

### Hash 算法

```typescript
async function hashPin(pin: string, salt: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(salt + pin)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
```

H5 用 `crypto.subtle`，小程序用 uni 兼容方案：

- 微信小程序：`wx.getRandomValues` 生成 salt，SHA-256 用 `crypto-js` 或自实现
- 跨端建议用 `crypto-js` npm 包（uni-app 支持）

### Salt 生成

```typescript
function generateSalt(): string {
  // 32 字节随机
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)  // H5
  // 小程序：wx.getRandomValues({ length: 32, success: ({ randomValues }) => ... })
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}
```

## 锁屏页

### H5

新增 `src/components/LockScreen.jsx`：

```jsx
import { useState, useEffect } from 'react'

export default function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(null)
  const [lockedUntil, setLockedUntil] = useState(0)

  // 进入时读 lockedUntil，倒计时禁用输入
  useEffect(() => {
    const until = Number(localStorage.getItem('privacy.lockedUntil') || 0)
    if (until > Date.now()) setLockedUntil(until)
  }, [])

  const handleSubmit = async () => {
    const salt = localStorage.getItem('privacy.lockSalt')
    const expected = localStorage.getItem('privacy.lockHash')
    const actual = await hashPin(pin, salt)
    if (actual === expected) {
      localStorage.setItem('privacy.lockFailedCount', '0')
      onUnlock()
    } else {
      const cnt = Number(localStorage.getItem('privacy.lockFailedCount') || 0) + 1
      localStorage.setItem('privacy.lockFailedCount', String(cnt))
      if (cnt >= 5) {
        const until = Date.now() + 60_000
        localStorage.setItem('privacy.lockedUntil', String(until))
        setLockedUntil(until)
      }
      setError('密码错误')
    }
  }

  // ...UI: 数字键盘 / 6 位 dot indicator
}
```

`App.jsx` 顶层包裹：

```jsx
function App() {
  const [unlocked, setUnlocked] = useState(!isLockEnabled())
  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />
  return <Router>...</Router>
}
```

### 小程序

新增 `pages/lock/index.vue`，pages.json 不放 tabBar，作为隐藏页面。

`App.vue`：

```javascript
onLaunch() {
  if (this.$privacy.isLockEnabled() && !this.$privacy.isUnlockedThisSession()) {
    uni.reLaunch({ url: '/pages/lock/index' })
  }
}
```

锁屏页校验通过后 `uni.reLaunch({ url: '/pages/index/index' })`。

会话内解锁标记：内存变量（`getApp().globalData.unlocked = true`），杀进程后失效需重锁。

## 设置 UI

### H5 ProfilePage 增加 PrivacySection

```jsx
function PrivacySection() {
  const [lockEnabled, setLockEnabled] = useState(getLockEnabled())
  const [sensitiveHidden, setSensitiveHidden] = useState(getSensitiveHidden())
  const [showPinModal, setShowPinModal] = useState(null)  // 'set' | 'change' | 'disable'

  return (
    <section className="profile-section">
      <h3>隐私设置</h3>

      <div className="settings-row">
        <span>解锁密码</span>
        <Switch checked={lockEnabled} onChange={(v) => setShowPinModal(v ? 'set' : 'disable')} />
        {lockEnabled && <button onClick={() => setShowPinModal('change')}>修改</button>}
      </div>

      <div className="settings-row">
        <span>敏感内容隐藏</span>
        <Switch checked={sensitiveHidden} onChange={setSensitiveHidden} />
      </div>

      {showPinModal && <PinModal mode={showPinModal} onClose={...} onConfirm={...} />}
    </section>
  )
}
```

### PinModal 三种 mode

| mode | 表单 | 提交动作 |
|------|------|---------|
| set | 新密码 / 确认新密码 | 生成 salt + hash，写 storage，enabled=true |
| change | 旧密码 / 新密码 / 确认新密码 | 旧密码匹配后 → 新 salt + hash 写入 |
| disable | 当前密码 | 匹配后清除 hash/salt，enabled=false |

UI 用 6 个 dot indicator + 自定义数字键盘（避免触发系统键盘）。

### 小程序 ProfilePage 同步

`pages/profile/index.vue` 增加同样 section，PinModal 用 `uni.showModal` 不够，需自实现 modal 组件 `components/pin-modal.vue`。

## 敏感内容隐藏

### H5 hook

```typescript
// src/hooks/useSensitivePrivacy.js
export function useSensitivePrivacy() {
  const [hidden, setHidden] = useState(getSensitiveHidden())
  const [revealed, setRevealed] = useState(new Set())

  useEffect(() => {
    const handler = () => setHidden(getSensitiveHidden())
    window.addEventListener('privacy-changed', handler)
    return () => window.removeEventListener('privacy-changed', handler)
  }, [])

  const reveal = (id) => setRevealed(prev => new Set([...prev, id]))
  const isHidden = (id) => hidden && !revealed.has(id)

  return { isHidden, reveal }
}
```

切换开关时 `window.dispatchEvent(new Event('privacy-changed'))` 通知所有挂载点。

### 小程序 mixin

```javascript
// mixins/sensitive.js
export default {
  data() {
    return {
      _privacyHidden: false,
      _privacyRevealed: {}
    }
  },
  onLoad() {
    this._privacyHidden = uni.getStorageSync('privacy.sensitiveHidden') === true
    uni.$on('privacy-changed', this._onPrivacyChanged)
  },
  onUnload() {
    uni.$off('privacy-changed', this._onPrivacyChanged)
  },
  methods: {
    _onPrivacyChanged() {
      this._privacyHidden = uni.getStorageSync('privacy.sensitiveHidden') === true
    },
    isHidden(id) {
      return this._privacyHidden && !this._privacyRevealed[id]
    },
    reveal(id) {
      this.$set(this._privacyRevealed, id, true)
    }
  }
}
```

### 渲染分支

卡片 / 详情中 remark / 灵感 desc：

```jsx
{isHidden(item.id)
  ? <span className="sensitive-mask" onClick={() => reveal(item.id)}>点击查看</span>
  : <span>{item.remark}</span>}
```

```vue
<text v-if="isHidden(item.id)" class="sensitive-mask" @tap="reveal(item.id)">点击查看</text>
<text v-else>{{ item.remark }}</text>
```

## 数字键盘

### H5

自实现 9 宫格组件（避免 input type=number 触发系统键盘）：

```
[1] [2] [3]
[4] [5] [6]
[7] [8] [9]
[ ] [0] [⌫]
```

输入填进 dot indicator，6 位（或 4 位用户选）满即触发提交。

### 小程序

同样自实现，使用 `<view>` 拼装。

> 备选：直接用 `<input password="true" type="number" />`，简化实现。但安全感与体验略弱。

**决策**：本期用自定义键盘（与 doc 10.4.5 「软隐私 + 防止偷看」语义匹配）。

## 风险与边界

| 风险 | 缓解 |
|------|------|
| 用户忘记密码 | 设置时强提示「忘记 = 清空数据」；锁屏页提供「忘记密码 = 清空所有数据并重置」二级入口 |
| 锁定时间被绕过（改本地时钟） | 不防（软隐私定位允许） |
| storage 被工具直读 | 标注于 doc 与 UI 提示「本地软隐私」 |
| 多端不同步 | 各端独立设置（H5 与小程序当前没有云同步） |
| 主题/语言切换页 LockScreen 闪烁 | 在 splash/loading 期判断后再渲染主路由 |

## 验证

- [ ] PIN 设置 / 修改 / 关闭三种流程跑通
- [ ] 5 次错误后锁定 60 秒
- [ ] 冷启动开启 PIN 时显示锁屏
- [ ] 关闭 PIN 后冷启动直接进首页
- [ ] 敏感隐藏开关切换实时生效（无需刷新）
- [ ] 开关开启时卡片库 remark 折叠为「点击查看」
- [ ] reveal 一条后该条本会话保持显示
- [ ] 关闭开关后所有 mask 消失
- [ ] 双端 H5/小程序 UI 与交互体验一致
- [ ] 「忘记密码 = 清空数据」流程跑通且二次确认
