import { Delete } from 'lucide-react'

export default function PinKeypad({ length = 6, value, onChange, disabled }) {
  const handleNum = (n) => {
    if (disabled) return
    if (value.length >= length) return
    onChange(value + n)
  }
  const handleDel = () => {
    if (disabled) return
    if (value.length === 0) return
    onChange(value.slice(0, -1))
  }
  const dots = Array.from({ length }, (_, i) => i)
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div className="pin-keypad">
      <div className="pin-dots">
        {dots.map(i => (
          <span key={i} className={`pin-dot ${value.length > i ? 'filled' : ''}`}></span>
        ))}
      </div>
      <div className="pin-keys">
        {keys.map(k => (
          <button key={k} type="button" className="pin-key" disabled={disabled} onClick={() => handleNum(k)}>{k}</button>
        ))}
        <span className="pin-key pin-key-empty"></span>
        <button type="button" className="pin-key" disabled={disabled} onClick={() => handleNum('0')}>0</button>
        <button type="button" className="pin-key pin-key-del" disabled={disabled} onClick={handleDel}>
          <Delete size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
