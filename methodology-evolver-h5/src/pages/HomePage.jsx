import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../mock'
import { useToast } from '../components/Toast'
import CheckinModal from '../components/CheckinModal'
import CreateActionModal from '../components/CreateActionModal'
import CreateLawModal from '../components/CreateLawModal'
import MigrateRecommendModal from '../components/MigrateRecommendModal'
import EvolutionJourney from '../components/EvolutionJourney'
import SmartSuggestion from '../components/SmartSuggestion'
import PostActionGuide from '../components/PostActionGuide'
import Loading from '../components/Loading'

function QuickActions({ onAddAction, onAddPositiveLaw, onAddNegativeLaw, onCheckin }) {
  return (
    <div className="quick-actions">
      <button className="quick-btn" onClick={onAddAction}><span className="quick-btn-icon">➕</span><span className="quick-btn-label">正确的事</span></button>
      <button className="quick-btn" onClick={onAddPositiveLaw}><span className="quick-btn-icon">➕</span><span className="quick-btn-label">正向规律</span></button>
      <button className="quick-btn" onClick={onAddNegativeLaw}><span className="quick-btn-icon">➕</span><span className="quick-btn-label">负向规律</span></button>
      <button className="quick-btn" onClick={onCheckin}><span className="quick-btn-icon">✅</span><span className="quick-btn-label">打卡</span></button>
    </div>
  )
}

function TodoSection({ todos, onDismiss, onMigrateClick }) {
  if (!todos || todos.length === 0) return null
  const renderTodo = (todo) => {
    if (todo.type === 'review') return <span>📊 您有 <strong>{todo.count}</strong> 个正确的事待复盘</span>
    if (todo.type === 'migrate') return <span>💡 今日有 <strong>{todo.count}</strong> 条迁移推荐</span>
    if (todo.type === 'overdue') return <span>⏰ <strong>{todo.action.name}</strong> 已 {todo.days} 天未执行</span>
    return null
  }
  return (
    <div className="todo-section">
      <div className="section-title">待办提醒</div>
      {todos.map(todo => (
        <div key={todo.key} className="todo-card" onClick={() => todo.type === 'migrate' && onMigrateClick?.()}>
          <div className="todo-content">{renderTodo(todo)}</div>
          <button className="todo-dismiss" onClick={e => { e.stopPropagation(); onDismiss(todo.key) }}>×</button>
        </div>
      ))}
    </div>
  )
}
const RANK_TABS = [
  { key: 'action', label: '正确的事' },
  { key: 'positive_law', label: '正向规律' },
  { key: 'negative_law', label: '负向规律' }
]

