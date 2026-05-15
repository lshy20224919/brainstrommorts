import { useState } from 'react'
import Modal from './Modal'
import { useDraft } from '../hooks/useDraft'

export default function CreateActionModal({ visible, categories, onClose, onSubmit, initial }) {
  const draftKey = initial ? null : 'draft_create_action'
  const [draft, setDraft, clearDraft] = useDraft(draftKey, { name: '', categoryId: '', weight: 5, remark: '' })

  const [name, setName] = useState(initial?.name ?? draft.name ?? '')
  const [categoryId, setCategoryId] = useState(initial?.category_id?.toString() ?? draft.categoryId ?? '')
  const [weight, setWeight] = useState(initial?.subjective_weight ?? draft.weight ?? 5)
  const [remark, setRemark] = useState(initial?.remark ?? draft.remark ?? '')

  const updateDraft = (patch) => { if (draftKey) setDraft(prev => ({ ...prev, ...patch })) }

  const handleSubmit = () => {
    if (!name.trim() || !categoryId) return
    onSubmit({ name: name.trim(), category_id: Number(categoryId), subjective_weight: weight, remark })
    if (draftKey) clearDraft()
  }

  if (!visible) return null

  return (
    <Modal visible={visible} title={initial ? '编辑正确的事' : '新增正确的事'} onClose={onClose}>
      <div className="g-form-group">
        <div className="g-form-label">名称 *</div>
        <input className="g-form-input" value={name} onChange={e => { setName(e.target.value); updateDraft({ name: e.target.value }) }} placeholder="最多30字" maxLength={30} />
      </div>
      <div className="g-form-group">
        <div className="g-form-label">分类 *</div>
        <select className="g-form-select" value={categoryId} onChange={e => { setCategoryId(e.target.value); updateDraft({ categoryId: e.target.value }) }}>
          <option value="">请选择分类</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>
      <div className="g-form-group">
        <div className="g-form-label">主观权重：{weight}</div>
        <input type="range" min={1} max={10} step={1} value={weight} onChange={e => { setWeight(Number(e.target.value)); updateDraft({ weight: Number(e.target.value) }) }} className="g-form-range" />
      </div>
      <div className="g-form-group">
        <div className="g-form-label">备注（选填）</div>
        <textarea className="g-form-textarea" value={remark} onChange={e => { setRemark(e.target.value); updateDraft({ remark: e.target.value }) }} placeholder="最多200字" maxLength={200} rows={3} />
      </div>
      <div className="g-modal-actions">
        <button className="btn btn-outline" onClick={onClose}>取消</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!name.trim() || !categoryId}>{initial ? '保存' : '创建'}</button>
      </div>
    </Modal>
  )
}
