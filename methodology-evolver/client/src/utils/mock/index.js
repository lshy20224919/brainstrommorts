// Mock数据服务 - 用于前端演示效果
// 在真机上线时，替换为真实API调用

const MockData = {
  // 当前时间
  now: new Date(),
  
  // 分类数据
  categories: [
    { category_id: 1, category_name: '职场工作', is_system_default: 1, sort_weight: 1 },
    { category_id: 2, category_name: '运动健身', is_system_default: 1, sort_weight: 2 },
    { category_id: 3, category_name: '理财投资', is_system_default: 1, sort_weight: 3 },
    { category_id: 4, category_name: '学习成长', is_system_default: 1, sort_weight: 4 },
    { category_id: 5, category_name: '日常生活', is_system_default: 1, sort_weight: 5 },
    { category_id: 6, category_name: '人际社交', is_system_default: 1, sort_weight: 6 }
  ],
  
  // 动作数据
  actions: [
    {
      action_id: 1,
      action_name: '低吸高抛',
      category_id: 3,
      category_name: '理财投资',
      subjective_weight: 8.5,
      exec_count: 15,
      success_count: 11,
      fail_count: 4,
      success_rate: 73.33,
      status: 0,
      pinned: 1,
      last_exec_time: '2026-05-07 10:30:00',
      create_time: '2026-04-01 09:00:00'
    },
    {
      action_id: 2,
      action_name: '每日晨跑',
      category_id: 2,
      category_name: '运动健身',
      subjective_weight: 7.0,
      exec_count: 28,
      success_count: 25,
      fail_count: 3,
      success_rate: 89.29,
      status: 0,
      pinned: 1,
      last_exec_time: '2026-05-07 06:30:00',
      create_time: '2026-03-15 07:00:00'
    },
    {
      action_id: 3,
      action_name: '主动汇报进度',
      category_id: 1,
      category_name: '职场工作',
      subjective_weight: 8.0,
      exec_count: 12,
      success_count: 10,
      fail_count: 2,
      success_rate: 83.33,
      status: 0,
      pinned: 0,
      last_exec_time: '2026-05-06 18:00:00',
      create_time: '2026-04-10 10:00:00'
    },
    {
      action_id: 4,
      action_name: '睡前阅读30分钟',
      category_id: 4,
      category_name: '学习成长',
      subjective_weight: 6.5,
      exec_count: 20,
      success_count: 14,
      fail_count: 6,
      success_rate: 70.0,
      status: 0,
      pinned: 0,
      last_exec_time: '2026-05-06 23:00:00',
      create_time: '2026-04-05 22:00:00'
    },
    {
      action_id: 5,
      action_name: '重要事情书面确认',
      category_id: 1,
      category_name: '职场工作',
      subjective_weight: 7.5,
      exec_count: 8,
      success_count: 8,
      fail_count: 0,
      success_rate: 100.0,
      status: 0,
      pinned: 0,
      last_exec_time: '2026-05-05 17:00:00',
      create_time: '2026-04-15 11:00:00'
    },
    {
      action_id: 6,
      action_name: '每周联系一位朋友',
      category_id: 6,
      category_name: '人际社交',
      subjective_weight: 6.0,
      exec_count: 4,
      success_count: 3,
      fail_count: 1,
      success_rate: 75.0,
      status: 0,
      pinned: 0,
      last_exec_time: '2026-05-04 20:00:00',
      create_time: '2026-04-20 12:00:00'
    }
  ],
  
  // 规律数据
  laws: [
    {
      law_id: 1,
      law_type: 1,
      law_desc: '行情震荡期，低吸高抛容错率更高',
      category_id: 3,
      category_name: '理财投资',
      related_action_id: 1,
      action_name: '低吸高抛',
      applicable_scenes: 'A股震荡行情',
      status: 0
    },
    {
      law_id: 2,
      law_type: 2,
      law_desc: '情绪化追涨，大概率短期被套',
      category_id: 3,
      category_name: '理财投资',
      related_action_id: 1,
      action_name: '低吸高抛',
      applicable_scenes: '行情急涨时',
      status: 0,
      popup_enabled: 1
    },
    {
      law_id: 3,
      law_type: 1,
      law_desc: '晨跑后人精神好，上午工作效率显著提升',
      category_id: 2,
      category_name: '运动健身',
      related_action_id: 2,
      action_name: '每日晨跑',
      applicable_scenes: '工作日早晨',
      status: 0
    },
    {
      law_id: 4,
      law_type: 2,
      law_desc: '睡前刷手机容易失眠，影响第二天状态',
      category_id: 4,
      category_name: '学习成长',
      applicable_scenes: '晚上22点后',
      status: 0,
      popup_enabled: 1
    },
    {
      law_id: 5,
      law_type: 1,
      law_desc: '书面确认可以留痕，避免事后扯皮',
      category_id: 1,
      category_name: '职场工作',
      related_action_id: 5,
      action_name: '重要事情书面确认',
      applicable_scenes: '重要决策、合作约定',
      status: 0
    }
  ],
  
  // SOP模板
  sops: [
    {
      sop_id: 1,
      sop_name: '股票低吸高抛标准流程',
      category_id: 3,
      category_name: '理财投资',
      steps: [
        { step: 1, action_id: null, remark: '判断行情：是否为震荡市' },
        { step: 2, action_id: 1, remark: '低位建仓' },
        { step: 3, action_id: null, remark: '设定止盈点位' },
        { step: 4, action_id: null, remark: '高位卖出' }
      ],
      is_auto_generated: 0,
      exec_count: 5,
      last_exec_time: '2026-05-06 15:00:00',
      create_time: '2026-04-10 10:00:00'
    },
    {
      sop_id: 2,
      sop_name: '晨跑执行流程',
      category_id: 2,
      category_name: '运动健身',
      steps: [
        { step: 1, action_id: null, remark: '前一天晚上准备好装备' },
        { step: 2, action_id: 2, remark: '起床后先喝温水' },
        { step: 3, action_id: null, remark: '热身5分钟' },
        { step: 4, action_id: null, remark: '跑步30分钟' },
        { step: 5, action_id: null, remark: '拉伸10分钟' }
      ],
      is_auto_generated: 1,
      exec_count: 12,
      last_exec_time: '2026-05-07 07:00:00',
      create_time: '2026-04-01 08:00:00'
    }
  ],
  
  // 复盘记录
  reviews: [
    {
      review_id: 1,
      review_cycle: 'week',
      start_time: '2026-04-28 00:00:00',
      end_time: '2026-05-04 23:59:59',
      snapshot_version: 'v1',
      has_snapshot: 1,
      create_time: '2026-05-05 10:00:00'
    },
    {
      review_id: 2,
      review_cycle: 'week',
      start_time: '2026-05-05 00:00:00',
      end_time: '2026-05-07 10:30:00',
      snapshot_version: 'v2',
      has_snapshot: 1,
      create_time: '2026-05-07 11:00:00'
    }
  ],
  
  // 执行记录
  records: [
    { record_id: 1, action_id: 1, exec_result: 1, exec_remark: 'XX股票盈利5%', exec_time: '2026-05-07 10:30:00' },
    { record_id: 2, action_id: 2, exec_result: 1, exec_remark: '5公里，感觉不错', exec_time: '2026-05-07 06:30:00' },
    { record_id: 3, action_id: 1, exec_result: 2, exec_remark: '止损出局', exec_time: '2026-05-06 14:00:00' },
    { record_id: 4, action_id: 3, exec_result: 1, exec_remark: '周例会汇报顺利', exec_time: '2026-05-06 18:00:00' },
    { record_id: 5, action_id: 4, exec_result: 1, exec_remark: '读《原则》30页', exec_time: '2026-05-06 23:00:00' }
  ]
}

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API服务
class MockAPI {
  constructor() {
    this.token = 'mock_token_123456'
    this.userId = 1
  }
  
