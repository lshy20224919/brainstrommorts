const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');

// 导入路由
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const actionRoutes = require('./routes/actions');
const eventRoutes = require('./routes/events');
const lawRoutes = require('./routes/laws');
const statsRoutes = require('./routes/stats');
const migrateRoutes = require('./routes/migrate');
const reviewRoutes = require('./routes/reviews');
const storageRoutes = require('./routes/storage');
const sopRoutes = require('./routes/sops');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100次请求
  message: { code: 429, message: '请求过于频繁，请稍后再试', data: null }
});
app.use('/api/', limiter);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/laws', lawRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/migrate', migrateRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/sops', sopRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在', data: null });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
});

// 启动服务器
async function startServer() {
  console.log('🚀 方法论进化器后端服务启动中...');
  
  // 测试数据库连接
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('❌ 数据库连接失败，请检查配置');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`✅ 服务已启动，监听端口 ${PORT}`);
    console.log(`📖 API文档: http://localhost:${PORT}/health`);
  });
}

startServer();

module.exports = app;
