import api from '@/utils/api.js'

// 24h 去重 + 弹窗确认；命中负向规律时阻塞，调用方在 onContinue 后再正式提交
export default {
  data() {
    return {
      _negativeWarning: { laws: [], pending: null }
    }
  },
  methods: {
    /**
     * 检查并提示。命中后弹 modal，确认才执行回调。
     * @param {number} categoryId
     * @param {Function} onContinue 用户「我已知晓，继续」时调用
     */
    async checkNegativeWarning(categoryId, onContinue) {
      try {
        const res = await api.laws.checkWarnings({ category_id: categoryId })
        const laws = (res && res.data) || []
        if (laws.length === 0) {
          onContinue && onContinue()
          return
        }
        const content = '该分类下有以下负向规律：\n\n' + laws.map(l => `• ${l.description || l.name}`).join('\n')
        uni.showModal({
          title: '避雷提醒',
          content,
          confirmText: '知道了，继续',
          cancelText: '返回修改',
          success: async (mres) => {
            if (mres.confirm) {
              try {
                await api.laws.logWarning({ law_ids: laws.map(l => l.id) })
              } catch (e) {
                // 静默：日志失败不阻断用户
              }
              onContinue && onContinue()
            }
          }
        })
      } catch (e) {
        console.error('避雷检测失败', e)
        onContinue && onContinue()
      }
    }
  }
}
