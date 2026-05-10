import { useState, useEffect, useRef } from 'react'
import { api } from '../mock'

// ─── 数据看板 ───────────────────────────────────────────────
function StatsBoard({ stats }) {
  return (
    <div className="stats-board">
      <div className="stats-board-item">
        <div className="stats-board-label">正确的事</div>
        <div className="stats-board-value">{stats.action_count ?? 0}</div>
        <div className="stats-board-sub">触发 {stats.action_trigger_count ?? 0} 次</div>
      </div>
      <div className="stats-board-item">
        <div className="stats-board-label">正向规律</div>
        <div className="stats-board-value">{stats.positive_law_count ?? 0}</div>
        <div className="stats-board-sub">触发 {stats.positive_law_trigger_count ?? 0} 次</div>
      </div>
      <div className="stats-board-item">
        <div className="stats-board-label">负向规律</div>
        <div className="stats-board-value negative">{stats.negative_law_count ?? 0}</div>
        <div className="stats-board-sub">触发 {stats.negative_law_trigger_count ?? 0} 次</div>
      </div>
    </div>
  )
}

// ─── 快捷操作区 ─────────────────────────────────────────────
function QuickActions({ onAddAction, onAddPositiveLaw, onAddNegativeLaw, onCheckin }) {
  return (
    <div className="quick-actions">
      <button className="quick-btn" onClick={onAddAction}>
        <span className="quick-btn-icon">➕</span>
        <span className="quick-btn-label">正确的事</span>
      </button>
      <button className="quick-btn" onClick={onAddPositiveLaw}>
        <span className="quick-btn-icon">➕</span>
        <span className="quick-btn-label">正向规律</span>
      </button>
      <button className="quick-btn" onClick={onAddNegativeLaw}>
        <span className="quick-btn-icon">➕</span>
        <span className="quick-btn-label">负向规律</span>
      </button>
      <button className="quick-btn" onClick={onCheckin}>
        <span className="quick-btn-icon">✅</span>
        <span className="quick-btn-label">打卡</span>
      </button>
    </div>
  )
}

// ─── 待办提醒区 ─────────────────────────────────────────────
function TodoSection({ todos, onDismiss }) {
  if (!todos || todos.length === 0) return null

  const renderTodo = (todo) => {
    if (todo.type === 'review') {
      return <span>📊 您有 <strong>{todo.count}</strong> 个正确的事待复盘</span>
    }
    if (todo.type === 'migrate') {
      return <span>💡 今日有 <strong>{todo.count}</strong> 条迁移推荐</span>
    }
    if (todo.type === 'overdue') {
      return <span>⏰ <strong>{todo.action.name}</strong> 已 {todo.days} 天未执行</span>
    }
    return null
  }

  return (
    <div className="todo-section">
      <div className="section-title">待办提醒</div>
      {todos.map(todo => (
        <div key={todo.key} className="todo-card">
          <div className="todo-content">{renderTodo(todo)}</div>
          <button className="todo-dismiss" onClick={() => onDismiss(todo.key)}>×</button>
        </div>
      ))}
    </div>
  )
}

