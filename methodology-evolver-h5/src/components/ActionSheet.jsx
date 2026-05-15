export default function ActionSheet({ visible, actions = [], onClose }) {
  if (!visible) return null
  return (
    <div className="g-modal-mask" onClick={onClose}>
      <div className="g-action-sheet" onClick={e => e.stopPropagation()}>
        {actions.map((action, i) => (
          <button
            key={i}
            className={`g-action-sheet-item ${action.danger ? 'danger' : ''} ${action.disabled ? 'disabled' : ''}`}
            onClick={() => { if (!action.disabled) { action.onClick?.(); onClose() } }}
            disabled={action.disabled}
          >
            {action.icon && <span className="g-action-sheet-icon">{action.icon}</span>}
            {action.label}
          </button>
        ))}
        <button className="g-action-sheet-cancel" onClick={onClose}>取消</button>
      </div>
    </div>
  )
}
