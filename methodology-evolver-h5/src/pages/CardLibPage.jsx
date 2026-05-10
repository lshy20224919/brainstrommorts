import { useState, useEffect, useRef } from 'react'
import { api } from '../mock'

// ─── 打卡弹窗 ────────────────────────────────────────────────
function CheckinModal({ action, onClose, onSubmit }) {
  const [result, setResult] = useState(null)
  const [remark, setRemark] = useState('')

  const handleSubmit = () => {
    if (!result) return
    onSubmit({ result, remark })
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">打卡 · {action.name}</div>
        <div className="form-group">
          <div className="form-label">执行结果 *</div>
          <div className="checkin-result-row">
            <button className={`checkin-result-btn success ${result === 'success' ? 'active' : ''}`} onClick={() => setResult('success')}>✅ 成功</button>
            <button className={`checkin-result-btn fail ${result === 'fail' ? 'active' : ''}`} onClick={() => setResult('fail')}>❌ 失败</button>
          </div>
        </div>
        <div className="form-group">
          <div className="form-label">备注（选填）</div>
          <input className="form-input" value={remark} onChange={e => setRemark(e.target.value)} placeholder="最多200字" maxLength={200} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>取消</button>
          <button className={`btn btn-primary ${!result ? 'disabled' : ''}`} onClick={handleSubmit} disabled={!result}>确认打卡</button>
        </div>
      </div>
    </div>
  )
}

// ─── 新增正确的事弹窗 ─────────────────────────────────────────
function CreateActionModal({ categories, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [weight, setWeight] = useState(5)
  const [remark, setRemark] = useState('')

  const handleSubmit = () => {
    if (!name.trim() || !categoryId) return
    onSubmit({ name: name.trim(), category_id: Number(categoryId), subjective_weight: weight, remark })
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">新增正确的事</div>
        <div className="form-group">
          <div className="form-label">名称 *</div>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="最多30字" maxLength={30} />
        </div>
        <div className="form-group">
          <div className="form-label">分类 *</div>
          <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">请选择分类</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">主观权重：{weight}</div>
          <input type="range" min={1} max={10} step={1} value={weight} onChange={e => setWeight(Number(e.target.value))} className="form-range" />
          <div className="range-labels"><span>1</span><span>10</span></div>
        </div>
        <div className="form-group">
          <div className="form-label">备注（选填）</div>
          <textarea className="form-textarea" value={remark} onChange={e => setRemark(e.target.value)} placeholder="最多200字" maxLength={200} rows={3} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>取消</button>
          <button className={`btn btn-primary ${!name.trim() || !categoryId ? 'disabled' : ''}`} onClick={handleSubmit} disabled={!name.trim() || !categoryId}>创建</button>
        </div>
      </div>
    </div>
  )
}

// ─── 新增规律弹窗 ─────────────────────────────────────────────
function CreateLawModal({ categories, actions, onClose, onSubmit }) {
  const [lawType, setLawType] = useState(null)
  const [desc, setDesc] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [relatedActionId, setRelatedActionId] = useState('')
  const [scenes, setScenes] = useState('')
  const [weight, setWeight] = useState(5)

  const handleSubmit = () => {
    if (!desc.trim() || !categoryId || !lawType) return
    onSubmit({
      law_type: lawType,
      law_desc: desc.trim(),
      category_id: Number(categoryId),
      related_action_id: relatedActionId ? Number(relatedActionId) : null,
      applicable_scenes: scenes,
      subjective_weight: weight
    })
  }

  const canSubmit = desc.trim() && categoryId && lawType

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">新增规律</div>
        <div className="form-group">
          <div className="form-label">规律类型 *</div>
          <div className="law-type-row">
            <button className={`law-type-btn positive ${lawType === 1 ? 'active' : ''}`} onClick={() => setLawType(1)}>🟢 正向规律</button>
            <button className={`law-type-btn negative ${lawType === 2 ? 'active' : ''}`} onClick={() => setLawType(2)}>🔴 负向规律</button>
          </div>
        </div>
        <div className="form-group">
          <div className="form-label">规律描述 *</div>
          <textarea className="form-textarea" value={desc} onChange={e => setDesc(e.target.value)} placeholder="最多500字" maxLength={500} rows={4} />
        </div>
        <div className="form-group">
          <div className="form-label">分类 *</div>
          <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">请选择分类</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">关联正确的事（选填）</div>
          <select className="form-select" value={relatedActionId} onChange={e => setRelatedActionId(e.target.value)}>
            <option value="">不关联</option>
            {actions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">适用场景（选填）</div>
          <input className="form-input" value={scenes} onChange={e => setScenes(e.target.value)} placeholder="例：股票交易、习惯养成" maxLength={100} />
        </div>
        <div className="form-group">
          <div className="form-label">主观权重：{weight}</div>
          <input type="range" min={1} max={10} step={1} value={weight} onChange={e => setWeight(Number(e.target.value))} className="form-range" />
          <div className="range-labels"><span>1</span><span>10</span></div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>取消</button>
          <button className={`btn btn-primary ${!canSubmit ? 'disabled' : ''}`} onClick={handleSubmit} disabled={!canSubmit}>创建</button>
        </div>
      </div>
    </div>
  )
}

// ─── 正确的事操作菜单 ─────────────────────────────────────────
function ActionMenu({ action, onClose, onCheckin, onArchive, onDelete, onTogglePin }) {
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="action-menu" onClick={e => e.stopPropagation()}>
        <div className="action-menu-title">{action.name}</div>
        <button className="action-menu-item" onClick={() => { onCheckin(action); onClose() }}>✅ 打卡</button>
        <button className="action-menu-item" onClick={() => { onTogglePin(action); onClose() }}>{action.pinned ? '📌 取消置顶' : '📌 置顶'}</button>
        <button className="action-menu-item" onClick={() => { onArchive(action); onClose() }}>📦 归档</button>
        <button className="action-menu-item danger" onClick={() => { onDelete(action); onClose() }}>🗑️ 删除</button>
        <button className="action-menu-cancel" onClick={onClose}>取消</button>
      </div>
    </div>
  )
}

