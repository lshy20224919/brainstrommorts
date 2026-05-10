import { useState, useEffect } from 'react'
import { api } from '../mock'

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
        <div className="review-stat-value" style={{ color: rate >= 70 ? '#36D399' : rate >= 40 ? '#FBBF24' : '#F87272' }}>
          {rate}%
        </div>
        <div className="review-stat-label">成功率</div>
      </div>
      <div className="review-stat-divider" />
      <div className="review-stat-item">
        <div className="review-stat-value" style={{ color: '#FBBF24' }}>{streak}</div>
        <div className="review-stat-label">连续天数 🔥</div>
      </div>
    </div>
  )
}

// ─── 热力日历 ─────────────────────────────────────────────────
function HeatmapCalendar({ dailyRecords }) {
  const [selected, setSelected] = useState(null)
  const last56 = dailyRecords.slice(-56)

  const getColor = (record) => {
    if (!record || record.exec_count === 0) return '#E5E7EB'
    const rate = record.success_count / record.exec_count
    if (rate >= 0.8) return '#36D399'
    if (rate >= 0.5) return '#FBBF24'
    return '#F87272'
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
        <span className="heatmap-legend-item"><span className="heatmap-legend-dot" style={{ background: '#36D399' }} />高成功率</span>
        <span className="heatmap-legend-item"><span className="heatmap-legend-dot" style={{ background: '#FBBF24' }} />中等</span>
        <span className="heatmap-legend-item"><span className="heatmap-legend-dot" style={{ background: '#F87272' }} />低成功率</span>
        <span className="heatmap-legend-item"><span className="heatmap-legend-dot" style={{ background: '#E5E7EB' }} />未执行</span>
      </div>
      {selectedRecord && (
        <div className="heatmap-tooltip">
          <span className="heatmap-tooltip-date">{getWeekLabel(selectedRecord.date)}</span>
          <span>执行 {selectedRecord.exec_count} 次</span>
          <span style={{ color: '#36D399' }}>成功 {selectedRecord.success_count}</span>
          <span style={{ color: '#F87272' }}>失败 {selectedRecord.exec_count - selectedRecord.success_count}</span>
        </div>
      )}
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
          <path d={toPath(compare.data)} fill="rgba(99,102,241,0.15)" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="4 2" />
          {/* 当前版本区域 */}
          <path d={toPath(current.data)} fill="rgba(54,211,153,0.2)" stroke="#36D399" strokeWidth="2" />
          {/* 当前版本数据点 */}
          {current.data.map((d, i) => {
            const p = getPoint(d.success_rate, i)
            return <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3" fill="#36D399" />
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
            <span className="radar-legend-line" style={{ background: '#36D399' }} />
            {current.label}（当前）
          </span>
          <span className="radar-legend-item">
            <span className="radar-legend-line" style={{ background: '#6366F1', opacity: 0.7 }} />
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
  const STATUS_COLOR = { active: '#36D399', evolved: '#9CA3AF', retired: '#F87272' }
  const STATUS_LABEL = { active: '当前', evolved: '已迭代', retired: '已淘汰' }
  const ITER_COLOR = { '固化': '#36D399', '优化': '#45B7D1', '降级': '#FBBF24', '淘汰': '#F87272' }

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
                      <div className="evo-connector-line" style={{ borderColor: node.status === 'retired' ? '#F87272' : '#D1D5DB' }} />
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
  const CYCLE_LABEL = { week: '周复盘', month: '月复盘', day: '日复盘' }
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
              <div className="review-history-summary">{r.review_summary || '暂无总结'}</div>
            </div>
          </div>
        ))}
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

  useEffect(() => {
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
  }, [])

  if (loading) {
    return (
      <div className="page">
        <div className="page-header"><h2>复盘中心</h2></div>
        <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
          <div style={{ color: '#9CA3AF', fontSize: 14 }}>加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header"><h2>复盘中心</h2></div>
      <div className="page-body review-page-body">
        <StatsOverview dailyRecords={dailyRecords} />
        <HeatmapCalendar dailyRecords={dailyRecords} />
        {snapshots.length >= 2 && <RadarChart snapshots={snapshots} />}
        <EvolutionTree nodes={evolutionNodes} />
        <ReviewHistory reviews={reviews} />
      </div>
    </div>
  )
}

