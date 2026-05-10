const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { formatResponse, errorResponse } = require('../utils/helpers');

// 微信登录
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return errorResponse(res, 400, '缺少code参数');
    }

    // TODO: 调用微信接口获取openID（实际项目中需要调用微信API）
    // const wxResult = await callWxApi(code);
    // const openid = wxResult.openid;

    // 模拟：使用code作为openid（开发环境）
    const openid = `wx_${code}`;

    // 查找或创建用户
    let [users] = await pool.query(
      'SELECT * FROM `user` WHERE wx_openid = ?',
      [openid]
    );

    let isNew = false;
    let userId;

    if (users.length === 0) {
      // 新用户，创建记录
      const [result] = await pool.query(
        'INSERT INTO `user` (wx_openid, create_time, last_login_time) VALUES (?, NOW(), NOW())',
        [openid]
      );
      userId = result.insertId;
      isNew = true;

      // 初始化默认分类
      await pool.query(
        'CALL sp_init_user_categories(?)',
        [userId]
      );
    } else {
      userId = users[0].user_id;
      // 更新最后登录时间
      await pool.query(
        'UPDATE `user` SET last_login_time = NOW() WHERE user_id = ?',
        [userId]
      );
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId, openid },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json(formatResponse({
      token,
      userId,
      isNew
    }, '登录成功'));
  } catch (error) {
    console.error('登录错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 验证token
router.get('/check', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return errorResponse(res, 401, '未登录');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await pool.query(
      'SELECT user_id, last_login_time, dark_mode FROM `user` WHERE user_id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return errorResponse(res, 401, '用户不存在');
    }

    return res.json(formatResponse({
      valid: true,
      user: {
        userId: users[0].user_id,
        lastLoginTime: users[0].last_login_time,
        darkMode: users[0].dark_mode
      }
    }));
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, '登录已过期');
    }
    return errorResponse(res, 401, '无效的登录凭证');
  }
});

// 获取用户设置
router.get('/settings', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return errorResponse(res, 401, '未登录');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await pool.query(
      'SELECT smart_migrate_on, warning_popup_on, dark_mode, show_sensitive FROM `user` WHERE user_id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return errorResponse(res, 401, '用户不存在');
    }

    return res.json(formatResponse(users[0]));
  } catch (error) {
    console.error('获取设置错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 更新用户设置
router.put('/settings', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return errorResponse(res, 401, '未登录');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { smart_migrate_on, warning_popup_on, dark_mode, show_sensitive } = req.body;

    const updates = [];
    const values = [];

    if (smart_migrate_on !== undefined) {
      updates.push('smart_migrate_on = ?');
      values.push(smart_migrate_on ? 1 : 0);
    }
    if (warning_popup_on !== undefined) {
      updates.push('warning_popup_on = ?');
      values.push(warning_popup_on ? 1 : 0);
    }
    if (dark_mode !== undefined) {
      updates.push('dark_mode = ?');
      values.push(dark_mode);
    }
    if (show_sensitive !== undefined) {
      updates.push('show_sensitive = ?');
      values.push(show_sensitive ? 1 : 0);
    }

    if (updates.length === 0) {
      return errorResponse(res, 400, '没有要更新的设置');
    }

    values.push(decoded.userId);

    await pool.query(
      `UPDATE \`user\` SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    return res.json(formatResponse(null, '设置更新成功'));
  } catch (error) {
    console.error('更新设置错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

module.exports = router;