  // 认证
  auth = {
    login: async (code) => {
      await delay()
      return {
        code: 200,
        message: '登录成功',
        data: {
          token: MockAPI.token,
          userId: 1,
          isNew: false
        }
      }
    },
    check: async () => {
      await delay()
      return {
        code: 200,
        data: { valid: true, userId: 1 }
      }
    },
    getSettings: async () => {
      await delay()
      return {
        code: 200,
        data: {
          smart_migrate_on: true,
          warning_popup_on: true
        }
      }
    },
    updateSettings: async (data) => {
      await delay()
      return { code: 200, message: '设置更新成功' }
    }
  }
  
  // 分类
  categories = {
    list: async () => {
      await delay()
      return { code: 200, data: MockData.categories }
    },
    create: async (data) => {
      await delay()
      const newCategory = {
        category_id: MockData.categories.length + 1,
        ...data,
        is_system_default: 0,
        sort_weight: MockData.categories.length + 1
      }
      MockData.categories.push(newCategory)
      return { code: 200, data: newCategory, message: '创建成功' }
    }
  }
  
  // 动作
  actions = {
    list: async (params = {}) => {
      await delay()
      let list = [...MockData.actions]
      
      // 筛选
      if (params.category_id) {
        list = list.filter(a => a.category_id === params.category_id)
      }
      if (params.status !== undefined) {
        list = list.filter(a => a.status === params.status)
      }
      
      // 排序
      if (params.sort_by === 'success_rate') {
        list.sort((a, b) => (b.success_rate || 0) - (a.success_rate || 0))
      } else if (params.sort_by === 'weight') {
        list.sort((a, b) => b.subjective_weight - a.subjective_weight)
      } else {
        list.sort((a, b) => b.exec_count - a.exec_count)
      }
      
      return { code: 200, data: { list, total: list.length, page: 1, page_size: 20 } }
    },
    detail: async (id) => {
      await delay()
      const action = MockData.actions.find(a => a.action_id === id)
      if (!action) return { code: 404, message: '动作不存在' }
      
      const records = MockData.records.filter(r => r.action_id === id)
      const laws = MockData.laws.filter(l => l.related_action_id === id)
      
      return { code: 200, data: { ...action, records, related_laws: laws } }
    },
    create: async (data) => {
      await delay()
      const newAction = {
        action_id: MockData.actions.length + 1,
        ...data,
        category_name: MockData.categories.find(c => c.category_id === data.category_id)?.category_name,
        exec_count: 0,
        success_count: 0,
        fail_count: 0,
        success_rate: null,
        status: 0,
        pinned: 0,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      MockData.actions.push(newAction)
      return { code: 200, data: newAction, message: '创建成功' }
    },
    update: async (id, data) => {
      await delay()
      const index = MockData.actions.findIndex(a => a.action_id === id)
      if (index > -1) {
        MockData.actions[index] = { ...MockData.actions[index], ...data }
        return { code: 200, message: '更新成功' }
      }
      return { code: 404, message: '动作不存在' }
    },
    archive: async (id) => {
      await delay()
      const action = MockData.actions.find(a => a.action_id === id)
      if (action) {
        action.status = 1
        action.pinned = 0
      }
      return { code: 200, message: '归档成功' }
    },
    delete: async (id) => {
      await delay()
      const index = MockData.actions.findIndex(a => a.action_id === id)
      if (index > -1) {
        MockData.actions.splice(index, 1)
        return { code: 200, message: '删除成功' }
      }
      return { code: 404, message: '动作不存在' }
    },
    checkin: async (id, data) => {
      await delay()
      const action = MockData.actions.find(a => a.action_id === id)
      if (!action) return { code: 404, message: '动作不存在' }
      
      // 更新统计
      action.exec_count++
      if (data.exec_result === 1) {
        action.success_count++
      } else {
        action.fail_count++
      }
      action.success_rate = Math.round((action.success_count / action.exec_count) * 10000) / 100
      action.last_exec_time = new Date().toISOString().slice(0, 19).replace('T', ' ')
      
      // 添加执行记录
      const record = {
        record_id: MockData.records.length + 1,
        action_id: id,
        exec_result: data.exec_result,
        exec_remark: data.exec_remark,
        exec_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      MockData.records.push(record)
      
      return { 
        code: 200, 
        message: '打卡成功',
        data: {
          record_id: record.record_id,
          action: {
            exec_count: action.exec_count,
            success_count: action.success_count,
            fail_count: action.fail_count,
            success_rate: action.success_rate
          }
        }
      }
    },
    stats: async (id) => {
      await delay()
      const action = MockData.actions.find(a => a.action_id === id)
      if (!action) return { code: 404, message: '动作不存在' }
      return { 
        code: 200, 
        data: {
          exec_count: action.exec_count,
          success_count: action.success_count,
          fail_count: action.fail_count,
          success_rate: action.success_rate,
          last_exec_time: action.last_exec_time
        }
      }
    },
    trend: async (id, params) => {
      await delay()
      // 返回最近30天的趋势数据
      const trend = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        trend.push({
          date: date.toISOString().slice(0, 10),
          exec_count: Math.floor(Math.random() * 3),
          success_count: Math.floor(Math.random() * 2),
          fail_count: Math.floor(Math.random() * 2)
        })
      }
      return { code: 200, data: trend }
    }
  }
  
  // 规律
  laws = {
    list: async (params = {}) => {
      await delay()
      let list = [...MockData.laws]
      if (params.law_type) {
        list = list.filter(l => l.law_type === params.law_type)
      }
      if (params.status !== undefined) {
        list = list.filter(l => l.status === params.status)
      }
      return { code: 200, data: { list, total: list.length } }
    },
    create: async (data) => {
      await delay()
      const newLaw = {
        law_id: MockData.laws.length + 1,
        ...data,
        category_name: MockData.categories.find(c => c.category_id === data.category_id)?.category_name,
        status: 0,
        popup_enabled: data.law_type === 2 ? 1 : 0,
        create_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      MockData.laws.push(newLaw)
      return { code: 200, data: newLaw, message: '创建成功' }
    },
    retire: async (id) => {
      await delay()
      const law = MockData.laws.find(l => l.law_id === id)
      if (law) law.status = 1
      return { code: 200, message: '淘汰成功' }
    },
    checkWarnings: async (params) => {
      await delay()
      const warnings = MockData.laws.filter(l => 
        l.law_type === 2 && l.status === 0 && l.popup_enabled === 1
      ).slice(0, 3)
      return { code: 200, data: warnings }
    }
  }
  
  // 统计
  stats = {
    dashboard: async () => {
      await delay()
      const totalActions = MockData.actions.filter(a => a.status === 0).length
      const totalExecCount = MockData.actions.reduce((sum, a) => sum + a.exec_count, 0)
      const totalSuccessCount = MockData.actions.reduce((sum, a) => sum + a.success_count, 0)
      const avgSuccessRate = totalExecCount > 0 ? Math.round((totalSuccessCount / totalExecCount) * 10000) / 100 : 0
      
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)
      const monthRecords = MockData.records.filter(r => new Date(r.exec_time) >= thisMonth)
      
      const negativeLaws = MockData.laws.filter(l => l.law_type === 2 && l.status === 0).length
      
      const topActions = [...MockData.actions]
        .filter(a => a.status === 0 && a.exec_count > 0)
        .sort((a, b) => b.exec_count - a.exec_count)
        .slice(0, 5)
      
      return {
        code: 200,
        data: {
          total_actions: totalActions,
          avg_success_rate: avgSuccessRate,
          month_exec_count: monthRecords.length,
          negative_law_count: negativeLaws,
          top5_actions: topActions,
          pending_review: { count: 3, last_due: new Date().toISOString().slice(0, 19) }
        }
      }
    },
    ranking: async (params) => {
      await delay()
      const list = [...MockData.actions].filter(a => a.status === 0)
      return { code: 200, data: { list, sort_by: params.sort_by || 'exec_count' } }
    }
  }
  
  // 复盘
  reviews = {
    list: async () => {
      await delay()
      return { code: 200, data: MockData.reviews }
    },
    create: async (data) => {
      await delay()
      const newReview = {
        review_id: MockData.reviews.length + 1,
        ...data,
        snapshot_version: `v${MockData.reviews.length + 1}`,
        has_snapshot: 1,
        create_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      MockData.reviews.push(newReview)
      return { code: 200, data: newReview, message: '创建成功' }
    },
    data: async (id) => {
      await delay()
      const review = MockData.reviews.find(r => r.review_id === id)
      if (!review) return { code: 404, message: '复盘不存在' }
      
      const actions = MockData.actions.filter(a => a.status === 0)
      const laws = MockData.laws.filter(l => l.status === 0)
      const eventStats = {
        total_exec: MockData.records.length,
        total_success: MockData.records.filter(r => r.exec_result === 1).length,
        total_fail: MockData.records.filter(r => r.exec_result === 2).length,
        active_actions: MockData.actions.filter(a => a.exec_count > 0).length
      }
      
      return { code: 200, data: { review, actions, laws, event_stats: eventStats } }
    }
  }
  
  // SOP
  sops = {
    list: async () => {
      await delay()
      return { code: 200, data: { list: MockData.sops, total: MockData.sops.length } }
    },
    detail: async (id) => {
      await delay()
      const sop = MockData.sops.find(s => s.sop_id === id)
      if (!sop) return { code: 404, message: 'SOP不存在' }
      return { code: 200, data: sop }
    },
    create: async (data) => {
      await delay()
      const newSop = {
        sop_id: MockData.sops.length + 1,
        ...data,
        category_name: MockData.categories.find(c => c.category_id === data.category_id)?.category_name,
        is_auto_generated: 0,
        exec_count: 0,
        create_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      MockData.sops.push(newSop)
      return { code: 200, data: newSop, message: '创建成功' }
    }
  }
  
  // 存储
  storage = {
    backup: async () => {
      await delay(500)
      return {
        code: 200,
        message: '备份成功',
        data: {
          backup_id: `backup_${Date.now()}`,
          backup_time: new Date().toISOString(),
          data_count: {
            actions: MockData.actions.length,
            laws: MockData.laws.length,
            events: MockData.records.length
          }
        }
      }
    }
  }
}

export default new MockAPI()
