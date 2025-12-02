/**
 * 数据库初始化脚本
 * 用于创建数据库表结构
 */

const db = require('./config/db');
const Game = require('./models/Game');
const Tag = require('./models/Tag');

async function initDatabase() {
  try {
    console.log('开始初始化数据库...');
    
    // 创建游戏表
    await Game.createTable(db);
    console.log('✓ 游戏表创建成功');
    
    // 创建标签表
    await Tag.createTable(db);
    console.log('✓ 标签表创建成功');
    
    // 创建游戏标签关联表
    await Tag.createGameTagsTable(db);
    console.log('✓ 游戏标签关联表创建成功');
    
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