import { useState, useEffect, useRef } from 'react'
import { api } from '../mock'
import { useToast } from '../components/Toast'
import ActionSheet from '../components/ActionSheet'
import CheckinModal from '../components/CheckinModal'
import CreateActionModal from '../components/CreateActionModal'
import CreateLawModal from '../components/CreateLawModal'
import MigrateModal from '../components/MigrateModal'
import ActionDetailPanel from '../components/ActionDetailPanel'
import Loading from '../components/Loading'

function ActionCard({ action, category, onCheckin, onLongPress, onShowDetail }) {
  const touchTimer = useRef(null)
  const touchStart = useRef({ x: 0, y: 0 })
  const touchCurrent = useRef({ x: 0, y: 0 })
  const [swipeHint, setSwipeHint] = useState(null)

  const cancelLongPress = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current)
      touchTimer.current = null
    }
  }

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
    touchCurrent.current = { x: touch.clientX, y: touch.clientY }
    touchTimer.current = setTimeout(() => {
      const dx = Math.abs(touchCurrent.current.x - touchStart.current.x)
      const dy = Math.abs(touchCurrent.current.y - touchStart.current.y)
      if (dx < 8 && dy < 8) onLongPress(action)
    }, 500)
  }

  const handleTouchMove = (e) => {
    const touch = e.touches[0]
    touchCurrent.current = { x: touch.clientX, y: touch.clientY }
    const dx = touch.clientX - touchStart.current.x
    const dy = touch.clientY - touchStart.current.y
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) cancelLongPress()
    if (Math.abs(dy) > Math.abs(dx)) {
      setSwipeHint(null)
      return
    }
    if (dx > 36) setSwipeHint('right')
    else if (dx < -36) setSwipeHint('left')
    else setSwipeHint(null)
  }

  const handleTouchEnd = () => {
    cancelLongPress()
    const dx = touchCurrent.current.x - touchStart.current.x
    const dy = touchCurrent.current.y - touchStart.current.y
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 56) onCheckin(action)
      else if (dx < -56) onShowDetail(action)
    }
    setSwipeHint(null)
  }

  const handleContextMenu = (e) => { e.preventDefault(); onLongPress(action) }
  const rate = action.success_rate != null ? `${action.success_rate}%` : '暂无'

  return (
    <div className="action-card-wrap">
      <div className="action-card-swipe-bg left">详情</div>
      <div className="action-card-swipe-bg right">✅ 打卡</div>
      <div className={`action-card ${swipeHint === 'right' ? 'swiped-right' : swipeHint === 'left' ? 'swiped-left' : ''}`} style={{ borderLeftColor: category?.color || '#9CA3AF' }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onContextMenu={handleContextMenu}>
        {swipeHint === 'right' && <div className="swipe-checkin-hint">✅ 松开打卡</div>}
        {swipeHint === 'left' && <div className="swipe-detail-hint">👁 松开查看详情</div>}
        <div className="action-card-header">
          <span className="action-card-name">{action.name}</span>
          <div className="action-card-header-right">
            {action.pinned === 1 && <span className="tag tag-pinned">置顶</span>}
            {action.status === 1 && <span className="tag tag-archived">已归档</span>}
            <span className="action-card-detail-arrow">›</span>
          </div>
        </div>
        <div className="action-card-meta"><span className="action-card-category">{category?.icon} {category?.name}</span></div>
        <div className="action-card-stats">
          <span className="action-card-stat">执行 {action.exec_count} 次</span>
          <span className={`action-card-rate ${action.success_rate >= 60 ? 'high' : ''}`}>成功率 {rate}</span>
        </div>
        <div className="action-card-detail-tip">左划查看详情</div>
      </div>
    </div>
  )
}

