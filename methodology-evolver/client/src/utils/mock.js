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
      description: '资产价格长期会回归其内在价值',
      source: '霍华德·马克斯',
      applicability: '股票、房产等大多数资产',
      warning_signs: ['过度乐观时', '泡沫迹象'],
      is_retired: false,
      created_at: '2024-01-20T12:00:00Z'
    },
    {
      id: 2,
      name: '长期坚持效果更佳',
      category: '健康',
      description: '运动需要持续才能看到效果',
      source: '个人经验',
      applicability: '健身、习惯养成',
      warning_signs: ['中断超过3天', '动力下降'],
      is_retired: false,
      created_at: '2024-02-15T10:00:00Z'
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
      status: 0,
      created_time: '2024-04-10T09:00:00Z'
    },
    {
      id: 2,
      desc: '间歇性断食可能比持续节食更有效',
      source: '播客',
      category_id: 2,
      status: 0,
      created_time: '2024-04-12T15:30:00Z'
    },
    {
      id: 3,
      desc: '费曼学习法的核心是输出倒逼输入，可以用在投资复盘上',
      source: '视频',
      category_id: 3,
      status: 1,
      created_time: '2024-04-08T20:00:00Z'
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
    checkWarnings: async (params) => {
      await delay()
      return { code: 200, data: [] }
    },
    logWarning: async (data) => {
      await delay()
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

export default mockApi
