import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'
import { api } from '../mock'
import SensitiveText from '../components/SensitiveText'

// ─── 工具 ─────────────────────────────────────────────────────
function getWeekLabel(dateStr) {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const dow = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${month}/${day} 周${dow}`
}

// ─── 顶部数据概览 ─────────────────────────────────────────────
function StatsOverview({ dailyRecords }) {
  const recent7 = dailyRecords.slice(-7)
  const totalExec = recent7.reduce((s, d) => s + d.exec_count, 0)
  const totalSuccess = recent7.reduce((s, d) => s + d.success_count, 0)
  const rate = totalExec === 0 ? 0 : Math.round((totalSuccess / totalExec) * 100)
  const streak = (() => {
    let s = 0
    for (let i = dailyRecords.length - 1; i >= 0; i--) {
      if (dailyRecords[i].exec_count > 0) s++
      else break
    }
    return s
  })()

  return (
    <div className="review-stats-row">
      <div className="review-stat-item">
        <div className="review-stat-value">{totalExec}</div>
        <div className="review-stat-label">本周执行</div>
      </div>
      <div className="review-stat-divider" />
      <div className="review-stat-item">
        <div className="review-stat-value" style={{ color: rate >= 70 ? 'var(--success)' : rate >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
          {rate}%
        </div>
        <div className="review-stat-label">成功率</div>
      </div>
      <div className="review-stat-divider" />
      <div className="review-stat-item">
        <div className="review-stat-value" style={{ color: 'var(--warning)' }}>{streak}</div>
        <div className="review-stat-label">连续天数 <Flame size={12} className="review-streak-icon" /></div>
      </div>
    </div>
  )
}

// ─── 热力日历 ─────────────────────────────────────────────────
function HeatmapCalendar({ dailyRecords }) {
  const [selected, setSelected] = useState(null)
  const last56 = dailyRecords.slice(-56)

  const getColor = (record) => {
    if (!record || record.exec_count === 0) return 'var(--rule)'
    const rate = record.success_count / record.exec_count
    if (rate >= 0.8) return 'var(--success)'
    if (rate >= 0.5) return 'var(--warning)'
    return 'var(--danger)'
  }

  const getOpacity = (record) => {
    if (!record || record.exec_count === 0) return 1
    return 0.4 + Math.min(record.exec_count / 5, 1) * 0.6
  }

  // 转置：按行（周一~周日）排列，每行8格（标签+8周数据）
  // last56 是按时间顺序的，每7条为一周（周一~周日）
  const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日']
  const NUM_WEEKS = 8
  // 补齐到 56 条
  const padded = Array(56).fill(null).map((_, i) => last56[i] || null)

  const selectedRecord = selected ? last56.find(r => r.date === selected) : null

  return (
    <div className="review-section">
      <div className="review-section-title">执行热力图</div>
      <div className="review-section-sub">颜色深浅 = 执行次数 · 绿/黄/红 = 成功率</div>
      <div className="heatmap-grid">
        {WEEK_DAYS.map((dayLabel, dayIdx) => (
          <div key={dayIdx} className="heatmap-row">
            <div className="heatmap-day-label">{dayLabel}</div>
            {Array.from({ length: NUM_WEEKS }, (_, weekIdx) => {
              const record = padded[weekIdx * 7 + dayIdx]
              return (
                <div
                  key={weekIdx}
                  className={`heatmap-cell ${record && selected === record.date ? 'selected' : ''}`}
                  style={{
                    background: getColor(record),
                    opacity: record ? getOpacity(record) : 1
                  }}
                  onClick={() => record && setSelected(selected === record.date ? null : record.date)}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span className="heatmap-legend-item"><span className="heatmap-legend-dot" style={{ background: 'var(--success)' }} />高成功率</span>
        <span className="heatmap-legend-item"><span className="heatmap-legend-dot" style={{ background: 'var(--warning)' }} />中等</span>
        <span className="heatmap-legend-item"><span className="heatmap-legend-dot" style={{ background: 'var(--danger)' }} />低成功率</span>
        <span className="heatmap-legend-item"><span className="heatmap-legend-dot" style={{ background: 'var(--rule)' }} />未执行</span>
      </div>
      {selectedRecord && (
        <div className="heatmap-tooltip">
          <span className="heatmap-tooltip-date">{getWeekLabel(selectedRecord.date)}</span>
          <span>执行 {selectedRecord.exec_count} 次</span>
          <span style={{ color: 'var(--success)' }}>成功 {selectedRecord.success_count}</span>
          <span style={{ color: 'var(--danger)' }}>失败 {selectedRecord.exec_count - selectedRecord.success_count}</span>
        </div>
      )}
    </div>
  )
}

// ─── 趋势折线图（纯 SVG） ─────────────────────────────────────
function TrendChart({ dailyRecords }) {
  const recent = dailyRecords.slice(-14)
  if (recent.length < 2) return null

  const W = 320, H = 140, PX = 30, PY = 20
  const chartW = W - PX * 2, chartH = H - PY * 2
  const maxExec = Math.max(...recent.map(r => r.exec_count), 1)

  const execPoints = recent.map((r, i) => ({
    x: PX + (i / (recent.length - 1)) * chartW,
    y: PY + chartH - (r.exec_count / maxExec) * chartH
  }))
  const ratePoints = recent.map((r, i) => {
    const rate = r.exec_count === 0 ? 0 : r.success_count / r.exec_count
    return {
      x: PX + (i / (recent.length - 1)) * chartW,
      y: PY + chartH - rate * chartH
    }
  })

  const toPolyline = (pts) => pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  const yLabelsExec = [0, Math.ceil(maxExec / 2), maxExec]
  const yLabelsRate = ['0%', '50%', '100%']

  return (
    <div className="review-section">
      <div className="review-section-title">执行趋势</div>
      <div className="review-section-sub">近 14 天执行次数与成功率变化</div>
      <div className="trend-chart-wrap">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          {[0, 0.5, 1].map((ratio, i) => (
            <line key={i} x1={PX} x2={W - PX} y1={PY + chartH * (1 - ratio)} y2={PY + chartH * (1 - ratio)} stroke="#E5E7EB" strokeWidth="0.5" />
          ))}
          {yLabelsExec.map((v, i) => (
            <text key={`l${i}`} x={PX - 4} y={PY + chartH * (1 - i / 2)} fontSize="8" fill="#9CA3AF" textAnchor="end" dominantBaseline="middle">{v}</text>
          ))}
          {yLabelsRate.map((v, i) => (
            <text key={`r${i}`} x={W - PX + 4} y={PY + chartH * (1 - i / 2)} fontSize="8" fill="#9CA3AF" textAnchor="start" dominantBaseline="middle">{v}</text>
          ))}
          <polyline points={toPolyline(execPoints)} fill="none" stroke="#C17B5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={toPolyline(ratePoints)} fill="none" stroke="#7D9B76" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />
          {execPoints.map((p, i) => <circle key={`e${i}`} cx={p.x} cy={p.y} r="2.5" fill="#C17B5A" />)}
          {ratePoints.map((p, i) => <circle key={`r${i}`} cx={p.x} cy={p.y} r="2.5" fill="#7D9B76" />)}
        </svg>
      </div>
      <div className="trend-legend">
        <span className="trend-legend-item"><span className="trend-legend-line" style={{ background: '#C17B5A' }} />执行次数</span>
        <span className="trend-legend-item"><span className="trend-legend-line dashed" style={{ background: '#7D9B76' }} />成功率</span>
      </div>
    </div>
  )
}

// ─── 雷达图（纯 SVG） ─────────────────────────────────────────
function RadarChart({ snapshots }) {
  const [compareIdx, setCompareIdx] = useState(0)
  const current = snapshots[snapshots.length - 1]
  const compare = snapshots[compareIdx]

  const size = 200
  const cx = size / 2
  const cy = size / 2
  const r = 75
  const axes = current.data

  const angleStep = (Math.PI * 2) / axes.length
  const getPoint = (value, i) => {
    const angle = i * angleStep - Math.PI / 2
    const dist = (value / 100) * r
    return {
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle)
    }
  }
  const getLabelPoint = (i) => {
    const angle = i * angleStep - Math.PI / 2
    const dist = r + 18
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
  }

  const toPath = (data) =>
    data.map((d, i) => {
      const p = getPoint(d.success_rate, i)
      return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
    }).join(' ') + ' Z'

  // 背景网格
  const gridLevels = [25, 50, 75, 100]

  return (
    <div className="review-section">
      <div className="review-section-title">分类成功率对比</div>
      <div className="review-section-sub">与历史版本横向对比，看清进退</div>
      <div className="radar-compare-tabs">
        {snapshots.slice(0, -1).map((s, i) => (
          <button
            key={i}
            className={`radar-tab ${compareIdx === i ? 'active' : ''}`}
            onClick={() => setCompareIdx(i)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="radar-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* 背景网格 */}
          {gridLevels.map(level => (
            <polygon
              key={level}
              points={axes.map((_, i) => {
                const p = getPoint(level, i)
                return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
              }).join(' ')}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          {/* 轴线 */}
          {axes.map((_, i) => {
            const p = getPoint(100, i)
            return <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="#E5E7EB" strokeWidth="1" />
          })}
          {/* 对比版本区域 */}
          <path d={toPath(compare.data)} fill="rgba(193,123,90,0.12)" stroke="#C17B5A" strokeWidth="1.5" strokeDasharray="4 2" />
          {/* 当前版本区域 */}
          <path d={toPath(current.data)} fill="rgba(125,155,118,0.15)" stroke="#7D9B76" strokeWidth="2" />
          {/* 当前版本数据点 */}
          {current.data.map((d, i) => {
            const p = getPoint(d.success_rate, i)
            return <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3" fill="#7D9B76" />
          })}
          {/* 轴标签 */}
          {axes.map((d, i) => {
            const lp = getLabelPoint(i)
            return (
              <text key={i} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="11" fill="#6B7280">
                {d.icon}
              </text>
            )
          })}
        </svg>
        <div className="radar-legend">
          <span className="radar-legend-item">
            <span className="radar-legend-line" style={{ background: '#7D9B76' }} />
            {current.label}（当前）
          </span>
          <span className="radar-legend-item">
            <span className="radar-legend-line" style={{ background: '#C17B5A', opacity: 0.7 }} />
            {compare.label}
          </span>
        </div>
      </div>
      <div className="radar-data-row">
        {current.data.map((d, i) => {
          const prev = compare.data[i]
          const diff = d.success_rate - prev.success_rate
          return (
            <div key={i} className="radar-data-item">
              <div className="radar-data-icon">{d.icon}</div>
              <div className="radar-data-name">{d.name}</div>
              <div className="radar-data-rate">{d.success_rate}%</div>
              <div className={`radar-data-diff ${diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'}`}>
                {diff > 0 ? `+${diff}` : diff === 0 ? '—' : diff}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 进化树 ───────────────────────────────────────────────────
function EvolutionTree({ nodes }) {
  const STATUS_COLOR = { active: '#7D9B76', evolved: '#9E9E9E', retired: '#B85C4A' }
  const STATUS_LABEL = { active: '当前', evolved: '已迭代', retired: '已淘汰' }
  const ITER_COLOR = { '固化': '#7D9B76', '优化': '#C17B5A', '降级': '#C9944A', '淘汰': '#B85C4A' }

  // 找出所有根节点，构建链
  const roots = nodes.filter(n => !n.parent_id)
  const getChain = (rootId) => {
    const chain = []
    let cur = nodes.find(n => n.id === rootId)
    while (cur) {
      chain.push(cur)
      cur = nodes.find(n => n.parent_id === cur.id)
    }
    return chain
  }

  return (
    <div className="review-section">
      <div className="review-section-title">方法论进化树</div>
      <div className="review-section-sub">每次复盘迭代都是一次生长</div>
      <div className="evo-tree">
        {roots.map(root => {
          const chain = getChain(root.id)
          return (
            <div key={root.id} className="evo-chain">
              {chain.map((node, idx) => (
                <div key={node.id} className="evo-node-wrap">
                  {idx > 0 && (
                    <div className="evo-connector">
                      <div className="evo-connector-line" style={{ borderColor: node.status === 'retired' ? '#B85C4A' : 'var(--rule)' }} />
                      <div className="evo-iter-badge" style={{ background: ITER_COLOR[node.iteration_type] || '#9CA3AF' }}>
                        {node.iteration_type}
                      </div>
                    </div>
                  )}
                  <div className={`evo-node ${node.status}`}>
                    <div className="evo-node-label">{node.label}</div>
                    <div className="evo-node-meta">
                      <span className="evo-node-cycle">{node.review_cycle}</span>
                      <span className="evo-node-status" style={{ color: STATUS_COLOR[node.status] }}>
                        {STATUS_LABEL[node.status]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 复盘历史列表 ─────────────────────────────────────────────
function ReviewHistory({ reviews }) {
  const CYCLE_LABEL = { day: '日复盘', week: '周复盘', month: '月复盘', custom: '自定义' }
  return (
    <div className="review-section">
      <div className="review-section-title">复盘历史</div>
      <div className="review-history-list">
        {reviews.map(r => (
          <div key={r.id} className="review-history-item">
            <div className="review-history-left">
              <div className="review-history-version">{r.snapshot_version}</div>
              <div className="review-history-cycle">{CYCLE_LABEL[r.review_cycle] || r.review_cycle}</div>
            </div>
            <div className="review-history-mid">
              <div className="review-history-range">{r.start_time} ~ {r.end_time}</div>
              {r.review_summary
                ? <SensitiveText as="div" className="review-history-summary" id={`review-summary-${r.id}`} value={r.review_summary} />
                : <div className="review-history-summary">暂无总结</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 淘汰库区块 ───────────────────────────────────────────────
const TYPE_LABEL = { action: '行动', law: '规律', mistake: '常犯错' }

function RetiredSection({ onViewAll }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = () => {
    setLoading(true)
    api.getRetiredItems({ page: 1, page_size: 5 }).then(res => {
      setItems(res.list || [])
      setLoading(false)
    })
  }

  useEffect(reload, [])

  const handleRestore = (item) => {
    if (!window.confirm(`还原「${item.name}」？`)) return
    api.restoreItem(item.type, item.id).then(reload).catch(e => alert(e.message))
  }

  const handleDelete = (item) => {
    if (!window.confirm(`「${item.name}」将被彻底删除，此操作不可恢复。继续？`)) return
    if (!window.confirm('再次确认：确定要永久删除吗？')) return
    api.permanentDeleteItem(item.type, item.id).then(reload).catch(e => alert(e.message))
  }

  return (
    <div className="review-section">
      <div className="review-section-header-row">
        <div className="review-section-title">淘汰库</div>
        <button className="review-section-more" onClick={onViewAll}>查看全部 ›</button>
      </div>
      {loading ? (
        <div className="review-section-sub">加载中...</div>
      ) : items.length === 0 ? (
        <div className="review-section-sub">暂无淘汰记录</div>
      ) : (
        <div className="retired-list">
          {items.map(item => (
            <div key={item.type + '-' + item.id} className="retired-card">
              <div className="retired-info">
                <div className="retired-type">{TYPE_LABEL[item.type] || item.type}</div>
                <div className="retired-name">{item.name}</div>
                {item.category_name && <div className="retired-cat">{item.category_name}</div>}
              </div>
              <div className="retired-actions">
                <button className="restore-btn" onClick={() => handleRestore(item)}>还原</button>
                <button className="delete-btn" onClick={() => handleDelete(item)}>永久删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 淘汰库完整页 ─────────────────────────────────────────────
function RetiredFullPage({ onClose }) {
  const [activeTab, setActiveTab] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'action', label: '行动' },
    { key: 'law', label: '规律' },
    { key: 'mistake', label: '常犯错' }
  ]

  const reload = () => {
    setLoading(true)
    const params = { page: 1, page_size: 100 }
    if (activeTab !== 'all') params.type = activeTab
    api.getRetiredItems(params).then(res => {
      setItems(res.list || [])
      setLoading(false)
    })
  }

  useEffect(reload, [activeTab])

  const handleRestore = (item) => {
    if (!window.confirm(`还原「${item.name}」？`)) return
    api.restoreItem(item.type, item.id).then(reload).catch(e => alert(e.message))
  }

  const handleDelete = (item) => {
    if (!window.confirm(`「${item.name}」将被彻底删除，此操作不可恢复。继续？`)) return
    if (!window.confirm('再次确认：确定要永久删除吗？')) return
    api.permanentDeleteItem(item.type, item.id).then(reload).catch(e => alert(e.message))
  }

  const fmt = (d) => d ? new Date(d).toISOString().slice(0, 10) : ''

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <button className="exec-back" onClick={onClose}>←</button>
          <h2>淘汰库</h2>
        </div>
      </div>
      <div className="retired-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`retired-tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >{t.label}</button>
        ))}
      </div>
      <div className="page-body">
        {loading ? (
          <div className="review-section-sub">加载中...</div>
        ) : items.length === 0 ? (
          <div className="review-section-sub" style={{ textAlign: 'center', padding: 40 }}>暂无淘汰记录</div>
        ) : (
          <div className="retired-list">
            {items.map(item => (
              <div key={item.type + '-' + item.id} className="retired-card">
                <div className="retired-info">
                  <div className="retired-type">{TYPE_LABEL[item.type] || item.type}</div>
                  <div className="retired-name">{item.name}</div>
                  {item.category_name && <div className="retired-cat">{item.category_name}</div>}
                  {item.retired_time && <div className="retired-time">淘汰于 {fmt(item.retired_time)}</div>}
                </div>
                <div className="retired-actions">
                  <button className="restore-btn" onClick={() => handleRestore(item)}>还原</button>
                  <button className="delete-btn" onClick={() => handleDelete(item)}>永久删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 新建复盘弹窗 ────────────────────────────────────────────
function ReviewCreateModal({ onClose, onCreate }) {
  const [cycle, setCycle] = useState('week')
  const fmt = (d) => d.toISOString().slice(0, 10)

  const computeDefaultRange = (c) => {
    const now = new Date()
    const end = fmt(now)
    if (c === 'day') return { start: end, end }
    const days = c === 'week' ? 7 : c === 'month' ? 30 : 7
    const start = fmt(new Date(now - days * 86400000))
    return { start, end }
  }

  const [{ start, end }, setRange] = useState(() => computeDefaultRange('week'))

  const handleCycleChange = (c) => {
    setCycle(c)
    setRange(computeDefaultRange(c))
  }

  const handleCreate = () => {
    if (cycle === 'custom' && new Date(start) > new Date(end)) {
      alert('开始时间不能晚于结束时间')
      return
    }
    onCreate({ review_cycle: cycle, start_time: start, end_time: end })
  }

  return (
    <div className="g-modal-mask" onClick={onClose}>
      <div className="g-modal-box" onClick={e => e.stopPropagation()}>
        <div className="g-modal-title">新建复盘</div>
        <div className="review-create-cycles">
          <button className={`review-cycle-btn ${cycle === 'day' ? 'active' : ''}`} onClick={() => handleCycleChange('day')}>日复盘</button>
          <button className={`review-cycle-btn ${cycle === 'week' ? 'active' : ''}`} onClick={() => handleCycleChange('week')}>周复盘</button>
          <button className={`review-cycle-btn ${cycle === 'month' ? 'active' : ''}`} onClick={() => handleCycleChange('month')}>月复盘</button>
          <button className={`review-cycle-btn ${cycle === 'custom' ? 'active' : ''}`} onClick={() => handleCycleChange('custom')}>自定义</button>
        </div>
        {cycle === 'custom' ? (
          <div className="review-create-custom">
            <label className="review-create-date-row">
              <span>开始时间</span>
              <input type="date" value={start} onChange={e => setRange(r => ({ ...r, start: e.target.value }))} />
            </label>
            <label className="review-create-date-row">
              <span>结束时间</span>
              <input type="date" value={end} onChange={e => setRange(r => ({ ...r, end: e.target.value }))} />
            </label>
          </div>
        ) : (
          <div className="review-create-range">复盘范围：{start} ~ {end}</div>
        )}
        <div className="g-modal-actions">
          <button className="btn btn-outline" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleCreate}>开始复盘</button>
        </div>
      </div>
    </div>
  )
}

// ─── 复盘迭代页面 ────────────────────────────────────────────
function ReviewIterationPage({ reviewData, onClose, onDone }) {
  const { id: reviewId, snapshot_version, items } = reviewData
  const [iterations, setIterations] = useState(items.map(() => null))
  const [summary, setSummary] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const currentIdx = iterations.findIndex(it => it === null)
  const allDone = iterations.every(it => it !== null)
  const doneCount = iterations.filter(it => it !== null).length

  const handleJudge = (idx, type) => {
    setIterations(prev => { const n = [...prev]; n[idx] = type; return n })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const iterData = items.map((item, i) => ({
      card_id: item.id,
      card_type: item.type,
      iteration_type: iterations[i]
    }))
    await api.submitReviewIteration(reviewId, iterData, summary)
    setSubmitting(false)
    onDone()
  }

  const ITER_OPTIONS = [
    { type: '固化', label: '固化', className: 'success' },
    { type: '优化', label: '优化', className: 'accent' },
    { type: '降级', label: '降级', className: 'warning' },
    { type: '淘汰', label: '淘汰', className: 'danger' }
  ]

  return (
    <div className="exec-page">
      <div className="exec-header">
        <button className="exec-back" onClick={onClose}>←</button>
        <div className="exec-title">复盘 {snapshot_version}</div>
        <div className="exec-progress">{doneCount}/{items.length}</div>
      </div>

      <div className="review-iter-progress">
        <div className="review-iter-bar" style={{ width: `${(doneCount / items.length) * 100}%` }} />
      </div>

      <div className="exec-body-new" style={{ padding: '16px' }}>
        {currentIdx !== -1 && (
          <div className="review-focus-card">
            <div className="review-focus-type">{items[currentIdx].type === 'action' ? '正确的事' : '规律'}</div>
            <div className="review-focus-name">{items[currentIdx].name}</div>
            <div className="review-focus-meta">
              {items[currentIdx].category_name}
              {items[currentIdx].exec_count != null && ` · ${items[currentIdx].type === 'action' ? '执行' : '触发'} ${items[currentIdx].exec_count} 次`}
              {items[currentIdx].success_rate != null && ` · ${items[currentIdx].success_rate}%`}
            </div>
            <div className="review-iter-btns">
              {ITER_OPTIONS.map(opt => (
                <button key={opt.type} className={`review-iter-btn ${opt.className}`} onClick={() => handleJudge(currentIdx, opt.type)}>{opt.label}</button>
              ))}
            </div>
          </div>
        )}

        {allDone && (
          <div className="review-summary-input">
            <div className="review-summary-label">复盘总结（选填）</div>
            <textarea className="form-textarea" value={summary} onChange={e => setSummary(e.target.value)} placeholder="记录本次复盘的感悟..." rows={3} />
          </div>
        )}

        <div className="review-iter-list">
          {items.map((item, idx) => {
            if (idx === currentIdx) return null
            const judged = iterations[idx]
            return (
              <div key={item.id + item.type} className={`review-iter-item ${judged ? 'done' : ''}`} onClick={() => judged && handleJudge(idx, null)}>
                <span className="review-iter-item-name">{item.name}</span>
                {judged && <span className={`review-iter-item-badge ${ITER_OPTIONS.find(o => o.type === judged)?.className}`}>{judged}</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="exec-footer">
        <button className="btn btn-outline" onClick={onClose}>放弃</button>
        <button className={`btn btn-primary${!allDone ? ' disabled' : ''}`} disabled={!allDone || submitting} onClick={handleSubmit}>
          {submitting ? '提交中...' : '提交复盘'}
        </button>
      </div>
    </div>
  )
}

// ─── 主页面 ───────────────────────────────────────────────────
export default function ReviewPage() {
  const [dailyRecords, setDailyRecords] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [evolutionNodes, setEvolutionNodes] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [iterationData, setIterationData] = useState(null)
  const [showRetiredFull, setShowRetiredFull] = useState(false)

  const loadData = () => {
    Promise.all([
      api.getDailyRecords(),
      api.getCategorySnapshots(),
      api.getEvolutionNodes(),
      api.getReviews()
    ]).then(([dr, sn, en, rv]) => {
      setDailyRecords(dr)
      setSnapshots(sn)
      setEvolutionNodes(en)
      setReviews(rv)
      setLoading(false)
    })
  }

  useEffect(() => { loadData() }, [])

  const handleCreateReview = async (data) => {
    const result = await api.createReview(data)
    setShowCreateModal(false)
    setIterationData(result)
  }

  const handleIterationDone = () => {
    setIterationData(null)
    setLoading(true)
    loadData()
  }

  if (iterationData) {
    return <ReviewIterationPage reviewData={iterationData} onClose={() => setIterationData(null)} onDone={handleIterationDone} />
  }

  if (showRetiredFull) {
    return <RetiredFullPage onClose={() => setShowRetiredFull(false)} />
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-header-row">
            <h2>复盘中心</h2>
            <span className="page-header-sub">review & reflect</span>
          </div>
        </div>
        <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <h2>复盘中心</h2>
          <span className="page-header-sub">review & reflect</span>
        </div>
      </div>
      <div className="page-body review-page-body">
        <StatsOverview dailyRecords={dailyRecords} />
        <HeatmapCalendar dailyRecords={dailyRecords} />
        <TrendChart dailyRecords={dailyRecords} />
        {snapshots.length >= 2 && <RadarChart snapshots={snapshots} />}
        <EvolutionTree nodes={evolutionNodes} />
        <ReviewHistory reviews={reviews} />
        <RetiredSection onViewAll={() => setShowRetiredFull(true)} />
      </div>

      <button className="fab" onClick={() => setShowCreateModal(true)}>+</button>
      {showCreateModal && <ReviewCreateModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateReview} />}
    </div>
  )
}

