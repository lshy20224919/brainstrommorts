import { useState } from 'react'
import { AlertTriangle, Check, X } from 'lucide-react'
import Modal from './Modal'
import { useToast } from './Toast'

export default function CheckinModal({ visible, action, actions, onClose, onSubmit, checkNegativeLaws }) {
  const [selectedId, setSelectedId] = useState(action?.id || '')
  const [result, setResult] = useState('')
  const [remark, setRemark] = useState('')
  const [warningLaws, setWarningLaws] = useState(null)
  const toast = useToast()

  const needSelect = !action
  const currentAction = action || actions?.find(a => a.id === Number(selectedId))

  const handleSubmit = async () => {
    if (!currentAction) return toast.error('请选择正确的事')
    if (!result) return toast.error('请选择执行结果')

    if (checkNegativeLaws && !warningLaws) {
      const laws = await checkNegativeLaws(currentAction.category_id)
      if (laws && laws.length > 0) {
        setWarningLaws(laws)
        return
      }
    }
    doSubmit()
  }

  const doSubmit = () => {
    onSubmit({ actionId: currentAction.id, result, remark })
    setSelectedId(''); setResult(''); setRemark(''); setWarningLaws(null)
  }

  const handleDisablePopup = (lawId) => {
    setWarningLaws(prev => prev.filter(l => l.id !== lawId))
  }

  if (!visible) return null

  if (warningLaws && warningLaws.length > 0) {
    return (
      <Modal visible={true} title="" onClose={() => setWarningLaws(null)} className="g-warning-modal">
        <div className="g-warning-header"><AlertTriangle size={16} className="g-warning-icon" /> 避雷提醒</div>
        <div className="g-warning-desc">该分类下有以下负向规律，请注意规避：</div>
        <div className="g-warning-list">
          {warningLaws.map(law => (
            <div key={law.id} className="g-warning-item">
              <div className="g-warning-item-text">{law.law_desc}</div>
              <button className="g-warning-dismiss" onClick={() => handleDisablePopup(law.id)}>不再提醒</button>
            </div>
          ))}
        </div>
        <div className="g-modal-actions">
          <button className="btn btn-outline" onClick={() => { setWarningLaws(null) }}>取消打卡</button>
          <button className="btn btn-primary" onClick={doSubmit}>我已知晓，继续打卡</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal visible={visible} title="打卡" onClose={onClose}>
      {needSelect && (
        <div className="g-form-group">
          <div className="g-form-label">选择正确的事 *</div>
          <select className="g-form-select" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            <option value="">请选择</option>
            {actions?.filter(a => a.status === 0).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      )}
      {!needSelect && <div className="g-checkin-target">打卡：{action.name}</div>}
      <div className="g-form-group">
        <div className="g-form-label">执行结果 *</div>
        <div className="g-checkin-btns">
          <button className={`g-checkin-btn success ${result === 'success' ? 'active' : ''}`} onClick={() => setResult('success')}><Check size={14} /> 成功</button>
          <button className={`g-checkin-btn fail ${result === 'fail' ? 'active' : ''}`} onClick={() => setResult('fail')}><X size={14} /> 失败</button>
        </div>
      </div>
      <div className="g-form-group">
        <div className="g-form-label">备注（选填）</div>
        <input className="g-form-input" value={remark} onChange={e => setRemark(e.target.value)} placeholder="最多200字" maxLength={200} />
      </div>
      <div className="g-modal-actions">
        <button className="btn btn-outline" onClick={onClose}>取消</button>
        <button className="btn btn-primary" onClick={handleSubmit}>确认打卡</button>
      </div>
    </Modal>
  )
}
