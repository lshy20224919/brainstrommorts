import { useEffect, useState } from 'react'
import { api } from '../mock'
import Loading from './Loading'
import SensitiveText from './SensitiveText'

export default function LawDetailPanel({ visible, law, category, onClose }) {
  const [relatedAction, setRelatedAction] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!visible || !law) return
    let active = true
    const load = async () => {
      setLoading(true)
      const action = law.related_action_id ? await api.getAction(law.related_action_id) : null
      if (!active) return
      setRelatedAction(action)
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [visible, law])

  if (!visible || !law) return null

  return (
    <div className="action-detail-panel">
      <div className="action-detail-header">
        <button className="action-detail-back" onClick={onClose}>←</button>
        <div className="action-detail-title">{law.law_type === 1 ? '正向规律' : '负向规律'}</div>
        <div className="action-detail-spacer" />
      </div>

      <div className="action-detail-body">
        {loading ? <Loading rows={4} /> : (
          <>
            <section className="action-detail-section">
              <div className="action-detail-section-title">规律描述</div>
              <SensitiveText as="div" className="detail-law-desc-block" id={`law-desc-${law.id}`} value={law.law_desc} />
            </section>

            <section className="action-detail-section">
              <div className="action-detail-section-title">详细信息</div>
              <div className="action-detail-summary-card">
                <div className="action-detail-category">{category?.icon} {category?.name}</div>
                <div className="action-detail-grid">
                  <div className="action-detail-metric"><span className="label">类型</span><span className={`value ${law.law_type === 1 ? 'success' : 'fail'}`}>{law.law_type === 1 ? '正向' : '负向'}</span></div>
                  <div className="action-detail-metric"><span className="label">触发次数</span><span className="value">{law.trigger_count}</span></div>
                  <div className="action-detail-metric"><span className="label">主观权重</span><span className="value">{law.subjective_weight}</span></div>
                  <div className="action-detail-metric"><span className="label">避雷提醒</span><span className="value">{law.popup_enabled ? '开启' : '关闭'}</span></div>
                </div>
              </div>
            </section>

            {law.applicable_scenes && (
              <section className="action-detail-section">
                <div className="action-detail-section-title">适用场景</div>
                <div className="detail-scenes">{law.applicable_scenes}</div>
              </section>
            )}

            {relatedAction && (
              <section className="action-detail-section">
                <div className="action-detail-section-title">关联正确的事</div>
                <div className="detail-related-item">
                  <span className="detail-related-desc">{relatedAction.name}</span>
                  <span className="detail-related-meta">执行 {relatedAction.exec_count} 次 · 成功率 {relatedAction.success_rate != null ? `${relatedAction.success_rate}%` : '暂无'}</span>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
