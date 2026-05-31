import { useState } from 'react'
import Modal from './Modal'
import { useDraft } from '../hooks/useDraft'

const SOURCE_OPTIONS = ['书籍', '视频', '聊天', '播客', '文章', '自己想到的']

export default function CreateInspirationModal({ visible, categories, onClose, onSubmit, initial }) {
  const draftKey = initial ? null : 'draft_create_inspiration'
  const [draft, setDraft, clearDraft] = useDraft(draftKey, { desc: '', source: '', categoryId: '' })

  const [desc, setDesc] = useState(initial?.desc ?? draft.desc ?? '')
  const [source, setSource] = useState(initial?.source ?? draft.source ?? '')
  const [categoryId, setCategoryId] = useState(initial?.category_id?.toString() ?? draft.categoryId ?? '')

  const updateDraft = (patch) => { if (draftKey) setDraft(prev => ({ ...prev, ...patch })) }

  const handleSubmit = () => {
    if (!desc.trim()) return
    onSubmit({
      desc: desc.trim(),
      source: source || null,
      category_id: categoryId ? Number(categoryId) : null
    })
    if (draftKey) clearDraft()
  }

  if (!visible) return null

  return (
    <Modal visible={visible} title={initial ? '编辑灵感' : '灵感捕捉'} onClose={onClose}>
      <div className="g-form-group">
        <div className="g-form-label">灵感内容 *</div>
        <textarea className="g-form-textarea" value={desc} onChange={e => { setDesc(e.target.value); updateDraft({ desc: e.target.value }) }} placeholder="快速记下你的想法或看到的好方法" maxLength={200} rows={3} />
      </div>
      <div className="g-form-group">
        <div className="g-form-label">来源（选填）</div>
        <div className="source-tags">
          {SOURCE_OPTIONS.map(s => (
            <span key={s} className={`source-tag ${source === s ? 'active' : ''}`} onClick={() => { const v = source === s ? '' : s; setSource(v); updateDraft({ source: v }) }}>{s}</span>
          ))}
        </div>
      </div>
      <div className="g-form-group">
        <div className="g-form-label">关联分类（选填）</div>
        <select className="g-form-select" value={categoryId} onChange={e => { setCategoryId(e.target.value); updateDraft({ categoryId: e.target.value }) }}>
          <option value="">不关联</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>
      <div className="g-modal-actions">
        <button className="btn btn-outline" onClick={onClose}>取消</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!desc.trim()}>{initial ? '保存' : '记录'}</button>
      </div>
    </Modal>
  )
}
