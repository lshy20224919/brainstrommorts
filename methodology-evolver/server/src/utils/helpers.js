// 统一响应格式
function formatResponse(data = null, message = 'success') {
  return {
    code: 200,
    message,
    data
  };
}

// 错误响应
function errorResponse(res, statusCode, message) {
  return res.status(statusCode).json({
    code: statusCode,
    message,
    data: null
  });
}

// 计算成功率
function calculateSuccessRate(successCount, failCount) {
  const total = successCount + failCount;
  if (total === 0) return null;
  return Math.round((successCount / total) * 10000) / 100; // 保留2位小数
}

// 日期格式化
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// 获取今天日期（用于弹窗冷却计算）
function getTodayDate() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

module.exports = {
  formatResponse,
  errorResponse,
  calculateSuccessRate,
  formatDate,
  getTodayDate
};
