export default function Modal({ visible, title, onClose, children, className = '' }) {
  if (!visible) return null
  return (
    <div className="g-modal-mask" onClick={onClose}>
      <div className={`g-modal-box ${className}`} onClick={e => e.stopPropagation()}>
        {title && <div className="g-modal-title">{title}</div>}
        {children}
      </div>
    </div>
  )
}
