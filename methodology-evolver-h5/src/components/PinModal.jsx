import { useState, useEffect } from 'react'
import PinKeypad from './PinKeypad'
import { setPin, clearPin, verifyPin } from '../utils/privacy'

const PIN_LENGTH = 6

export default function PinModal({ mode, visible, onClose, onSuccess }) {
  const [step, setStep] = useState(0)
  const [pin1, setPin1] = useState('')
  const [pin2, setPin2] = useState('')
  const [pin3, setPin3] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (visible) {
      setStep(0); setPin1(''); setPin2(''); setPin3(''); setError('')
    }
  }, [visible, mode])

  if (!visible) return null

  const titles = {
    set: ['设置解锁密码', '请再次输入'],
    change: ['请输入当前密码', '设置新密码', '请再次输入'],
    disable: ['请输入当前密码以关闭']
  }
  const title = titles[mode][step]

  const handleSubmit = async () => {
    if (mode === 'set') {
      if (step === 0) {
        if (pin1.length !== PIN_LENGTH) return
        setStep(1); return
      }
      if (pin2 !== pin1) { setError('两次密码不一致'); setPin2(''); return }
      await setPin(pin1)
      onSuccess?.('已开启解锁密码')
      onClose()
      return
    }
    if (mode === 'change') {
      if (step === 0) {
        const ok = await verifyPin(pin1)
        if (!ok) { setError('密码错误'); setPin1(''); return }
        setStep(1); setError(''); return
      }
      if (step === 1) {
        if (pin2.length !== PIN_LENGTH) return
        setStep(2); return
      }
      if (pin3 !== pin2) { setError('两次密码不一致'); setPin3(''); return }
      await setPin(pin2)
      onSuccess?.('密码已更新')
      onClose()
      return
    }
    if (mode === 'disable') {
      const ok = await verifyPin(pin1)
      if (!ok) { setError('密码错误'); setPin1(''); return }
      clearPin()
      onSuccess?.('已关闭解锁密码')
      onClose()
    }
  }

  const currentPin = mode === 'set' ? (step === 0 ? pin1 : pin2)
    : mode === 'change' ? (step === 0 ? pin1 : step === 1 ? pin2 : pin3)
    : pin1

  const setCurrent = (v) => {
    setError('')
    if (mode === 'set') { step === 0 ? setPin1(v) : setPin2(v) }
    else if (mode === 'change') { step === 0 ? setPin1(v) : step === 1 ? setPin2(v) : setPin3(v) }
    else setPin1(v)
    if (v.length === PIN_LENGTH) setTimeout(() => handleSubmitWith(v), 50)
  }

  const handleSubmitWith = async (v) => {
    if (mode === 'set' && step === 0) { setStep(1); return }
    if (mode === 'set' && step === 1) {
      if (v !== pin1) { setError('两次密码不一致'); setPin2(''); return }
      await setPin(pin1); onSuccess?.('已开启解锁密码'); onClose(); return
    }
    if (mode === 'change' && step === 0) {
      const ok = await verifyPin(v)
      if (!ok) { setError('密码错误'); setPin1(''); return }
      setStep(1); return
    }
    if (mode === 'change' && step === 1) { setStep(2); return }
    if (mode === 'change' && step === 2) {
      if (v !== pin2) { setError('两次密码不一致'); setPin3(''); return }
      await setPin(pin2); onSuccess?.('密码已更新'); onClose(); return
    }
    if (mode === 'disable') {
      const ok = await verifyPin(v)
      if (!ok) { setError('密码错误'); setPin1(''); return }
      clearPin(); onSuccess?.('已关闭解锁密码'); onClose()
    }
  }

  return (
    <div className="g-modal-mask" onClick={onClose}>
      <div className="g-modal-box pin-modal" onClick={e => e.stopPropagation()}>
        <div className="g-modal-title">{title}</div>
        <div className="pin-error">{error || ' '}</div>
        <PinKeypad length={PIN_LENGTH} value={currentPin} onChange={setCurrent} />
        <div className="g-modal-actions">
          <button className="btn btn-outline" onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  )
}