// ─── 榜单区 ─────────────────────────────────────────────────
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

  useEffect(() => {
    loadRankings()
    api.getRankConfig().then(setRankConfig)
  }, [])

  const loadRankings = async () => {
    const [action, positive_law, negative_law] = await Promise.all([
      api.getRanking('action'),
      api.getRanking('positive_law'),
      api.getRanking('negative_law')
    ])
    setRankings({ action, positive_law, negative_law })
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) setRankIndex(i => Math.min(i + 1, 2))
      else setRankIndex(i => Math.max(i - 1, 0))
    }
    touchStartX.current = null
  }

  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name ?? ''
  }

  const currentKey = RANK_TABS[rankIndex].key
  const currentList = rankings[currentKey] ?? []

  const handleSaveConfig = async () => {
    await api.updateRankConfig(configDraft)
    setRankConfig(configDraft)
    setShowConfig(false)
    loadRankings()
  }

  return (
    <div className="rank-section">
      <div className="section-header">
        <span className="section-title">我的榜单</span>
        <button className="rank-config-btn" onClick={() => { setConfigDraft({ ...rankConfig }); setShowConfig(true) }}>自定义</button>
      </div>

      {/* 滑动区域 */}
      <div
        className="rank-slider"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 指示点 */}
        <div className="rank-dots">
          {RANK_TABS.map((_, i) => (
            <span key={i} className={`rank-dot ${i === rankIndex ? 'active' : ''}`} onClick={() => setRankIndex(i)} />
          ))}
        </div>

        {/* 榜单标题 */}
        <div className="rank-tab-label">{RANK_TABS[rankIndex].label}</div>

        {/* 榜单列表 */}
        {currentList.length === 0 ? (
          <div className="rank-empty">暂无数据</div>
        ) : (
          <div className="rank-list">
            {currentList.map((item, index) => (
              <div key={item.id} className="rank-item">
                <span className={`rank-num ${index < 3 ? 'top3' : ''}`}>{index + 1}</span>
                <div className="rank-info">
                  <span className="rank-name">{item.name ?? item.law_desc}</span>
                  <span className="rank-category">{getCategoryName(item.category_id)}</span>
                </div>
                <div className="rank-stats">
                  {currentKey === 'action' ? (
                    <>
                      <span className="rank-count">{item.exec_count} 次</span>
                      <span className={`rank-rate ${item.success_rate >= 60 ? 'high' : ''}`}>
                        {item.success_rate != null ? `${item.success_rate}%` : '暂无'}
                      </span>
                    </>
                  ) : (
                    <span className="rank-count">触发 {item.trigger_count} 次</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 自定义数量弹窗 */}
      {showConfig && configDraft && (
        <div className="modal-overlay" onClick={() => setShowConfig(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>自定义榜单显示数量</h3>
            {[
              { key: 'action', label: '正确的事' },
              { key: 'positive_law', label: '正向规律' },
              { key: 'negative_law', label: '负向规律' }
            ].map(({ key, label }) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={configDraft[key]}
                  onChange={e => setConfigDraft(d => ({ ...d, [key]: parseInt(e.target.value) || 1 }))}
                />
              </div>
            ))}
            <div className="modal-actions">
              <button onClick={() => setShowConfig(false)}>取消</button>
              <button className="primary" onClick={handleSaveConfig}>确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 新增正确的事弹窗 ────────────────────────────────────────
function AddActionModal({ categories, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [weight, setWeight] = useState(5)
  const [remark, setRemark] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return alert('请输入名称')
    onSubmit({ name: name.trim(), category_id: parseInt(categoryId), subjective_weight: weight, remark })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>新增正确的事</h3>
        <div className="form-group">
          <label>名称 *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="最多30字" maxLength={30} />
        </div>
        <div className="form-group">
          <label>分类 *</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>主观权重：{weight}</label>
          <input type="range" min={1} max={10} value={weight} onChange={e => setWeight(parseInt(e.target.value))} />
        </div>
        <div className="form-group">
          <label>备注</label>
          <textarea value={remark} onChange={e => setRemark(e.target.value)} placeholder="最多200字" maxLength={200} />
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>取消</button>
          <button className="primary" onClick={handleSubmit}>创建</button>
        </div>
      </div>
    </div>
  )
}

// ─── 新增规律弹窗 ────────────────────────────────────────────
function AddLawModal({ lawType, categories, actions, onClose, onSubmit }) {
  const [desc, setDesc] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [relatedActionId, setRelatedActionId] = useState('')
  const [scenes, setScenes] = useState('')
  const [weight, setWeight] = useState(5)

  const typeLabel = lawType === 1 ? '正向规律' : '负向规律'

  const handleSubmit = () => {
    if (!desc.trim()) return alert('请输入规律描述')
    onSubmit({
      law_type: lawType,
      law_desc: desc.trim(),
      category_id: parseInt(categoryId),
      related_action_id: relatedActionId ? parseInt(relatedActionId) : null,
      applicable_scenes: scenes,
      subjective_weight: weight
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>新增{typeLabel}</h3>
        <div className={`law-type-badge ${lawType === 1 ? 'positive' : 'negative'}`}>{typeLabel}</div>
        <div className="form-group">
          <label>规律描述 *</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="最多500字" maxLength={500} rows={3} />
        </div>
        <div className="form-group">
          <label>分类 *</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>关联正确的事（选填）</label>
          <select value={relatedActionId} onChange={e => setRelatedActionId(e.target.value)}>
            <option value="">不关联</option>
            {actions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>适用场景（选填）</label>
          <input value={scenes} onChange={e => setScenes(e.target.value)} placeholder="如：股票、习惯养成" />
        </div>
        <div className="form-group">
          <label>主观权重：{weight}</label>
          <input type="range" min={1} max={10} value={weight} onChange={e => setWeight(parseInt(e.target.value))} />
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>取消</button>
          <button className="primary" onClick={handleSubmit}>创建</button>
        </div>
      </div>
    </div>
  )
}

// ─── 打卡弹窗 ────────────────────────────────────────────────
function CheckinModal({ actions, onClose, onSubmit }) {
  const [selectedId, setSelectedId] = useState('')
  const [result, setResult] = useState('')
  const [remark, setRemark] = useState('')

  const handleSubmit = () => {
    if (!selectedId) return alert('请选择正确的事')
    if (!result) return alert('请选择执行结果')
    onSubmit({ actionId: parseInt(selectedId), result, remark })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>打卡</h3>
        <div className="form-group">
          <label>选择正确的事 *</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            <option value="">请选择</option>
            {actions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>执行结果 *</label>
          <div className="checkin-result-btns">
            <button
              className={`checkin-result-btn success ${result === 'success' ? 'active' : ''}`}
              onClick={() => setResult('success')}
            >✅ 成功</button>
            <button
              className={`checkin-result-btn fail ${result === 'fail' ? 'active' : ''}`}
              onClick={() => setResult('fail')}
            >❌ 失败</button>
          </div>
        </div>
        <div className="form-group">
          <label>备注（选填）</label>
          <input value={remark} onChange={e => setRemark(e.target.value)} placeholder="最多200字" maxLength={200} />
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>取消</button>
          <button className="primary" onClick={handleSubmit}>确认打卡</button>
        </div>
      </div>
    </div>
  )
}

// ─── 首页主组件 ──────────────────────────────────────────────
export default function HomePage() {
  const [stats, setStats] = useState({})
  const [todos, setTodos] = useState([])
  const [categories, setCategories] = useState([])
  const [actions, setActions] = useState([])
  const [modal, setModal] = useState(null) // 'action' | 'positive_law' | 'negative_law' | 'checkin'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [s, t, cats, acts] = await Promise.all([
      api.getHomeStats(),
      api.getTodos(),
      api.getCategories(),
      api.getActions({ status: 0 })
    ])
    setStats(s)
    setTodos(t)
    setCategories(cats)
    setActions(acts)
  }

  const handleDismiss = async (key) => {
    await api.dismissTodo(key)
    setTodos(prev => prev.filter(t => t.key !== key))
  }

  const handleAddAction = async (data) => {
    await api.createAction(data)
    setModal(null)
    loadData()
  }

  const handleAddLaw = async (data) => {
    await api.createLaw(data)
    setModal(null)
    loadData()
  }

  const handleCheckin = async ({ actionId, result, remark }) => {
    await api.checkin(actionId, { result, remark })
    setModal(null)
    loadData()
    alert('打卡成功！')
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">方法论进化器</h1>
      </div>

      <div className="page-body">
        <StatsBoard stats={stats} />
        <QuickActions
          onAddAction={() => setModal('action')}
          onAddPositiveLaw={() => setModal('positive_law')}
          onAddNegativeLaw={() => setModal('negative_law')}
          onCheckin={() => setModal('checkin')}
        />
        <TodoSection todos={todos} onDismiss={handleDismiss} />
        <RankSection categories={categories} />
      </div>

      {modal === 'action' && (
        <AddActionModal categories={categories} onClose={() => setModal(null)} onSubmit={handleAddAction} />
      )}
      {modal === 'positive_law' && (
        <AddLawModal lawType={1} categories={categories} actions={actions} onClose={() => setModal(null)} onSubmit={handleAddLaw} />
      )}
      {modal === 'negative_law' && (
        <AddLawModal lawType={2} categories={categories} actions={actions} onClose={() => setModal(null)} onSubmit={handleAddLaw} />
      )}
      {modal === 'checkin' && (
        <CheckinModal actions={actions} onClose={() => setModal(null)} onSubmit={handleCheckin} />
      )}
    </div>
  )
}
