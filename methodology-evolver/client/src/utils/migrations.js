const MIGRATION_KEY = 'mock_migrations_applied'

function getApplied() {
  try {
    return uni.getStorageSync(MIGRATION_KEY) || {}
  } catch (e) {
    return {}
  }
}

function setApplied(map) {
  try {
    uni.setStorageSync(MIGRATION_KEY, map)
  } catch (e) {}
}

export function migrateInspirationsV2(mockDB) {
  const applied = getApplied()
  if (applied.inspirations_v2) return 0
  if (!mockDB || !Array.isArray(mockDB.inspirations)) {
    applied.inspirations_v2 = true
    setApplied(applied)
    return 0
  }
  let touched = 0
  for (const item of mockDB.inspirations) {
    if (!item.direction) {
      item.direction = 'positive'
      item._direction_inferred = true
      touched += 1
    }
  }
  applied.inspirations_v2 = true
  setApplied(applied)
  return touched
}

export default {
  run(mockDB) {
    return {
      inspirationsV2: migrateInspirationsV2(mockDB)
    }
  }
}
