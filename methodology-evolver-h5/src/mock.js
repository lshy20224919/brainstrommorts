// Mock数据 - 方法论进化器 H5 版
const DATA_VERSION = 4
const STORAGE_KEY = 'methodology_evolver_data'
const POPUP_LOG_KEY = 'methodology_evolver_popup_log'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

// ─── 默认数据 ─────────────────────────────────────────────────
const defaultData = {
  categories: [
    { id: 1, name: '投资', icon: '◆', color: '#C17B5A', sort_weight: 1, is_system_default: 1 },
    { id: 2, name: '健康', icon: '○', color: '#7D9B76', sort_weight: 2, is_system_default: 1 },
    { id: 3, name: '学习', icon: '△', color: '#C9944A', sort_weight: 3, is_system_default: 1 },
    { id: 4, name: '工作', icon: '□', color: '#8B7E74', sort_weight: 4, is_system_default: 1 }
  ],
  actions: [
    { id: 1, category_id: 1, name: '低吸高抛', remark: '在股票低估时买入，高估时卖出', subjective_weight: 9, status: 0, pinned: 1, exec_count: 8, success_count: 6, fail_count: 2, success_rate: 75.00, last_exec_time: new Date(Date.now() - 3 * 86400000).toISOString(), related_law_ids: [1, 3] },
    { id: 2, category_id: 1, name: '定投指数基金', remark: '每月固定日期投入固定金额', subjective_weight: 8, status: 0, pinned: 0, exec_count: 12, success_count: 10, fail_count: 2, success_rate: 83.33, last_exec_time: new Date(Date.now() - 1 * 86400000).toISOString(), related_law_ids: [] },
    { id: 3, category_id: 2, name: '晨跑5公里', remark: '每天早晨跑步5公里，保持体能', subjective_weight: 7, status: 0, pinned: 0, exec_count: 45, success_count: 40, fail_count: 5, success_rate: 88.89, last_exec_time: new Date(Date.now() - 8 * 86400000).toISOString(), related_law_ids: [2] },
    { id: 4, category_id: 3, name: '每日阅读30分钟', remark: '睡前阅读，积累知识', subjective_weight: 6, status: 0, pinned: 0, exec_count: 20, success_count: 15, fail_count: 5, success_rate: 75.00, last_exec_time: new Date(Date.now() - 10 * 86400000).toISOString(), related_law_ids: [4] }
  ],
  laws: [
    { id: 1, category_id: 1, related_action_id: 1, law_type: 1, law_desc: '行情震荡期，低吸高抛容错率更高', applicable_scenes: '股票、可转债等波动性资产', subjective_weight: 9, trigger_count: 32, status: 0, popup_enabled: 1 },
    { id: 2, category_id: 2, related_action_id: 3, law_type: 1, law_desc: '运动习惯需要持续21天以上才能稳固', applicable_scenes: '健身、习惯养成', subjective_weight: 7, trigger_count: 18, status: 0, popup_enabled: 1 },
    { id: 3, category_id: 1, related_action_id: 1, law_type: 2, law_desc: '情绪化追涨，大概率短期被套', applicable_scenes: '股票交易', subjective_weight: 8, trigger_count: 6, status: 0, popup_enabled: 1 },
    { id: 4, category_id: 3, related_action_id: 4, law_type: 2, law_desc: '睡前刷手机超过30分钟，次日精力明显下降', applicable_scenes: '日常作息', subjective_weight: 6, trigger_count: 4, status: 0, popup_enabled: 1 }
  ],
  mistakes: [
    { id: 1, category_id: 1, name: '满仓单只股票', remark: '任何时候都不能把所有资金压在一只票上', subjective_weight: 10, status: 0, pinned: 1, related_law_ids: [3] },
    { id: 2, category_id: 1, name: '情绪化追涨杀跌', remark: '看到涨就追、看到跌就割，是最大的亏损来源', subjective_weight: 9, status: 0, pinned: 0, related_law_ids: [3] },
    { id: 3, category_id: 2, name: '熬夜超过凌晨2点', remark: '严重损害第二天的判断力和体能', subjective_weight: 8, status: 0, pinned: 0, related_law_ids: [4] }
  ],
  inspirations: [
    { id: 1, desc: '看到一个说法：仓位管理比选股更重要', source: '书籍', category_id: 1, direction: 'positive', status: 0, created_time: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 2, desc: '运动后30分钟内补充蛋白质，肌肉恢复效率翻倍', source: '视频', category_id: 2, direction: 'positive', status: 0, created_time: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 3, desc: '费曼学习法：教别人是最好的学习方式', source: '聊天', category_id: 3, direction: 'positive', status: 0, created_time: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 4, desc: '频繁切换任务会导致深度思考能力下降', source: '书籍', category_id: 3, direction: 'negative', status: 0, created_time: new Date(Date.now() - 4 * 86400000).toISOString() },
    { id: 5, desc: '睡前看手机蓝光影响褪黑素分泌', source: '视频', category_id: 2, direction: 'negative', status: 0, created_time: new Date(Date.now() - 3 * 86400000).toISOString() }
  ],
  records: [
    { id: 1, action_id: 1, exec_result: 1, exec_remark: '抄底成功，盈利8%', exec_time: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 2, action_id: 2, exec_result: 1, exec_remark: '按计划定投', exec_time: new Date(Date.now() - 1 * 86400000).toISOString() }
  ],
  dismissedTodos: [],
  migrateLogs: [],
  sops: [
    { id: 1, name: '行情分析 SOP', category_id: 1, remark: '每次操盘前必走流程', last_exec_time: new Date(Date.now() - 3 * 86400000).toISOString(), steps: [{ id: 1, sort_order: 1, step_desc: '打开行情软件，查看大盘情绪指标', related_action_id: null }, { id: 2, sort_order: 2, step_desc: '检查当前持仓分布是否合理', related_action_id: null }, { id: 3, sort_order: 3, step_desc: '执行低吸高抛操作', related_action_id: 1 }, { id: 4, sort_order: 4, step_desc: '记录本次操盘心得', related_action_id: null }] },
    { id: 2, name: '晨间健康 SOP', category_id: 2, remark: '', last_exec_time: null, steps: [{ id: 5, sort_order: 1, step_desc: '起床后喝一杯温水', related_action_id: null }, { id: 6, sort_order: 2, step_desc: '完成晨间锻炼', related_action_id: 3 }, { id: 7, sort_order: 3, step_desc: '冥想10分钟', related_action_id: null }] }
  ],
  reviews: [
    { id: 1, review_cycle: 'week', start_time: '2026-04-21', end_time: '2026-04-27', snapshot_version: 'v1', review_summary: '本周投资执行较稳定，运动有所懈怠', create_time: '2026-04-27T20:00:00.000Z' },
    { id: 2, review_cycle: 'week', start_time: '2026-04-28', end_time: '2026-05-04', snapshot_version: 'v2', review_summary: '定投坚持，低吸高抛成功2次，晨跑中断', create_time: '2026-05-04T20:00:00.000Z' },
    { id: 3, review_cycle: 'week', start_time: '2026-05-05', end_time: '2026-05-10', snapshot_version: 'v3', review_summary: null, create_time: '2026-05-10T20:00:00.000Z' }
  ],
  settings: { smart_migrate_on: true, warning_popup_on: true, dark_mode: 2, register_time: '2026-04-01T08:00:00.000Z' },
  rankConfig: { action: 5, positive_law: 3, negative_law: 3, mistake: 3 }
}
// ─── 动态数据（不持久化） ──────────────────────────────────────
const generateDailyRecords = () => {
  const records = []
  const base = new Date('2026-05-10')
  for (let i = 59; i >= 0; i--) {
    const d = new Date(base); d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const execCount = isWeekend ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 5)
    const successCount = execCount === 0 ? 0 : Math.floor(execCount * (0.5 + Math.random() * 0.5))
    records.push({ date: dateStr, exec_count: execCount, success_count: successCount })
  }
  records[records.length - 1] = { date: '2026-05-10', exec_count: 3, success_count: 3 }
  records[records.length - 2] = { date: '2026-05-09', exec_count: 2, success_count: 1 }
  records[records.length - 3] = { date: '2026-05-08', exec_count: 4, success_count: 3 }
  return records
}

