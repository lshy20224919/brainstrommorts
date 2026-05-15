import { useState } from 'react'
import Modal from './Modal'

export default function MigrateModal({ visible, categories, currentCategoryId, onClose, onConfirm }) {
  const [targetId, setTargetId] = useState('')
  const available = categories.filter(c => c.id !== currentCategoryId)

  const handleConfirm = () => {
    if (!targetId) return
    onConfirm(Number(targetId))
    setTargetId('')
  }

  if (!visible) return null

  return (
    <Modal visible={visible} title="迁移到其他分类" onClose={onClose}>
      <div className="g-form-group">
        <div className="g-form-label">选择目标分类</div>
        <div className="g-migrate-list">
          {available.map(c => (
            <button key={c.id} className={`g-migrate-item ${Number(targetId) === c.id ? 'active' : ''}`} onClick={() => setTargetId(c.id.toString())}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>
      <div className="g-modal-actions">
        <button className="btn btn-outline" onClick={onClose}>取消</button>
        <button className="btn btn-primary" onClick={handleConfirm} disabled={!targetId}>确认迁移</button>
      </div>
    </Modal>
  )
}
