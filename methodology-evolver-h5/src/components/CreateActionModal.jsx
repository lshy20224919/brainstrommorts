import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import { useDraft } from '../hooks/useDraft'
import { api } from '../mock'

export default function CreateActionModal({ visible, categories, laws, onClose, onSubmit, initial }) {
  const draftKey = initial ? null : 'draft_create_action'
  const [draft, setDraft, clearDraft] = useDraft(draftKey, { name: '', categoryId: '', weight: 5, remark: '', relatedLawIds: [] })

  const [name, setName] = useState(initial?.name ?? draft.name ?? '')
  const [categoryId, setCategoryId] = useState(initial?.category_id?.toString() ?? draft.categoryId ?? '')
  const [weight, setWeight] = useState(initial?.subjective_weight ?? draft.weight ?? 5)
  const [remark, setRemark] = useState(initial?.remark ?? draft.remark ?? '')
  const [relatedLawIds, setRelatedLawIds] = useState(initial?.related_law_ids ?? draft.relatedLawIds ?? [])
  const [warningLaws, setWarningLaws] = useState(null)

  const updateDraft = (patch) => { if (draftKey) setDraft(prev => ({ ...prev, ...patch })) }

  const toggleLaw = (lawId) => {
    const next = relatedLawIds.includes(lawId) ? relatedLawIds.filter(id => id !== lawId) : [...relatedLawIds, lawId]
    setRelatedLawIds(next)
    updateDraft({ relatedLawIds: next })
  }

  const doSubmit = () => {
    onSubmit({ name: name.trim(), category_id: Number(categoryId), subjective_weight: weight, remark, related_law_ids: relatedLawIds })
    if (draftKey) clearDraft()
    setWarningLaws(null)
  }

  const handleSubmit = async () => {
    if (!name.trim() || !categoryId) return
    const matched = await api.checkNegativeLaws(Number(categoryId))
    if (matched && matched.length > 0) {
      setWarningLaws(matched)
      return
    }
    doSubmit()
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
      {laws && laws.length > 0 && (
        <div className="g-form-group">
          <div className="g-form-label">关联规律（选填）</div>
          <div className="law-select-list">
            {laws.map(l => (
              <label key={l.id} className={`law-select-item ${relatedLawIds.includes(l.id) ? 'selected' : ''}`}>
                <input type="checkbox" checked={relatedLawIds.includes(l.id)} onChange={() => toggleLaw(l.id)} />
                <span className={`law-select-type ${l.law_type === 1 ? 'positive' : 'negative'}`}>{l.law_type === 1 ? '正' : '负'}</span>
                <span className="law-select-desc">{l.law_desc}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {warningLaws && (
        <div className="negative-law-warning">
          <div className="negative-law-warning-title"><AlertTriangle size={14} className="g-warning-icon" /> 该分类下有负向规律提醒</div>
          {warningLaws.map(l => (
            <div key={l.id} className="negative-law-warning-item">{l.law_desc}</div>
          ))}
          <div className="negative-law-warning-actions">
            <button className="btn btn-outline" onClick={() => setWarningLaws(null)}>返回修改</button>
            <button className="btn btn-primary" onClick={doSubmit}>知道了，继续</button>
          </div>
        </div>
      )}
      <div className="g-modal-actions">
        <button className="btn btn-outline" onClick={onClose}>取消</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!name.trim() || !categoryId}>{initial ? '保存' : '创建'}</button>
      </div>
    </Modal>
  )
}