function RankSection({ categories }) {
  const [rankIndex, setRankIndex] = useState(0)
  const [rankings, setRankings] = useState({ action: [], positive_law: [], negative_law: [] })
  const [rankConfig, setRankConfig] = useState({ action: 5, positive_law: 3, negative_law: 3 })
  const [showConfig, setShowConfig] = useState(false)
  const [configDraft, setConfigDraft] = useState(null)
  const touchStartX = useRef(null)

  useEffect(() => { loadRankings(); api.getRankConfig().then(setRankConfig) }, [])
  const loadRankings = async () => {
    const [action, positive_law, negative_law] = await Promise.all([api.getRanking('action'), api.getRanking('positive_law'), api.getRanking('negative_law')])
    setRankings({ action, positive_law, negative_law })
  }
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) { if (diff > 0) setRankIndex(i => Math.min(i + 1, 2)); else setRankIndex(i => Math.max(i - 1, 0)) }
    touchStartX.current = null
  }
  const getCategoryName = (id) => categories.find(c => c.id === id)?.name ?? ''
  const currentKey = RANK_TABS[rankIndex].key
  const currentList = rankings[currentKey] ?? []
  const handleSaveConfig = async () => { await api.updateRankConfig(configDraft); setRankConfig(configDraft); setShowConfig(false); loadRankings() }

  return (
    <div className="rank-section">
      <div className="section-header"><span className="section-title">我的榜单</span><button className="rank-config-btn" onClick={() => { setConfigDraft({ ...rankConfig }); setShowConfig(true) }}>自定义</button></div>
      <div className="rank-slider" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="rank-dots">{RANK_TABS.map((_, i) => <span key={i} className={`rank-dot ${i === rankIndex ? 'active' : ''}`} onClick={() => setRankIndex(i)} />)}</div>
        <div className="rank-tab-label">{RANK_TABS[rankIndex].label}</div>
        {currentList.length === 0 ? <div className="rank-empty">暂无数据</div> : (
          <div className="rank-list">
            {currentList.map((item, index) => (
              <div key={item.id} className="rank-item">
                <span className={`rank-num ${index < 3 ? 'top3' : ''}`}>{index + 1}</span>
                <div className="rank-info"><span className="rank-name">{item.name ?? item.law_desc}</span><span className="rank-category">{getCategoryName(item.category_id)}</span></div>
                <div className="rank-stats">
                  {currentKey === 'action' ? (<><span className="rank-count">{item.exec_count} 次</span><span className={`rank-rate ${item.success_rate >= 60 ? 'high' : ''}`}>{item.success_rate != null ? `${item.success_rate}%` : '暂无'}</span></>) : (<span className="rank-count">触发 {item.trigger_count} 次</span>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showConfig && configDraft && (
        <div className="g-modal-mask" onClick={() => setShowConfig(false)}>
          <div className="g-modal-box" onClick={e => e.stopPropagation()}>
            <div className="g-modal-title">自定义榜单显示数量</div>
            {[{ key: 'action', label: '正确的事' }, { key: 'positive_law', label: '正向规律' }, { key: 'negative_law', label: '负向规律' }].map(({ key, label }) => (
              <div key={key} className="g-form-group"><div className="g-form-label">{label}</div><input type="number" className="g-form-input" min={1} max={20} value={configDraft[key]} onChange={e => setConfigDraft(d => ({ ...d, [key]: parseInt(e.target.value) || 1 }))} /></div>
            ))}
            <div className="g-modal-actions"><button className="btn btn-outline" onClick={() => setShowConfig(false)}>取消</button><button className="btn btn-primary" onClick={handleSaveConfig}>确认</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function HomePage({ onSwitchTab }) {
  const [stages, setStages] = useState([])
  const [suggestion, setSuggestion] = useState(null)
  const [todos, setTodos] = useState([])
  const [categories, setCategories] = useState([])
  const [actions, setActions] = useState([])
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMigrateRec, setShowMigrateRec] = useState(false)
  const [migrateRecs, setMigrateRecs] = useState([])
  const [guide, setGuide] = useState(null)
  const [lastCheckinActionId, setLastCheckinActionId] = useState(null)
  const toast = useToast()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const [stg, sug, t, cats, acts] = await Promise.all([
      api.getEvolutionProgress(), api.getSmartSuggestion(), api.getTodos(), api.getCategories(), api.getActions({ status: 0 })
    ])
    setStages(stg); setSuggestion(sug); setTodos(t); setCategories(cats); setActions(acts); setLoading(false)
  }

  const handleDismiss = async (key) => { await api.dismissTodo(key); setTodos(prev => prev.filter(t => t.key !== key)) }

  const handleAddAction = async (data) => { await api.createAction(data); setModal(null); loadData(); toast.success('创建成功') }

  const handleAddLaw = async (data) => {
    await api.createLaw(data); setModal(null); loadData()
    setGuide({ message: '规律创建成功', actions: [{ label: '去创建 SOP →', onClick: () => {} }] })
  }

  const handleCheckin = async ({ actionId, result, remark }) => {
    await api.checkin(actionId, { result, remark })
    await api.recordPopup([]); setModal(null); setLastCheckinActionId(actionId); loadData()
    setGuide({
      message: '打卡成功',
      actions: [
        { label: '查看详情', onClick: () => {} },
        { label: '提炼规律', onClick: () => setModal('positive_law') }
      ]
    })
  }

  const handleMigrateClick = async () => { const recs = await api.getMigrateRecommendations(); setMigrateRecs(recs); setShowMigrateRec(true) }
  const handleAcceptMigration = async (rec) => { await api.acceptMigration(rec); loadData() }

  const handleSuggestionAction = useCallback((action) => {
    if (action === 'create_action') setModal('action')
    else if (action === 'checkin') setModal('checkin')
    else if (action === 'create_law') setModal('positive_law')
    else if (action === 'go_sop') onSwitchTab?.('sop')
    else if (action === 'go_review') onSwitchTab?.('review')
  }, [onSwitchTab])

  const handleGuideClose = useCallback(() => setGuide(null), [])

  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">方法论进化器</h1></div>
      <div className="page-body">
        {loading ? <Loading rows={4} /> : (<>
          <EvolutionJourney stages={stages} />
          <SmartSuggestion suggestion={suggestion} onAction={handleSuggestionAction} />
          <QuickActions onAddAction={() => setModal('action')} onAddPositiveLaw={() => setModal('positive_law')} onAddNegativeLaw={() => setModal('negative_law')} onCheckin={() => setModal('checkin')} />
          <TodoSection todos={todos} onDismiss={handleDismiss} onMigrateClick={handleMigrateClick} />
          <RankSection categories={categories} />
        </>)}
      </div>

      <CheckinModal visible={modal === 'checkin'} actions={actions} onClose={() => setModal(null)} onSubmit={handleCheckin} checkNegativeLaws={api.checkNegativeLaws} />
      <CreateActionModal visible={modal === 'action'} categories={categories} onClose={() => setModal(null)} onSubmit={handleAddAction} />
      <CreateLawModal visible={modal === 'positive_law'} lawType={1} categories={categories} actions={actions} onClose={() => setModal(null)} onSubmit={handleAddLaw} />
      <CreateLawModal visible={modal === 'negative_law'} lawType={2} categories={categories} actions={actions} onClose={() => setModal(null)} onSubmit={handleAddLaw} />
      <MigrateRecommendModal visible={showMigrateRec} recommendations={migrateRecs} onClose={() => setShowMigrateRec(false)} onAccept={handleAcceptMigration} onDismiss={api.dismissMigration} />
      <PostActionGuide visible={!!guide} message={guide?.message} actions={guide?.actions || []} onClose={handleGuideClose} />
    </div>
  )
}
