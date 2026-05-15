import Modal from './Modal'

export default function ConfirmDialog({ visible, title, content, confirmText = '确认', cancelText = '取消', danger = false, onConfirm, onCancel }) {
  if (!visible) return null
  return (
    <Modal visible={visible} title={title} onClose={onCancel}>
      <p className="g-confirm-content">{content}</p>
      <div className="g-modal-actions">
        <button className="btn btn-outline" onClick={onCancel}>{cancelText}</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmText}</button>
      </div>
    </Modal>
  )
}
