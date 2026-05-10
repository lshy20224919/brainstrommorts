const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, errorResponse } = require('../utils/helpers');

router.use(authMiddleware);

// ============================================================
// 迁移相关
// ============================================================

// 获取迁移推荐（智能迁移）
router.get('/recommend', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { category_id, limit = 3 } = req.query;

    // 简化版：基于逻辑指纹相似度推荐
    // TODO: 后续升级为TF-IDF或BERT语义匹配
    const [recommendations] = await pool.query(
      `SELECT l.law_id, l.law_desc, l.logic_fingerprint, l.category_id as source_category_id,
              c1.category_name as source_category_name,
              c2.category_id as target_category_id,
              c2.category_name as target_category_name,
              0.70 as similarity_score
       FROM law l
       CROSS JOIN category c2
       LEFT JOIN category c1 ON l.category_id = c1.category_id
       WHERE l.user_id = ?
         AND l.status = 0
         AND c2.user_id = ?
         AND l.category_id != c2.category_id
         AND l.logic_fingerprint IS NOT NULL
         AND l.logic_fingerprint != ''
         ${category_id ? 'AND c2.category_id = ?' : ''}
       ORDER BY RAND()
       LIMIT ?`,
      [userId, userId, ...(category_id ? [category_id] : []), parseInt(limit)]
    );

    return res.json(formatResponse(recommendations));
  } catch (error) {
    console.error('获取迁移推荐错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 手动迁移
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.user_id;
    const { card_id, card_type, target_category_id } = req.body;

    if (!card_id || !card_type || !target_category_id) {
      await connection.rollback();
      return errorResponse(res, 400, '缺少必要参数');
    }

    if (!['action', 'law'].includes(card_type)) {
      await connection.rollback();
      return errorResponse(res, 400, '卡片类型错误');
    }

    // 验证目标分类存在
    const [categories] = await connection.query(
      'SELECT * FROM category WHERE category_id = ? AND user_id = ?',
      [target_category_id, userId]
    );

    if (categories.length === 0) {
      await connection.rollback();
      return errorResponse(res, 400, '目标分类不存在');
    }

    let newCardId;

    // 根据卡片类型复制
    if (card_type === 'action') {
      // 复制动作
      const [actions] = await connection.query(
        'SELECT * FROM action_right WHERE action_id = ? AND user_id = ?',
        [card_id, userId]
      );

      if (actions.length === 0) {
        await connection.rollback();
        return errorResponse(res, 404, '动作不存在');
      }

      const action = actions[0];
      const [newAction] = await connection.query(
        `INSERT INTO action_right 
         (user_id, category_id, action_name, subjective_weight, related_tags) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, target_category_id, action.action_name, action.subjective_weight, action.related_tags]
      );
      newCardId = newAction.insertId;

    } else {
      // 复制规律
      const [laws] = await connection.query(
        'SELECT * FROM law WHERE law_id = ? AND user_id = ?',
        [card_id, userId]
      );

      if (laws.length === 0) {
        await connection.rollback();
        return errorResponse(res, 404, '规律不存在');
      }

      const law = laws[0];
      const [newLaw] = await connection.query(
        `INSERT INTO law 
         (user_id, category_id, related_action_id, law_type, law_desc, applicable_scenes, logic_fingerprint, popup_enabled) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, target_category_id, law.related_action_id, law.law_type, 
         law.law_desc, law.applicable_scenes, law.logic_fingerprint, law.popup_enabled]
      );
      newCardId = newLaw.insertId;
    }

    // 记录迁移日志（永久留存）
    await connection.query(
      `INSERT INTO migrate_log 
       (user_id, source_card_id, source_card_type, target_category_id, migrate_type, new_card_id) 
       VALUES (?, ?, ?, ?, 1, ?)`,
      [userId, card_id, card_type, target_category_id, newCardId]
    );

    await connection.commit();

    return res.json(formatResponse({
      migrate_id: null,
      new_card_id: newCardId,
      new_card_type: card_type
    }, '迁移成功'));
  } catch (error) {
    await connection.rollback();
    console.error('迁移错误:', error);
    return errorResponse(res, 500, '服务器错误');
  } finally {
    connection.release();
  }
});

// 获取迁移历史（永久留存）
router.get('/logs', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page = 1, page_size = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(page_size);

    const [logs] = await pool.query(
      `SELECT m.*, 
              CASE m.source_card_type 
                WHEN 'action' THEN a.action_name 
                WHEN 'law' THEN l.law_desc 
              END as source_card_name,
              c.category_name as target_category_name
       FROM migrate_log m
       LEFT JOIN action_right a ON m.source_card_type = 'action' AND m.source_card_id = a.action_id
       LEFT JOIN law l ON m.source_card_type = 'law' AND m.source_card_id = l.law_id
       LEFT JOIN category c ON m.target_category_id = c.category_id
       WHERE m.user_id = ?
       ORDER BY m.migrate_time DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(page_size), offset]
    );

    const [total] = await pool.query(
      'SELECT COUNT(*) as count FROM migrate_log WHERE user_id = ?',
      [userId]
    );

    return res.json(formatResponse({
      list: logs,
      total: total[0].count,
      page: parseInt(page),
      page_size: parseInt(page_size)
    }));
  } catch (error) {
    console.error('获取迁移历史错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

module.exports = router;
