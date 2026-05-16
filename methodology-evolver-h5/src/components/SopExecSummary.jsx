export default function SopExecSummary({ visible, sopName, results, onClose }) {
  if (!visible) return null

  const total = results.length
  const successCount = results.filter(r => r.result === 'success').length
  const rate = total > 0 ? Math.round((successCount / total) * 100) : 0

  return (
    <div className="sop-exec-summary">
      <div className="sop-exec-summary-header">
        <div className="sop-exec-summary-title">执行完成</div>
        <div className="sop-exec-summary-sop">{sopName}</div>
      </div>

      <div className="sop-exec-summary-stats">
        <div className="sop-exec-summary-stat">
          <span className="label">执行动作</span>
          <span className="value">{total} 个</span>
        </div>
        <div className="sop-exec-summary-stat">
          <span className="label">成功率</span>
          <span className="value" style={{ color: rate >= 70 ? '#36D399' : rate >= 40 ? '#FBBF24' : '#F87272' }}>{rate}%</span>
        </div>
      </div>

      <div className="sop-exec-summary-list">
        {results.map((r, i) => (
          <div key={i} className="sop-exec-summary-item">
            <span className={`sop-exec-summary-badge ${r.result === 'success' ? 'success' : 'fail'}`}>
              {r.result === 'success' ? '✓' : '✕'}
            </span>
            <span className="sop-exec-summary-name">{r.actionName}</span>
          </div>
        ))}
      </div>

      <button className="sop-exec-summary-done" onClick={onClose}>完成</button>
    </div>
  )
}
