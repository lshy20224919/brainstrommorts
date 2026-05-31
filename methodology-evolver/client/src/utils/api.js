// API 工具类 - Mock模式
// USE_MOCK=true 时使用本地Mock数据

const USE_MOCK = true

// 动态导入Mock
let MockAPI = null
const getMock = async () => {
  if (!MockAPI) {
    const module = await import('./mock.js')
    MockAPI = module.mockApi
  }
  return MockAPI
}

// 真实API请求（Mock模式下不启用）
const request = async (options) => {
  const token = uni.getStorageSync('token')
  const header = {
    'Content-Type': 'application/json',
    ...options.header
  }
  if (token) header['Authorization'] = `Bearer ${token}`
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: `http://localhost:3000/api${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve(res.data)
        } else {
          reject(res.data)
        }
      },
      fail: reject
    })
  })
}

// API服务
const api = {
  auth: {
    login: (code) => request({ url: '/auth/login', method: 'POST', data: { code } }),
    check: () => request({ url: '/auth/check' }),
    getSettings: () => request({ url: '/auth/settings' }),
    updateSettings: (data) => request({ url: '/auth/settings', method: 'PUT', data })
  },
  categories: {
    list: () => request({ url: '/categories' }),
    create: (data) => request({ url: '/categories', method: 'POST', data }),
    update: (id, data) => request({ url: `/categories/${id}`, method: 'PUT', data }),
    delete: (id) => request({ url: `/categories/${id}`, method: 'DELETE' })
  },
  actions: {
    list: (params) => request({ url: '/actions', data: params }),
    detail: (id) => request({ url: `/actions/${id}` }),
    create: (data) => request({ url: '/actions', method: 'POST', data }),
    update: (id, data) => request({ url: `/actions/${id}`, method: 'PUT', data }),
    archive: (id) => request({ url: `/actions/${id}/archive`, method: 'PUT' }),
    delete: (id) => request({ url: `/actions/${id}`, method: 'DELETE' }),
    checkin: (id, data) => request({ url: `/actions/${id}/checkin`, method: 'POST', data }),
    stats: (id) => request({ url: `/actions/${id}/stats` }),
    trend: (id, params) => request({ url: `/actions/${id}/trend`, data: params })
  },
  events: {
    list: (params) => request({ url: '/events', data: params }),
    detail: (id) => request({ url: `/events/${id}` }),
    create: (data) => request({ url: '/events', method: 'POST', data }),
    delete: (id) => request({ url: `/events/${id}`, method: 'DELETE' })
  },
  laws: {
    list: (params) => request({ url: '/laws', data: params }),
    detail: (id) => request({ url: `/laws/${id}` }),
    create: (data) => request({ url: '/laws', method: 'POST', data }),
    update: (id, data) => request({ url: `/laws/${id}`, method: 'PUT', data }),
    retire: (id) => request({ url: `/laws/${id}/retire`, method: 'PUT' }),
    delete: (id) => request({ url: `/laws/${id}`, method: 'DELETE' }),
    checkWarnings: (params) => request({ url: '/laws/warnings/check', data: params }),
    logWarning: (data) => request({ url: '/laws/warnings/log', method: 'POST', data })
  },
  mistakes: {
    list: (params) => request({ url: '/mistakes', data: params }),
    detail: (id) => request({ url: `/mistakes/${id}` }),
    create: (data) => request({ url: '/mistakes', method: 'POST', data }),
    update: (id, data) => request({ url: `/mistakes/${id}`, method: 'PUT', data }),
    delete: (id) => request({ url: `/mistakes/${id}`, method: 'DELETE' })
  },
  stats: {
    dashboard: () => request({ url: '/stats/dashboard' }),
    ranking: (params) => request({ url: '/stats/ranking', data: params }),
    todos: () => request({ url: '/stats/todos' }),
    dismissTodo: (data) => request({ url: '/stats/todos/dismiss', method: 'POST', data })
  },
  migrate: {
    recommend: (params) => request({ url: '/migrate/recommend', data: params }),
    execute: (data) => request({ url: '/migrate', method: 'POST', data }),
    logs: (params) => request({ url: '/migrate/logs', data: params })
  },
  reviews: {
    list: () => request({ url: '/reviews' }),
    data: (id) => request({ url: `/reviews/${id}/data` }),
    create: (data) => request({ url: '/reviews', method: 'POST', data }),
    snapshot: (id) => request({ url: `/reviews/${id}/snapshot` }),
    iterateAction: (id, data) => request({ url: `/reviews/iterate/action/${id}`, method: 'PUT', data }),
    iterateLaw: (id, data) => request({ url: `/reviews/iterate/law/${id}`, method: 'PUT', data })
  },
  sops: {
    list: (params) => request({ url: '/sops', data: params }),
    detail: (id) => request({ url: `/sops/${id}` }),
    create: (data) => request({ url: '/sops', method: 'POST', data }),
    update: (id, data) => request({ url: `/sops/${id}`, method: 'PUT', data }),
    delete: (id) => request({ url: `/sops/${id}`, method: 'DELETE' }),
    execute: (id, data) => request({ url: `/sops/${id}/execute`, method: 'POST', data })
  },
  inspirations: {
    list: (params) => request({ url: '/inspirations', data: params }),
    create: (data) => request({ url: '/inspirations', method: 'POST', data }),
    update: (id, data) => request({ url: `/inspirations/${id}`, method: 'PUT', data }),
    delete: (id) => request({ url: `/inspirations/${id}`, method: 'DELETE' }),
    convert: (id, data) => request({ url: `/inspirations/${id}/convert`, method: 'POST', data })
  },
  storage: {
    backup: () => request({ url: '/storage/backup', method: 'POST' }),
    restore: (data) => request({ url: '/storage/restore', method: 'POST', data })
  }
}

// Mock代理
const mockProxy = new Proxy({}, {
  get: (_, ns) => new Proxy({}, {
    get: (_, method) => async (...args) => {
      const Mock = await getMock()
      if (typeof Mock[ns]?.[method] === 'function') {
        return Mock[ns][method](...args)
      }
      throw new Error(`Mock not found: ${ns}.${method}`)
    }
  })
})

export default USE_MOCK ? mockProxy : api
