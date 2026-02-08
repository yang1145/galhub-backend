const express = require('express');
const Game = require('../models/Game');
const Tag = require('../models/Tag');
const User = require('../models/User');
const Review = require('../models/Review');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 辅助函数：为游戏列表添加标签（解决N+1查询问题）
async function attachTagsToGames(games) {
  if (games.length === 0) return [];
  
  const gameIds = games.map(g => g.id);
  const tagsByGameId = await Game.findAllWithTags(db, gameIds);
  
  return games.map(game => ({
    ...game,
    tags: tagsByGameId[game.id] || []
  }));
}

// 获取最新游戏列表
router.get('/games/latest', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const [games] = await Game.findLatest(db, limit);
    
    // 使用批量查询获取标签（解决N+1问题）
    const gamesWithTags = await attachTagsToGames(games);

    res.json({
      success: true,
      data: gamesWithTags
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '获取最新游戏列表失败'
    });
  }
});

// 获取热门游戏列表
router.get('/games/popular', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const [games] = await Game.findPopular(db, limit);
    
    // 使用批量查询获取标签（解决N+1问题）
    const gamesWithTags = await attachTagsToGames(games);

    res.json({
      success: true,
      data: gamesWithTags
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '获取热门游戏列表失败'
    });
  }
});

// 获取游戏列表（带分页）
router.get('/games', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    
    const [games] = await Game.findAll(db, page, limit);
    const total = await Game.count(db);
    
    // 使用批量查询获取标签（解决N+1问题）
    const gamesWithTags = await attachTagsToGames(games);

    res.json({
      success: true,
      data: gamesWithTags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '获取游戏列表失败'
    });
  }
});

// 获取单个游戏详情
router.get('/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gameId = parseInt(id);
    
    if (isNaN(gameId) || gameId < 1) {
      return res.status(400).json({
        success: false,
        message: '无效的游戏ID'
      });
    }
    
    const [games] = await Game.findById(db, gameId);
    
    if (games.length === 0) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      });
    }
    
    const [tags] = await Tag.findByGameId(db, gameId);
    
    res.json({
      success: true,
      data: {
        ...games[0],
        tags
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '获取游戏详情失败'
    });
  }
});

// 添加新游戏（需要认证）
router.post('/games', authenticate, async (req, res) => {
  try {
    const { title, alias, link, coverImage, description, rating, tags } = req.body;
    
    // 验证必要字段
    if (!title || typeof title !== 'string') {
      return res.status(400).json({
        success: false,
        message: '游戏标题是必需的'
      });
    }
    
    // 验证标题长度
    if (title.trim().length < 1 || title.length > 255) {
      return res.status(400).json({
        success: false,
        message: '游戏标题长度必须在1-255字符之间'
      });
    }
    
    // 验证评分范围
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 10)) {
      return res.status(400).json({
        success: false,
        message: '评分必须在0-10之间'
      });
    }
    
    // 验证URL格式
    if (link && typeof link === 'string' && link.length > 0) {
      try {
        new URL(link);
      } catch {
        return res.status(400).json({
          success: false,
          message: '链接格式无效'
        });
      }
    }
    
    // 创建游戏
    const [result] = await Game.create(db, { 
      title: title.trim(), 
      alias: alias?.trim() || null, 
      link: link || null, 
      coverImage: coverImage || null, 
      description: description?.trim() || null, 
      rating: rating || 0 
    });
    const gameId = result.insertId;
    
    // 如果提供了标签，则关联它们
    if (tags && Array.isArray(tags)) {
      // 限制标签数量
      const validTags = tags.slice(0, 20).filter(t => typeof t === 'string' && t.trim().length > 0);
      
      for (const tagName of validTags) {
        const trimmedName = tagName.trim().substring(0, 100);
        // 检查标签是否已存在，如果不存在则创建
        let [existingTags] = await db.execute('SELECT id FROM tags WHERE name = $1', [trimmedName]);
        
        let tagId;
        if (existingTags.length > 0) {
          tagId = existingTags[0].id;
        } else {
          const [newTag] = await Tag.create(db, trimmedName);
          tagId = newTag.insertId;
        }
        
        // 关联游戏和标签
        await Tag.addTagToGame(db, gameId, tagId);
      }
    }
    
    // 返回创建的游戏
    const [games] = await Game.findById(db, gameId);
    const [tagsResult] = await Tag.findByGameId(db, gameId);
    
    res.status(201).json({
      success: true,
      data: {
        ...games[0],
        tags: tagsResult
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '创建游戏失败'
    });
  }
});

// 获取统计信息
router.get('/stats', async (req, res) => {
  try {
    // 并行获取三个统计数字
    const [gameCount, userCount, reviewCount] = await Promise.all([
      Game.count(db),
      User.count(db),
      Review.count(db)
    ]);

    res.json({
      success: true,
      data: {
        gameCount: gameCount,
        userCount: userCount,
        reviewCount: reviewCount
      }
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败'
    });
  }
});

module.exports = router;