// ─── 规律操作菜单 ─────────────────────────────────────────────
function LawMenu({ law, onClose, onRetire, onDelete, onTogglePin }) {
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="action-menu" onClick={e => e.stopPropagation()}>
        <div className="action-menu-title law-menu-title">
          <span className={`law-type-badge-large ${law.law_type === 1 ? 'positive' : 'negative'}`}>
            {law.law_type === 1 ? '正向' : '负向'}
          </span>
          <span className="law-menu-desc">{law.law_desc}</span>
        </div>
        <button className="action-menu-item" onClick={() => { onTogglePin(law); onClose() }}>{law.pinned ? '📌 取消置顶' : '📌 置顶'}</button>
        <button className="action-menu-item danger" onClick={() => { onRetire(law); onClose() }}>🚫 淘汰</button>
        <button className="action-menu-item danger" onClick={() => { onDelete(law); onClose() }}>🗑️ 删除</button>
        <button className="action-menu-cancel" onClick={onClose}>取消</button>
      </div>
    </div>
  )
}

// ─── 正确的事卡片 ─────────────────────────────────────────────
function ActionCard({ action, category, onCheckin, onLongPress }) {
  const touchTimer = useRef(null)
  const swipeStartX = useRef(null)
  const [swiped, setSwiped] = useState(false)

  const handleTouchStart = (e) => {
    swipeStartX.current = e.touches[0].clientX
    touchTimer.current = setTimeout(() => {
      onLongPress(action)
      swipeStartX.current = null
    }, 500)
  }

  const handleTouchMove = (e) => {
    if (swipeStartX.current === null) return
    const diff = e.touches[0].clientX - swipeStartX.current
    if (diff > 40) {
      clearTimeout(touchTimer.current)
      setSwiped(true)
    }
  }

  const handleTouchEnd = () => {
    clearTimeout(touchTimer.current)
    if (swiped) {
      onCheckin(action)
      setSwiped(false)
    }
    swipeStartX.current = null
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    onLongPress(action)
  }

  const rate = action.success_rate != null ? `${action.success_rate}%` : '暂无'
  const isHighRate = action.success_rate != null && action.success_rate >= 60

  return (
    <div className="action-card-wrap">
      <div className="action-card-swipe-bg">✅ 打卡</div>
      <div
        className={`action-card ${swiped ? 'swiped' : ''}`}
        style={{ borderLeftColor: category?.color || '#9CA3AF' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
      >
        {swiped && <div className="swipe-checkin-hint">✅ 松开打卡</div>}
        <div className="action-card-header">
          <span className="action-card-name">{action.name}</span>
          {action.pinned === 1 && <span className="tag tag-pinned">置顶</span>}
          {action.status === 1 && <span className="tag tag-archived">已归档</span>}
        </div>
        <div className="action-card-meta">
          <span className="action-card-category">{category?.icon} {category?.name}</span>
        </div>
        <div className="action-card-stats">
          <span className="action-card-stat">执行 {action.exec_count} 次</span>
          <span className={`action-card-rate ${isHighRate ? 'high' : ''}`}>成功率 {rate}</span>
        </div>
      </div>
    </div>
  )
}

// ─── 规律卡片 ─────────────────────────────────────────────────
function LawCard({ law, category, relatedAction, onLongPress }) {
  const touchTimer = useRef(null)

  const handleTouchStart = () => {
    touchTimer.current = setTimeout(() => onLongPress(law), 500)
  }

  const handleTouchEnd = () => clearTimeout(touchTimer.current)

  const handleContextMenu = (e) => {
    e.preventDefault()
    onLongPress(law)
  }

  const typeClass = law.law_type === 1 ? 'positive' : 'negative'
  const isArchived = law.status !== 0

  return (
    <div
      className={`law-card ${typeClass} ${isArchived ? 'archived' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
    >
      <div className="law-card-desc">{law.law_desc}</div>
      <div className="law-card-meta">
        <span className="law-card-category">{category?.icon} {category?.name}</span>
        {relatedAction && <span className="law-card-related">关联：{relatedAction.name}</span>}
      </div>
      <div className="law-card-footer">
        <span className="law-card-trigger">触发 {law.trigger_count} 次</span>
        <span className={`law-type-badge ${typeClass}`}>{law.law_type === 1 ? '正向' : '负向'}</span>
      </div>
    </div>
  )
}

// ─── 卡片库主页面 ─────────────────────────────────────────────
export default function CardLibPage() {
  const [tab, setTab] = useState('action')
  const [categories, setCategories] = useState([])

  // 正确的事状态
  const [actions, setActions] = useState([])
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSort, setFilterSort] = useState('weight')
  const [filterStatus, setFilterStatus] = useState(0)
  const [checkinTarget, setCheckinTarget] = useState(null)
  const [actionMenuTarget, setActionMenuTarget] = useState(null)
  const [showCreateAction, setShowCreateAction] = useState(false)

  // 规律状态
  const [laws, setLaws] = useState([])
  const [lawFilterCategory, setLawFilterCategory] = useState('')
  const [lawFilterType, setLawFilterType] = useState('')
  const [lawFilterSort, setLawFilterSort] = useState('weight')
  const [lawMenuTarget, setLawMenuTarget] = useState(null)
  const [showCreateLaw, setShowCreateLaw] = useState(false)

  useEffect(() => {
    api.getCategories().then(setCategories)
  }, [])

  useEffect(() => { loadActions() }, [filterCategory, filterStatus])
  useEffect(() => { loadLaws() }, [lawFilterCategory, lawFilterType])

  const loadActions = async () => {
    const params = { status: filterStatus }
    if (filterCategory) params.category_id = Number(filterCategory)
    setActions(await api.getActions(params))
  }

  const loadLaws = async () => {
    const params = {}
    if (lawFilterCategory) params.category_id = Number(lawFilterCategory)
    if (lawFilterType) params.law_type = Number(lawFilterType)
    setLaws(await api.getLaws(params))
  }

  // 正确的事排序
  const sortedActions = [...actions].sort((a, b) => {
    if (filterSort === 'weight') return b.subjective_weight - a.subjective_weight
    if (filterSort === 'exec') return b.exec_count - a.exec_count
    if (filterSort === 'rate') return (b.success_rate ?? -1) - (a.success_rate ?? -1)
    return 0
  })
  const displayActions = [
    ...sortedActions.filter(a => a.pinned === 1),
    ...sortedActions.filter(a => a.pinned !== 1)
  ]

  // 规律排序
  const sortedLaws = [...laws].sort((a, b) => {
    if (lawFilterSort === 'weight') return b.subjective_weight - a.subjective_weight
    if (lawFilterSort === 'trigger') return b.trigger_count - a.trigger_count
    return 0
  })
  const displayLaws = [
    ...sortedLaws.filter(l => l.pinned === 1),
    ...sortedLaws.filter(l => l.pinned !== 1)
  ]

  const getCategory = (id) => categories.find(c => c.id === id)
  const getAction = (id) => actions.find(a => a.id === id)

  // 正确的事操作
  const handleCheckin = async (action, data) => {
    await api.checkin(action.id, data)
    setCheckinTarget(null)
    loadActions()
  }

  const handleArchive = (action) => {
    const idx = actions.findIndex(a => a.id === action.id)
    if (idx !== -1) { actions[idx].status = 1; setActions([...actions]) }
  }

  const handleDeleteAction = async (action) => {
    try {
      await api.deleteAction(action.id)
      loadActions()
    } catch (e) { alert(e.message) }
  }

  const handleToggleActionPin = (action) => {
    const idx = actions.findIndex(a => a.id === action.id)
    if (idx !== -1) { actions[idx].pinned = actions[idx].pinned === 1 ? 0 : 1; setActions([...actions]) }
  }

  const handleCreateAction = async (data) => {
    await api.createAction(data)
    setShowCreateAction(false)
    loadActions()
  }

  // 规律操作
  const handleRetireLaw = (law) => {
    const idx = laws.findIndex(l => l.id === law.id)
    if (idx !== -1) { laws[idx].status = 2; setLaws([...laws]) }
  }

  const handleDeleteLaw = async (law) => {
    try {
      await api.deleteLaw(law.id)
      loadLaws()
    } catch (e) { alert(e.message) }
  }

  const handleToggleLawPin = (law) => {
    const idx = laws.findIndex(l => l.id === law.id)
    if (idx !== -1) { laws[idx].pinned = laws[idx].pinned === 1 ? 0 : 1; setLaws([...laws]) }
  }

  const handleCreateLaw = async (data) => {
    await api.createLaw(data)
    setShowCreateLaw(false)
    loadLaws()
  }

  const actionCount = actions.filter(a => a.status === 0).length
  const lawCount = laws.length

  return (
    <div className="page">
      <div className="page-header">
        <h2>卡片库</h2>
      </div>

      {/* Tab切换 */}
      <div className="card-lib-tabs">
        <button className={`card-lib-tab ${tab === 'action' ? 'active' : ''}`} onClick={() => setTab('action')}>
          正确的事 ({actionCount})
        </button>
        <button className={`card-lib-tab ${tab === 'law' ? 'active' : ''}`} onClick={() => setTab('law')}>
          规律 ({lawCount})
        </button>
      </div>

      {/* ── 正确的事 Tab ── */}
      {tab === 'action' && (
        <>
          <div className="filter-bar">
            <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">全部分类</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <select className="filter-select" value={filterSort} onChange={e => setFilterSort(e.target.value)}>
              <option value="weight">主观权重</option>
              <option value="exec">执行次数</option>
              <option value="rate">成功率</option>
            </select>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(Number(e.target.value))}>
              <option value={0}>正常</option>
              <option value={1}>已归档</option>
              <option value={2}>已淘汰</option>
            </select>
          </div>

          <div className="card-list">
            {displayActions.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <span className="empty-text">暂无正确的事</span>
                <span className="empty-desc">点击右下角按钮新增</span>
              </div>
            ) : (
              displayActions.map(action => (
                <ActionCard
                  key={action.id}
                  action={action}
                  category={getCategory(action.category_id)}
                  onCheckin={a => setCheckinTarget(a)}
                  onLongPress={a => setActionMenuTarget(a)}
                />
              ))
            )}
          </div>

          <button className="fab" onClick={() => setShowCreateAction(true)}>+</button>
        </>
      )}

      {/* ── 规律 Tab ── */}
      {tab === 'law' && (
        <>
          <div className="filter-bar">
            <select className="filter-select" value={lawFilterCategory} onChange={e => setLawFilterCategory(e.target.value)}>
              <option value="">全部分类</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <select className="filter-select" value={lawFilterType} onChange={e => setLawFilterType(e.target.value)}>
              <option value="">全部类型</option>
              <option value="1">正向规律</option>
              <option value="2">负向规律</option>
            </select>
            <select className="filter-select" value={lawFilterSort} onChange={e => setLawFilterSort(e.target.value)}>
              <option value="weight">主观权重</option>
              <option value="trigger">触发次数</option>
            </select>
          </div>

          <div className="card-list">
            {displayLaws.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">💡</span>
                <span className="empty-text">暂无规律</span>
                <span className="empty-desc">点击右下角按钮新增</span>
              </div>
            ) : (
              displayLaws.map(law => (
                <LawCard
                  key={law.id}
                  law={law}
                  category={getCategory(law.category_id)}
                  relatedAction={law.related_action_id ? getAction(law.related_action_id) : null}
                  onLongPress={l => setLawMenuTarget(l)}
                />
              ))
            )}
          </div>

          <button className="fab" onClick={() => setShowCreateLaw(true)}>+</button>
        </>
      )}

      {/* 打卡弹窗 */}
      {checkinTarget && (
        <CheckinModal
          action={checkinTarget}
          onClose={() => setCheckinTarget(null)}
          onSubmit={data => handleCheckin(checkinTarget, data)}
        />
      )}

      {/* 正确的事操作菜单 */}
      {actionMenuTarget && (
        <ActionMenu
          action={actionMenuTarget}
          onClose={() => setActionMenuTarget(null)}
          onCheckin={a => setCheckinTarget(a)}
          onArchive={handleArchive}
          onDelete={handleDeleteAction}
          onTogglePin={handleToggleActionPin}
        />
      )}

      {/* 规律操作菜单 */}
      {lawMenuTarget && (
        <LawMenu
          law={lawMenuTarget}
          onClose={() => setLawMenuTarget(null)}
          onRetire={handleRetireLaw}
          onDelete={handleDeleteLaw}
          onTogglePin={handleToggleLawPin}
        />
      )}

      {/* 新增正确的事弹窗 */}
      {showCreateAction && (
        <CreateActionModal
          categories={categories}
          onClose={() => setShowCreateAction(false)}
          onSubmit={handleCreateAction}
        />
      )}

      {/* 新增规律弹窗 */}
      {showCreateLaw && (
        <CreateLawModal
          categories={categories}
          actions={actions.filter(a => a.status === 0)}
          onClose={() => setShowCreateLaw(false)}
          onSubmit={handleCreateLaw}
        />
      )}
    </div>
  )
}
