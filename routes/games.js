const express = require('express');
const Game = require('../models/Game');
const Tag = require('../models/Tag');
const db = require('../config/db');

const router = express.Router();

// 获取最新游戏列表
router.get('/games/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [games] = await Game.findLatest(db, Math.min(limit, 50)); // 限制最多50个
    
    // 为每个游戏添加标签信息
    const gamesWithTags = await Promise.all(games.map(async (game) => {
      const [tags] = await Tag.findByGameId(db, game.id);
      return {
        ...game,
        tags
      };
    }));

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
    const limit = parseInt(req.query.limit) || 10;
    const [games] = await Game.findPopular(db, Math.min(limit, 50)); // 限制最多50个
    
    // 为每个游戏添加标签信息
    const gamesWithTags = await Promise.all(games.map(async (game) => {
      const [tags] = await Tag.findByGameId(db, game.id);
      return {
        ...game,
        tags
      };
    }));

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

// 获取游戏列表
router.get('/games', async (req, res) => {
  try {
    const [games] = await Game.findAll(db);
    
    // 为每个游戏添加标签信息
    const gamesWithTags = await Promise.all(games.map(async (game) => {
      const [tags] = await Tag.findByGameId(db, game.id);
      return {
        ...game,
        tags
      };
    }));

    res.json({
      success: true,
      data: gamesWithTags
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '获取游戏列表失败'
    });
  }
});

// 添加新游戏
router.post('/games', async (req, res) => {
  try {
    const { title, alias, link, coverImage, description, rating, tags } = req.body;
    
    // 验证必要字段
    if (!title) {
      return res.status(400).json({
        success: false,
        message: '游戏标题是必需的'
      });
    }
    
    // 创建游戏
    const [result] = await Game.create(db, { title, alias, link, coverImage, description, rating });
    const gameId = result.insertId;
    
    // 如果提供了标签，则关联它们
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        // 检查标签是否已存在，如果不存在则创建
        let [existingTags] = await db.execute('SELECT id FROM tags WHERE name = ?', [tagName]);
        
        let tagId;
        if (existingTags.length > 0) {
          tagId = existingTags[0].id;
        } else {
          const [newTag] = await Tag.create(db, tagName);
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

module.exports = router;