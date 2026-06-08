import { useState, useEffect } from 'react'
import { api } from '../mock'

function UserCard({ settings }) {
  const days = Math.max(1, Math.floor((Date.now() - new Date(settings.register_time).getTime()) / (1000 * 60 * 60 * 24)))
  return (
    <div className="profile-user-card">
      <div className="profile-avatar">我</div>
      <div className="profile-user-info">
        <div className="profile-user-name">方法论进化者</div>
        <div className="profile-user-days">使用 {days} 天</div>
      </div>
    </div>
  )
}

function DataOverview({ actions, laws }) {
  const activeActions = actions.filter(a => a.status === 0)
  const totalExec = activeActions.reduce((s, a) => s + a.exec_count, 0)
  return (
    <div className="profile-data-overview">
      <div className="profile-data-item">
        <div className="profile-data-value">{activeActions.length}</div>
        <div className="profile-data-label">正确的事</div>
      </div>
      <div className="profile-data-item">
        <div className="profile-data-value">{laws.length}</div>
        <div className="profile-data-label">规律</div>
      </div>
      <div className="profile-data-item">
        <div className="profile-data-value">{totalExec}</div>
        <div className="profile-data-label">累计打卡</div>
      </div>
    </div>
  )
}

function SettingsSection({ settings, onUpdate }) {
  const darkModeOptions = [
    { value: 0, label: '浅色' },
    { value: 1, label: '深色' },
    { value: 2, label: '跟随系统' }
  ]

  return (
    <div className="profile-section">
      <div className="profile-section-title">通用设置</div>
      <div className="profile-section-body">
        <div className="profile-setting-row">
          <span className="profile-setting-label">智能迁移推荐</span>
          <label className="profile-toggle">
            <input type="checkbox" checked={settings.smart_migrate_on} onChange={e => onUpdate({ smart_migrate_on: e.target.checked })} />
            <span className="profile-toggle-slider"></span>
          </label>
        </div>
        <div className="profile-setting-row">
          <span className="profile-setting-label">负向避雷提醒</span>
          <label className="profile-toggle">
            <input type="checkbox" checked={settings.warning_popup_on} onChange={e => onUpdate({ warning_popup_on: e.target.checked })} />
            <span className="profile-toggle-slider"></span>
          </label>
        </div>
        <div className="profile-setting-row">
          <span className="profile-setting-label">深色模式</span>
          <div className="profile-dark-mode-group">
            {darkModeOptions.map(opt => (
              <button key={opt.value} className={`profile-dark-mode-btn ${settings.dark_mode === opt.value ? 'active' : ''}`} onClick={() => onUpdate({ dark_mode: opt.value })}>{opt.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
function CategoryManager({ categories, onAdd, onRename, onRemove, onReorder }) {
  const [expanded, setExpanded] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const sorted = [...categories].sort((a, b) => a.sort_weight - b.sort_weight)

  const handleAdd = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setNewName('')
  }

  const startRename = (cat) => {
    setEditingId(cat.id)
    setEditingName(cat.name)
  }

  const confirmRename = () => {
    const trimmed = editingName.trim()
    if (trimmed && editingId) {
      onRename(editingId, trimmed)
    }
    setEditingId(null)
    setEditingName('')
  }

  return (
    <div className="profile-section">
      <div className="profile-section-title profile-section-title-clickable" onClick={() => setExpanded(!expanded)}>
        分类管理
        <span className={`profile-expand-arrow ${expanded ? 'expanded' : ''}`}>›</span>
      </div>
      {expanded && (
        <div className="profile-section-body">
          {sorted.map((cat, idx) => (
            <div key={cat.id} className="profile-category-row">
              {editingId === cat.id ? (
                <div className="profile-category-edit">
                  <input className="profile-category-input" value={editingName} onChange={e => setEditingName(e.target.value)} maxLength={30} autoFocus onKeyDown={e => e.key === 'Enter' && confirmRename()} />
                  <button className="profile-cat-btn confirm" onClick={confirmRename}>确认</button>
                  <button className="profile-cat-btn" onClick={() => setEditingId(null)}>取消</button>
                </div>
              ) : (
                <>
                  <span className="profile-category-name">{cat.icon} {cat.name}</span>
                  <div className="profile-category-actions">
                    <button className="profile-cat-btn" onClick={() => startRename(cat)}>改名</button>
                    {idx > 0 && <button className="profile-cat-btn" onClick={() => onReorder(cat.id, 'up')}>↑</button>}
                    {idx < sorted.length - 1 && <button className="profile-cat-btn" onClick={() => onReorder(cat.id, 'down')}>↓</button>}
                    {!cat.is_system_default && <button className="profile-cat-btn danger" onClick={() => onRemove(cat.id)}>删除</button>}
                  </div>
                </>
              )}
            </div>
          ))}
          <div className="profile-category-add">
            <input className="profile-category-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="新分类名称" maxLength={30} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <button className="profile-cat-btn confirm" onClick={handleAdd}>新增</button>
          </div>
        </div>
      )}
    </div>
  )
}

function DataManager({ totalRecords }) {
  const [loading, setLoading] = useState(null)
  const [confirmType, setConfirmType] = useState(null)

  const doAction = (type) => {
    setConfirmType(null)
    setLoading(type)
    setTimeout(() => {
      setLoading(null)
      alert(type === 'backup' ? '备份成功' : '还原成功')
    }, 1500)
  }

  return (
    <div className="profile-section">
      <div className="profile-section-title">数据管理</div>
      <div className="profile-section-body">
        <div className="profile-setting-row" onClick={() => setConfirmType('backup')}>
          <span className="profile-setting-label">云端备份</span>
          <span className="profile-setting-arrow">›</span>
        </div>
        <div className="profile-setting-row" onClick={() => setConfirmType('restore')}>
          <span className="profile-setting-label">数据还原</span>
          <span className="profile-setting-arrow">›</span>
        </div>
        <div className="profile-setting-row">
          <span className="profile-setting-label">数据统计</span>
          <span className="profile-setting-value">{totalRecords} 条记录</span>
        </div>
      </div>

      {confirmType && (
        <div className="modal-mask" onClick={() => setConfirmType(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{confirmType === 'backup' ? '确认备份' : '数据还原'}</div>
            <p className="profile-confirm-text">
              {confirmType === 'backup' ? '是否将本地数据加密备份到云端？' : '还原将覆盖当前数据，此操作不可撤销，是否继续？'}
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmType(null)}>取消</button>
              <button className="btn btn-primary" onClick={() => doAction(confirmType)}>确认</button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="modal-mask">
          <div className="modal-box profile-loading-box">
            <div className="profile-loading-spinner"></div>
            <p>{loading === 'backup' ? '备份中...' : '还原中...'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
export default function ProfilePage() {
  const [settings, setSettings] = useState({ smart_migrate_on: true, warning_popup_on: true, dark_mode: 2, register_time: new Date().toISOString() })
  const [categories, setCategories] = useState([])
  const [actions, setActions] = useState([])
  const [laws, setLaws] = useState([])

  useEffect(() => {
    api.getSettings().then(setSettings)
    api.getCategories().then(setCategories)
    api.getActions().then(setActions)
    api.getLaws().then(setLaws)
  }, [])

  const handleUpdateSettings = async (patch) => {
    const updated = await api.updateSettings(patch)
    setSettings(updated)
  }

  const handleAddCategory = async (name) => {
    await api.addCategory(name)
    setCategories(await api.getCategories())
  }

  const handleRenameCategory = async (id, name) => {
    await api.renameCategory(id, name)
    setCategories(await api.getCategories())
  }

  const handleRemoveCategory = async (id) => {
    if (!confirm('确定删除该分类？')) return
    await api.removeCategory(id)
    setCategories(await api.getCategories())
  }

  const handleReorderCategory = async (id, direction) => {
    await api.reorderCategory(id, direction)
    setCategories(await api.getCategories())
  }

  const totalRecords = actions.length + laws.length

  return (
    <div className="page profile-page">
      <div className="page-header">
        <div className="page-header-row">
          <h2>个人中心</h2>
          <span className="page-header-sub">profile & settings</span>
        </div>
      </div>
      <div className="page-body">
        <UserCard settings={settings} />
        <DataOverview actions={actions} laws={laws} />
        <SettingsSection settings={settings} onUpdate={handleUpdateSettings} />
        <CategoryManager categories={categories} onAdd={handleAddCategory} onRename={handleRenameCategory} onRemove={handleRemoveCategory} onReorder={handleReorderCategory} />
        <DataManager totalRecords={totalRecords} />
        <div className="profile-section">
          <div className="profile-section-title">关于</div>
          <div className="profile-section-body">
            <div className="profile-setting-row">
              <span className="profile-setting-label">版本</span>
              <span className="profile-setting-value">v1.0.0</span>
            </div>
            <div className="profile-setting-row" onClick={() => { if (confirm('重置将清除所有数据并恢复默认，确定？')) api.resetAllData() }}>
              <span className="profile-setting-label" style={{ color: '#F87272' }}>重置所有数据</span>
              <span className="profile-setting-arrow">›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
