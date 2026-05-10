const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, errorResponse } = require('../utils/helpers');

router.use(authMiddleware);

// ============================================================
// 事件相关
// ============================================================

// 获取事件列表
router.get('/', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { category_id, action_id, start_time, end_time, page = 1, page_size = 20 } = req.query;

    let whereClause = 'WHERE e.user_id = ?';
    const params = [userId];

    if (category_id) {
      whereClause += ' AND e.category_id = ?';
      params.push(category_id);
    }

    if (action_id) {
      whereClause += ' AND e.action_id = ?';
      params.push(action_id);
    }

    if (start_time) {
      whereClause += ' AND e.create_time >= ?';
      params.push(start_time);
    }

    if (end_time) {
      whereClause += ' AND e.create_time <= ?';
      params.push(end_time);
    }

    const offset = (parseInt(page) - 1) * parseInt(page_size);

    const [list] = await pool.query(
      `SELECT e.*, a.action_name, c.category_name
       FROM event_raw e
       LEFT JOIN action_right a ON e.action_id = a.action_id
       LEFT JOIN category c ON e.category_id = c.category_id
       ${whereClause}
       ORDER BY e.create_time DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(page_size), offset]
    );

    const [total] = await pool.query(
      `SELECT COUNT(*) as count FROM event_raw e ${whereClause}`,
      params
    );

    return res.json(formatResponse({
      list,
      total: total[0].count,
      page: parseInt(page),
      page_size: parseInt(page_size)
    }));
  } catch (error) {
    console.error('获取事件列表错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 获取事件详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [events] = await pool.query(
      `SELECT e.*, a.action_name, c.category_name
       FROM event_raw e
       LEFT JOIN action_right a ON e.action_id = a.action_id
       LEFT JOIN category c ON e.category_id = c.category_id
       WHERE e.event_id = ? AND e.user_id = ?`,
      [id, userId]
    );

    if (events.length === 0) {
      return errorResponse(res, 404, '事件不存在');
    }

    return res.json(formatResponse(events[0]));
  } catch (error) {
    console.error('获取事件详情错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 创建事件（可选层）
router.post('/', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { action_id, category_id, event_desc, emotion_state, remark } = req.body;

    if (!event_desc || event_desc.trim().length === 0) {
      return errorResponse(res, 400, '事件描述不能为空');
    }

    if (event_desc.length > 500) {
      return errorResponse(res, 400, '事件描述不能超过500字符');
    }

    // 如果有action_id，验证并获取category_id
    let finalCategoryId = category_id;
    if (action_id) {
      const [actions] = await pool.query(
        'SELECT * FROM action_right WHERE action_id = ? AND user_id = ?',
        [action_id, userId]
      );
      if (actions.length === 0) {
        return errorResponse(res, 400, '动作不存在');
      }
      finalCategoryId = actions[0].category_id;
    }

    if (!finalCategoryId) {
      return errorResponse(res, 400, '请选择分类或关联动作');
    }

    const [result] = await pool.query(
      `INSERT INTO event_raw 
       (user_id, action_id, category_id, event_desc, emotion_state, remark) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, action_id || null, finalCategoryId, event_desc.trim(), emotion_state || null, remark?.trim() || null]
    );

    return res.json(formatResponse({
      event_id: result.insertId,
      event_desc: event_desc.trim(),
      category_id: finalCategoryId,
      emotion_state,
      remark: remark?.trim() || null
    }, '事件创建成功'));
  } catch (error) {
    console.error('创建事件错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 删除事件
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [events] = await pool.query(
      'SELECT * FROM event_raw WHERE event_id = ? AND user_id = ?',
      [id, userId]
    );

    if (events.length === 0) {
      return errorResponse(res, 404, '事件不存在');
    }

    // 检查是否有关联的执行记录
    const [records] = await pool.query(
      'SELECT COUNT(*) as count FROM action_record WHERE event_id = ? AND user_id = ?',
      [id, userId]
    );

    if (records[0].count > 0) {
      return errorResponse(res, 400, '该事件有关联的执行记录，无法删除');
    }

    await pool.query(
      'DELETE FROM event_raw WHERE event_id = ? AND user_id = ?',
      [id, userId]
    );

    return res.json(formatResponse(null, '删除成功'));
  } catch (error) {
    console.error('删除事件错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

module.exports = router;
