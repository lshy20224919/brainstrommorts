// Mock数据
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const mockApi = {
  categories: [
    { id: 1, name: '投资', icon: '📈', color: '#FF6B6B', sort_weight: 1 },
    { id: 2, name: '健康', icon: '💪', color: '#4ECDC4', sort_weight: 2 },
    { id: 3, name: '学习', icon: '📚', color: '#45B7D1', sort_weight: 3 },
    { id: 4, name: '工作', icon: '💼', color: '#96CEB4', sort_weight: 4 }
  ],

  // 正确的事（action_right）
  actions: [
    {
      id: 1,
      category_id: 1,
      name: '低吸高抛',
      remark: '在股票低估时买入，高估时卖出',
      subjective_weight: 9,
      status: 0, // 0正常 1归档 2已淘汰
      pinned: 1,
      exec_count: 8,
      success_count: 6,
      fail_count: 2,
      success_rate: 75.00,
      last_exec_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3天前
    },
    {
      id: 2,
      category_id: 1,
      name: '定投指数基金',
      remark: '每月固定日期投入固定金额',
      subjective_weight: 8,
      status: 0,
      pinned: 0,
      exec_count: 12,
      success_count: 10,
      fail_count: 2,
      success_rate: 83.33,
      last_exec_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1天前
    },
    {
      id: 3,
      category_id: 2,
      name: '晨跑5公里',
      remark: '每天早晨跑步5公里，保持体能',
      subjective_weight: 7,
      status: 0,
      pinned: 0,
      exec_count: 45,
      success_count: 40,
      fail_count: 5,
      success_rate: 88.89,
      last_exec_time: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8天前，触发超7天提醒
    },
    {
      id: 4,
      category_id: 3,
      name: '每日阅读30分钟',
      remark: '睡前阅读，积累知识',
      subjective_weight: 6,
      status: 0,
      pinned: 0,
      exec_count: 20,
      success_count: 15,
      fail_count: 5,
      success_rate: 75.00,
      last_exec_time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10天前，触发超7天提醒
    }
  ],

  // 规律（law）law_type: 1正向 2负向
  laws: [
    {
      id: 1,
      category_id: 1,
      related_action_id: 1,
      law_type: 1, // 正向
      law_desc: '行情震荡期，低吸高抛容错率更高',
      applicable_scenes: '股票、可转债等波动性资产',
      subjective_weight: 9,
      trigger_count: 32,
      status: 0,
      popup_enabled: 1
    },
    {
      id: 2,
      category_id: 2,
      related_action_id: 3,
      law_type: 1, // 正向
      law_desc: '运动习惯需要持续21天以上才能稳固',
      applicable_scenes: '健身、习惯养成',
      subjective_weight: 7,
      trigger_count: 18,
      status: 0,
      popup_enabled: 1
    },
    {
      id: 3,
      category_id: 1,
      related_action_id: 1,
      law_type: 2, // 负向
      law_desc: '情绪化追涨，大概率短期被套',
      applicable_scenes: '股票交易',
      subjective_weight: 8,
      trigger_count: 6,
      status: 0,
      popup_enabled: 1
    },
    {
      id: 4,
      category_id: 3,
      related_action_id: 4,
      law_type: 2, // 负向
      law_desc: '睡前刷手机超过30分钟，次日精力明显下降',
      applicable_scenes: '日常作息',
      subjective_weight: 6,
      trigger_count: 4,
      status: 0,
      popup_enabled: 1
    }
  ],

  // 执行记录
  records: [
    {
      id: 1,
      action_id: 1,
      exec_result: 1, // 1成功 2失败
      exec_remark: '抄底成功，盈利8%',
      exec_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      action_id: 2,
      exec_result: 1,
      exec_remark: '按计划定投',
      exec_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  // 待办提醒（本地状态，手动清除后当日不再显示）
  dismissedTodos: [], // 存储已清除的待办key

  // SOP 模板
  sops: [
    {
      id: 1,
      name: '行情分析 SOP',
      category_id: 1,
      remark: '每次操盘前必走流程',
      last_exec_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      steps: [
        { id: 1, sort_order: 1, step_desc: '打开行情软件，查看大盘情绪指标', related_action_id: null },
        { id: 2, sort_order: 2, step_desc: '检查当前持仓分布是否合理', related_action_id: null },
        { id: 3, sort_order: 3, step_desc: '执行低吸高抛操作', related_action_id: 1 },
        { id: 4, sort_order: 4, step_desc: '记录本次操盘心得', related_action_id: null }
      ]
    },
    {
      id: 2,
      name: '晨间健康 SOP',
      category_id: 2,
      remark: '',
      last_exec_time: null,
      steps: [
        { id: 5, sort_order: 1, step_desc: '起床后喝一杯温水', related_action_id: null },
        { id: 6, sort_order: 2, step_desc: '完成晨间锻炼', related_action_id: 3 },
        { id: 7, sort_order: 3, step_desc: '冥想10分钟', related_action_id: null }
      ]
    }
  ],

  // 复盘历史
  reviews: [
    {
      id: 1, review_cycle: 'week', start_time: '2026-04-21', end_time: '2026-04-27',
      snapshot_version: 'v1', review_summary: '本周投资执行较稳定，运动有所懈怠',
      create_time: '2026-04-27T20:00:00.000Z'
    },
    {
      id: 2, review_cycle: 'week', start_time: '2026-04-28', end_time: '2026-05-04',
      snapshot_version: 'v2', review_summary: '定投坚持，低吸高抛成功2次，晨跑中断',
      create_time: '2026-05-04T20:00:00.000Z'
    },
    {
      id: 3, review_cycle: 'week', start_time: '2026-05-05', end_time: '2026-05-10',
      snapshot_version: 'v3', review_summary: null,
      create_time: '2026-05-10T20:00:00.000Z'
    }
  ],

  // 近60天每日执行热力数据
  dailyRecords: (() => {
    const records = []
    const base = new Date('2026-05-10')
    for (let i = 59; i >= 0; i--) {
      const d = new Date(base)
      d.setDate(d.getDate() - i)
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
  })(),

  // 各分类成功率快照（雷达图对比用）
  categorySnapshots: [
    {
      version: 'v1', label: '4月第3周',
      data: [
        { category_id: 1, name: '投资', icon: '📈', success_rate: 40 },
        { category_id: 2, name: '健康', icon: '💪', success_rate: 70 },
        { category_id: 3, name: '学习', icon: '📚', success_rate: 55 },
        { category_id: 4, name: '工作', icon: '💼', success_rate: 80 }
      ]
    },
    {
      version: 'v2', label: '4月第4周',
      data: [
        { category_id: 1, name: '投资', icon: '📈', success_rate: 60 },
        { category_id: 2, name: '健康', icon: '💪', success_rate: 50 },
        { category_id: 3, name: '学习', icon: '📚', success_rate: 65 },
        { category_id: 4, name: '工作', icon: '💼', success_rate: 75 }
      ]
    },
    {
      version: 'v3', label: '5月第1周',
      data: [
        { category_id: 1, name: '投资', icon: '📈', success_rate: 85 },
        { category_id: 2, name: '健康', icon: '💪', success_rate: 45 },
        { category_id: 3, name: '学习', icon: '📚', success_rate: 75 },
        { category_id: 4, name: '工作', icon: '💼', success_rate: 88 }
      ]
    }
  ],

  // 进化树节点
  evolutionNodes: [
    { id: 'a1-v1', label: '低吸高抛 v1', iteration_type: null, parent_id: null, review_cycle: '4月第3周', status: 'evolved', type: 'action' },
    { id: 'a1-v2', label: '低吸高抛 v2', iteration_type: '优化', parent_id: 'a1-v1', review_cycle: '4月第4周', status: 'evolved', type: 'action' },
    { id: 'a1-v3', label: '低吸高抛 v3', iteration_type: '固化', parent_id: 'a1-v2', review_cycle: '5月第1周', status: 'active', type: 'action' },
    { id: 'a3-v1', label: '晨跑5公里 v1', iteration_type: null, parent_id: null, review_cycle: '4月第3周', status: 'evolved', type: 'action' },
    { id: 'a3-v2', label: '晨跑5公里 v2', iteration_type: '降级', parent_id: 'a3-v1', review_cycle: '4月第4周', status: 'active', type: 'action' },
    { id: 'l3-v1', label: '情绪化追涨 v1', iteration_type: null, parent_id: null, review_cycle: '4月第3周', status: 'evolved', type: 'law' },
    { id: 'l3-v2', label: '情绪化追涨 v2', iteration_type: '淘汰', parent_id: 'l3-v1', review_cycle: '4月第4周', status: 'retired', type: 'law' }
  ],

  // 榜单自定义数量配置
  rankConfig: {
    action: 5,
    positive_law: 3,
    negative_law: 3
  }
}

// 计算统计数据
const calcStats = () => {
  const actions = mockApi.actions.filter(a => a.status === 0)
  const positiveLaws = mockApi.laws.filter(l => l.law_type === 1 && l.status === 0)
  const negativeLaws = mockApi.laws.filter(l => l.law_type === 2 && l.status === 0)

  return {
    action_count: actions.length,
    action_trigger_count: actions.reduce((s, a) => s + a.exec_count, 0),
    positive_law_count: positiveLaws.length,
    positive_law_trigger_count: positiveLaws.reduce((s, l) => s + l.trigger_count, 0),
    negative_law_count: negativeLaws.length,
    negative_law_trigger_count: negativeLaws.reduce((s, l) => s + l.trigger_count, 0)
  }
}

// 计算待办提醒
const calcTodos = () => {
  const todos = []
  const dismissed = mockApi.dismissedTodos

  // 待复盘（mock：固定有2个待复盘）
  const reviewKey = 'review'
  if (!dismissed.includes(reviewKey)) {
    todos.push({ key: reviewKey, type: 'review', count: 2 })
  }

  // 迁移推荐（mock：固定有1条推荐）
  const migrateKey = 'migrate'
  if (!dismissed.includes(migrateKey)) {
    todos.push({ key: migrateKey, type: 'migrate', count: 1 })
  }

  // 超7天未执行的正确的事
  const now = Date.now()
  mockApi.actions
    .filter(a => a.status === 0)
    .forEach(a => {
      const key = `overdue_${a.id}`
      if (dismissed.includes(key)) return
      if (!a.last_exec_time) {
        todos.push({ key, type: 'overdue', action: a, days: null })
        return
      }
      const days = Math.floor((now - new Date(a.last_exec_time).getTime()) / (1000 * 60 * 60 * 24))
      if (days >= 7) {
        todos.push({ key, type: 'overdue', action: a, days })
      }
    })

  return todos
}

// 计算榜单
const calcRanking = (type) => {
  if (type === 'action') {
    return [...mockApi.actions]
      .filter(a => a.status === 0)
      .sort((a, b) => b.subjective_weight - a.subjective_weight)
      .slice(0, mockApi.rankConfig.action)
  }
  if (type === 'positive_law') {
    return [...mockApi.laws]
      .filter(l => l.law_type === 1 && l.status === 0)
      .sort((a, b) => b.subjective_weight - a.subjective_weight)
      .slice(0, mockApi.rankConfig.positive_law)
  }
  if (type === 'negative_law') {
    return [...mockApi.laws]
      .filter(l => l.law_type === 2 && l.status === 0)
      .sort((a, b) => b.subjective_weight - a.subjective_weight)
      .slice(0, mockApi.rankConfig.negative_law)
  }
  return []
}

// API methods
export const api = {
  // 分类
  getCategories: async () => {
    await delay()
    return mockApi.categories
  },

  // 正确的事
  getActions: async (params = {}) => {
    await delay()
    let list = mockApi.actions
    if (params.category_id) list = list.filter(a => a.category_id === params.category_id)
    if (params.status !== undefined) list = list.filter(a => a.status === params.status)
    return list
  },
  getAction: async (id) => {
    await delay()
    return mockApi.actions.find(a => a.id === id)
  },
  createAction: async (data) => {
    await delay()
    const action = {
      id: Date.now(),
      exec_count: 0,
      success_count: 0,
      fail_count: 0,
      success_rate: null,
      status: 0,
      pinned: 0,
      last_exec_time: null,
      ...data
    }
    mockApi.actions.push(action)
    return action
  },
  checkin: async (actionId, data) => {
    await delay()
    const record = {
      id: Date.now(),
      action_id: actionId,
      exec_result: data.result === 'success' ? 1 : 2,
      exec_remark: data.remark || '',
      exec_time: new Date().toISOString()
    }
    mockApi.records.push(record)
    const action = mockApi.actions.find(a => a.id === actionId)
    if (action) {
      action.exec_count++
      if (data.result === 'success') action.success_count++
      else action.fail_count++
      action.success_rate = Math.round((action.success_count / action.exec_count) * 10000) / 100
      action.last_exec_time = record.exec_time
    }
    return record
  },
  deleteAction: async (id) => {
    await delay()
    const index = mockApi.actions.findIndex(a => a.id === id)
    if (index === -1) throw new Error('正确的事不存在')
    if (mockApi.records.some(r => r.action_id === id)) {
      throw new Error('有执行记录的正确的事不能直接删除，请先归档')
    }
    mockApi.actions.splice(index, 1)
    return { success: true }
  },

  // 规律
  getLaws: async (params = {}) => {
    await delay()
    let list = mockApi.laws
    if (params.law_type) list = list.filter(l => l.law_type === params.law_type)
    if (params.category_id) list = list.filter(l => l.category_id === params.category_id)
    if (params.status !== undefined) list = list.filter(l => l.status === params.status)
    return list
  },
  createLaw: async (data) => {
    await delay()
    const law = {
      id: Date.now(),
      trigger_count: 0,
      status: 0,
      popup_enabled: 1,
      ...data
    }
    mockApi.laws.push(law)
    return law
  },
  deleteLaw: async (id) => {
    await delay()
    const index = mockApi.laws.findIndex(l => l.id === id)
    if (index === -1) throw new Error('规律不存在')
    mockApi.laws.splice(index, 1)
    return { success: true }
  },

  // 首页数据
  getHomeStats: async () => {
    await delay()
    return calcStats()
  },
  getTodos: async () => {
    await delay()
    return calcTodos()
  },
  dismissTodo: async (key) => {
    await delay()
    if (!mockApi.dismissedTodos.includes(key)) {
      mockApi.dismissedTodos.push(key)
    }
    return { success: true }
  },

  // 榜单
  getRanking: async (type) => {
    await delay()
    return calcRanking(type)
  },
  getRankConfig: async () => {
    await delay()
    return { ...mockApi.rankConfig }
  },
  updateRankConfig: async (config) => {
    await delay()
    Object.assign(mockApi.rankConfig, config)
    return { ...mockApi.rankConfig }
  },

  // SOP
  getSops: async (params = {}) => {
    await delay()
    let list = [...mockApi.sops]
    if (params.category_id) list = list.filter(s => s.category_id === Number(params.category_id))
    return list
  },
  createSop: async (data) => {
    await delay()
    const sop = {
      id: Date.now(),
      last_exec_time: null,
      ...data,
      steps: (data.steps || []).map((s, i) => ({ id: Date.now() + i, sort_order: i + 1, ...s }))
    }
    mockApi.sops.push(sop)
    return sop
  },
  updateSop: async (id, data) => {
    await delay()
    const idx = mockApi.sops.findIndex(s => s.id === id)
    if (idx === -1) throw new Error('SOP不存在')
    mockApi.sops[idx] = {
      ...mockApi.sops[idx],
      ...data,
      steps: (data.steps || mockApi.sops[idx].steps).map((s, i) => ({ ...s, sort_order: i + 1 }))
    }
    return mockApi.sops[idx]
  },
  deleteSop: async (id) => {
    await delay()
    const idx = mockApi.sops.findIndex(s => s.id === id)
    if (idx === -1) throw new Error('SOP不存在')
    mockApi.sops.splice(idx, 1)
    return { success: true }
  },
  copySop: async (id) => {
    await delay()
    const src = mockApi.sops.find(s => s.id === id)
    if (!src) throw new Error('SOP不存在')
    const copy = {
      ...src,
      id: Date.now(),
      name: src.name + '（副本）',
      last_exec_time: null,
      steps: src.steps.map((s, i) => ({ ...s, id: Date.now() + i }))
    }
    mockApi.sops.push(copy)
    return copy
  },
  execSop: async (id, checkins) => {
    // checkins: [{ action_id, result, remark }]
    await delay()
    const sop = mockApi.sops.find(s => s.id === id)
    if (!sop) throw new Error('SOP不存在')
    sop.last_exec_time = new Date().toISOString()
    const records = []
    for (const c of checkins) {
      const action = mockApi.actions.find(a => a.id === c.action_id)
      if (!action) continue
      action.exec_count = (action.exec_count || 0) + 1
      if (c.result === 'success') action.success_count = (action.success_count || 0) + 1
      else action.fail_count = (action.fail_count || 0) + 1
      action.success_rate = Math.round((action.success_count / action.exec_count) * 10000) / 100
      action.last_exec_time = sop.last_exec_time
      const record = {
        id: Date.now() + records.length,
        action_id: c.action_id,
        exec_result: c.result === 'success' ? 1 : 2,
        exec_remark: c.remark || '',
        exec_time: sop.last_exec_time
      }
      mockApi.records.push(record)
      records.push(record)
    }
    return records
  },

  // 复盘
  getReviews: async () => {
    await delay()
    return [...mockApi.reviews]
  },
  getDailyRecords: async () => {
    await delay()
    return [...mockApi.dailyRecords]
  },
  getCategorySnapshots: async () => {
    await delay()
    return [...mockApi.categorySnapshots]
  },
  getEvolutionNodes: async () => {
    await delay()
    return [...mockApi.evolutionNodes]
  }
}
