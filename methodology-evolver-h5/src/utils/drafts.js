export const DRAFT_KEYS = [
  { key: 'draft_create_action', label: '正确的事' },
  { key: 'draft_create_mistake', label: '错误的事' },
  { key: 'draft_create_law', label: '规律' },
  { key: 'draft_create_inspiration', label: '灵感' }
]

// storage: 形如 localStorage（H5）或一个有 getItem/removeItem 的适配器
export function scanDrafts(storage) {
  return DRAFT_KEYS.filter(({ key }) => {
    try {
      const v = storage.getItem ? storage.getItem(key) : storage[key]
      return !!v
    } catch (e) { return false }
  })
}

export function clearDrafts(storage) {
  for (const { key } of DRAFT_KEYS) {
    try {
      if (storage.removeItem) storage.removeItem(key)
      else delete storage[key]
    } catch (e) {}
  }
}

export function buildDraftTodo(storage) {
  const drafts = scanDrafts(storage)
  if (drafts.length === 0) return null
  return {
    key: 'draft',
    type: 'draft',
    drafts,
    count: drafts.length
  }
}
