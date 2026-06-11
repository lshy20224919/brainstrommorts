import { PRIVACY_KEYS } from '@/utils/privacy-core.js'

export default {
  data() {
    return {
      _privacyHidden: false,
      _privacyRevealed: {}
    }
  },
  onLoad() {
    this._privacyHidden = uni.getStorageSync(PRIVACY_KEYS.sensitiveHidden) === true
    this._onPrivacyChanged = () => {
      this._privacyHidden = uni.getStorageSync(PRIVACY_KEYS.sensitiveHidden) === true
    }
    uni.$on('privacy-changed', this._onPrivacyChanged)
  },
  onUnload() {
    if (this._onPrivacyChanged) uni.$off('privacy-changed', this._onPrivacyChanged)
  },
  methods: {
    isSensitiveHidden(id) {
      return this._privacyHidden && !this._privacyRevealed[id]
    },
    revealSensitive(id) {
      this.$set(this._privacyRevealed, id, true)
    }
  }
}
