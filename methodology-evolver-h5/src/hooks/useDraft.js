import { useState, useEffect, useRef, useCallback } from 'react'

export function useDraft(key, defaultValue) {
  const [value, setValue] = useState(() => {
    if (!key) return defaultValue
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch { return defaultValue }
  })

  const timerRef = useRef(null)

  const setDraft = useCallback((updater) => {
    setValue(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (key) {
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
        }, 500)
      }
      return next
    })
  }, [key])

  const clearDraft = useCallback(() => {
    if (key) {
      localStorage.removeItem(key)
      setValue(defaultValue)
    }
  }, [key, defaultValue])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return [value, setDraft, clearDraft]
}
