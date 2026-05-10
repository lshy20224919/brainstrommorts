const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, errorResponse } = require('../utils/helpers');

// 所有路由需要登录
router.use(authMiddleware);

// ============================================================
// 动作相关
// ============================================================

// 获取动作列表
router.get('/', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { category_id, status, sort_by = 'exec_count', page = 1, page_size = 20 } = req.query;

    let whereClause = 'WHERE a.user_id = ?';
    const params = [userId];

    if (category_id) {
      whereClause += ' AND a.category_id = ?';
      params.push(category_id);
    }

    if (status !== undefined) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    // 排序
    let orderClause = 'ORDER BY ';
    switch (sort_by) {
      case 'success_rate':
        orderClause += 'a.success_rate DESC NULLS LAST';
        break;
      case 'weight':
        orderClause += 'a.subjective_weight DESC';
        break;
      case 'exec_count':
      default:
        orderClause += 'a.exec_count DESC';
    }

    // 分页
    const offset = (parseInt(page) - 1) * parseInt(page_size);

    const [list] = await pool.query(
      `SELECT a.action_id, a.action_name, a.category_id, c.category_name,
              a.subjective_weight, a.exec_count, a.success_count, a.fail_count,
              a.success_rate, a.related_tags, a.status, a.pinned, 
              a.last_exec_time, a.create_time
       FROM action_right a
       LEFT JOIN category c ON a.category_id = c.category_id
       ${whereClause}
       ${orderClause}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(page_size), offset]
    );

    // 获取总数
    const [total] = await pool.query(
      `SELECT COUNT(*) as count FROM action_right a ${whereClause}`,
      params
    );

    return res.json(formatResponse({
      list,
      total: total[0].count,
      page: parseInt(page),
      page_size: parseInt(page_size)
    }));
  } catch (error) {
    console.error('获取动作列表错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 获取动作详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [actions] = await pool.query(
      `SELECT a.*, c.category_name
       FROM action_right a
       LEFT JOIN category c ON a.category_id = c.category_id
       WHERE a.action_id = ? AND a.user_id = ?`,
      [id, userId]
    );

    if (actions.length === 0) {
      return errorResponse(res, 404, '动作不存在');
    }

    // 获取执行记录
    const [records] = await pool.query(
      `SELECT record_id, exec_result, exec_remark, exec_time, create_time
       FROM action_record
       WHERE action_id = ? AND user_id = ?
       ORDER BY exec_time DESC
       LIMIT 50`,
      [id, userId]
    );

    // 获取关联规律
    const [laws] = await pool.query(
      `SELECT law_id, law_type, law_desc, status
       FROM law
       WHERE related_action_id = ? AND user_id = ? AND status = 0
       ORDER BY create_time DESC`,
      [id, userId]
    );

    return res.json(formatResponse({
      ...actions[0],
      records,
      related_laws: laws
    }));
  } catch (error) {
    console.error('获取动作详情错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 创建动作（直接新建，不从事件提炼）
router.post('/', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { action_name, category_id, subjective_weight = 5.0, remark, related_tags } = req.body;

    // 校验
    if (!action_name || action_name.trim().length === 0) {
      return errorResponse(res, 400, '动作名称不能为空');
    }

    if (action_name.length > 30) {
      return errorResponse(res, 400, '动作名称不能超过30字符');
    }

    if (!category_id) {
      return errorResponse(res, 400, '请选择分类');
    }

    // 验证分类存在
    const [categories] = await pool.query(
      'SELECT * FROM category WHERE category_id = ? AND user_id = ?',
      [category_id, userId]
    );

    if (categories.length === 0) {
      return errorResponse(res, 400, '分类不存在');
    }

    // 创建动作
    const [result] = await pool.query(
      `INSERT INTO action_right 
       (user_id, category_id, action_name, subjective_weight, related_tags, status) 
       VALUES (?, ?, ?, ?, ?, 0)`,
      [userId, category_id, action_name.trim(), subjective_weight, 
       related_tags ? JSON.stringify(related_tags) : null]
    );

    return res.json(formatResponse({
      action_id: result.insertId,
      action_name: action_name.trim(),
      category_id,
      category_name: categories[0].category_name,
      subjective_weight,
      exec_count: 0,
      success_count: 0,
      fail_count: 0,
      success_rate: null,
      status: 0
    }, '动作创建成功'));
  } catch (error) {
    console.error('创建动作错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 更新动作
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { action_name, category_id, subjective_weight, related_tags } = req.body;

    // 检查动作是否存在
    const [actions] = await pool.query(
      'SELECT * FROM action_right WHERE action_id = ? AND user_id = ?',
      [id, userId]
    );

    if (actions.length === 0) {
      return errorResponse(res, 404, '动作不存在');
    }

    const updates = [];
    const values = [];

    if (action_name !== undefined) {
      if (action_name.trim().length === 0) {
        return errorResponse(res, 400, '动作名称不能为空');
      }
      if (action_name.length > 30) {
        return errorResponse(res, 400, '动作名称不能超过30字符');
      }
      updates.push('action_name = ?');
      values.push(action_name.trim());
    }

    if (category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(category_id);
    }

    if (subjective_weight !== undefined) {
      updates.push('subjective_weight = ?');
      values.push(subjective_weight);
    }

    if (related_tags !== undefined) {
      updates.push('related_tags = ?');
      values.push(JSON.stringify(related_tags));
    }

    if (updates.length === 0) {
      return errorResponse(res, 400, '没有要更新的内容');
    }

    values.push(id, userId);

    await pool.query(
      `UPDATE action_right SET ${updates.join(', ')}, update_time = NOW() WHERE action_id = ? AND user_id = ?`,
      values
    );

    return res.json(formatResponse(null, '动作更新成功'));
  } catch (error) {
    console.error('更新动作错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 归档动作
router.put('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [actions] = await pool.query(
      'SELECT * FROM action_right WHERE action_id = ? AND user_id = ?',
      [id, userId]
    );

    if (actions.length === 0) {
      return errorResponse(res, 404, '动作不存在');
    }

    if (actions[0].status === 1) {
      return errorResponse(res, 400, '该动作已归档');
    }

    await pool.query(
      'UPDATE action_right SET status = 1, pinned = 0, update_time = NOW() WHERE action_id = ? AND user_id = ?',
      [id, userId]
    );

    return res.json(formatResponse(null, '归档成功'));
  } catch (error) {
    console.error('归档动作错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 删除动作（无执行记录时可用）
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [actions] = await pool.query(
      'SELECT * FROM action_right WHERE action_id = ? AND user_id = ?',
      [id, userId]
    );

    if (actions.length === 0) {
      return errorResponse(res, 404, '动作不存在');
    }

    if (actions[0].exec_count > 0) {
      return errorResponse(res, 403, '有执行记录的动作禁止直接删除，请先归档');
    }

    await pool.query(
      'DELETE FROM action_right WHERE action_id = ? AND user_id = ?',
      [id, userId]
    );

    return res.json(formatResponse(null, '删除成功'));
  } catch (error) {
    console.error('删除动作错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// ============================================================
// 打卡相关
// ============================================================

// 快速打卡
router.post('/:id/checkin', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const userId = req.user.user_id;
    const { exec_result, exec_remark, event_desc } = req.body;

    if (!exec_result || ![1, 2].includes(exec_result)) {
      await connection.rollback();
      return errorResponse(res, 400, '请选择执行结果：成功(1)或失败(2)');
    }

    // 获取动作信息
    const [actions] = await connection.query(
      'SELECT * FROM action_right WHERE action_id = ? AND user_id = ?',
      [id, userId]
    );

    if (actions.length === 0) {
      await connection.rollback();
      return errorResponse(res, 404, '动作不存在');
    }

    const action = actions[0];

    // 创建事件记录（可选，event_desc为空时不创建）
    let eventId = null;
    if (event_desc && event_desc.trim().length > 0) {
      const [eventResult] = await connection.query(
        `INSERT INTO event_raw 
         (user_id, action_id, category_id, event_desc, create_time) 
         VALUES (?, ?, ?, ?, NOW())`,
        [userId, id, action.category_id, event_desc.trim()]
      );
      eventId = eventResult.insertId;
    }

    // 创建执行记录
    const [recordResult] = await connection.query(
      `INSERT INTO action_record 
       (action_id, event_id, user_id, exec_result, exec_remark, exec_time) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [id, eventId, userId, exec_result, exec_remark || null]
    );

    await connection.commit();

    // 获取更新后的统计
    const [updatedAction] = await pool.query(
      'SELECT exec_count, success_count, fail_count, success_rate, last_exec_time FROM action_right WHERE action_id = ?',
      [id]
    );

    return res.json(formatResponse({
      record_id: recordResult.insertId,
      event_id: eventId,
      action: updatedAction[0]
    }, '打卡成功'));
  } catch (error) {
    await connection.rollback();
    console.error('打卡错误:', error);
    return errorResponse(res, 500, '服务器错误');
  } finally {
    connection.release();
  }
});

