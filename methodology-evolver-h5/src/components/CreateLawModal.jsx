import { useState } from 'react'
import Modal from './Modal'
import { useDraft } from '../hooks/useDraft'

export default function CreateLawModal({ visible, lawType: fixedType, categories, actions, onClose, onSubmit, initial }) {
  const draftKey = initial ? null : 'draft_create_law'
  const [draft, setDraft, clearDraft] = useDraft(draftKey, { desc: '', categoryId: '', lawType: null, relatedActionId: '', scenes: '', weight: 5 })

  const [lawType, setLawType] = useState(initial?.law_type ?? fixedType ?? draft.lawType ?? null)
  const [desc, setDesc] = useState(initial?.law_desc ?? draft.desc ?? '')
  const [categoryId, setCategoryId] = useState(initial?.category_id?.toString() ?? draft.categoryId ?? '')
  const [relatedActionId, setRelatedActionId] = useState(initial?.related_action_id?.toString() ?? draft.relatedActionId ?? '')
  const [scenes, setScenes] = useState(initial?.applicable_scenes ?? draft.scenes ?? '')
  const [weight, setWeight] = useState(initial?.subjective_weight ?? draft.weight ?? 5)

  const updateDraft = (patch) => { if (draftKey) setDraft(prev => ({ ...prev, ...patch })) }
  const canSubmit = desc.trim() && categoryId && lawType

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      law_type: lawType, law_desc: desc.trim(), category_id: Number(categoryId),
      related_action_id: relatedActionId ? Number(relatedActionId) : null,
      applicable_scenes: scenes, subjective_weight: weight
    })
    if (draftKey) clearDraft()
  }

  if (!visible) return null
  const title = initial ? '编辑规律' : fixedType === 1 ? '新增正向规律' : fixedType === 2 ? '新增负向规律' : '新增规律'

  return (
    <Modal visible={visible} title={title} onClose={onClose}>
      {!fixedType && !initial && (
        <div className="g-form-group">
          <div className="g-form-label">规律类型 *</div>
          <div className="g-law-type-row">
            <button className={`g-law-type-btn positive ${lawType === 1 ? 'active' : ''}`} onClick={() => { setLawType(1); updateDraft({ lawType: 1 }) }}>🟢 正向规律</button>
            <button className={`g-law-type-btn negative ${lawType === 2 ? 'active' : ''}`} onClick={() => { setLawType(2); updateDraft({ lawType: 2 }) }}>🔴 负向规律</button>
          </div>
        </div>
      )}
      <div className="g-form-group">
        <div className="g-form-label">规律描述 *</div>
        <textarea className="g-form-textarea" value={desc} onChange={e => { setDesc(e.target.value); updateDraft({ desc: e.target.value }) }} placeholder="最多500字" maxLength={500} rows={4} />
      </div>
      <div className="g-form-group">
        <div className="g-form-label">分类 *</div>
        <select className="g-form-select" value={categoryId} onChange={e => { setCategoryId(e.target.value); updateDraft({ categoryId: e.target.value }) }}>
          <option value="">请选择分类</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>
      <div className="g-form-group">
        <div className="g-form-label">关联正确的事（选填）</div>
        <select className="g-form-select" value={relatedActionId} onChange={e => { setRelatedActionId(e.target.value); updateDraft({ relatedActionId: e.target.value }) }}>
          <option value="">不关联</option>
          {actions?.filter(a => a.status === 0).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      <div className="g-form-group">
        <div className="g-form-label">适用场景（选填）</div>
        <input className="g-form-input" value={scenes} onChange={e => { setScenes(e.target.value); updateDraft({ scenes: e.target.value }) }} placeholder="例：股票交易、习惯养成" maxLength={100} />
      </div>
      <div className="g-form-group">
        <div className="g-form-label">主观权重：{weight}</div>
        <input type="range" min={1} max={10} step={1} value={weight} onChange={e => { setWeight(Number(e.target.value)); updateDraft({ weight: Number(e.target.value) }) }} className="g-form-range" />
      </div>
      <div className="g-modal-actions">
        <button className="btn btn-outline" onClick={onClose}>取消</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}>{initial ? '保存' : '创建'}</button>
      </div>
    </Modal>
  )
}
