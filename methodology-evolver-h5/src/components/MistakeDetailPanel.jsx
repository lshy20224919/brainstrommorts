import { useEffect, useState } from 'react'
import { api } from '../mock'
import Loading from './Loading'

export default function MistakeDetailPanel({ visible, mistake, category, onClose }) {
  const [relatedLaws, setRelatedLaws] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!visible || !mistake) return
    let active = true
    const load = async () => {
      setLoading(true)
      const ids = mistake.related_law_ids || []
      const laws = ids.length > 0 ? await api.getLawsByIds(ids) : []
      if (!active) return
      setRelatedLaws(laws)
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [visible, mistake])

  if (!visible || !mistake) return null

  return (
    <div className="action-detail-panel">
      <div className="action-detail-header">
        <button className="action-detail-back" onClick={onClose}>←</button>
        <div className="action-detail-title">{mistake.name}</div>
        <div className="action-detail-spacer" />
      </div>

      <div className="action-detail-body">
        {loading ? <Loading rows={4} /> : (
          <>
            <section className="action-detail-section">
              <div className="action-detail-section-title">基础信息</div>
              <div className="action-detail-summary-card">
                <div className="action-detail-category">{category?.icon} {category?.name}</div>
                <div className="action-detail-grid">
                  <div className="action-detail-metric"><span className="label">主观权重</span><span className="value">{mistake.subjective_weight}</span></div>
                  <div className="action-detail-metric"><span className="label">状态</span><span className="value">{mistake.status === 0 ? '正常' : '已淘汰'}</span></div>
                </div>
                {mistake.remark && <div className="detail-remark">{mistake.remark}</div>}
              </div>
            </section>

            {relatedLaws.length > 0 && (
              <section className="action-detail-section">
                <div className="action-detail-section-title">关联规律 ({relatedLaws.length})</div>
                <div className="detail-related-list">
                  {relatedLaws.map(law => (
                    <div key={law.id} className="detail-related-item">
                      <span className={`detail-law-tag ${law.law_type === 1 ? 'positive' : 'negative'}`}>
                        {law.law_type === 1 ? '正向' : '负向'}
                      </span>
                      <span className="detail-related-desc">{law.law_desc}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
