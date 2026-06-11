export const DRAFT_KEYS = [
  { key: 'draft_action', label: '正确的事', route: '/pages/card/create?type=action' },
  { key: 'draft_mistake', label: '错误的事', route: '/pages/mistake/create' },
  { key: 'draft_law', label: '规律', route: '/pages/law/create?type=positive' },
  { key: 'draft_inspiration', label: '灵感', route: '/pages/inspiration/create' }
]

export function scanDrafts() {
  const out = []
  for (const item of DRAFT_KEYS) {
    try {
      const v = uni.getStorageSync(item.key)
      if (v) out.push(item)
    } catch (e) {}
  }
  return out
}

export function clearDrafts() {
  for (const { key } of DRAFT_KEYS) {
    try { uni.removeStorageSync(key) } catch (e) {}
  }
}

export function buildDraftTodo() {
  const drafts = scanDrafts()
  if (drafts.length === 0) return null
  return {
    key: 'draft',
    type: 'draft',
    drafts,
    count: drafts.length
  }
}

export default { DRAFT_KEYS, scanDrafts, clearDrafts, buildDraftTodo }
