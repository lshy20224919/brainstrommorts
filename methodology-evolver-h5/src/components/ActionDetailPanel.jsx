import { useEffect, useState } from 'react'
import { api } from '../mock'
import Loading from './Loading'

function formatDateTime(iso) {
  const d = new Date(iso)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}/${day} ${h}:${min}`
}

export default function ActionDetailPanel({ visible, action, category, onClose }) {
  const [records, setRecords] = useState([])
  const [laws, setLaws] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!visible || !action) return
    let active = true
    const load = async () => {
      setLoading(true)
      const [recordList, lawList] = await Promise.all([
        api.getActionRecords(action.id),
        api.getActionRelatedLaws(action.id)
      ])
      if (!active) return
      setRecords(recordList)
      setLaws(lawList)
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [visible, action])

  if (!visible || !action) return null

  return (
    <div className="action-detail-panel">
      <div className="action-detail-header">
        <button className="action-detail-back" onClick={onClose}>←</button>
        <div className="action-detail-title">{action.name}</div>
        <div className="action-detail-spacer" />
      </div>

      <div className="action-detail-body">
        {loading ? <Loading rows={5} /> : (
          <>
            <section className="action-detail-section">
              <div className="action-detail-section-title">基础概览</div>
              <div className="action-detail-summary-card">
                <div className="action-detail-category">{category?.icon} {category?.name}</div>
                <div className="action-detail-grid">
                  <div className="action-detail-metric"><span className="label">执行次数</span><span className="value">{action.exec_count}</span></div>
                  <div className="action-detail-metric"><span className="label">成功次数</span><span className="value success">{action.success_count}</span></div>
                  <div className="action-detail-metric"><span className="label">失败次数</span><span className="value fail">{action.fail_count}</span></div>
                  <div className="action-detail-metric"><span className="label">成功率</span><span className="value">{action.success_rate != null ? `${action.success_rate}%` : '暂无'}</span></div>
                  <div className="action-detail-metric full"><span className="label">主观权重</span><span className="value">{action.subjective_weight}</span></div>
                </div>
              </div>
            </section>

            <section className="action-detail-section">
              <div className="action-detail-section-title">打卡记录</div>
              {records.length === 0 ? (
                <div className="action-detail-empty">暂无打卡记录</div>
              ) : (
                <div className="action-detail-timeline">
                  {records.map(record => (
                    <div key={record.id} className="action-detail-record">
                      <div className="action-detail-record-dot" />
                      <div className="action-detail-record-content">
                        <div className="action-detail-record-top">
                          <span className="action-detail-record-time">{formatDateTime(record.exec_time)}</span>
                          <span className={`action-detail-record-result ${record.exec_result === 1 ? 'success' : 'fail'}`}>
                            {record.exec_result === 1 ? '成功' : '失败'}
                          </span>
                        </div>
                        <div className="action-detail-record-remark">{record.exec_remark || '无备注'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="action-detail-section">
              <div className="action-detail-section-title">关联规律</div>
              {laws.length === 0 ? (
                <div className="action-detail-empty">暂无关联规律</div>
              ) : (
                <div className="action-detail-laws">
                  {laws.map(law => (
                    <div key={law.id} className={`action-detail-law ${law.law_type === 1 ? 'positive' : 'negative'}`}>
                      <div className="action-detail-law-badge">{law.law_type === 1 ? '正向' : '负向'}</div>
                      <div className="action-detail-law-text">{law.law_desc}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
