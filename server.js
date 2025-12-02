const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 初始化数据库表
async function initializeDatabase() {
  try {
    await User.createTable(db);
    await Game.createTable(db);
    await Tag.createTable(db);
    await Tag.createGameTagsTable(db);
    await Review.createTable(db);
    console.log('数据库表初始化成功');
  } catch (error) {
    console.error('数据库表初始化失败:', error);
  }
}

// 路由
app.use('/api', gameRoutes);
app.use('/api', tagRoutes);
app.use('/api', userRoutes);
app.use('/api', reviewRoutes);

app.get('/', (req, res) => {
  res.json({ message: '欢迎来到GalHub游戏管理API' });
});

// 初始化数据库并启动服务器
initializeDatabase().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}).catch(err => {
  console.error('启动服务器失败:', err);
});