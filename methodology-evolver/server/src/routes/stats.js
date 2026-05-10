const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, errorResponse } = require('../utils/helpers');

router.use(authMiddleware);

// ============================================================
// 统计相关
// ============================================================

// 首页数据看板
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.user_id;

    // 获取本月开始时间
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // 1. 总动作数、平均成功率、本月执行次数、负向规律数
    const [stats] = await pool.query(
      `SELECT 
         (SELECT COUNT(*) FROM action_right WHERE user_id = ? AND status = 0) as total_actions,
         (SELECT ROUND(AVG(success_rate), 2) FROM action_right 
          WHERE user_id = ? AND status = 0 AND success_rate IS NOT NULL) as avg_success_rate,
         (SELECT COUNT(*) FROM action_record 
          WHERE user_id = ? AND exec_time >= ?) as month_exec_count,
         (SELECT COUNT(*) FROM law WHERE user_id = ? AND law_type = 2 AND status = 0) as negative_law_count`,
      [userId, userId, userId, monthStart, userId]
    );

    // 2. Top5高频动作
    const [topActions] = await pool.query(
      `SELECT action_id, action_name, category_name, exec_count, success_rate
       FROM action_right a
       LEFT JOIN category c ON a.category_id = c.category_id
       WHERE a.user_id = ? AND a.status = 0 AND a.exec_count > 0
       ORDER BY a.exec_count DESC
       LIMIT 5`,
      [userId]
    );

    // 3. 待复盘提醒
    const [pendingReview] = await pool.query(
      `SELECT 
         (SELECT COUNT(*) FROM action_right WHERE user_id = ? AND status = 0 AND exec_count > 0) as pending_count,
         (SELECT MAX(last_exec_time) FROM action_right WHERE user_id = ? AND status = 0) as last_action_time`,
      [userId, userId]
    );

    return res.json(formatResponse({
      total_actions: stats[0].total_actions || 0,
      avg_success_rate: stats[0].avg_success_rate || null,
      month_exec_count: stats[0].month_exec_count || 0,
      negative_law_count: stats[0].negative_law_count || 0,
      top5_actions: topActions,
      pending_review: {
        count: pendingReview[0].pending_count || 0,
        last_due: pendingReview[0].last_action_time
      }
    }));
  } catch (error) {
    console.error('获取看板数据错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 多维榜单
router.get('/ranking', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { sort_by = 'exec_count', limit = 10 } = req.query;

    let orderClause = 'ORDER BY ';
    switch (sort_by) {
      case 'success_rate':
        orderClause += 'success_rate DESC';
        break;
      case 'weight':
        orderClause += 'subjective_weight DESC';
        break;
      case 'exec_count':
      default:
        orderClause += 'exec_count DESC';
    }

    const [ranking] = await pool.query(
      `SELECT a.action_id, a.action_name, c.category_name,
              a.subjective_weight, a.exec_count, a.success_count, 
              a.fail_count, a.success_rate, a.pinned
       FROM action_right a
       LEFT JOIN category c ON a.category_id = c.category_id
       WHERE a.user_id = ? AND a.status = 0
       ${orderClause}
       LIMIT ?`,
      [userId, parseInt(limit)]
    );

    return res.json(formatResponse({
      list: ranking,
      sort_by
    }));
  } catch (error) {
    console.error('获取榜单错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

module.exports = router;