const categorySnapshots = [
  { version: 'v1', label: '4月第3周', data: [{ category_id: 1, name: '投资', icon: '◆', success_rate: 40 }, { category_id: 2, name: '健康', icon: '○', success_rate: 70 }, { category_id: 3, name: '学习', icon: '△', success_rate: 55 }, { category_id: 4, name: '工作', icon: '□', success_rate: 80 }] },
  { version: 'v2', label: '4月第4周', data: [{ category_id: 1, name: '投资', icon: '◆', success_rate: 60 }, { category_id: 2, name: '健康', icon: '○', success_rate: 50 }, { category_id: 3, name: '学习', icon: '△', success_rate: 65 }, { category_id: 4, name: '工作', icon: '□', success_rate: 75 }] },
  { version: 'v3', label: '5月第1周', data: [{ category_id: 1, name: '投资', icon: '◆', success_rate: 85 }, { category_id: 2, name: '健康', icon: '○', success_rate: 45 }, { category_id: 3, name: '学习', icon: '△', success_rate: 75 }, { category_id: 4, name: '工作', icon: '□', success_rate: 88 }] }
]

const evolutionNodes = [
  { id: 'a1-v1', label: '低吸高抛 v1', iteration_type: null, parent_id: null, review_cycle: '4月第3周', status: 'evolved', type: 'action' },
  { id: 'a1-v2', label: '低吸高抛 v2', iteration_type: '优化', parent_id: 'a1-v1', review_cycle: '4月第4周', status: 'evolved', type: 'action' },
  { id: 'a1-v3', label: '低吸高抛 v3', iteration_type: '固化', parent_id: 'a1-v2', review_cycle: '5月第1周', status: 'active', type: 'action' },
  { id: 'a3-v1', label: '晨跑5公里 v1', iteration_type: null, parent_id: null, review_cycle: '4月第3周', status: 'evolved', type: 'action' },
  { id: 'a3-v2', label: '晨跑5公里 v2', iteration_type: '降级', parent_id: 'a3-v1', review_cycle: '4月第4周', status: 'active', type: 'action' },
  { id: 'l3-v1', label: '情绪化追涨 v1', iteration_type: null, parent_id: null, review_cycle: '4月第3周', status: 'evolved', type: 'law' },
  { id: 'l3-v2', label: '情绪化追涨 v2', iteration_type: '淘汰', parent_id: 'l3-v1', review_cycle: '4月第4周', status: 'retired', type: 'law' }
]

