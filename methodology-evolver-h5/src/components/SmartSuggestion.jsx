export default function SmartSuggestion({ suggestion, onAction }) {
  if (!suggestion) return null

  return (
    <div className="smart-suggestion">
      <div className="smart-suggestion-icon">{suggestion.icon}</div>
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
