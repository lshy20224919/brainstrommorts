import { PRIVACY_KEYS, hashPin, generateSalt } from './privacy-core.js'

const PRIVACY_EVENT = 'privacy-changed'

function readBool(key) {
  try {
    const v = uni.getStorageSync(key)
    return v === true || v === 'true'
  } catch (e) { return false }
}

export function getLockEnabled() { return readBool(PRIVACY_KEYS.lockEnabled) }
export function getSensitiveHidden() { return readBool(PRIVACY_KEYS.sensitiveHidden) }

export function getLockState() {
  const failed = Number(uni.getStorageSync(PRIVACY_KEYS.lockFailedCount) || 0)
  const until = Number(uni.getStorageSync(PRIVACY_KEYS.lockedUntil) || 0)
  return { failed, until }
}

export function verifyPin(pin) {
  const salt = uni.getStorageSync(PRIVACY_KEYS.lockSalt) || ''
  const expected = uni.getStorageSync(PRIVACY_KEYS.lockHash) || ''
  const actual = hashPin(pin, salt)
  return actual === expected
}

export function setPin(pin) {
  const salt = generateSalt()
  const hash = hashPin(pin, salt)
  uni.setStorageSync(PRIVACY_KEYS.lockSalt, salt)
  uni.setStorageSync(PRIVACY_KEYS.lockHash, hash)
  uni.setStorageSync(PRIVACY_KEYS.lockEnabled, true)
  uni.setStorageSync(PRIVACY_KEYS.lockFailedCount, 0)
  uni.removeStorageSync(PRIVACY_KEYS.lockedUntil)
  emitChange()
}

export function clearPin() {
  uni.removeStorageSync(PRIVACY_KEYS.lockHash)
  uni.removeStorageSync(PRIVACY_KEYS.lockSalt)
  uni.removeStorageSync(PRIVACY_KEYS.lockFailedCount)
  uni.removeStorageSync(PRIVACY_KEYS.lockedUntil)
  uni.setStorageSync(PRIVACY_KEYS.lockEnabled, false)
  emitChange()
}

export function setSensitiveHidden(value) {
  uni.setStorageSync(PRIVACY_KEYS.sensitiveHidden, !!value)
  emitChange()
}

export function bumpFailedCount() {
  const cnt = Number(uni.getStorageSync(PRIVACY_KEYS.lockFailedCount) || 0) + 1
  uni.setStorageSync(PRIVACY_KEYS.lockFailedCount, cnt)
  if (cnt >= 5) {
    const until = Date.now() + 60_000
    uni.setStorageSync(PRIVACY_KEYS.lockedUntil, until)
    return { count: cnt, until }
  }
  return { count: cnt, until: 0 }
}

export function resetFailedCount() {
  uni.setStorageSync(PRIVACY_KEYS.lockFailedCount, 0)
  uni.removeStorageSync(PRIVACY_KEYS.lockedUntil)
}

export function clearAllAppData() {
  try { uni.clearStorageSync() } catch (e) {}
  emitChange()
}

export function onPrivacyChange(handler) {
  uni.$on(PRIVACY_EVENT, handler)
  return () => uni.$off(PRIVACY_EVENT, handler)
}

function emitChange() {
  uni.$emit(PRIVACY_EVENT)
}
