import SensitiveText from './SensitiveText'

export default function InspirationDetailPanel({ visible, inspiration, category, onClose }) {
  if (!visible || !inspiration) return null

  const dirLabel = inspiration.direction === 'positive' ? '正向灵感' : '负向灵感'
  const dirClass = inspiration.direction === 'positive' ? 'positive' : 'negative'

  return (
    <div className="action-detail-panel">
      <div className="action-detail-header">
        <button className="action-detail-back" onClick={onClose}>←</button>
        <div className="action-detail-title">灵感详情</div>
        <div className="action-detail-spacer" />
      </div>

      <div className="action-detail-body">
        <section className="action-detail-section">
          <div className="action-detail-section-title">内容</div>
          <SensitiveText as="div" className="detail-law-desc-block" id={`insp-detail-${inspiration.id}`} value={inspiration.desc} />
        </section>

        <section className="action-detail-section">
          <div className="action-detail-section-title">详细信息</div>
          <div className="action-detail-summary-card">
            {category && <div className="action-detail-category">{category.icon} {category.name}</div>}
            <div className="action-detail-grid">
              <div className="action-detail-metric"><span className="label">方向</span><span className={`value ${dirClass === 'positive' ? 'success' : 'fail'}`}>{dirLabel}</span></div>
              <div className="action-detail-metric"><span className="label">来源</span><span className="value">{inspiration.source || '未标注'}</span></div>
              <div className="action-detail-metric"><span className="label">状态</span><span className="value">{inspiration.status === 0 ? '未处理' : '已转化'}</span></div>
              <div className="action-detail-metric"><span className="label">创建时间</span><span className="value">{new Date(inspiration.created_time).toLocaleDateString()}</span></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
