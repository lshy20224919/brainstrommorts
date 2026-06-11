import { useState, useEffect } from 'react'
import { getSensitiveHidden } from '../utils/privacy'

export function useSensitivePrivacy() {
  const [hidden, setHidden] = useState(getSensitiveHidden())
  const [revealed, setRevealed] = useState(() => new Set())

  useEffect(() => {
    const handler = () => setHidden(getSensitiveHidden())
    window.addEventListener('privacy-changed', handler)
    return () => window.removeEventListener('privacy-changed', handler)
  }, [])

  const reveal = (id) => setRevealed(prev => {
    const next = new Set(prev)
    next.add(id)
    return next
  })
  const isHidden = (id) => hidden && !revealed.has(id)

  return { isHidden, reveal, hidden }
}
