import { useEffect, useRef } from 'react'

export default function PostActionGuide({ visible, message, actions, onClose }) {
  const timerRef = useRef(null)

  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(() => { onClose() }, 3000)
      return () => clearTimeout(timerRef.current)
    }
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div className="post-action-guide" onClick={e => e.stopPropagation()}>
      <div className="post-action-guide-msg">{message}</div>
      <div className="post-action-guide-btns">
        {actions.map((action, i) => (
          <button key={i} className="post-action-guide-btn" onClick={() => { clearTimeout(timerRef.current); action.onClick(); onClose() }}>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
