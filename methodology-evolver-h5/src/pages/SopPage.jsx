import { useState, useEffect, useRef } from 'react'
import { api } from '../mock'
import SopExecSummary from '../components/SopExecSummary'

// ─── 工具 ─────────────────────────────────────────────────────
function formatLastExec(t) {
  if (!t) return '从未执行'
  const diff = Math.floor((Date.now() - new Date(t)) / 1000)
  if (diff < 60) return '刚刚执行'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  return `${Math.floor(diff / 86400)} 天前执行`
}

// ─── 步骤编辑行 ───────────────────────────────────────────────
function StepRow({ step, index, total, actions, onChange, onRemove, onMoveUp, onMoveDown }) {
  return (
    <div className="sop-step-row">
      <div className="sop-step-order">{index + 1}</div>
      <div className="sop-step-body">
        <input
          className="form-input sop-step-input"
          value={step.step_desc}
          onChange={e => onChange({ ...step, step_desc: e.target.value })}
          placeholder="步骤描述（必填）"
          maxLength={100}
        />
        <select
          className="form-select sop-step-select"
          value={step.related_action_id || ''}
          onChange={e => onChange({ ...step, related_action_id: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">不关联正确的事</option>
          {actions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      <div className="sop-step-actions">
        <button className="sop-step-btn" onClick={onMoveUp} disabled={index === 0}>↑</button>
        <button className="sop-step-btn" onClick={onMoveDown} disabled={index === total - 1}>↓</button>
        <button className="sop-step-btn danger" onClick={onRemove}>×</button>
      </div>
    </div>
  )
}

// ─── 新建/编辑模板弹窗 ────────────────────────────────────────
function SopFormModal({ sop, categories, actions, onClose, onSubmit }) {
  const isEdit = !!sop
  const [name, setName] = useState(sop?.name || '')
  const [categoryId, setCategoryId] = useState(sop?.category_id || '')
  const [remark, setRemark] = useState(sop?.remark || '')
  const [steps, setSteps] = useState(
    sop?.steps?.length
      ? sop.steps.map(s => ({ ...s }))
      : [{ id: 'new-0', step_desc: '', related_action_id: null }]
  )

  const canSubmit = name.trim() && categoryId && steps.length > 0 && steps.every(s => s.step_desc.trim())

  const addStep = () => {
    if (steps.length >= 10) return
    setSteps(prev => [...prev, { id: `new-${Date.now()}`, step_desc: '', related_action_id: null }])
  }

  const updateStep = (idx, updated) => {
    setSteps(prev => { const n = [...prev]; n[idx] = updated; return n })
  }

  const removeStep = (idx) => {
    setSteps(prev => prev.filter((_, i) => i !== idx))
  }

  const moveUp = (idx) => {
    if (idx === 0) return
    setSteps(prev => { const n = [...prev]; ;[n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n })
  }

  const moveDown = (idx) => {
    setSteps(prev => {
      if (idx === prev.length - 1) return prev
      const n = [...prev]; ;[n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n
    })
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({ name: name.trim(), category_id: Number(categoryId), remark, steps })
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal-box sop-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{isEdit ? '编辑模板' : '新建 SOP 模板'}</div>

        <div className="form-group">
          <div className="form-label">模板名称 *</div>
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
          <div className="form-label">步骤（最多10步）*</div>
          <div className="sop-steps-list">
            {steps.map((s, i) => (
              <StepRow
                key={s.id}
                step={s}
                index={i}
                total={steps.length}
                actions={actions}
                onChange={updated => updateStep(i, updated)}
                onRemove={() => removeStep(i)}
                onMoveUp={() => moveUp(i)}
                onMoveDown={() => moveDown(i)}
              />
            ))}
          </div>
          {steps.length < 10 && (
            <button className="sop-add-step-btn" onClick={addStep}>+ 添加步骤</button>
          )}
        </div>

        <div className="form-group">
          <div className="form-label">备注（选填）</div>
          <textarea className="form-textarea" value={remark} onChange={e => setRemark(e.target.value)} placeholder="最多200字" maxLength={200} rows={2} />
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>取消</button>
          <button className={`btn btn-primary${!canSubmit ? ' disabled' : ''}`} onClick={handleSubmit} disabled={!canSubmit}>
            {isEdit ? '保存' : '创建'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 操作菜单 ─────────────────────────────────────────────────
function SopMenu({ sop, onClose, onEdit, onCopy, onDelete }) {
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="action-menu" onClick={e => e.stopPropagation()}>
        <div className="action-menu-title">{sop.name}</div>
        <button className="action-menu-item" onClick={onEdit}>✏️ 编辑</button>
        <button className="action-menu-item" onClick={onCopy}>📋 复制模板</button>
        <button className="action-menu-item danger" onClick={onDelete}>🗑️ 删除</button>
        <button className="action-menu-item cancel" onClick={onClose}>取消</button>
      </div>
    </div>
  )
}

// ─── 步骤进度条 ───────────────────────────────────────────────
function StepProgressBar({ steps, stepStates }) {
  const doneCount = stepStates.filter(s => s.done).length
  const currentIdx = stepStates.findIndex(s => !s.done)

  return (
    <div className="exec-progress-bar">
      {steps.map((step, idx) => {
        const state = stepStates[idx]
        const isDone = state.done
        const isCurrent = idx === currentIdx
        const isPending = !isDone && !isCurrent

        // Line before this node
        const lineBefore = idx > 0 ? (
          <div className={`exec-progress-line ${stepStates[idx - 1].done ? 'done' : 'pending'}`} />
        ) : null

        // Line after this node
        const lineAfter = idx < steps.length - 1 ? (
          <div className={`exec-progress-line ${isDone ? 'done' : 'pending'}`} />
        ) : null

        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {lineBefore}
            <div className="exec-progress-node-wrap">
              <div className={`exec-progress-node ${isDone ? 'done' : isCurrent ? 'current' : 'pending'}`}>
                {isDone ? '✓' : idx + 1}
              </div>
              <div className={`exec-progress-label ${isCurrent ? 'current' : ''}`}>
                {idx + 1}步
              </div>
            </div>
            {lineAfter}
          </div>
        )
      })}
    </div>
  )
}

// ─── 聚焦步骤卡片 ────────────────────────────────────────────
function FocusedStepCard({ step, state, index, action, onComplete, onUndo }) {
  const hasAction = !!step.related_action_id
  const isDone = state.done

  const handleResult = (result) => {
    onComplete(result)
  }

  return (
    <div className="exec-focused-card">
      <div className="exec-focused-card-step">
        <div className={`exec-focused-card-order${isDone ? '' : ' playing'}`}>
          {isDone ? '✓' : index + 1}
        </div>
        <div className="exec-focused-card-desc">{step.step_desc}</div>
      </div>

      {hasAction && (
        <div className="exec-focused-card-action">关联：{action?.name}</div>
      )}

      {!isDone ? (
        hasAction ? (
          <div className="exec-focused-card-buttons">
            <button
              className="exec-focused-card-btn success"
              onClick={() => handleResult('success')}
            >✅ 成功</button>
            <button
              className="exec-focused-card-btn fail"
              onClick={() => handleResult('fail')}
            >❌ 失败</button>
          </div>
        ) : (
          <div className="exec-focused-card-buttons">
            <button
              className="exec-focused-card-btn success"
              onClick={() => onComplete(null)}
            >✅ 完成此步</button>
          </div>
        )
      ) : (
        <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', cursor: 'pointer' }} onClick={onUndo}>
          点击撤销
        </div>
      )}
    </div>
  )
}

// ─── 紧凑步骤行 ───────────────────────────────────────────────
function CompactStepRow({ step, index }) {
  return (
    <div className="exec-compact-row">
      <div className="exec-compact-order">{index + 1}</div>
      <div className="exec-compact-desc">{step.step_desc}</div>
    </div>
  )
}

// ─── 执行页 ───────────────────────────────────────────────────
function ExecPage({ sop, actions, onClose, onDone }) {
  const [stepStates, setStepStates] = useState(
    sop.steps.map(() => ({ done: false, result: null, remark: '' }))
  )

  const allDone = stepStates.every(s => s.done)
  const currentIdx = stepStates.findIndex(s => !s.done)
  const getAction = (id) => actions.find(a => a.id === id)

  const handleComplete = (idx, result, remark = '') => {
    setStepStates(prev => {
      const n = [...prev]
      n[idx] = { done: true, result, remark }
      return n
    })
  }

  const handleUndo = (idx) => {
    setStepStates(prev => {
      const n = [...prev]
      n[idx] = { done: false, result: null, remark: '' }
      return n
    })
  }

  const handleSubmit = async () => {
    const checkins = sop.steps
      .map((s, i) => ({ step: s, state: stepStates[i] }))
      .filter(({ step, state }) => step.related_action_id && state.done)
      .map(({ step, state }) => ({
        action_id: step.related_action_id,
        result: state.result || 'success',
        remark: state.remark
      }))
    await api.execSop(sop.id, checkins)
    const results = checkins.map(c => ({
      actionName: getAction(c.action_id)?.name || '未知动作',
      result: c.result
    }))
    onDone(results)
  }

  return (
    <div className="exec-page">
      <div className="exec-header">
        <button className="exec-back" onClick={onClose}>←</button>
        <div className="exec-title">{sop.name}</div>
        <div className="exec-progress">{stepStates.filter(s => s.done).length}/{sop.steps.length}</div>
      </div>

      <StepProgressBar steps={sop.steps} stepStates={stepStates} />

      <div className="exec-body-new">
        {/* 当前步骤（第一个未完成的） */}
        {currentIdx !== -1 && (
          <FocusedStepCard
            step={sop.steps[currentIdx]}
            state={stepStates[currentIdx]}
            index={currentIdx}
            action={sop.steps[currentIdx].related_action_id ? getAction(sop.steps[currentIdx].related_action_id) : null}
            onComplete={(result) => handleComplete(currentIdx, result)}
            onUndo={() => handleUndo(currentIdx)}
          />
        )}

        {/* 后续未开始步骤 */}
        {currentIdx !== -1 && sop.steps.slice(currentIdx + 1).map((step, i) => (
          <CompactStepRow key={step.id} step={step} index={currentIdx + 1 + i} />
        ))}
      </div>

      <div className="exec-footer">
        <button className="btn btn-outline" onClick={onClose}>放弃</button>
        <button
          className={`btn btn-primary${!allDone ? ' disabled' : ''}`}
          disabled={!allDone}
          onClick={handleSubmit}
        >
          完成并提交
        </button>
      </div>
    </div>
  )
}

// ─── 模板卡片 ─────────────────────────────────────────────────
function SopCard({ sop, category, onExec, onLongPress }) {
  const touchTimer = useRef(null)

  const handleTouchStart = () => {
    touchTimer.current = setTimeout(() => onLongPress(sop), 500)
  }
  const handleTouchEnd = () => clearTimeout(touchTimer.current)
  const handleContextMenu = (e) => { e.preventDefault(); onLongPress(sop) }

  return (
    <div
      className="sop-card"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
    >
      <div className="sop-card-header">
        <span className="sop-card-name">{sop.name}</span>
      </div>
      <div className="sop-card-meta">
        <span className="sop-card-category">{category?.icon} {category?.name}</span>
        <span className="sop-card-dot">·</span>
        <span className="sop-card-steps">{sop.steps.length} 步骤</span>
      </div>
      {sop.remark ? <div className="sop-card-remark">{sop.remark}</div> : null}
      <div className="sop-card-footer">
        <span className="sop-card-last-exec">{formatLastExec(sop.last_exec_time)}</span>
        <button className="sop-exec-btn" onClick={e => { e.stopPropagation(); onExec(sop) }}>套用 ▶</button>
      </div>
    </div>
  )
}

// ─── 主页面 ───────────────────────────────────────────────────
export default function SopPage() {
  const [sops, setSops] = useState([])
  const [categories, setCategories] = useState([])
  const [actions, setActions] = useState([])
  const [filterCategory, setFilterCategory] = useState('')
  const [menuTarget, setMenuTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)   // null=关闭, false=新建, sop对象=编辑
  const [execTarget, setExecTarget] = useState(null)
  const [execSummary, setExecSummary] = useState(null)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const loadSops = async () => {
    const data = await api.getSops(filterCategory ? { category_id: filterCategory } : {})
    setSops(data)
  }

  useEffect(() => {
    api.getCategories().then(setCategories)
    api.getActions().then(setActions)
  }, [])

  useEffect(() => { loadSops() }, [filterCategory])

  const getCategory = (id) => categories.find(c => c.id === id)

  const handleCreate = async (data) => {
    await api.createSop(data)
    setEditTarget(null)
    loadSops()
    showToast('模板已创建')
  }

  const handleUpdate = async (data) => {
    await api.updateSop(editTarget.id, data)
    setEditTarget(null)
    loadSops()
    showToast('模板已保存')
  }

  const handleCopy = async (sop) => {
    setMenuTarget(null)
    await api.copySop(sop.id)
    loadSops()
    showToast('已复制为副本')
  }

  const handleDelete = async (sop) => {
    setMenuTarget(null)
    await api.deleteSop(sop.id)
    loadSops()
    showToast('模板已删除')
  }

  const handleExecDone = (results) => {
    setExecTarget(null)
    loadSops()
    if (results && results.length > 0) {
      setExecSummary({ sopName: execTarget.name, results })
    } else {
      showToast('执行完成，记录已保存')
    }
  }

  const displaySops = sops

  if (execSummary) {
    return <SopExecSummary visible={true} sopName={execSummary.sopName} results={execSummary.results} onClose={() => setExecSummary(null)} />
  }

  if (execTarget) {
    return (
      <ExecPage
        sop={execTarget}
        actions={actions}
        onClose={() => setExecTarget(null)}
        onDone={handleExecDone}
      />
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>SOP 模板</h2>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">全部分类</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      <div className="card-list">
        {displaySops.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📌</span>
            <span className="empty-text">暂无 SOP 模板</span>
            <span className="empty-desc">点击右下角按钮新建</span>
          </div>
        ) : (
          displaySops.map(sop => (
            <SopCard
              key={sop.id}
              sop={sop}
              category={getCategory(sop.category_id)}
              onExec={s => setExecTarget(s)}
              onLongPress={s => setMenuTarget(s)}
            />
          ))
        )}
      </div>

      <button className="fab" onClick={() => setEditTarget(false)}>+</button>

      {menuTarget && (
        <SopMenu
          sop={menuTarget}
          onClose={() => setMenuTarget(null)}
          onEdit={() => { setEditTarget(menuTarget); setMenuTarget(null) }}
          onCopy={() => handleCopy(menuTarget)}
          onDelete={() => handleDelete(menuTarget)}
        />
      )}

      {editTarget !== null && (
        <SopFormModal
          sop={editTarget || null}
          categories={categories}
          actions={actions.filter(a => a.status === 0)}
          onClose={() => setEditTarget(null)}
          onSubmit={editTarget ? handleUpdate : handleCreate}
        />
      )}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}