function LawCard({ law, category, relatedAction, onLongPress }) {
  const touchTimer = useRef(null)
  const handleTouchStart = () => { touchTimer.current = setTimeout(() => onLongPress(law), 500) }
  const handleTouchEnd = () => clearTimeout(touchTimer.current)
  const handleContextMenu = (e) => { e.preventDefault(); onLongPress(law) }

  return (
    <div className={`law-card ${law.law_type === 1 ? 'positive' : 'negative'} ${law.status !== 0 ? 'archived' : ''}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onContextMenu={handleContextMenu}>
      <div className="law-card-desc">{law.law_desc}</div>
      <div className="law-card-meta">
        <span className="law-card-category">{category?.icon} {category?.name}</span>
        {relatedAction && <span className="law-card-related">关联：{relatedAction.name}</span>}
      </div>
      <div className="law-card-footer">
        <span className="law-card-trigger">触发 {law.trigger_count} 次</span>
        <span className={`law-type-badge ${law.law_type === 1 ? 'positive' : 'negative'}`}>{law.law_type === 1 ? '正向' : '负向'}</span>
      </div>
    </div>
  )
}
export default function CardLibPage() {
  const [tab, setTab] = useState('action')
  const [categories, setCategories] = useState([])
  const [actions, setActions] = useState([])
  const [laws, setLaws] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSort, setFilterSort] = useState('weight')
  const [filterStatus, setFilterStatus] = useState(0)
  const [lawFilterCategory, setLawFilterCategory] = useState('')
  const [lawFilterType, setLawFilterType] = useState('')
  const [lawFilterSort, setLawFilterSort] = useState('weight')

  const [checkinTarget, setCheckinTarget] = useState(null)
  const [actionSheet, setActionSheet] = useState(null)
  const [showCreateAction, setShowCreateAction] = useState(false)
  const [editActionTarget, setEditActionTarget] = useState(null)
  const [showCreateLaw, setShowCreateLaw] = useState(false)
  const [editLawTarget, setEditLawTarget] = useState(null)
  const [migrateTarget, setMigrateTarget] = useState(null)
  const [detailAction, setDetailAction] = useState(null)

  const toast = useToast()

  useEffect(() => { api.getCategories().then(setCategories) }, [])
  useEffect(() => { loadActions() }, [filterCategory, filterStatus])
  useEffect(() => { loadLaws() }, [lawFilterCategory, lawFilterType])

  const loadActions = async () => {
    setLoading(true)
    const params = { status: filterStatus }
    if (filterCategory) params.category_id = Number(filterCategory)
    setActions(await api.getActions(params)); setLoading(false)
  }
  const loadLaws = async () => {
    setLoading(true)
    const params = {}
    if (lawFilterCategory) params.category_id = Number(lawFilterCategory)
    if (lawFilterType) params.law_type = Number(lawFilterType)
    setLaws(await api.getLaws(params)); setLoading(false)
  }

  const sortedActions = [...actions].sort((a, b) => { if (filterSort === 'weight') return b.subjective_weight - a.subjective_weight; if (filterSort === 'exec') return b.exec_count - a.exec_count; return (b.success_rate ?? -1) - (a.success_rate ?? -1) })
  const displayActions = [...sortedActions.filter(a => a.pinned === 1), ...sortedActions.filter(a => a.pinned !== 1)]
  const sortedLaws = [...laws].sort((a, b) => lawFilterSort === 'weight' ? b.subjective_weight - a.subjective_weight : b.trigger_count - a.trigger_count)

  const getCategory = (id) => categories.find(c => c.id === id)
  const getAction = (id) => actions.find(a => a.id === id)

  const handleCheckin = async (action, data) => { await api.checkin(action.id, data); setCheckinTarget(null); loadActions(); toast.success('打卡成功') }
  const handleCreateAction = async (data) => { await api.createAction(data); setShowCreateAction(false); loadActions(); toast.success('创建成功') }
  const handleEditAction = async (data) => { await api.updateAction(editActionTarget.id, data); setEditActionTarget(null); loadActions(); toast.success('保存成功') }
  const handleCreateLaw = async (data) => { await api.createLaw(data); setShowCreateLaw(false); loadLaws(); toast.success('创建成功') }
  const handleEditLaw = async (data) => { await api.updateLaw(editLawTarget.id, data); setEditLawTarget(null); loadLaws(); toast.success('保存成功') }
  const handleMigrate = async (targetCategoryId) => {
    const t = migrateTarget
    await api.migrateCard(t.id, t.law_desc ? 'law' : 'action', targetCategoryId)
    setMigrateTarget(null); loadActions(); loadLaws(); toast.success('迁移成功')
  }

  const handleShowDetail = (action) => {
    setActionSheet(null)
    setCheckinTarget(null)
    setDetailAction(action)
  }

  const openActionSheet = (action) => {
    setActionSheet({
      actions: [
        { icon: '✅', label: '打卡', onClick: () => setCheckinTarget(action) },
        { icon: '✏️', label: '编辑', onClick: () => setEditActionTarget(action) },
        { icon: '📌', label: action.pinned ? '取消置顶' : '置顶', onClick: async () => { await api.updateAction(action.id, { pinned: action.pinned ? 0 : 1 }); loadActions() } },
        { icon: '📦', label: '归档', onClick: async () => { await api.updateAction(action.id, { status: 1 }); loadActions(); toast.info('已归档') } },
        { icon: '🔀', label: '迁移', onClick: () => setMigrateTarget(action) },
        { icon: '🗑️', label: '删除', danger: true, onClick: async () => { try { await api.deleteAction(action.id); loadActions(); toast.success('已删除') } catch (e) { toast.error(e.message) } } }
      ]
    })
  }

  const openLawSheet = (law) => {
    setActionSheet({
      actions: [
        { icon: '✏️', label: '编辑', onClick: () => setEditLawTarget(law) },
        { icon: '🔀', label: '迁移', onClick: () => setMigrateTarget(law) },
        { icon: '🚫', label: '淘汰', danger: true, onClick: async () => { await api.updateLaw(law.id, { status: 2 }); loadLaws(); toast.info('已淘汰') } },
        { icon: '🗑️', label: '删除', danger: true, onClick: async () => { try { await api.deleteLaw(law.id); loadLaws(); toast.success('已删除') } catch (e) { toast.error(e.message) } } }
      ]
    })
  }

  return (
    <div className="page">
      <div className="page-header"><h2>卡片库</h2></div>
      <div className="card-lib-tabs">
        <button className={`card-lib-tab ${tab === 'action' ? 'active' : ''}`} onClick={() => setTab('action')}>正确的事 ({actions.filter(a => a.status === 0).length})</button>
        <button className={`card-lib-tab ${tab === 'law' ? 'active' : ''}`} onClick={() => setTab('law')}>规律 ({laws.length})</button>
      </div>

      {tab === 'action' && (<>
        <div className="filter-bar">
          <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}><option value="">全部分类</option>{categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>
          <select className="filter-select" value={filterSort} onChange={e => setFilterSort(e.target.value)}><option value="weight">主观权重</option><option value="exec">执行次数</option><option value="rate">成功率</option></select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(Number(e.target.value))}><option value={0}>正常</option><option value={1}>已归档</option><option value={2}>已淘汰</option></select>
        </div>
        <div className="card-list">
          {loading ? <Loading rows={3} /> : displayActions.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">📋</span><span className="empty-text">暂无正确的事</span></div>
          ) : displayActions.map(action => <ActionCard key={action.id} action={action} category={getCategory(action.category_id)} onCheckin={a => setCheckinTarget(a)} onLongPress={openActionSheet} onShowDetail={handleShowDetail} />)}
        </div>
        <button className="fab" onClick={() => setShowCreateAction(true)}>+</button>
      </>)}

      {tab === 'law' && (<>
        <div className="filter-bar">
          <select className="filter-select" value={lawFilterCategory} onChange={e => setLawFilterCategory(e.target.value)}><option value="">全部分类</option>{categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>
          <select className="filter-select" value={lawFilterType} onChange={e => setLawFilterType(e.target.value)}><option value="">全部类型</option><option value="1">正向规律</option><option value="2">负向规律</option></select>
          <select className="filter-select" value={lawFilterSort} onChange={e => setLawFilterSort(e.target.value)}><option value="weight">主观权重</option><option value="trigger">触发次数</option></select>
        </div>
        <div className="card-list">
          {loading ? <Loading rows={3} /> : sortedLaws.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">💡</span><span className="empty-text">暂无规律</span></div>
          ) : sortedLaws.map(law => <LawCard key={law.id} law={law} category={getCategory(law.category_id)} relatedAction={law.related_action_id ? getAction(law.related_action_id) : null} onLongPress={openLawSheet} />)}
        </div>
        <button className="fab" onClick={() => setShowCreateLaw(true)}>+</button>
      </>)}

      <ActionSheet visible={!!actionSheet} actions={actionSheet?.actions || []} onClose={() => setActionSheet(null)} />
      <CheckinModal visible={!!checkinTarget} action={checkinTarget} onClose={() => setCheckinTarget(null)} onSubmit={data => handleCheckin(checkinTarget, data)} checkNegativeLaws={api.checkNegativeLaws} />
      <CreateActionModal visible={showCreateAction} categories={categories} onClose={() => setShowCreateAction(false)} onSubmit={handleCreateAction} />
      <CreateActionModal visible={!!editActionTarget} categories={categories} initial={editActionTarget} onClose={() => setEditActionTarget(null)} onSubmit={handleEditAction} />
      <CreateLawModal visible={showCreateLaw} categories={categories} actions={actions.filter(a => a.status === 0)} onClose={() => setShowCreateLaw(false)} onSubmit={handleCreateLaw} />
      <CreateLawModal visible={!!editLawTarget} categories={categories} actions={actions.filter(a => a.status === 0)} initial={editLawTarget} onClose={() => setEditLawTarget(null)} onSubmit={handleEditLaw} />
      <MigrateModal visible={!!migrateTarget} categories={categories} currentCategoryId={migrateTarget?.category_id} onClose={() => setMigrateTarget(null)} onConfirm={handleMigrate} />
      <ActionDetailPanel visible={!!detailAction} action={detailAction} category={detailAction ? getCategory(detailAction.category_id) : null} onClose={() => setDetailAction(null)} />
    </div>
  )
}
