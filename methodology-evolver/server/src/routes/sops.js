const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, errorResponse } = require('../utils/helpers');

router.use(authMiddleware);

// 获取SOP列表
router.get('/', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { category_id, page = 1, page_size = 20 } = req.query;

    let whereClause = 'WHERE s.user_id = ?';
    const params = [userId];

    if (category_id) {
      whereClause += ' AND s.category_id = ?';
      params.push(category_id);
    }

    const offset = (parseInt(page) - 1) * parseInt(page_size);

    const [list] = await pool.query(
      `SELECT s.*, c.category_name
       FROM sop_template s
       LEFT JOIN category c ON s.category_id = c.category_id
       ${whereClause}
       ORDER BY s.create_time DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(page_size), offset]
    );

    const [total] = await pool.query(
      `SELECT COUNT(*) as count FROM sop_template s ${whereClause}`,
      params
    );

    return res.json(formatResponse({
      list,
      total: total[0].count,
      page: parseInt(page),
      page_size: parseInt(page_size)
    }));
  } catch (error) {
    console.error('获取SOP列表错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 获取SOP详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [sops] = await pool.query(
      `SELECT s.*, c.category_name
       FROM sop_template s
       LEFT JOIN category c ON s.category_id = c.category_id
       WHERE s.sop_id = ? AND s.user_id = ?`,
      [id, userId]
    );

    if (sops.length === 0) {
      return errorResponse(res, 404, 'SOP不存在');
    }

    // 获取步骤中的动作详情
    const sop = sops[0];
    const steps = typeof sop.steps === 'string' ? JSON.parse(sop.steps) : sop.steps;
    
    if (steps && steps.length > 0) {
      const actionIds = steps.map(s => s.action_id).filter(id => id);
      if (actionIds.length > 0) {
        const [actions] = await pool.query(
          `SELECT action_id, action_name, category_name, success_rate 
           FROM action_right a
           LEFT JOIN category c ON a.category_id = c.category_id
           WHERE action_id IN (?)`,
          [actionIds]
        );
        sop.actions = actions;
      }
    }

    return res.json(formatResponse(sop));
  } catch (error) {
    console.error('获取SOP详情错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 创建SOP
router.post('/', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { sop_name, category_id, steps } = req.body;

    if (!sop_name || sop_name.trim().length === 0) {
      return errorResponse(res, 400, 'SOP名称不能为空');
    }

    if (sop_name.length > 30) {
      return errorResponse(res, 400, 'SOP名称不能超过30字符');
    }

    if (!category_id) {
      return errorResponse(res, 400, '请选择分类');
    }

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return errorResponse(res, 400, '请添加至少一个步骤');
    }

    const [result] = await pool.query(
      `INSERT INTO sop_template (user_id, sop_name, category_id, steps) VALUES (?, ?, ?, ?)`,
      [userId, sop_name.trim(), category_id, JSON.stringify(steps)]
    );

    return res.json(formatResponse({
      sop_id: result.insertId,
      sop_name: sop_name.trim(),
      category_id
    }, 'SOP创建成功'));
  } catch (error) {
    console.error('创建SOP错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 更新SOP
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { sop_name, category_id, steps } = req.body;

    const [sops] = await pool.query(
      'SELECT * FROM sop_template WHERE sop_id = ? AND user_id = ?',
      [id, userId]
    );

    if (sops.length === 0) {
      return errorResponse(res, 404, 'SOP不存在');
    }

    const updates = [];
    const values = [];

    if (sop_name !== undefined) {
      if (sop_name.trim().length === 0) {
        return errorResponse(res, 400, 'SOP名称不能为空');
      }
      updates.push('sop_name = ?');
      values.push(sop_name.trim());
    }

    if (category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(category_id);
    }

    if (steps !== undefined) {
      updates.push('steps = ?');
      values.push(JSON.stringify(steps));
    }

    if (updates.length === 0) {
      return errorResponse(res, 400, '没有要更新的内容');
    }

    values.push(id, userId);

    await pool.query(
      `UPDATE sop_template SET ${updates.join(', ')}, update_time = NOW() WHERE sop_id = ? AND user_id = ?`,
      values
    );

    return res.json(formatResponse(null, 'SOP更新成功'));
  } catch (error) {
    console.error('更新SOP错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 删除SOP
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [sops] = await pool.query(
      'SELECT * FROM sop_template WHERE sop_id = ? AND user_id = ?',
      [id, userId]
    );

    if (sops.length === 0) {
      return errorResponse(res, 404, 'SOP不存在');
    }

    await pool.query(
      'DELETE FROM sop_template WHERE sop_id = ? AND user_id = ?',
      [id, userId]
    );

    return res.json(formatResponse(null, '删除成功'));
  } catch (error) {
    console.error('删除SOP错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 执行SOP
router.post('/:id/execute', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const userId = req.user.user_id;
    const { step_results } = req.body;

    if (!step_results || !Array.isArray(step_results)) {
      await connection.rollback();
      return errorResponse(res, 400, '缺少执行结果');
    }

    // 获取SOP信息
    const [sops] = await connection.query(
      'SELECT * FROM sop_template WHERE sop_id = ? AND user_id = ?',
      [id, userId]
    );

    if (sops.length === 0) {
      await connection.rollback();
      return errorResponse(res, 404, 'SOP不存在');
    }

    const sop = sops[0];
    const steps = typeof sop.steps === 'string' ? JSON.parse(sop.steps) : sop.steps;

    const eventIds = [];
    const recordIds = [];

    // 逐步骤执行
    for (const result of step_results) {
      const stepInfo = steps.find(s => s.step === result.step);
      if (!stepInfo || !stepInfo.action_id) continue;

      const actionId = stepInfo.action_id;

      // 创建事件
      const [eventResult] = await connection.query(
        `INSERT INTO event_raw 
         (user_id, action_id, category_id, event_desc, create_time) 
         VALUES (?, ?, ?, ?, NOW())`,
        [userId, actionId, sop.category_id, `${sop.sop_name} - 步骤${result.step}: ${stepInfo.remark || ''}`]
      );
      eventIds.push(eventResult.insertId);

      // 创建执行记录
      const [recordResult] = await connection.query(
        `INSERT INTO action_record 
         (action_id, event_id, user_id, exec_result, exec_remark, exec_time) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [actionId, eventResult.insertId, userId, result.exec_result, result.exec_remark || null]
      );
      recordIds.push(recordResult.insertId);
    }

    // 更新SOP执行次数
    await connection.query(
      'UPDATE sop_template SET exec_count = exec_count + 1, last_exec_time = NOW() WHERE sop_id = ?',
      [id]
    );

    await connection.commit();

    return res.json(formatResponse({
      sop_id: parseInt(id),
      event_ids: eventIds,
      record_ids: recordIds,
      exec_count: sop.exec_count + 1
    }, 'SOP执行完成'));
  } catch (error) {
    await connection.rollback();
    console.error('执行SOP错误:', error);
    return errorResponse(res, 500, '服务器错误');
  } finally {
    connection.release();
  }
});

module.exports = router;
