import { PRIVACY_KEYS, hashPin, generateSalt } from './privacy-core'

const PRIVACY_EVENT = 'privacy-changed'

export function getLockEnabled() {
  return localStorage.getItem(PRIVACY_KEYS.lockEnabled) === 'true'
}

export function getSensitiveHidden() {
  return localStorage.getItem(PRIVACY_KEYS.sensitiveHidden) === 'true'
}

export function getLockState() {
  const failed = Number(localStorage.getItem(PRIVACY_KEYS.lockFailedCount) || 0)
  const until = Number(localStorage.getItem(PRIVACY_KEYS.lockedUntil) || 0)
  return { failed, until }
}

export async function verifyPin(pin) {
  const salt = localStorage.getItem(PRIVACY_KEYS.lockSalt) || ''
  const expected = localStorage.getItem(PRIVACY_KEYS.lockHash) || ''
  const actual = hashPin(pin, salt)
  return actual === expected
}

export async function setPin(pin) {
  const salt = generateSalt()
  const hash = hashPin(pin, salt)
  localStorage.setItem(PRIVACY_KEYS.lockSalt, salt)
  localStorage.setItem(PRIVACY_KEYS.lockHash, hash)
  localStorage.setItem(PRIVACY_KEYS.lockEnabled, 'true')
  localStorage.setItem(PRIVACY_KEYS.lockFailedCount, '0')
  localStorage.removeItem(PRIVACY_KEYS.lockedUntil)
  emitChange()
}

export function clearPin() {
  localStorage.removeItem(PRIVACY_KEYS.lockHash)
  localStorage.removeItem(PRIVACY_KEYS.lockSalt)
  localStorage.removeItem(PRIVACY_KEYS.lockFailedCount)
  localStorage.removeItem(PRIVACY_KEYS.lockedUntil)
  localStorage.setItem(PRIVACY_KEYS.lockEnabled, 'false')
  emitChange()
}

export function setSensitiveHidden(value) {
  localStorage.setItem(PRIVACY_KEYS.sensitiveHidden, value ? 'true' : 'false')
  emitChange()
}

export function bumpFailedCount() {
  const cnt = Number(localStorage.getItem(PRIVACY_KEYS.lockFailedCount) || 0) + 1
  localStorage.setItem(PRIVACY_KEYS.lockFailedCount, String(cnt))
  if (cnt >= 5) {
    const until = Date.now() + 60_000
    localStorage.setItem(PRIVACY_KEYS.lockedUntil, String(until))
    return { count: cnt, until }
  }
  return { count: cnt, until: 0 }
}

export function resetFailedCount() {
  localStorage.setItem(PRIVACY_KEYS.lockFailedCount, '0')
  localStorage.removeItem(PRIVACY_KEYS.lockedUntil)
}

export function clearAllAppData() {
  localStorage.clear()
  sessionStorage.clear()
  emitChange()
}

export function onPrivacyChange(handler) {
  window.addEventListener(PRIVACY_EVENT, handler)
  return () => window.removeEventListener(PRIVACY_EVENT, handler)
}

function emitChange() {
  window.dispatchEvent(new Event(PRIVACY_EVENT))
}
