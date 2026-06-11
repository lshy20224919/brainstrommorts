import { useState, useEffect, useRef } from 'react'
import { Check, Pencil, Pin, Archive, Trash2, Lightbulb, ClipboardList, Shuffle, Ban, CircleSlash } from 'lucide-react'
import { api } from '../mock'
import { useToast } from '../components/Toast'
import ActionSheet from '../components/ActionSheet'
import CheckinModal from '../components/CheckinModal'
import CreateActionModal from '../components/CreateActionModal'
import CreateLawModal from '../components/CreateLawModal'
import CreateMistakeModal from '../components/CreateMistakeModal'
import CreateInspirationModal from '../components/CreateInspirationModal'
import MigrateModal from '../components/MigrateModal'
import ActionDetailPanel from '../components/ActionDetailPanel'
import MistakeDetailPanel from '../components/MistakeDetailPanel'
import LawDetailPanel from '../components/LawDetailPanel'
import InspirationDetailPanel from '../components/InspirationDetailPanel'
import Loading from '../components/Loading'
import SensitiveText from '../components/SensitiveText'

function UnifiedCard({ title, badge, badgeClass, meta, data, borderColor, onClick, onLongPress, rate }) {
  const touchTimer = useRef(null)
  const handleTouchStart = () => { touchTimer.current = setTimeout(() => onLongPress(), 500) }
  const handleTouchEnd = () => clearTimeout(touchTimer.current)
  const handleContextMenu = (e) => { e.preventDefault(); onLongPress() }

  return (
    <div
      className="unified-card"
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
    >
      <div className="unified-card-left">
        <div className="unified-card-title">
          {title}
          {badge && <span className={`unified-card-badge ${badgeClass || ''}`}>{badge}</span>}
        </div>
        <div className="unified-card-meta">{meta}</div>
      </div>
      <div className="unified-card-right">
        <div className="unified-card-data">{data}</div>
        {rate != null && (
          <div className="unified-card-bar">
            <div className="unified-card-bar-fill" style={{ width: `${rate}%`, background: borderColor || 'var(--accent)' }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function CardLibPage({ initParams }) {
  const [primaryTab, setPrimaryTab] = useState(initParams?.primaryTab || 'behavior')
  const [subTab, setSubTab] = useState(initParams?.subTab || 'action')
  const [categories, setCategories] = useState([])
  const [actions, setActions] = useState([])
  const [laws, setLaws] = useState([])
  const [mistakes, setMistakes] = useState([])
  const [inspirations, setInspirations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSort, setFilterSort] = useState('weight')

  const [checkinTarget, setCheckinTarget] = useState(null)
  const [actionSheet, setActionSheet] = useState(null)
  const [showCreateAction, setShowCreateAction] = useState(false)
  const [editActionTarget, setEditActionTarget] = useState(null)
  const [showCreateLaw, setShowCreateLaw] = useState(false)
  const [editLawTarget, setEditLawTarget] = useState(null)
  const [showCreateMistake, setShowCreateMistake] = useState(false)
  const [editMistakeTarget, setEditMistakeTarget] = useState(null)
  const [showCreateInspiration, setShowCreateInspiration] = useState(false)
  const [migrateTarget, setMigrateTarget] = useState(null)
  const [detailAction, setDetailAction] = useState(null)
  const [detailMistake, setDetailMistake] = useState(null)
  const [detailLaw, setDetailLaw] = useState(null)
  const [detailInspiration, setDetailInspiration] = useState(null)

  const toast = useToast()

  useEffect(() => { api.getCategories().then(setCategories) }, [])
  useEffect(() => { loadAll() }, [filterCategory])

  const loadAll = async () => {
    setLoading(true)
    const catParams = filterCategory ? { category_id: Number(filterCategory) } : {}
    const [acts, lws, msts, insps] = await Promise.all([
      api.getActions({ status: 0, ...catParams }),
      api.getLaws(catParams),
      api.getMistakes({ status: 0, ...catParams }),
      api.getInspirations({ status: 0 })
    ])
    setActions(acts); setLaws(lws); setMistakes(msts); setInspirations(insps)
    setLoading(false)
  }
  const loadActions = async () => { const params = { status: 0 }; if (filterCategory) params.category_id = Number(filterCategory); setActions(await api.getActions(params)) }
  const loadLaws = async () => { const params = {}; if (filterCategory) params.category_id = Number(filterCategory); setLaws(await api.getLaws(params)) }
  const loadMistakes = async () => { const params = { status: 0 }; if (filterCategory) params.category_id = Number(filterCategory); setMistakes(await api.getMistakes(params)) }
  const loadInspirations = async () => { setInspirations(await api.getInspirations({ status: 0 })) }

  const handlePrimaryTabChange = (tab) => {
    setPrimaryTab(tab)
    setFilterCategory('')
    setFilterSort('weight')
    if (tab === 'behavior') setSubTab('action')
    else if (tab === 'law') setSubTab('positive')
    else setSubTab('positive')
  }

  // --- Sorting ---
  const getSortedActions = () => {
    const sorted = [...actions].sort((a, b) => {
      if (filterSort === 'exec') return b.exec_count - a.exec_count
      if (filterSort === 'rate') return (b.success_rate ?? -1) - (a.success_rate ?? -1)
      return b.subjective_weight - a.subjective_weight
    })
    return [...sorted.filter(a => a.pinned === 1), ...sorted.filter(a => a.pinned !== 1)]
  }
  const getSortedMistakes = () => {
    const sorted = [...mistakes].sort((a, b) => b.subjective_weight - a.subjective_weight)
    return [...sorted.filter(m => m.pinned === 1), ...sorted.filter(m => m.pinned !== 1)]
  }
  const getSortedLaws = (type) => {
    const filtered = laws.filter(l => l.law_type === type)
    return [...filtered].sort((a, b) => {
      if (filterSort === 'trigger') return b.trigger_count - a.trigger_count
      return b.subjective_weight - a.subjective_weight
    })
  }
  const getSortedInspirations = (dir) => {
    return inspirations.filter(i => i.direction === dir).sort((a, b) => new Date(b.created_time) - new Date(a.created_time))
  }

  const getCategory = (id) => categories.find(c => c.id === id)
  const getAction = (id) => actions.find(a => a.id === id)

  // --- Handlers ---
  const handleCheckin = async (action, data) => { await api.checkin(action.id, data); setCheckinTarget(null); loadActions(); toast.success('打卡成功') }
  const handleCreateAction = async (data) => { await api.createAction(data); setShowCreateAction(false); loadActions(); toast.success('创建成功') }
  const handleEditAction = async (data) => { await api.updateAction(editActionTarget.id, data); setEditActionTarget(null); loadActions(); toast.success('保存成功') }
  const handleCreateLaw = async (data) => { await api.createLaw(data); setShowCreateLaw(false); loadLaws(); toast.success('创建成功') }
  const handleEditLaw = async (data) => { await api.updateLaw(editLawTarget.id, data); setEditLawTarget(null); loadLaws(); toast.success('保存成功') }
  const handleCreateMistake = async (data) => { await api.createMistake(data); setShowCreateMistake(false); loadMistakes(); toast.success('创建成功') }
  const handleEditMistake = async (data) => { await api.updateMistake(editMistakeTarget.id, data); setEditMistakeTarget(null); loadMistakes(); toast.success('保存成功') }
  const handleCreateInspiration = async (data) => { await api.createInspiration(data); setShowCreateInspiration(false); loadInspirations(); toast.success('灵感已记录') }
  const handleMigrate = async (targetCategoryId) => {
    const t = migrateTarget
    await api.migrateCard(t.id, t.law_desc ? 'law' : 'action', targetCategoryId)
    setMigrateTarget(null); loadActions(); loadLaws(); toast.success('迁移成功')
  }

  const openActionSheet = (action) => {
    setActionSheet({
      actions: [
        { icon: <Check size={16} />, label: '打卡', onClick: () => setCheckinTarget(action) },
        { icon: <Pencil size={16} />, label: '编辑', onClick: () => setEditActionTarget(action) },
        { icon: <Pin size={16} />, label: action.pinned ? '取消置顶' : '置顶', onClick: async () => { await api.updateAction(action.id, { pinned: action.pinned ? 0 : 1 }); loadActions() } },
        { icon: <Archive size={16} />, label: '归档', onClick: async () => { await api.updateAction(action.id, { status: 1 }); loadActions(); toast.info('已归档') } },
        { icon: <Shuffle size={16} />, label: '迁移', onClick: () => setMigrateTarget(action) },
        { icon: <Trash2 size={16} />, label: '删除', danger: true, onClick: async () => { try { await api.deleteAction(action.id); loadActions(); toast.success('已删除') } catch (e) { toast.error(e.message) } } }
      ]
    })
  }
  const openMistakeSheet = (mistake) => {
    setActionSheet({
      actions: [
        { icon: <Pencil size={16} />, label: '编辑', onClick: () => setEditMistakeTarget(mistake) },
        { icon: <Pin size={16} />, label: mistake.pinned ? '取消置顶' : '置顶', onClick: async () => { await api.updateMistake(mistake.id, { pinned: mistake.pinned ? 0 : 1 }); loadMistakes() } },
        { icon: <Shuffle size={16} />, label: '迁移', onClick: () => setMigrateTarget(mistake) },
        { icon: <Ban size={16} />, label: '淘汰', danger: true, onClick: async () => { await api.updateMistake(mistake.id, { status: 2 }); loadMistakes(); toast.info('已淘汰') } },
        { icon: <Trash2 size={16} />, label: '删除', danger: true, onClick: async () => { try { await api.deleteMistake(mistake.id); loadMistakes(); toast.success('已删除') } catch (e) { toast.error(e.message) } } }
      ]
    })
  }
  const openLawSheet = (law) => {
    setActionSheet({
      actions: [
        { icon: <Pencil size={16} />, label: '编辑', onClick: () => setEditLawTarget(law) },
        { icon: <Shuffle size={16} />, label: '迁移', onClick: () => setMigrateTarget(law) },
        { icon: <Ban size={16} />, label: '淘汰', danger: true, onClick: async () => { await api.updateLaw(law.id, { status: 2 }); loadLaws(); toast.info('已淘汰') } },
        { icon: <Trash2 size={16} />, label: '删除', danger: true, onClick: async () => { try { await api.deleteLaw(law.id); loadLaws(); toast.success('已删除') } catch (e) { toast.error(e.message) } } }
      ]
    })
  }
  const openInspirationSheet = (insp) => {
    setActionSheet({
      actions: [
        { icon: <Check size={16} />, label: '转为正确的事', onClick: async () => { await api.convertInspiration(insp.id, 'action'); loadInspirations(); setActionSheet(null); setEditActionTarget({ name: insp.desc, category_id: insp.category_id }) } },
        { icon: <CircleSlash size={16} />, label: '转为错误的事', onClick: async () => { await api.convertInspiration(insp.id, 'mistake'); loadInspirations(); setActionSheet(null); setEditMistakeTarget({ name: insp.desc, category_id: insp.category_id }) } },
        { icon: <Lightbulb size={16} />, label: '转为规律', onClick: async () => { await api.convertInspiration(insp.id, 'law'); loadInspirations(); setActionSheet(null); setEditLawTarget({ law_desc: insp.desc, category_id: insp.category_id }) } },
        { icon: <Trash2 size={16} />, label: '删除', danger: true, onClick: async () => { await api.deleteInspiration(insp.id); loadInspirations(); toast.success('已删除') } }
      ]
    })
  }

  // --- Sort options per context ---
  const getSortOptions = () => {
    if (primaryTab === 'behavior' && subTab === 'action') return [['weight', '主观权重'], ['exec', '执行次数'], ['rate', '成功率']]
    if (primaryTab === 'behavior' && subTab === 'mistake') return [['weight', '主观权重']]
    if (primaryTab === 'law') return [['weight', '主观权重'], ['trigger', '触发次数']]
    return [['time', '创建时间']]
  }

  // --- FAB handler ---
  const handleFabClick = () => {
    if (primaryTab === 'behavior' && subTab === 'action') setShowCreateAction(true)
    else if (primaryTab === 'behavior' && subTab === 'mistake') setShowCreateMistake(true)
    else if (primaryTab === 'law') setShowCreateLaw(true)
    else setShowCreateInspiration(true)
  }

  // --- Counts ---
  const actionCount = actions.filter(a => a.status === 0).length
  const mistakeCount = mistakes.filter(m => m.status === 0).length
  const positiveLawCount = laws.filter(l => l.law_type === 1).length
  const negativeLawCount = laws.filter(l => l.law_type === 2).length
  const positiveInspCount = inspirations.filter(i => i.direction === 'positive').length
  const negativeInspCount = inspirations.filter(i => i.direction === 'negative').length

  // --- Render card list ---
  const renderCards = () => {
    if (loading) return <Loading rows={3} />

    if (primaryTab === 'behavior' && subTab === 'action') {
      const list = getSortedActions()
      if (list.length === 0) return <div className="empty-state"><span className="empty-icon"><ClipboardList size={28} /></span><span className="empty-text">暂无正确的事</span></div>
      return list.map(action => {
        const cat = getCategory(action.category_id)
        return <UnifiedCard key={action.id} title={action.name} badge={action.pinned === 1 ? '置顶' : null} badgeClass="badge-pinned" meta={<>{cat?.name} · 执行 {action.exec_count} 次</>} data={action.success_rate != null ? `${action.success_rate}%` : '—'} rate={action.success_rate} borderColor={cat?.color || 'var(--accent)'} onClick={() => setDetailAction(action)} onLongPress={() => openActionSheet(action)} />
      })
    }

    if (primaryTab === 'behavior' && subTab === 'mistake') {
      const list = getSortedMistakes()
      if (list.length === 0) return <div className="empty-state"><span className="empty-icon"><CircleSlash size={28} /></span><span className="empty-text">暂无错误的事</span></div>
      return list.map(mistake => {
        const cat = getCategory(mistake.category_id)
        const relatedCount = (mistake.related_law_ids || []).length
        return <UnifiedCard key={mistake.id} title={mistake.name} badge="红线" badgeClass="badge-redline" meta={<>{cat?.name} · 关联 {relatedCount} 条规律</>} data={`权重 ${mistake.subjective_weight}`} borderColor="#D4836A" onClick={() => setDetailMistake(mistake)} onLongPress={() => openMistakeSheet(mistake)} />
      })
    }

    if (primaryTab === 'law') {
      const type = subTab === 'positive' ? 1 : 2
      const list = getSortedLaws(type)
      if (list.length === 0) return <div className="empty-state"><span className="empty-icon"><Lightbulb size={28} /></span><span className="empty-text">暂无{subTab === 'positive' ? '正向' : '负向'}规律</span></div>
      return list.map(law => {
        const cat = getCategory(law.category_id)
        const relatedAction = law.related_action_id ? getAction(law.related_action_id) : null
        return <UnifiedCard key={law.id} title={law.law_desc} meta={<>{cat?.name}{relatedAction ? ` · ${relatedAction.name}` : ''}</>} data={`触发 ${law.trigger_count} 次`} borderColor={type === 1 ? 'var(--accent)' : '#D4836A'} onClick={() => setDetailLaw(law)} onLongPress={() => openLawSheet(law)} />
      })
    }

    if (primaryTab === 'inspiration') {
      const dir = subTab
      const list = getSortedInspirations(dir)
      if (list.length === 0) return <div className="empty-state"><span className="empty-icon"><Lightbulb size={28} /></span><span className="empty-text">暂无{dir === 'positive' ? '正向' : '负向'}灵感</span></div>
      return list.map(insp => {
        const cat = getCategory(insp.category_id)
        return <UnifiedCard key={insp.id} title={<SensitiveText id={`insp-${insp.id}`} value={insp.desc} />} meta={<>{cat?.name || ''}{insp.source ? ` · ${insp.source}` : ''}</>} data={new Date(insp.created_time).toLocaleDateString()} borderColor={dir === 'positive' ? 'var(--accent)' : '#A78BFA'} onClick={() => setDetailInspiration(insp)} onLongPress={() => openInspirationSheet(insp)} />
      })
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <h2>卡片库</h2>
          <span className="page-header-sub">card library</span>
        </div>
        <div className="card-lib-tabs">
          <button className={`card-lib-tab ${primaryTab === 'behavior' ? 'active' : ''}`} onClick={() => handlePrimaryTabChange('behavior')}>
            <span className="card-lib-tab-count">{actionCount + mistakeCount}</span>
            <span className="card-lib-tab-label">行为</span>
          </button>
          <button className={`card-lib-tab ${primaryTab === 'law' ? 'active' : ''}`} onClick={() => handlePrimaryTabChange('law')}>
            <span className="card-lib-tab-count">{positiveLawCount + negativeLawCount}</span>
            <span className="card-lib-tab-label">规律</span>
          </button>
          <button className={`card-lib-tab ${primaryTab === 'inspiration' ? 'active' : ''}`} onClick={() => handlePrimaryTabChange('inspiration')}>
            <span className="card-lib-tab-count">{positiveInspCount + negativeInspCount}</span>
            <span className="card-lib-tab-label">灵感</span>
          </button>
        </div>
      </div>

      <div className="card-lib-control-bar">
        <div className="card-lib-sub-tabs">
          {primaryTab === 'behavior' && <>
            <button className={`card-lib-sub ${subTab === 'action' ? 'active' : ''}`} onClick={() => setSubTab('action')}>正确的事</button>
            <button className={`card-lib-sub ${subTab === 'mistake' ? 'active' : ''}`} onClick={() => setSubTab('mistake')}>错误的事</button>
          </>}
          {primaryTab === 'law' && <>
            <button className={`card-lib-sub ${subTab === 'positive' ? 'active' : ''}`} onClick={() => setSubTab('positive')}>正向</button>
            <button className={`card-lib-sub ${subTab === 'negative' ? 'active' : ''}`} onClick={() => setSubTab('negative')}>负向</button>
          </>}
          {primaryTab === 'inspiration' && <>
            <button className={`card-lib-sub ${subTab === 'positive' ? 'active' : ''}`} onClick={() => setSubTab('positive')}>正向</button>
            <button className={`card-lib-sub ${subTab === 'negative' ? 'active' : ''}`} onClick={() => setSubTab('negative')}>负向</button>
          </>}
        </div>
        <div className="card-lib-filters">
          <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">全部</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {getSortOptions().length > 1 && (
            <select className="filter-select" value={filterSort} onChange={e => setFilterSort(e.target.value)}>
              {getSortOptions().map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* 卡片列表 */}
      <div className="card-list">{renderCards()}</div>

      {/* FAB */}
      <button className="fab" onClick={handleFabClick}>+</button>

      {/* Modals */}
      <ActionSheet visible={!!actionSheet} actions={actionSheet?.actions || []} onClose={() => setActionSheet(null)} />
      <CheckinModal visible={!!checkinTarget} action={checkinTarget} onClose={() => setCheckinTarget(null)} onSubmit={data => handleCheckin(checkinTarget, data)} checkNegativeLaws={api.checkNegativeLaws} />
      <CreateActionModal visible={showCreateAction} categories={categories} laws={laws} onClose={() => setShowCreateAction(false)} onSubmit={handleCreateAction} />
      <CreateActionModal visible={!!editActionTarget} categories={categories} laws={laws} initial={editActionTarget} onClose={() => setEditActionTarget(null)} onSubmit={handleEditAction} />
      <CreateLawModal visible={showCreateLaw} categories={categories} actions={actions.filter(a => a.status === 0)} onClose={() => setShowCreateLaw(false)} onSubmit={handleCreateLaw} />
      <CreateLawModal visible={!!editLawTarget} categories={categories} actions={actions.filter(a => a.status === 0)} initial={editLawTarget} onClose={() => setEditLawTarget(null)} onSubmit={handleEditLaw} />
      <CreateMistakeModal visible={showCreateMistake} categories={categories} laws={laws} onClose={() => setShowCreateMistake(false)} onSubmit={handleCreateMistake} />
      <CreateMistakeModal visible={!!editMistakeTarget} categories={categories} laws={laws} initial={editMistakeTarget} onClose={() => setEditMistakeTarget(null)} onSubmit={handleEditMistake} />
      <CreateInspirationModal visible={showCreateInspiration} categories={categories} onClose={() => setShowCreateInspiration(false)} onSubmit={handleCreateInspiration} />
      <MigrateModal visible={!!migrateTarget} categories={categories} currentCategoryId={migrateTarget?.category_id} onClose={() => setMigrateTarget(null)} onConfirm={handleMigrate} />
      <ActionDetailPanel visible={!!detailAction} action={detailAction} category={detailAction ? getCategory(detailAction.category_id) : null} onClose={() => setDetailAction(null)} />
      <MistakeDetailPanel visible={!!detailMistake} mistake={detailMistake} category={detailMistake ? getCategory(detailMistake.category_id) : null} onClose={() => setDetailMistake(null)} />
      <LawDetailPanel visible={!!detailLaw} law={detailLaw} category={detailLaw ? getCategory(detailLaw.category_id) : null} onClose={() => setDetailLaw(null)} />
      <InspirationDetailPanel visible={!!detailInspiration} inspiration={detailInspiration} category={detailInspiration ? getCategory(detailInspiration.category_id) : null} onClose={() => setDetailInspiration(null)} />
    </div>
  )
}
