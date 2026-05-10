const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, errorResponse, getTodayDate } = require('../utils/helpers');

router.use(authMiddleware);

// ============================================================
// 规律相关
// ============================================================

// 获取规律列表
router.get('/', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { category_id, law_type, status, page = 1, page_size = 20 } = req.query;

    let whereClause = 'WHERE l.user_id = ?';
    const params = [userId];

    if (category_id) {
      whereClause += ' AND l.category_id = ?';
      params.push(category_id);
    }

    if (law_type) {
      whereClause += ' AND l.law_type = ?';
      params.push(law_type);
    }

    if (status !== undefined) {
      whereClause += ' AND l.status = ?';
      params.push(status);
    }

    const offset = (parseInt(page) - 1) * parseInt(page_size);

    const [list] = await pool.query(
      `SELECT l.*, c.category_name, a.action_name
       FROM law l
       LEFT JOIN category c ON l.category_id = c.category_id
       LEFT JOIN action_right a ON l.related_action_id = a.action_id
       ${whereClause}
       ORDER BY l.create_time DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(page_size), offset]
    );

    const [total] = await pool.query(
      `SELECT COUNT(*) as count FROM law l ${whereClause}`,
      params
    );

    return res.json(formatResponse({
      list,
      total: total[0].count,
      page: parseInt(page),
      page_size: parseInt(page_size)
    }));
  } catch (error) {
    console.error('获取规律列表错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 获取规律详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [laws] = await pool.query(
      `SELECT l.*, c.category_name, a.action_name
       FROM law l
       LEFT JOIN category c ON l.category_id = c.category_id
       LEFT JOIN action_right a ON l.related_action_id = a.action_id
       WHERE l.law_id = ? AND l.user_id = ?`,
      [id, userId]
    );

    if (laws.length === 0) {
      return errorResponse(res, 404, '规律不存在');
    }

    return res.json(formatResponse(laws[0]));
  } catch (error) {
    console.error('获取规律详情错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 创建规律（强制选择正向/负向）
router.post('/', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { law_type, law_desc, category_id, related_action_id, applicable_scenes } = req.body;

    // 强制校验：law_type必选
    if (!law_type || ![1, 2].includes(law_type)) {
      return errorResponse(res, 400, '请选择规律类型：正向(1)或负向(2)');
    }

    if (!law_desc || law_desc.trim().length === 0) {
      return errorResponse(res, 400, '规律描述不能为空');
    }

    if (law_desc.length > 500) {
      return errorResponse(res, 400, '规律描述不能超过500字符');
    }

    if (!category_id) {
      return errorResponse(res, 400, '请选择分类');
    }

    // 生成逻辑指纹（简化版：取前50字符的hash）
    const logicFingerprint = law_desc.trim().substring(0, 50);

    const [result] = await pool.query(
      `INSERT INTO law 
       (user_id, category_id, related_action_id, law_type, law_desc, applicable_scenes, logic_fingerprint) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, category_id, related_action_id || null, law_type, law_desc.trim(), 
       applicable_scenes?.trim() || null, logicFingerprint]
    );

    return res.json(formatResponse({
      law_id: result.insertId,
      law_type,
      law_desc: law_desc.trim(),
      category_id,
      popup_enabled: law_type === 2 ? 1 : 0
    }, '规律创建成功'));
  } catch (error) {
    console.error('创建规律错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 更新规律
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { law_desc, applicable_scenes, popup_enabled } = req.body;

    const [laws] = await pool.query(
      'SELECT * FROM law WHERE law_id = ? AND user_id = ?',
      [id, userId]
    );

    if (laws.length === 0) {
      return errorResponse(res, 404, '规律不存在');
    }

    const updates = [];
    const values = [];

    if (law_desc !== undefined) {
      if (law_desc.trim().length === 0) {
        return errorResponse(res, 400, '规律描述不能为空');
      }
      if (law_desc.length > 500) {
        return errorResponse(res, 400, '规律描述不能超过500字符');
      }
      updates.push('law_desc = ?');
      values.push(law_desc.trim());
      updates.push('logic_fingerprint = ?');
      values.push(law_desc.trim().substring(0, 50));
    }

    if (applicable_scenes !== undefined) {
      updates.push('applicable_scenes = ?');
      values.push(applicable_scenes?.trim() || null);
    }

    if (popup_enabled !== undefined && laws[0].law_type === 2) {
      updates.push('popup_enabled = ?');
      values.push(popup_enabled ? 1 : 0);
    }

    if (updates.length === 0) {
      return errorResponse(res, 400, '没有要更新的内容');
    }

    values.push(id, userId);

    await pool.query(
      `UPDATE law SET ${updates.join(', ')}, update_time = NOW() WHERE law_id = ? AND user_id = ?`,
      values
    );

    return res.json(formatResponse(null, '规律更新成功'));
  } catch (error) {
    console.error('更新规律错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 淘汰规律
router.put('/:id/retire', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [laws] = await pool.query(
      'SELECT * FROM law WHERE law_id = ? AND user_id = ?',
      [id, userId]
    );

    if (laws.length === 0) {
      return errorResponse(res, 404, '规律不存在');
    }

    if (laws[0].status === 1) {
      return errorResponse(res, 400, '该规律已在淘汰库');
    }

    await pool.query(
      'UPDATE law SET status = 1, update_time = NOW() WHERE law_id = ? AND user_id = ?',
      [id, userId]
    );

    return res.json(formatResponse(null, '淘汰成功'));
  } catch (error) {
    console.error('淘汰规律错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 删除规律
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [laws] = await pool.query(
      'SELECT * FROM law WHERE law_id = ? AND user_id = ?',
      [id, userId]
    );

    if (laws.length === 0) {
      return errorResponse(res, 404, '规律不存在');
    }

    await pool.query(
      'DELETE FROM law WHERE law_id = ? AND user_id = ?',
      [id, userId]
    );

    return res.json(formatResponse(null, '删除成功'));
  } catch (error) {
    console.error('删除规律错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// ============================================================
// 避雷提醒相关
// ============================================================

// 获取可弹出的负向规律（用于避雷提醒）
router.get('/warnings/check', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { category_id } = req.query;
    const today = getTodayDate();

    let whereClause = `WHERE l.user_id = ? 
                       AND l.law_type = 2 
                       AND l.status = 0 
                       AND l.popup_enabled = 1`;
    const params = [userId];

    if (category_id) {
      whereClause += ' AND l.category_id = ?';
      params.push(category_id);
    }

    // 检查24小时冷却和今日弹窗次数
    const [warnings] = await pool.query(
      `SELECT l.law_id, l.law_desc, l.applicable_scenes, c.category_name,
              (SELECT COUNT(*) FROM popup_log pl 
               WHERE pl.law_id = l.law_id 
                 AND DATE(pl.popup_time) = ?) as today_count,
              (SELECT COUNT(*) FROM popup_log pl 
               WHERE pl.law_id = l.law_id 
                 AND pl.popup_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as in_24h_count
       FROM law l
       LEFT JOIN category c ON l.category_id = c.category_id
       ${whereClause}
       HAVING today_count < 2 AND in_24h_count = 0
       ORDER BY today_count ASC
       LIMIT 3`,
      [...params, today]
    );

    return res.json(formatResponse(warnings));
  } catch (error) {
    console.error('检查避雷规律错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 记录弹窗日志
router.post('/warnings/log', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { law_id, dismissed = 0 } = req.body;

    if (!law_id) {
      return errorResponse(res, 400, '缺少law_id');
    }

    await pool.query(
      'INSERT INTO popup_log (user_id, law_id, dismissed) VALUES (?, ?, ?)',
      [userId, law_id, dismissed]
    );

    // 更新规律的弹窗时间
    await pool.query(
      'UPDATE law SET last_popup_time = NOW(), popup_count_today = popup_count_today + 1 WHERE law_id = ?',
      [law_id]
    );

    return res.json(formatResponse(null, '记录成功'));
  } catch (error) {
    console.error('记录弹窗日志错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

module.exports = router;