// 获取动作统计数据
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [actions] = await pool.query(
      `SELECT exec_count, success_count, fail_count, success_rate, last_exec_time
       FROM action_right 
       WHERE action_id = ? AND user_id = ?`,
      [id, userId]
    );

    if (actions.length === 0) {
      return errorResponse(res, 404, '动作不存在');
    }

    return res.json(formatResponse(actions[0]));
  } catch (error) {
    console.error('获取统计错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 获取动作数据趋势
router.get('/:id/trend', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { period = 'week', start_time, end_time } = req.query;

    // 计算日期范围
    let startDate, endDate;
    endDate = end_time ? new Date(end_time) : new Date();
    
    if (start_time) {
      startDate = new Date(start_time);
    } else {
      startDate = new Date();
      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 12 * 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 12);
          break;
        default:
          startDate.setDate(startDate.getDate() - 12 * 7);
      }
    }

    // 按天聚合统计数据
    const [trend] = await pool.query(
      `SELECT 
         DATE(exec_time) as date,
         COUNT(*) as exec_count,
         SUM(CASE WHEN exec_result = 1 THEN 1 ELSE 0 END) as success_count,
         SUM(CASE WHEN exec_result = 2 THEN 1 ELSE 0 END) as fail_count
       FROM action_record
       WHERE action_id = ? 
         AND user_id = ?
         AND exec_time >= ?
         AND exec_time <= ?
       GROUP BY DATE(exec_time)
       ORDER BY date ASC`,
      [id, userId, startDate.toISOString(), endDate.toISOString()]
    );

    return res.json(formatResponse(trend));
  } catch (error) {
    console.error('获取趋势错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

module.exports = router;
