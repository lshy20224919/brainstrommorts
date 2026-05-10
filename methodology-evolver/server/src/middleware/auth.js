const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// JWT验证中间件
async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 验证用户存在
    const [users] = await pool.query(
      'SELECT user_id, wx_openid FROM `user` WHERE user_id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: '登录已过期' });
    }
    return res.status(401).json({ code: 401, message: '无效的登录凭证' });
  }
}

module.exports = { authMiddleware };
