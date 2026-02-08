/**
 * 数据库初始化脚本
 * 用于创建数据库表结构和默认管理员账户
 */

const bcrypt = require('bcryptjs');
const db = require('./config/db');
const Game = require('./models/Game');
const Tag = require('./models/Tag');
const User = require('./models/User');
const Review = require('./models/Review');

// 默认管理员账户配置
const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@galhub.com',
  password: 'admin123' // 生产环境中应该使用更安全的密码
};

// 检查并添加 role 字段（如果不存在）
async function ensureRoleColumnExists() {
  try {
    // 检查 users 表是否包含 role 列
    const [columns] = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (columns.length === 0) {
      console.log('检测到 users 表缺少 role 字段，正在添加...');
      await db.execute('ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT \'user\'');
      console.log('✓ role 字段已成功添加到 users 表');
    } else {
      console.log('✓ users 表已包含 role 字段');
    }
  } catch (error) {
    console.error('检查或添加 role 字段时出错:', error);
    throw error;
  }
}

async function createDefaultAdmin() {
  try {
    // 检查管理员是否已存在
    const [existingAdmins] = await db.execute(
      'SELECT id FROM users WHERE username = $1 OR email = $1',
      [DEFAULT_ADMIN.username]
    );
    
    if (existingAdmins.length > 0) {
      console.log('✓ 默认管理员账户已存在');
      return;
    }
    
    // 加密密码
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, saltRounds);
    
    // 创建管理员账户
    const sql = `
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, 'admin')
      RETURNING id
    `;
    const [result] = await db.execute(sql, [
      DEFAULT_ADMIN.username,
      DEFAULT_ADMIN.email,
      hashedPassword
    ]);
    
    console.log('✓ 默认管理员账户创建成功');
    console.log(`  用户名: ${DEFAULT_ADMIN.username}`);
    console.log(`  邮箱: ${DEFAULT_ADMIN.email}`);
    console.log(`  密码: ${DEFAULT_ADMIN.password} (请在生产环境中修改!)`);
  } catch (error) {
    console.error('创建默认管理员账户失败:', error);
    throw error;
  }
}

async function initDatabase() {
  try {
    console.log('开始初始化数据库...');
    
    // 创建用户表
    await User.createTable(db);
    console.log('✓ 用户表创建成功');
    
    // 确保 role 字段存在
    await ensureRoleColumnExists();
    
    // 创建游戏表
    await Game.createTable(db);
    console.log('✓ 游戏表创建成功');
    
    // 创建标签表
    await Tag.createTable(db);
    console.log('✓ 标签表创建成功');
    
    // 创建游戏标签关联表
    await Tag.createGameTagsTable(db);
    console.log('✓ 游戏标签关联表创建成功');
    
    // 创建评论表
    await Review.createTable(db);
    console.log('✓ 评论表创建成功');
    
    // 创建默认管理员账户
    await createDefaultAdmin();
    
    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  } finally {
    // 关闭数据库连接
    await db.end();
    console.log('数据库连接已关闭');
  }
}

// 执行数据库初始化
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;