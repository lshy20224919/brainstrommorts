import { useState, useEffect } from 'react'
import PinKeypad from './PinKeypad'
import { verifyPin, bumpFailedCount, resetFailedCount, getLockState, clearAllAppData, clearPin } from '../utils/privacy'

const PIN_LENGTH = 6

export default function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [lockedUntil, setLockedUntil] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [showForget, setShowForget] = useState(false)

  useEffect(() => {
    const { until } = getLockState()
    if (until > Date.now()) setLockedUntil(until)
  }, [])

  useEffect(() => {
    if (lockedUntil <= Date.now()) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= lockedUntil) {
        setLockedUntil(0)
        resetFailedCount()
        clearInterval(id)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [lockedUntil])

  const isLocked = lockedUntil > now
  const remaining = Math.max(0, Math.ceil((lockedUntil - now) / 1000))

  const onChange = async (v) => {
    if (isLocked) return
    setError('')
    setPin(v)
    if (v.length === PIN_LENGTH) {
      const ok = await verifyPin(v)
      if (ok) {
        resetFailedCount()
        sessionStorage.setItem('privacy.unlocked', '1')
        onUnlock?.()
      } else {
        const { count, until } = bumpFailedCount()
        setPin('')
        if (until > 0) {
          setLockedUntil(until)
          setError('错误次数过多，请稍候再试')
        } else {
          setError(`密码错误（${5 - count} 次后将锁定）`)
        }
      }
    }
  }

  const handleForget = () => {
    if (!confirm('忘记密码将清空全部本地数据，无法恢复，确定继续？')) return
    clearPin()
    clearAllAppData()
    sessionStorage.setItem('privacy.unlocked', '1')
    onUnlock?.()
  }

  return (
    <div className="lockscreen">
      <div className="lockscreen-card">
        <div className="lockscreen-title">输入解锁密码</div>
        <div className="pin-error">
          {isLocked ? `请等待 ${remaining}s` : (error || ' ')}
        </div>
        <PinKeypad length={PIN_LENGTH} value={pin} onChange={onChange} disabled={isLocked} />
        <button className="lockscreen-forget" onClick={handleForget}>忘记密码？</button>
      </div>
    </div>
  )
}
