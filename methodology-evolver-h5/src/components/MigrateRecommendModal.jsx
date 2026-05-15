import { useState, useEffect } from 'react'
import Modal from './Modal'
import { useToast } from './Toast'

export default function MigrateRecommendModal({ visible, recommendations, onClose, onAccept, onDismiss }) {
  const [items, setItems] = useState([])
  const toast = useToast()

  useEffect(() => { if (visible) setItems(recommendations || []) }, [visible, recommendations])

  const handleAccept = async (rec) => {
    await onAccept(rec)
    setItems(prev => prev.filter(r => r.id !== rec.id))
    toast.success('迁移成功')
    if (items.length <= 1) onClose()
  }

  const handleDismiss = (rec) => {
    onDismiss(rec.id)
    setItems(prev => prev.filter(r => r.id !== rec.id))
    if (items.length <= 1) onClose()
  }

  if (!visible) return null

  return (
    <Modal visible={visible} title="智能迁移推荐" onClose={onClose}>
      <div className="g-migrate-rec-list">
        {items.map(rec => (
          <div key={rec.id} className="g-migrate-rec-item">
            <div className="g-migrate-rec-header">
              <span className="g-migrate-rec-name">{rec.source_name}</span>
              <span className="g-migrate-rec-score">{rec.similarity_score}% 相似</span>
            </div>
            <div className="g-migrate-rec-reason">{rec.reason}</div>
            <div className="g-migrate-rec-target">{rec.source_category} → {rec.target_category_name}</div>
            <div className="g-migrate-rec-actions">
              <button className="btn btn-sm btn-outline" onClick={() => handleDismiss(rec)}>忽略</button>
              <button className="btn btn-sm btn-primary" onClick={() => handleAccept(rec)}>采纳</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="g-empty-text">暂无推荐</div>}
      </div>
    </Modal>
  )
}