// ─── localStorage 持久化 ──────────────────────────────────────
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed._version !== DATA_VERSION) return null
    delete parsed._version
    return parsed
  } catch { return null }
}

function saveToStorage() {
  try {
    const toSave = { _version: DATA_VERSION }
    const keys = ['categories', 'actions', 'laws', 'mistakes', 'inspirations', 'records', 'dismissedTodos', 'migrateLogs', 'sops', 'reviews', 'settings', 'rankConfig']
    keys.forEach(k => { toSave[k] = mockApi[k] })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {}
}

function getPopupLog() {
  try {
    const raw = localStorage.getItem(POPUP_LOG_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function setPopupLog(log) {
  try { localStorage.setItem(POPUP_LOG_KEY, JSON.stringify(log)) } catch {}
}

// ─── 初始化 mockApi ───────────────────────────────────────────
const stored = loadFromStorage()
export const mockApi = stored ? { ...stored, dailyRecords: generateDailyRecords(), categorySnapshots, evolutionNodes } : { ...JSON.parse(JSON.stringify(defaultData)), dailyRecords: generateDailyRecords(), categorySnapshots, evolutionNodes }

if (!stored) saveToStorage()

// ─── 辅助函数 ─────────────────────────────────────────────────
const persist = () => saveToStorage()

const calcStats = () => {
  const actions = mockApi.actions.filter(a => a.status === 0)
  const positiveLaws = mockApi.laws.filter(l => l.law_type === 1 && l.status === 0)
  const negativeLaws = mockApi.laws.filter(l => l.law_type === 2 && l.status === 0)
  const mistakes = mockApi.mistakes.filter(m => m.status === 0)
  const inspirations = mockApi.inspirations.filter(i => i.status === 0)
  return {
    action_count: actions.length,
    action_trigger_count: actions.reduce((s, a) => s + a.exec_count, 0),
    positive_law_count: positiveLaws.length,
    positive_law_trigger_count: positiveLaws.reduce((s, l) => s + l.trigger_count, 0),
    negative_law_count: negativeLaws.length,
    negative_law_trigger_count: negativeLaws.reduce((s, l) => s + l.trigger_count, 0),
    mistake_count: mistakes.length,
    inspiration_count: inspirations.length
  }
}

const calcTodos = () => {
  const todos = []
  const dismissed = mockApi.dismissedTodos
  if (!dismissed.includes('review')) todos.push({ key: 'review', type: 'review', count: 2 })
  if (!dismissed.includes('migrate') && mockApi.settings.smart_migrate_on) todos.push({ key: 'migrate', type: 'migrate', count: 2 })
  const now = Date.now()
  mockApi.actions.filter(a => a.status === 0).forEach(a => {
    const key = `overdue_${a.id}`
    if (dismissed.includes(key)) return
    if (!a.last_exec_time) { todos.push({ key, type: 'overdue', action: a, days: null }); return }
    const days = Math.floor((now - new Date(a.last_exec_time).getTime()) / 86400000)
    if (days >= 7) todos.push({ key, type: 'overdue', action: a, days })
  })
  return todos
}

const calcRanking = (type) => {
  if (type === 'action') return [...mockApi.actions].filter(a => a.status === 0).sort((a, b) => b.subjective_weight - a.subjective_weight).slice(0, mockApi.rankConfig.action)
  if (type === 'positive_law') return [...mockApi.laws].filter(l => l.law_type === 1 && l.status === 0).sort((a, b) => b.subjective_weight - a.subjective_weight).slice(0, mockApi.rankConfig.positive_law)
  if (type === 'negative_law') return [...mockApi.laws].filter(l => l.law_type === 2 && l.status === 0).sort((a, b) => b.subjective_weight - a.subjective_weight).slice(0, mockApi.rankConfig.negative_law)
  if (type === 'mistake') return [...mockApi.mistakes].filter(m => m.status === 0).sort((a, b) => b.subjective_weight - a.subjective_weight).slice(0, mockApi.rankConfig.mistake)
  return []
}

// ─── 智能迁移推荐（mock） ─────────────────────────────────────
const getMigrateRecommendations = () => {
  return [
    { id: 'rec_1', source_card_id: 1, source_card_type: 'action', source_name: '低吸高抛', source_category: '投资', target_category_id: 4, target_category_name: '工作', similarity_score: 72, reason: '逻辑相似：低买高卖 ≈ 低谷期储备资源' },
    { id: 'rec_2', source_card_id: 2, source_card_type: 'law', source_name: '运动习惯需要持续21天以上才能稳固', source_category: '健康', target_category_id: 3, target_category_name: '学习', similarity_score: 68, reason: '逻辑相似：习惯养成周期规律可迁移至学习领域' }
  ]
}

// ─── API ──────────────────────────────────────────────────────
export const api = {
  getCategories: async () => { await delay(); return [...mockApi.categories] },

  getActions: async (params = {}) => {
    await delay()
    let list = mockApi.actions
    if (params.category_id) list = list.filter(a => a.category_id === params.category_id)
    if (params.status !== undefined) list = list.filter(a => a.status === params.status)
    return [...list]
  },
  getAction: async (id) => { await delay(); return mockApi.actions.find(a => a.id === id) },
  createAction: async (data) => {
    await delay()
    const action = { id: Date.now(), exec_count: 0, success_count: 0, fail_count: 0, success_rate: null, status: 0, pinned: 0, last_exec_time: null, related_law_ids: [], ...data }
    mockApi.actions.push(action); persist()
    return action
  },
  updateAction: async (id, data) => {
    await delay()
    const idx = mockApi.actions.findIndex(a => a.id === id)
    if (idx === -1) throw new Error('不存在')
    Object.assign(mockApi.actions[idx], data); persist()
    return mockApi.actions[idx]
  },
  checkin: async (actionId, data) => {
    await delay()
    const record = { id: Date.now(), action_id: actionId, exec_result: data.result === 'success' ? 1 : 2, exec_remark: data.remark || '', exec_time: new Date().toISOString() }
    mockApi.records.push(record)
    const action = mockApi.actions.find(a => a.id === actionId)
    if (action) {
      action.exec_count++
      if (data.result === 'success') action.success_count++; else action.fail_count++
      action.success_rate = Math.round((action.success_count / action.exec_count) * 10000) / 100
      action.last_exec_time = record.exec_time
    }
    persist(); return record
  },
  getActionRecords: async (actionId) => {
    await delay(120)
    return [...mockApi.records]
      .filter(r => r.action_id === actionId)
      .sort((a, b) => new Date(b.exec_time).getTime() - new Date(a.exec_time).getTime())
  },
  getActionRelatedLaws: async (actionId) => {
    await delay(120)
    return [...mockApi.laws]
      .filter(l => l.related_action_id === actionId)
      .sort((a, b) => {
        if (a.law_type !== b.law_type) return a.law_type - b.law_type
        return b.subjective_weight - a.subjective_weight
      })
  },
  deleteAction: async (id) => {
    await delay()
    const index = mockApi.actions.findIndex(a => a.id === id)
    if (index === -1) throw new Error('正确的事不存在')
    if (mockApi.records.some(r => r.action_id === id)) throw new Error('有执行记录的正确的事不能直接删除，请先归档')
    mockApi.actions.splice(index, 1); persist()
    return { success: true }
  },

  getLaws: async (params = {}) => {
    await delay()
    let list = mockApi.laws
    if (params.law_type) list = list.filter(l => l.law_type === params.law_type)
    if (params.category_id) list = list.filter(l => l.category_id === params.category_id)
    if (params.status !== undefined) list = list.filter(l => l.status === params.status)
    return [...list]
  },
  getLaw: async (id) => { await delay(); return mockApi.laws.find(l => l.id === id) },
  getLawsByIds: async (ids) => { await delay(); return mockApi.laws.filter(l => ids.includes(l.id)) },
  createLaw: async (data) => {
    await delay()
    const law = { id: Date.now(), trigger_count: 0, status: 0, popup_enabled: 1, ...data }
    mockApi.laws.push(law); persist()
    return law
  },
  updateLaw: async (id, data) => {
    await delay()
    const idx = mockApi.laws.findIndex(l => l.id === id)
    if (idx === -1) throw new Error('规律不存在')
    Object.assign(mockApi.laws[idx], data); persist()
    return mockApi.laws[idx]
  },
  deleteLaw: async (id) => {
    await delay()
    const index = mockApi.laws.findIndex(l => l.id === id)
    if (index === -1) throw new Error('规律不存在')
    mockApi.laws.splice(index, 1); persist()
    return { success: true }
  },

  // 错误的事
  getMistakes: async (params = {}) => {
    await delay()
    let list = mockApi.mistakes
    if (params.category_id) list = list.filter(m => m.category_id === params.category_id)
    if (params.status !== undefined) list = list.filter(m => m.status === params.status)
    return [...list]
  },
  getMistake: async (id) => { await delay(); return mockApi.mistakes.find(m => m.id === id) },
  createMistake: async (data) => {
    await delay()
    const mistake = { id: Date.now(), status: 0, pinned: 0, related_law_ids: [], ...data }
    mockApi.mistakes.push(mistake); persist()
    return mistake
  },
  updateMistake: async (id, data) => {
    await delay()
    const idx = mockApi.mistakes.findIndex(m => m.id === id)
    if (idx === -1) throw new Error('错误的事不存在')
    Object.assign(mockApi.mistakes[idx], data); persist()
    return mockApi.mistakes[idx]
  },
  deleteMistake: async (id) => {
    await delay()
    const index = mockApi.mistakes.findIndex(m => m.id === id)
    if (index === -1) throw new Error('错误的事不存在')
    mockApi.mistakes.splice(index, 1); persist()
    return { success: true }
  },

  // 灵感捕捉
  getInspirations: async (params = {}) => {
    await delay()
    let list = mockApi.inspirations
    if (params.category_id) list = list.filter(i => i.category_id === params.category_id)
    if (params.status !== undefined) list = list.filter(i => i.status === params.status)
    return [...list].sort((a, b) => new Date(b.created_time) - new Date(a.created_time))
  },
  getInspiration: async (id) => { await delay(); return mockApi.inspirations.find(i => i.id === id) },
  createInspiration: async (data) => {
    await delay()
    const item = { id: Date.now(), status: 0, created_time: new Date().toISOString(), ...data }
    mockApi.inspirations.push(item); persist()
    return item
  },
  updateInspiration: async (id, data) => {
    await delay()
    const idx = mockApi.inspirations.findIndex(i => i.id === id)
    if (idx === -1) throw new Error('灵感不存在')
    Object.assign(mockApi.inspirations[idx], data); persist()
    return mockApi.inspirations[idx]
  },
  deleteInspiration: async (id) => {
    await delay()
    const index = mockApi.inspirations.findIndex(i => i.id === id)
    if (index === -1) throw new Error('灵感不存在')
    mockApi.inspirations.splice(index, 1); persist()
    return { success: true }
  },
  convertInspiration: async (id, targetType) => {
    await delay()
    const insp = mockApi.inspirations.find(i => i.id === id)
    if (!insp) throw new Error('灵感不存在')
    insp.status = 1; persist()
    return { success: true, targetType }
  },

  // 避雷检测
  checkNegativeLaws: async (categoryId) => {
    await delay(100)
    const log = getPopupLog()
    const now = Date.now()
    const laws = mockApi.laws.filter(l => l.law_type === 2 && l.category_id === categoryId && l.status === 0 && l.popup_enabled === 1)
    return laws.filter(l => {
      const lastTime = log[l.id]
      return !lastTime || (now - lastTime > 24 * 3600000)
    })
  },
  recordPopup: async (lawIds) => {
    const log = getPopupLog()
    const now = Date.now()
    lawIds.forEach(id => { log[id] = now })
    setPopupLog(log)
    lawIds.forEach(id => {
      const law = mockApi.laws.find(l => l.id === id)
      if (law) law.trigger_count++
    })
    persist()
  },
  disablePopup: async (lawId) => {
    await delay(100)
    const law = mockApi.laws.find(l => l.id === lawId)
    if (law) { law.popup_enabled = 0; persist() }
  },

  // 迁移
  migrateCard: async (sourceId, sourceType, targetCategoryId) => {
    await delay()
    let newCard
    if (sourceType === 'action') {
      const src = mockApi.actions.find(a => a.id === sourceId)
      if (!src) throw new Error('源卡片不存在')
      newCard = { ...src, id: Date.now(), category_id: targetCategoryId, exec_count: 0, success_count: 0, fail_count: 0, success_rate: null, pinned: 0, last_exec_time: null }
      mockApi.actions.push(newCard)
    } else {
      const src = mockApi.laws.find(l => l.id === sourceId)
      if (!src) throw new Error('源卡片不存在')
      newCard = { ...src, id: Date.now(), category_id: targetCategoryId, trigger_count: 0 }
      mockApi.laws.push(newCard)
    }
    mockApi.migrateLogs.push({ id: Date.now(), source_card_id: sourceId, source_card_type: sourceType, target_category_id: targetCategoryId, migrate_type: 1, similarity_score: null, new_card_id: newCard.id, migrate_time: new Date().toISOString() })
    persist(); return newCard
  },
  getMigrateRecommendations: async () => { await delay(); return getMigrateRecommendations() },
  acceptMigration: async (rec) => {
    await delay()
    const newCard = await api.migrateCard(rec.source_card_id, rec.source_card_type, rec.target_category_id)
    const log = mockApi.migrateLogs[mockApi.migrateLogs.length - 1]
    log.migrate_type = 2
    log.similarity_score = rec.similarity_score
    persist(); return newCard
  },
  dismissMigration: async (recId) => { await delay(); return { success: true } },

  // 首页
  getHomeStats: async () => { await delay(); return calcStats() },
  getTodos: async () => { await delay(); return calcTodos() },
  dismissTodo: async (key) => { await delay(); if (!mockApi.dismissedTodos.includes(key)) mockApi.dismissedTodos.push(key); persist(); return { success: true } },

  // 进化旅程
  getEvolutionProgress: async () => {
    await delay(100)
    const actions = mockApi.actions.filter(a => a.status === 0)
    const totalExec = actions.reduce((s, a) => s + a.exec_count, 0)
    const lawCount = mockApi.laws.length
    const sopCount = mockApi.sops.length
    const reviewCount = mockApi.reviews.length
    return [
      { key: 'record', label: '记录', done: actions.length >= 1, value: `${actions.length} 条` },
      { key: 'verify', label: '验证', done: totalExec >= 5, value: `${totalExec} 次` },
      { key: 'extract', label: '提炼', done: lawCount >= 1, value: `${lawCount} 条` },
      { key: 'solidify', label: '固化', done: sopCount >= 1, value: `${sopCount} 个` },
      { key: 'iterate', label: '迭代', done: reviewCount >= 1, value: `${reviewCount} 次` }
    ]
  },

  // 智能建议
  getSmartSuggestion: async () => {
    await delay(100)
    const actions = mockApi.actions.filter(a => a.status === 0)
    const totalExec = actions.reduce((s, a) => s + a.exec_count, 0)
    const lawCount = mockApi.laws.length
    const sopCount = mockApi.sops.length
    const reviewCount = mockApi.reviews.length

    if (actions.length === 0) return { text: '记录你做对的第一件事', action: 'create_action', icon: '✏️' }
    if (totalExec < 5) return { text: '去执行一次，验证它是否有效', action: 'checkin', icon: '✅' }
    if (lawCount === 0) return { text: '从成功经验中提炼规律', action: 'create_law', icon: '💡' }
    if (sopCount === 0) return { text: '把规律组合成可执行的流程', action: 'go_sop', icon: '📌' }
    if (reviewCount === 0) return { text: '做一次复盘，看看方法论是否在进化', action: 'go_review', icon: '🔄' }

    const best = [...actions].sort((a, b) => b.exec_count - a.exec_count)[0]
    if (best) return { text: `"${best.name}"成功率 ${best.success_rate ?? 0}%，已执行 ${best.exec_count} 次，建议提炼为 SOP`, action: 'go_sop', icon: '🚀' }
    return { text: '继续保持，你的方法论在持续进化', action: null, icon: '🎯' }
  },

  // 榜单
  getRanking: async (type) => { await delay(); return calcRanking(type) },
  getRankConfig: async () => { await delay(); return { ...mockApi.rankConfig } },
  updateRankConfig: async (config) => { await delay(); Object.assign(mockApi.rankConfig, config); persist(); return { ...mockApi.rankConfig } },

  // SOP
  getSops: async (params = {}) => { await delay(); let list = [...mockApi.sops]; if (params.category_id) list = list.filter(s => s.category_id === Number(params.category_id)); return list },
  createSop: async (data) => { await delay(); const sop = { id: Date.now(), last_exec_time: null, ...data, steps: (data.steps || []).map((s, i) => ({ id: Date.now() + i, sort_order: i + 1, ...s })) }; mockApi.sops.push(sop); persist(); return sop },
  updateSop: async (id, data) => { await delay(); const idx = mockApi.sops.findIndex(s => s.id === id); if (idx === -1) throw new Error('SOP不存在'); mockApi.sops[idx] = { ...mockApi.sops[idx], ...data, steps: (data.steps || mockApi.sops[idx].steps).map((s, i) => ({ ...s, sort_order: i + 1 })) }; persist(); return mockApi.sops[idx] },
  deleteSop: async (id) => { await delay(); const idx = mockApi.sops.findIndex(s => s.id === id); if (idx === -1) throw new Error('SOP不存在'); mockApi.sops.splice(idx, 1); persist(); return { success: true } },
  copySop: async (id) => { await delay(); const src = mockApi.sops.find(s => s.id === id); if (!src) throw new Error('SOP不存在'); const copy = { ...src, id: Date.now(), name: src.name + '（副本）', last_exec_time: null, steps: src.steps.map((s, i) => ({ ...s, id: Date.now() + i })) }; mockApi.sops.push(copy); persist(); return copy },
  execSop: async (id, checkins) => {
    await delay()
    const sop = mockApi.sops.find(s => s.id === id)
    if (!sop) throw new Error('SOP不存在')
    sop.last_exec_time = new Date().toISOString()
    const records = []
    for (const c of checkins) {
      const action = mockApi.actions.find(a => a.id === c.action_id)
      if (!action) continue
      action.exec_count++
      if (c.result === 'success') action.success_count++; else action.fail_count++
      action.success_rate = Math.round((action.success_count / action.exec_count) * 10000) / 100
      action.last_exec_time = sop.last_exec_time
      records.push({ id: Date.now() + records.length, action_id: c.action_id, exec_result: c.result === 'success' ? 1 : 2, exec_remark: c.remark || '', exec_time: sop.last_exec_time })
      mockApi.records.push(records[records.length - 1])
    }
    persist(); return records
  },

  // 复盘
  getReviews: async () => { await delay(); return [...mockApi.reviews] },
  getDailyRecords: async () => { await delay(); return [...mockApi.dailyRecords] },
  getCategorySnapshots: async () => { await delay(); return [...mockApi.categorySnapshots] },
  getEvolutionNodes: async () => { await delay(); return [...mockApi.evolutionNodes] },

  createReview: async ({ review_cycle, start_time, end_time }) => {
    await delay()
    const items = [
      ...mockApi.actions.filter(a => a.status === 0).map(a => {
        const cat = mockApi.categories.find(c => c.id === a.category_id)
        return { id: a.id, type: 'action', name: a.name, exec_count: a.exec_count, success_rate: a.success_rate, category_name: cat?.name || '' }
      }),
      ...mockApi.laws.filter(l => l.status === 0).map(l => {
        const cat = mockApi.categories.find(c => c.id === l.category_id)
        return { id: l.id, type: 'law', name: l.law_desc, exec_count: l.trigger_count, success_rate: null, category_name: cat?.name || '' }
      })
    ]
    const maxVersion = mockApi.reviews.length > 0 ? Math.max(...mockApi.reviews.map(r => parseInt(r.snapshot_version.replace('v', '')))) : 0
    const newVersion = `v${maxVersion + 1}`
    const review = { id: Date.now(), review_cycle, start_time, end_time, snapshot_version: newVersion, review_summary: null, create_time: new Date().toISOString(), _items: items }
    mockApi.reviews.push(review)
    persist()
    return { id: review.id, snapshot_version: newVersion, items }
  },

  submitReviewIteration: async (reviewId, iterations, summary) => {
    await delay()
    const review = mockApi.reviews.find(r => r.id === reviewId)
    if (review) review.review_summary = summary

    for (const iter of iterations) {
      if (iter.card_type === 'action') {
        const action = mockApi.actions.find(a => a.id === iter.card_id)
        if (!action) continue
        if (iter.iteration_type === '固化') action.pinned = 1
        else if (iter.iteration_type === '降级') action.pinned = 0
        else if (iter.iteration_type === '淘汰') action.status = 2

        const prevNode = mockApi.evolutionNodes.filter(n => n.type === 'action' && n.id.startsWith(`a${iter.card_id}-`)).pop()
        const vNum = prevNode ? parseInt(prevNode.id.split('-v')[1]) + 1 : 1
        mockApi.evolutionNodes.push({
          id: `a${iter.card_id}-v${vNum}`,
          label: `${action.name} v${vNum}`,
          iteration_type: iter.iteration_type,
          parent_id: prevNode?.id || null,
          review_cycle: review?.snapshot_version || '',
          status: iter.iteration_type === '淘汰' ? 'retired' : 'active',
          type: 'action'
        })
        if (prevNode && prevNode.status === 'active') prevNode.status = 'evolved'
      } else if (iter.card_type === 'law') {
        const law = mockApi.laws.find(l => l.id === iter.card_id)
        if (!law) continue
        if (iter.iteration_type === '淘汰') law.status = 2

        const prevNode = mockApi.evolutionNodes.filter(n => n.type === 'law' && n.id.startsWith(`l${iter.card_id}-`)).pop()
        const vNum = prevNode ? parseInt(prevNode.id.split('-v')[1]) + 1 : 1
        mockApi.evolutionNodes.push({
          id: `l${iter.card_id}-v${vNum}`,
          label: `${law.law_desc.slice(0, 10)} v${vNum}`,
          iteration_type: iter.iteration_type,
          parent_id: prevNode?.id || null,
          review_cycle: review?.snapshot_version || '',
          status: iter.iteration_type === '淘汰' ? 'retired' : 'active',
          type: 'law'
        })
        if (prevNode && prevNode.status === 'active') prevNode.status = 'evolved'
      }
    }

    const snapshot = {
      version: review?.snapshot_version || 'v?',
      label: `${review?.start_time?.slice(5)} 复盘`,
      data: mockApi.categories.map(cat => {
        const catActions = mockApi.actions.filter(a => a.category_id === cat.id && a.status === 0)
        const avgRate = catActions.length > 0 ? Math.round(catActions.reduce((s, a) => s + (a.success_rate || 0), 0) / catActions.length) : 0
        return { category_id: cat.id, name: cat.name, icon: cat.icon, success_rate: avgRate }
      })
    }
    mockApi.categorySnapshots.push(snapshot)
    persist()
    return { success: true }
  },

  // 设置
  getSettings: async () => { await delay(); return { ...mockApi.settings } },
  updateSettings: async (patch) => { await delay(); Object.assign(mockApi.settings, patch); persist(); return { ...mockApi.settings } },

  // 分类管理
  addCategory: async (name) => { await delay(); const maxId = Math.max(...mockApi.categories.map(c => c.id), 0); const maxWeight = Math.max(...mockApi.categories.map(c => c.sort_weight), 0); const cat = { id: maxId + 1, name, icon: '📁', color: '#9CA3AF', sort_weight: maxWeight + 1, is_system_default: 0 }; mockApi.categories.push(cat); persist(); return cat },
  renameCategory: async (id, name) => { await delay(); const cat = mockApi.categories.find(c => c.id === id); if (!cat) throw new Error('分类不存在'); cat.name = name; persist(); return cat },
  removeCategory: async (id) => { await delay(); const idx = mockApi.categories.findIndex(c => c.id === id); if (idx === -1) throw new Error('分类不存在'); mockApi.categories.splice(idx, 1); persist(); return { success: true } },
  reorderCategory: async (id, direction) => { await delay(); const sorted = [...mockApi.categories].sort((a, b) => a.sort_weight - b.sort_weight); const idx = sorted.findIndex(c => c.id === id); if (idx === -1) return sorted; const swapIdx = direction === 'up' ? idx - 1 : idx + 1; if (swapIdx < 0 || swapIdx >= sorted.length) return sorted; const tmp = sorted[idx].sort_weight; sorted[idx].sort_weight = sorted[swapIdx].sort_weight; sorted[swapIdx].sort_weight = tmp; persist(); return sorted.sort((a, b) => a.sort_weight - b.sort_weight) },

  // 重置
  resetAllData: () => { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(POPUP_LOG_KEY); window.location.reload() }
}
