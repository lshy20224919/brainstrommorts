const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, errorResponse } = require('../utils/helpers');

router.use(authMiddleware);

// ============================================================
// 复盘相关
// ============================================================

// 获取复盘历史列表
router.get('/', async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [reviews] = await pool.query(
      `SELECT review_id, review_cycle, start_time, end_time, snapshot_version, has_snapshot, create_time
       FROM review
       WHERE user_id = ?
       ORDER BY create_time DESC`,
      [userId]
    );

    return res.json(formatResponse(reviews));
  } catch (error) {
    console.error('获取复盘历史错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 获取复盘数据（自动拉取周期内数据）
router.get('/:id/data', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [reviews] = await pool.query(
      'SELECT * FROM review WHERE review_id = ? AND user_id = ?',
      [id, userId]
    );

    if (reviews.length === 0) {
      return errorResponse(res, 404, '复盘不存在');
    }

    const review = reviews[0];

    // 拉取周期内动作数据
    const [actions] = await pool.query(
      `SELECT a.*, c.category_name
       FROM action_right a
       LEFT JOIN category c ON a.category_id = c.category_id
       WHERE a.user_id = ?
         AND a.status = 0
         AND a.update_time >= ?
         AND a.update_time <= ?`,
      [userId, review.start_time, review.end_time]
    );

    // 拉取周期内规律数据
    const [laws] = await pool.query(
      `SELECT l.*, c.category_name
       FROM law l
       LEFT JOIN category c ON l.category_id = c.category_id
       WHERE l.user_id = ?
         AND l.status = 0
         AND l.create_time >= ?
         AND l.create_time <= ?`,
      [userId, review.start_time, review.end_time]
    );

    // 拉取周期内执行统计
    const [eventStats] = await pool.query(
      `SELECT 
         COUNT(*) as total_exec,
         SUM(CASE WHEN exec_result = 1 THEN 1 ELSE 0 END) as total_success,
         SUM(CASE WHEN exec_result = 2 THEN 1 ELSE 0 END) as total_fail,
         COUNT(DISTINCT action_id) as active_actions
       FROM action_record
       WHERE user_id = ?
         AND exec_time >= ?
         AND exec_time <= ?`,
      [userId, review.start_time, review.end_time]
    );

    return res.json(formatResponse({
      review,
      actions,
      laws,
      event_stats: eventStats[0]
    }));
  } catch (error) {
    console.error('获取复盘数据错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 创建复盘
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.user_id;
    const { review_cycle, start_time, end_time, review_summary } = req.body;

    if (!review_cycle || !start_time || !end_time) {
      await connection.rollback();
      return errorResponse(res, 400, '缺少必要参数');
    }

    // 获取当前最大版本号
    const [maxVersion] = await connection.query(
      `SELECT COALESCE(MAX(snapshot_version), 'v0') as max_version 
       FROM review WHERE user_id = ?`,
      [userId]
    );

    const currentVersion = maxVersion[0].max_version;
    const versionParts = currentVersion.match(/v(\d+)/);
    const nextVersion = versionParts ? `v${parseInt(versionParts[1]) + 1}` : 'v1';

    // 拉取快照数据
    const [snapshotActions] = await connection.query(
      `SELECT action_id, action_name, category_id, subjective_weight, 
              exec_count, success_count, fail_count, success_rate, status, pinned
       FROM action_right WHERE user_id = ?`,
      [userId]
    );

    const [snapshotLaws] = await connection.query(
      `SELECT law_id, law_type, law_desc, category_id, related_action_id, status
       FROM law WHERE user_id = ?`,
      [userId]
    );

    const snapshotData = {
      actions: snapshotActions,
      laws: snapshotLaws,
      generated_at: new Date().toISOString()
    };

    // 创建复盘记录
    const [result] = await connection.query(
      `INSERT INTO review 
       (user_id, review_cycle, start_time, end_time, review_summary, snapshot_version, snapshot_data, has_snapshot) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [userId, review_cycle, start_time, end_time, review_summary || null, nextVersion, JSON.stringify(snapshotData)]
    );

    await connection.commit();

    return res.json(formatResponse({
      review_id: result.insertId,
      snapshot_version: nextVersion,
      has_snapshot: 1
    }, '复盘创建成功'));
  } catch (error) {
    await connection.rollback();
    console.error('创建复盘错误:', error);
    return errorResponse(res, 500, '服务器错误');
  } finally {
    connection.release();
  }
});

// 获取复盘快照
router.get('/:id/snapshot', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [reviews] = await pool.query(
      'SELECT snapshot_data, snapshot_version, review_cycle, start_time, end_time, create_time FROM review WHERE review_id = ? AND user_id = ?',
      [id, userId]
    );

    if (reviews.length === 0) {
      return errorResponse(res, 404, '复盘不存在');
    }

    return res.json(formatResponse(reviews[0]));
  } catch (error) {
    console.error('获取复盘快照错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// ============================================================
// 迭代操作（复盘时对动作/规律进行操作）
// ============================================================

// 动作迭代操作
router.put('/iterate/action/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const userId = req.user.user_id;
    const { review_id, iteration_type, iteration_remark } = req.body;

    if (!review_id || !iteration_type) {
      await connection.rollback();
      return errorResponse(res, 400, '缺少必要参数');
    }

    if (!['固化', '优化', '降级', '淘汰'].includes(iteration_type)) {
      await connection.rollback();
      return errorResponse(res, 400, '迭代类型错误');
    }

    // 获取当前动作状态
    const [actions] = await connection.query(
      'SELECT * FROM action_right WHERE action_id = ? AND user_id = ?',
      [id, userId]
    );

    if (actions.length === 0) {
      await connection.rollback();
      return errorResponse(res, 404, '动作不存在');
    }

    const beforeStatus = actions[0].status;
    const beforePinned = actions[0].pinned;

    let newStatus = beforeStatus;
    let newPinned = beforePinned;

    // 根据迭代类型更新状态
    switch (iteration_type) {
      case '固化':
        newStatus = 0;
        newPinned = 1;
        break;
      case '优化':
        // 优化保留原数据，生成新版本记录（已在review_action_log中）
        newStatus = 0;
        newPinned = beforePinned;
        break;
      case '降级':
        newStatus = 0;
        newPinned = 0;
        break;
      case '淘汰':
        newStatus = 2;
        newPinned = 0;
        break;
    }

    // 更新动作状态
    await connection.query(
      'UPDATE action_right SET status = ?, pinned = ?, update_time = NOW() WHERE action_id = ?',
      [newStatus, newPinned, id]
    );

    // 记录迭代日志
    await connection.query(
      `INSERT INTO review_action_log 
       (review_id, card_id, card_type, before_status, after_status, iteration_type, iteration_remark) 
       VALUES (?, ?, 'action', ?, ?, ?, ?)`,
      [review_id, id, beforeStatus, newStatus, iteration_type, iteration_remark || null]
    );

    await connection.commit();

    return res.json(formatResponse({
      action_id: id,
      before_status: beforeStatus,
      after_status: newStatus,
      iteration_type
    }, '迭代成功'));
  } catch (error) {
    await connection.rollback();
    console.error('迭代操作错误:', error);
    return errorResponse(res, 500, '服务器错误');
  } finally {
    connection.release();
  }
});

// 规律迭代操作
router.put('/iterate/law/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const userId = req.user.user_id;
    const { review_id, iteration_type, iteration_remark } = req.body;

    if (!review_id || !iteration_type) {
      await connection.rollback();
      return errorResponse(res, 400, '缺少必要参数');
    }

    const [laws] = await connection.query(
      'SELECT * FROM law WHERE law_id = ? AND user_id = ?',
      [id, userId]
    );

    if (laws.length === 0) {
      await connection.rollback();
      return errorResponse(res, 404, '规律不存在');
    }

    const beforeStatus = laws[0].status;
    const newStatus = iteration_type === '淘汰' ? 1 : beforeStatus;

    await connection.query(
      'UPDATE law SET status = ?, update_time = NOW() WHERE law_id = ?',
      [newStatus, id]
    );

    await connection.query(
      `INSERT INTO review_action_log 
       (review_id, card_id, card_type, before_status, after_status, iteration_type, iteration_remark) 
       VALUES (?, ?, 'law', ?, ?, ?, ?)`,
      [review_id, id, beforeStatus, newStatus, iteration_type, iteration_remark || null]
    );

    await connection.commit();

    return res.json(formatResponse({
      law_id: id,
      before_status: beforeStatus,
      after_status: newStatus,
      iteration_type
    }, '迭代成功'));
  } catch (error) {
    await connection.rollback();
    console.error('规律迭代错误:', error);
    return errorResponse(res, 500, '服务器错误');
  } finally {
    connection.release();
  }
});

module.exports = router;
