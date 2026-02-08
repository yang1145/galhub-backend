const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/index');

// 数据库和模型
const db = require('./config/db');
const Game = require('./models/Game');
const Tag = require('./models/Tag');
const User = require('./models/User');
const Review = require('./models/Review');

// 路由
const gameRoutes = require('./routes/games');
const tagRoutes = require('./routes/tags');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const captchaRoutes = require('./routes/captcha');

// 创建Express应用
const app = express();

// 信任代理设置 - 解决 X-Forwarded-For 头问题
// 当应用部署在反向代理后面时，需要信任代理传递的头部信息
app.set('trust proxy', true);

// 安全中间件
app.use(helmet());

// CORS配置
const corsOptions = {
  origin: config.server.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24小时
};
app.use(cors(corsOptions));

// 请求体大小限制
app.use(express.json({ limit: '10kb' }));

// 全局速率限制
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// 认证相关路由的严格速率限制
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 每个IP最多10次登录/注册尝试
  message: {
    success: false,
    message: '登录尝试过于频繁，请15分钟后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// 初始化数据库表
async function initializeDatabase() {
  try {
    await User.createTable(db);
    await Game.createTable(db);
    await Tag.createTable(db);
    await Tag.createGameTagsTable(db);
    await Review.createTable(db);
    
    // 创建索引以提升查询性能
    await createIndexes();
    
    console.log('数据库表初始化成功');
  } catch (error) {
    console.error('数据库表初始化失败:', error);
  }
}

// 创建数据库索引
async function createIndexes() {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_games_rating ON games(rating DESC)',
    'CREATE INDEX IF NOT EXISTS idx_reviews_game_id ON reviews(game_id)',
    'CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_game_tags_game_id ON game_tags(game_id)',
    'CREATE INDEX IF NOT EXISTS idx_game_tags_tag_id ON game_tags(tag_id)',
    'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'
  ];
  
  for (const sql of indexes) {
    try {
      await db.execute(sql);
    } catch (error) {
      // 索引可能已存在，忽略错误
    }
  }
}

// 路由
app.use('/api', gameRoutes);
app.use('/api', tagRoutes);
app.use('/api', userRoutes);
app.use('/api', reviewRoutes);
app.use('/api', adminRoutes);
app.use('/api/captcha', captchaRoutes);

app.get('/', (req, res) => {
  res.json({ message: '欢迎来到GalHub游戏管理API' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 初始化数据库并启动服务器
initializeDatabase().then(() => {
  const PORT = config.server.port;
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}).catch(err => {
  console.error('启动服务器失败:', err);
});