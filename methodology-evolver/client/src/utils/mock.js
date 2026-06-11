// Mock数据 - 方法论进化器
// 提供完整的模拟数据用于前端开发调试

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

// Mock数据存储
const mockDB = {
  categories: [
    { id: 1, name: '投资', icon: 'chart', color: '#FF6B6B', sort: 1 },
    { id: 2, name: '健康', icon: 'heart', color: '#4ECDC4', sort: 2 },
    { id: 3, name: '学习', icon: 'book', color: '#45B7D1', sort: 3 },
    { id: 4, name: '工作', icon: 'briefcase', color: '#96CEB4', sort: 4 }
  ],
  actions: [
    {
      id: 1,
      category_id: 1,
      name: '低吸高抛',
      description: '在股票低估时买入，高估时卖出',
      principle: '逆向投资，人弃我取',
      expected_times: 4,
      expected_amount: 10000,
      is_archived: false,
      created_at: '2024-01-15T10:00:00Z',
      stats: { total: 8, success: 6, total_amount: 45000 }
    },
    {
      id: 2,
      category_id: 1,
      name: '定投指数基金',
      description: '每月固定日期投入固定金额',
      principle: '分散风险，长期持有',
      expected_times: 12,
      expected_amount: 5000,
      is_archived: false,
      created_at: '2024-02-01T08:00:00Z',
      stats: { total: 12, success: 10, total_amount: 60000 }
    },
    {
      id: 3,
      category_id: 2,
      name: '晨跑5公里',
      description: '每天早晨跑步5公里',
      principle: '保持体能，提升精力',
      expected_times: 6,
      is_archived: false,
      created_at: '2024-03-01T07:00:00Z',
      stats: { total: 45, success: 40, total_amount: 0 }
    }
  ],
  events: [
    {
      id: 1,
      action_id: 1,
      type: 'checkin',
      amount: 5000,
      note: '在XX股票上执行低吸',
      happened_at: '2024-04-10T09:30:00Z',
      result: 'success'
    },
    {
      id: 2,
      action_id: 1,
      type: 'checkin',
      amount: 5500,
      note: '卖出XX股票',
      happened_at: '2024-04-15T14:00:00Z',
      result: 'success'
    },
    {
      id: 3,
      action_id: 3,
      type: 'checkin',
      note: '完成今日晨跑',
      happened_at: '2024-04-16T06:30:00Z',
      result: 'success'
    }
  ],
  laws: [
    {
      id: 1,
      name: '均值回归',
      category: '投资',
      category_id: 1,
      description: '资产价格长期会回归其内在价值',
      source: '霍华德·马克斯',
      applicability: '股票、房产等大多数资产',
      warning_signs: ['过度乐观时', '泡沫迹象'],
      direction: 'positive',
      is_retired: false,
      created_at: '2024-01-20T12:00:00Z'
    },
    {
      id: 2,
      name: '长期坚持效果更佳',
      category: '健康',
      category_id: 2,
      description: '运动需要持续才能看到效果',
      source: '个人经验',
      applicability: '健身、习惯养成',
      warning_signs: ['中断超过3天', '动力下降'],
      direction: 'positive',
      is_retired: false,
      created_at: '2024-02-15T10:00:00Z'
    },
    {
      id: 3,
      name: '情绪化追涨杀跌注定亏损',
      category: '投资',
      category_id: 1,
      description: '情绪驱动的交易胜率显著低于理性决策',
      source: '个人经验',
      applicability: '股票、可转债等波动资产',
      warning_signs: ['市场剧烈波动', '热点轮动'],
      direction: 'negative',
      is_retired: false,
      created_at: '2024-03-01T10:00:00Z'
    }
  ],
  sops: [
    {
      id: 1,
      name: '股票买入流程',
      steps: [
        { order: 1, content: '检查大盘走势', tip: '避免在系统性下跌时买入' },
        { order: 2, content: '分析估值水平', tip: 'PE/PB处于历史低位' },
        { order: 3, content: '确认基本面无重大变化', tip: '无负面消息' },
        { order: 4, content: '设置买入价格和数量', tip: '分批建仓' },
        { order: 5, content: '执行买入', tip: '市价或限价单' }
      ],
      is_active: true,
      used_count: 15
    }
  ],
  reviews: [
    {
      id: 1,
      type: 'weekly',
      period_start: '2024-04-08',
      period_end: '2024-04-14',
      summary: '本周执行良好，股市操作成功率80%',
      action_updates: [{ id: 1, note: '优化买入时机判断' }],
      law_updates: [],
      created_at: '2024-04-14T20:00:00Z'
    }
  ],
  mistakes: [
    {
      id: 1,
      category_id: 1,
      name: '追涨杀跌',
      remark: '情绪化操作，看到涨就追，看到跌就割',
      subjective_weight: 9,
      status: 0,
      pinned: 1,
      related_law_ids: [1],
      created_at: '2024-02-10T10:00:00Z'
    },
    {
      id: 2,
      category_id: 4,
      name: '带情绪做决策',
      remark: '愤怒或焦虑时做出的决策往往质量很低',
      subjective_weight: 8,
      status: 0,
      pinned: 0,
      related_law_ids: [],
      created_at: '2024-03-05T09:00:00Z'
    },
    {
      id: 3,
      category_id: 2,
      name: '熬夜超过凌晨1点',
      remark: '严重影响第二天精力和判断力',
      subjective_weight: 7,
      status: 0,
      pinned: 0,
      related_law_ids: [2],
      created_at: '2024-03-20T11:00:00Z'
    }
  ],
  inspirations: [
    {
      id: 1,
      desc: '低估值买入的逻辑可能也适用于二手房市场',
      source: '书籍',
      category_id: 1,
      direction: 'positive',
      status: 0,
      created_time: '2024-04-10T09:00:00Z'
    },
    {
      id: 2,
      desc: '间歇性断食可能比持续节食更有效',
      source: '播客',
      category_id: 2,
      direction: 'positive',
      status: 0,
      created_time: '2024-04-12T15:30:00Z'
    },
    {
      id: 3,
      desc: '费曼学习法的核心是输出倒逼输入，可以用在投资复盘上',
      source: '视频',
      category_id: 3,
      direction: 'positive',
      status: 1,
      created_time: '2024-04-08T20:00:00Z'
    },
    {
      id: 4,
      desc: '频繁看盘会导致情绪化操作增多',
      source: '聊天',
      category_id: 1,
      direction: 'negative',
      status: 0,
      created_time: '2024-04-11T14:00:00Z'
    }
  ],
  stats: {
    dashboard: {
      today_checkins: 2,
      week_checkins: 12,
      month_checkins: 35,
      streak_days: 7,
      total_actions: 3,
      active_actions: 3,
      total_laws: 2,
      total_mistakes: 3,
      success_rate: 85
    }
  }
}

