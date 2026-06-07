import { useState } from 'react'
import { Pencil, CheckCircle2, Lightbulb, Pin, RefreshCw, Rocket, Target } from 'lucide-react'

const ICON_MAP = {
  '✏️': Pencil,
  '✅': CheckCircle2,
  '💡': Lightbulb,
  '📌': Pin,
  '🔄': RefreshCw,
  '🚀': Rocket,
  '🎯': Target,
}

export default function SmartSuggestion({ suggestion, onAction }) {
  const [dismissed, setDismissed] = useState(false)
  if (!suggestion || dismissed) return null
  const IconComp = ICON_MAP[suggestion.icon]

  return (
    <div className="smart-suggestion">
      <button className="smart-suggestion-close" onClick={() => setDismissed(true)}>×</button>
      <div className="smart-suggestion-icon">
        {IconComp ? <IconComp size={18} strokeWidth={1.5} /> : suggestion.icon}
      </div>
      <div className="smart-suggestion-body">
        <div className="smart-suggestion-text">{suggestion.text}</div>
        {suggestion.action && (
          <button className="smart-suggestion-btn" onClick={() => onAction(suggestion.action)}>
            去完成 →
          </button>
        )}
      </div>
    </div>
  )
}
