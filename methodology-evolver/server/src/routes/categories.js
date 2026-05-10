const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, errorResponse } = require('../utils/helpers');

// 所有路由需要登录
router.use(authMiddleware);

// 获取全部分类
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query(
      `SELECT category_id, category_name, is_system_default, sort_weight, create_time
       FROM category 
       WHERE user_id = ? 
       ORDER BY sort_weight ASC, create_time ASC`,
      [req.user.user_id]
    );

    return res.json(formatResponse(categories));
  } catch (error) {
    console.error('获取分类错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 创建分类
router.post('/', async (req, res) => {
  try {
    const { category_name } = req.body;
    const userId = req.user.user_id;

    if (!category_name || category_name.trim().length === 0) {
      return errorResponse(res, 400, '分类名称不能为空');
    }

    if (category_name.length > 30) {
      return errorResponse(res, 400, '分类名称不能超过30字符');
    }

    // 获取当前最大排序权重
    const [maxWeight] = await pool.query(
      'SELECT COALESCE(MAX(sort_weight), 0) + 1 as next_weight FROM category WHERE user_id = ?',
      [userId]
    );

    const [result] = await pool.query(
      'INSERT INTO category (user_id, category_name, is_system_default, sort_weight) VALUES (?, ?, 0, ?)',
      [userId, category_name.trim(), maxWeight[0].next_weight]
    );

    return res.json(formatResponse({
      category_id: result.insertId,
      category_name: category_name.trim(),
      is_system_default: 0,
      sort_weight: maxWeight[0].next_weight
    }, '分类创建成功'));
  } catch (error) {
    console.error('创建分类错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 更新分类
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name } = req.body;
    const userId = req.user.user_id;

    if (!category_name || category_name.trim().length === 0) {
      return errorResponse(res, 400, '分类名称不能为空');
    }

    if (category_name.length > 30) {
      return errorResponse(res, 400, '分类名称不能超过30字符');
    }

    // 检查分类是否存在且属于该用户
    const [categories] = await pool.query(
      'SELECT * FROM category WHERE category_id = ? AND user_id = ?',
      [id, userId]
    );

    if (categories.length === 0) {
      return errorResponse(res, 404, '分类不存在');
    }

    // 系统默认分类可改名但不能改其他
    await pool.query(
      'UPDATE category SET category_name = ?, update_time = NOW() WHERE category_id = ? AND user_id = ?',
      [category_name.trim(), id, userId]
    );

    return res.json(formatResponse(null, '分类更新成功'));
  } catch (error) {
    console.error('更新分类错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 删除分类（仅自定义分类）
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    // 检查分类是否存在且属于该用户
    const [categories] = await pool.query(
      'SELECT * FROM category WHERE category_id = ? AND user_id = ?',
      [id, userId]
    );

    if (categories.length === 0) {
      return errorResponse(res, 404, '分类不存在');
    }

    if (categories[0].is_system_default) {
      return errorResponse(res, 403, '系统默认分类不可删除');
    }

    // 检查分类下是否有动作或事件
    const [actions] = await pool.query(
      'SELECT COUNT(*) as count FROM action_right WHERE category_id = ? AND user_id = ? AND status = 0',
      [id, userId]
    );

    if (actions[0].count > 0) {
      return errorResponse(res, 400, '该分类下有未归档的动作，请先归档');
    }

    await pool.query(
      'DELETE FROM category WHERE category_id = ? AND user_id = ?',
      [id, userId]
    );

    return res.json(formatResponse(null, '分类删除成功'));
  } catch (error) {
    console.error('删除分类错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

module.exports = router;