// Mock API方法
export const mockApi = {
  auth: {
    login: async (code) => {
      await delay()
      return { code: 200, data: { token: 'mock_token_123', user: { id: 1, name: '测试用户' } } }
    },
    check: async () => {
      await delay()
      return { code: 200, data: { user: { id: 1, name: '测试用户' } } }
    },
    getSettings: async () => {
      await delay()
      return { code: 200, data: { theme: 'light', notifications: true } }
    },
    updateSettings: async (data) => {
      await delay()
      return { code: 200, data }
    }
  },
  categories: {
    list: async () => {
      await delay()
      return { code: 200, data: mockDB.categories }
    },
    create: async (data) => {
      await delay()
      const newCat = { id: Date.now(), ...data }
      mockDB.categories.push(newCat)
      return { code: 200, data: newCat }
    },
    update: async (id, data) => {
      await delay()
      const idx = mockDB.categories.findIndex(c => c.id === id)
      if (idx >= 0) {
        mockDB.categories[idx] = { ...mockDB.categories[idx], ...data }
        return { code: 200, data: mockDB.categories[idx] }
      }
      return { code: 404, message: 'Not found' }
    },
    delete: async (id) => {
      await delay()
      mockDB.categories = mockDB.categories.filter(c => c.id !== id)
      return { code: 200 }
    }
  },
  actions: {
    list: async (params = {}) => {
      await delay()
      let result = [...mockDB.actions]
      if (params.category_id) result = result.filter(a => a.category_id === params.category_id)
      if (params.is_archived !== undefined) result = result.filter(a => a.is_archived === params.is_archived)
      return { code: 200, data: result, total: result.length }
    },
    detail: async (id) => {
      await delay()
      const action = mockDB.actions.find(a => a.id === id)
      if (!action) return { code: 404, message: 'Not found' }
      return { code: 200, data: action }
    },
    create: async (data) => {
      await delay()
      const newAction = { id: Date.now(), created_at: new Date().toISOString(), stats: { total: 0, success: 0, total_amount: 0 }, ...data }
      mockDB.actions.push(newAction)
      return { code: 200, data: newAction }
    },
    update: async (id, data) => {
      await delay()
      const idx = mockDB.actions.findIndex(a => a.id === id)
      if (idx >= 0) {
        mockDB.actions[idx] = { ...mockDB.actions[idx], ...data }
        return { code: 200, data: mockDB.actions[idx] }
      }
      return { code: 404 }
    },
    archive: async (id) => {
      await delay()
      const idx = mockDB.actions.findIndex(a => a.id === id)
      if (idx >= 0) {
        mockDB.actions[idx].is_archived = true
        return { code: 200 }
      }
      return { code: 404 }
    },
    delete: async (id) => {
      await delay()
      mockDB.actions = mockDB.actions.filter(a => a.id !== id)
      return { code: 200 }
    },
    checkin: async (id, data) => {
      await delay()
      const newEvent = { id: Date.now(), action_id: id, happened_at: new Date().toISOString(), ...data }
      mockDB.events.push(newEvent)
      return { code: 200, data: newEvent }
    },
    stats: async (id) => {
      await delay()
      return { code: 200, data: { total: 8, success: 6, success_rate: 75, total_amount: 45000 } }
    },
    trend: async (id, params) => {
      await delay()
      const trend = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        trend.push({ date: d.toISOString().split('T')[0], count: Math.floor(Math.random() * 3) })
      }
      return { code: 200, data: trend }
    }
  },
  events: {
    list: async (params = {}) => {
      await delay()
      let result = [...mockDB.events]
      if (params.action_id) result = result.filter(e => e.action_id === params.action_id)
      return { code: 200, data: result }
    },
    detail: async (id) => {
      await delay()
      const event = mockDB.events.find(e => e.id === id)
      return event ? { code: 200, data: event } : { code: 404 }
    },
    create: async (data) => {
      await delay()
      const newEvent = { id: Date.now(), happened_at: new Date().toISOString(), ...data }
      mockDB.events.push(newEvent)
      return { code: 200, data: newEvent }
    },
    delete: async (id) => {
      await delay()
      mockDB.events = mockDB.events.filter(e => e.id !== id)
      return { code: 200 }
    }
  },
  laws: {
    list: async (params = {}) => {
      await delay()
      let result = [...mockDB.laws]
      if (params.is_retired !== undefined) result = result.filter(l => l.is_retired === params.is_retired)
      return { code: 200, data: result }
    },
    detail: async (id) => {
      await delay()
      const law = mockDB.laws.find(l => l.id === id)
      return law ? { code: 200, data: law } : { code: 404 }
    },
    create: async (data) => {
      await delay()
      const newLaw = { id: Date.now(), created_at: new Date().toISOString(), is_retired: false, ...data }
      mockDB.laws.push(newLaw)
      return { code: 200, data: newLaw }
    },
    update: async (id, data) => {
      await delay()
      const idx = mockDB.laws.findIndex(l => l.id === id)
      if (idx >= 0) {
        mockDB.laws[idx] = { ...mockDB.laws[idx], ...data }
        return { code: 200, data: mockDB.laws[idx] }
      }
      return { code: 404 }
    },
    retire: async (id) => {
      await delay()
      const idx = mockDB.laws.findIndex(l => l.id === id)
      if (idx >= 0) {
        mockDB.laws[idx].is_retired = true
        return { code: 200 }
      }
      return { code: 404 }
    },
    delete: async (id) => {
      await delay()
      mockDB.laws = mockDB.laws.filter(l => l.id !== id)
      return { code: 200 }
    },
    checkWarnings: async (params = {}) => {
      await delay(100)
      const { category_id } = params
      let log = {}
      try { log = uni.getStorageSync('mock_popup_log') || {} } catch (e) { log = {} }
      const now = Date.now()
      const matched = mockDB.laws.filter(l =>
        l.direction === 'negative' && !l.is_retired && (!category_id || l.category_id === category_id)
      )
      const fresh = matched.filter(l => {
        const last = log[l.id]
        return !last || (now - last > 24 * 3600000)
      })
      return { code: 200, data: fresh }
    },
    logWarning: async (data = {}) => {
      await delay(50)
      const { law_ids = [] } = data
      let log = {}
      try { log = uni.getStorageSync('mock_popup_log') || {} } catch (e) { log = {} }
      const now = Date.now()
      law_ids.forEach(id => { log[id] = now })
      try { uni.setStorageSync('mock_popup_log', log) } catch (e) {}
      return { code: 200 }
    }
  },
  mistakes: {
    list: async (params = {}) => {
      await delay()
      let result = [...mockDB.mistakes]
      if (params.category_id) result = result.filter(m => m.category_id === params.category_id)
      if (params.status !== undefined) result = result.filter(m => m.status === params.status)
      // 置顶排前面
      result.sort((a, b) => (b.pinned || 0) - (a.pinned || 0))
      return { code: 200, data: result, total: result.length }
    },
    detail: async (id) => {
      await delay()
      const mistake = mockDB.mistakes.find(m => m.id === id)
      return mistake ? { code: 200, data: mistake } : { code: 404, message: 'Not found' }
    },
    create: async (data) => {
      await delay()
      const newMistake = { id: Date.now(), created_at: new Date().toISOString(), status: 0, pinned: 0, ...data }
      mockDB.mistakes.push(newMistake)
      return { code: 200, data: newMistake }
    },
    update: async (id, data) => {
      await delay()
      const idx = mockDB.mistakes.findIndex(m => m.id === id)
      if (idx >= 0) {
        mockDB.mistakes[idx] = { ...mockDB.mistakes[idx], ...data }
        return { code: 200, data: mockDB.mistakes[idx] }
      }
      return { code: 404 }
    },
    delete: async (id) => {
      await delay()
      mockDB.mistakes = mockDB.mistakes.filter(m => m.id !== id)
      return { code: 200 }
    }
  },
  stats: {
    dashboard: async () => {
      await delay()
      return { code: 200, data: { ...mockDB.stats.dashboard, mistake_count: mockDB.mistakes.filter(m => m.status === 0).length } }
    },
    ranking: async (params) => {
      await delay()
      if (params.type === 'mistake') {
        return { code: 200, data: mockDB.mistakes.filter(m => m.status === 0) }
      }
      return { code: 200, data: [] }
    },
    todos: async () => {
      await delay()
      return { code: 200, data: [] }
    },
    dismissTodo: async (data) => {
      await delay()
      return { code: 200 }
    },
    rankConfig: async () => {
      await delay()
      const cfg = uni.getStorageSync('rank_config') || { action: 5, mistake: 5, positive_law: 5, negative_law: 5 }
      return { code: 200, data: cfg }
    },
    updateRankConfig: async (data) => {
      await delay()
      uni.setStorageSync('rank_config', data)
      return { code: 200, data }
    }
  },
  evolution: {
    progress: async () => {
      await delay(100)
      const actions = (mockDB.actions || []).filter(a => a.status === 0)
      const totalExec = actions.reduce((s, a) => s + (a.exec_count || 0), 0)
      const lawCount = (mockDB.laws || []).length
      const sopCount = (mockDB.sops || []).length
      const reviewCount = (mockDB.reviews || []).length
      return {
        code: 200,
        data: [
          { key: 'record', label: '记录', done: actions.length >= 1, value: `${actions.length} 条` },
          { key: 'verify', label: '验证', done: totalExec >= 5, value: `${totalExec} 次` },
          { key: 'extract', label: '提炼', done: lawCount >= 1, value: `${lawCount} 条` },
          { key: 'solidify', label: '固化', done: sopCount >= 1, value: `${sopCount} 个` },
          { key: 'iterate', label: '迭代', done: reviewCount >= 1, value: `${reviewCount} 次` }
        ]
      }
    }
  },
  suggestions: {
    smart: async () => {
      await delay(100)
      const actions = (mockDB.actions || []).filter(a => a.status === 0)
      const totalExec = actions.reduce((s, a) => s + (a.exec_count || 0), 0)
      const lawCount = (mockDB.laws || []).length
      const sopCount = (mockDB.sops || []).length
      const reviewCount = (mockDB.reviews || []).length

      if (actions.length === 0) return { code: 200, data: { text: '记录你做对的第一件事', action: 'create_action', icon: '✏️' } }
      if (totalExec < 5) return { code: 200, data: { text: '去执行一次，验证它是否有效', action: 'checkin', icon: '✅' } }
      if (lawCount === 0) return { code: 200, data: { text: '从成功经验中提炼规律', action: 'create_law', icon: '💡' } }
      if (sopCount === 0) return { code: 200, data: { text: '把规律组合成可执行的流程', action: 'go_sop', icon: '📌' } }
      if (reviewCount === 0) return { code: 200, data: { text: '做一次复盘，看看方法论是否在进化', action: 'go_review', icon: '🔄' } }
      const best = [...actions].sort((a, b) => (b.exec_count || 0) - (a.exec_count || 0))[0]
      if (best) return { code: 200, data: { text: `"${best.action_name || best.name}"成功率 ${best.success_rate ?? 0}%，已执行 ${best.exec_count || 0} 次，建议提炼为 SOP`, action: 'go_sop', icon: '🚀' } }
      return { code: 200, data: { text: '继续保持，你的方法论在持续进化', action: null, icon: '🎯' } }
    }
  },
  migrate: {
    recommend: async (params) => {
      await delay()
      return { code: 200, data: [] }
    },
    execute: async (data) => {
      await delay()
      return { code: 200, data: { migrated: 0 } }
    },
    logs: async (params) => {
      await delay()
      return { code: 200, data: [] }
    }
  },
  reviews: {
    list: async () => {
      await delay()
      return { code: 200, data: mockDB.reviews }
    },
    data: async (id) => {
      await delay()
      const review = mockDB.reviews.find(r => r.id === id)
      return review ? { code: 200, data: { ...review, events: mockDB.events.slice(0, 5) } } : { code: 404 }
    },
    create: async (data) => {
      await delay()
      const newReview = { id: Date.now(), created_at: new Date().toISOString(), ...data }
      mockDB.reviews.push(newReview)
      return { code: 200, data: newReview }
    },
    snapshot: async (id) => {
      await delay()
      return { code: 200, data: { actions: mockDB.actions.length, laws: mockDB.laws.length } }
    },
    iterateAction: async (id, data) => {
      await delay()
      return { code: 200 }
    },
    iterateLaw: async (id, data) => {
      await delay()
      return { code: 200 }
    },
    retiredItems: async (params = {}) => {
      await delay()
      const { type, page = 1, page_size = 20 } = params
      const all = []
      if (!type || type === 'action') {
        for (const a of mockDB.actions.filter(x => x.is_archived === true)) {
          const cat = mockDB.categories.find(c => c.id === a.category_id)
          all.push({ type: 'action', id: a.id, name: a.name, category_name: cat ? cat.name : '', retired_time: a.retired_at || a.updated_at || a.created_at })
        }
      }
      if (!type || type === 'mistake') {
        for (const m of mockDB.mistakes.filter(x => x.status === 2)) {
          const cat = mockDB.categories.find(c => c.id === m.category_id)
          all.push({ type: 'mistake', id: m.id, name: m.name, category_name: cat ? cat.name : '', retired_time: m.retired_at || m.updated_at || m.created_at })
        }
      }
      if (!type || type === 'law') {
        for (const l of mockDB.laws.filter(x => x.is_retired === true)) {
          all.push({ type: 'law', id: l.id, name: l.name, category_name: l.category || '', retired_time: l.retired_at || l.updated_at || l.created_at })
        }
      }
      all.sort((a, b) => new Date(b.retired_time || 0) - new Date(a.retired_time || 0))
      const start = (page - 1) * page_size
      return { code: 200, data: { list: all.slice(start, start + page_size), total: all.length } }
    },
    restoreItem: async (type, id) => {
      await delay()
      if (type === 'action') {
        const idx = mockDB.actions.findIndex(x => x.id === id)
        if (idx < 0) return { code: 404, message: '记录不存在' }
        if (!mockDB.actions[idx].is_archived) return { code: 400, message: '该记录未被淘汰' }
        mockDB.actions[idx].is_archived = false
        return { code: 200 }
      }
      if (type === 'law') {
        const idx = mockDB.laws.findIndex(x => x.id === id)
        if (idx < 0) return { code: 404, message: '记录不存在' }
        if (!mockDB.laws[idx].is_retired) return { code: 400, message: '该记录未被淘汰' }
        mockDB.laws[idx].is_retired = false
        return { code: 200 }
      }
      if (type === 'mistake') {
        const idx = mockDB.mistakes.findIndex(x => x.id === id)
        if (idx < 0) return { code: 404, message: '记录不存在' }
        if (mockDB.mistakes[idx].status !== 2) return { code: 400, message: '该记录未被淘汰' }
        mockDB.mistakes[idx].status = 0
        return { code: 200 }
      }
      return { code: 400, message: '未知类型' }
    },
    permanentDeleteItem: async (type, id) => {
      await delay()
      if (type === 'action') {
        const idx = mockDB.actions.findIndex(x => x.id === id)
        if (idx < 0) return { code: 404, message: '记录不存在' }
        mockDB.actions.splice(idx, 1)
        for (let i = mockDB.events.length - 1; i >= 0; i--) {
          if (mockDB.events[i].action_id === id) mockDB.events.splice(i, 1)
        }
        return { code: 200 }
      }
      if (type === 'law') {
        const idx = mockDB.laws.findIndex(x => x.id === id)
        if (idx < 0) return { code: 404, message: '记录不存在' }
        mockDB.laws.splice(idx, 1)
        return { code: 200 }
      }
      if (type === 'mistake') {
        const idx = mockDB.mistakes.findIndex(x => x.id === id)
        if (idx < 0) return { code: 404, message: '记录不存在' }
        mockDB.mistakes.splice(idx, 1)
        return { code: 200 }
      }
      return { code: 400, message: '未知类型' }
    }
  },
  sops: {
    list: async (params = {}) => {
      await delay()
      return { code: 200, data: mockDB.sops }
    },
    detail: async (id) => {
      await delay()
      const sop = mockDB.sops.find(s => s.id === id)
      return sop ? { code: 200, data: sop } : { code: 404 }
    },
    create: async (data) => {
      await delay()
      const newSop = { id: Date.now(), used_count: 0, is_active: true, ...data }
      mockDB.sops.push(newSop)
      return { code: 200, data: newSop }
    },
    update: async (id, data) => {
      await delay()
      const idx = mockDB.sops.findIndex(s => s.id === id)
      if (idx >= 0) {
        mockDB.sops[idx] = { ...mockDB.sops[idx], ...data }
        return { code: 200, data: mockDB.sops[idx] }
      }
      return { code: 404 }
    },
    delete: async (id) => {
      await delay()
      mockDB.sops = mockDB.sops.filter(s => s.id !== id)
      return { code: 200 }
    },
    execute: async (id, data) => {
      await delay()
      const idx = mockDB.sops.findIndex(s => s.id === id)
      if (idx >= 0) mockDB.sops[idx].used_count++
      return { code: 200 }
    }
  },
  inspirations: {
    list: async (params = {}) => {
      await delay()
      let result = [...mockDB.inspirations]
      if (params.status !== undefined) result = result.filter(i => i.status === params.status)
      if (params.category_id) result = result.filter(i => i.category_id === params.category_id)
      result.sort((a, b) => new Date(b.created_time) - new Date(a.created_time))
      return { code: 200, data: result, total: result.length }
    },
    create: async (data) => {
      await delay()
      const newItem = { id: Date.now(), status: 0, created_time: new Date().toISOString(), ...data }
      mockDB.inspirations.push(newItem)
      return { code: 200, data: newItem }
    },
    update: async (id, data) => {
      await delay()
      const idx = mockDB.inspirations.findIndex(i => i.id === id)
      if (idx >= 0) {
        mockDB.inspirations[idx] = { ...mockDB.inspirations[idx], ...data }
        return { code: 200, data: mockDB.inspirations[idx] }
      }
      return { code: 404 }
    },
    delete: async (id) => {
      await delay()
      mockDB.inspirations = mockDB.inspirations.filter(i => i.id !== id)
      return { code: 200 }
    },
    convert: async (id, data) => {
      await delay()
      const idx = mockDB.inspirations.findIndex(i => i.id === id)
      if (idx >= 0) {
        mockDB.inspirations[idx].status = 1
        return { code: 200, data: { target_type: data.target_type, target_id: Date.now() } }
      }
      return { code: 404 }
    }
  },
  storage: {
    backup: async () => {
      await delay()
      return { code: 200, data: { url: '/backup/mock.zip', created_at: new Date().toISOString() } }
    },
    restore: async (data) => {
      await delay()
      return { code: 200 }
    }
  }
}

export { mockDB }
export default mockApi
