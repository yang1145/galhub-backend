const express = require('express');
const Game = require('../models/Game');
const Tag = require('../models/Tag');
const db = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 辅助函数：为游戏列表添加标签
async function attachTagsToGames(games) {
  if (games.length === 0) return [];
  
  const gameIds = games.map(g => g.id);
  const tagsByGameId = await Game.findAllWithTags(db, gameIds);
  
  return games.map(game => ({
    ...game,
    tags: tagsByGameId[game.id] || []
  }));
}

// 获取所有游戏列表（管理员专用，支持更多功能）
router.get('/admin/games', requireAdmin, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const search = req.query.search || '';
    
    let games, total;
    if (search) {
      // 搜索功能
      const [searchResults] = await db.execute(
        'SELECT * FROM games WHERE title ILIKE $1 OR alias ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [`%${search}%`, limit, (page - 1) * limit]
      );
      const [countResult] = await db.execute(
        'SELECT COUNT(*) as total FROM games WHERE title ILIKE $1 OR alias ILIKE $1',
        [`%${search}%`]
      );
      games = searchResults;
      total = parseInt(countResult[0].total);
    } else {
      // 获取所有游戏
      [games] = await Game.findAll(db, page, limit);
      total = await Game.count(db);
    }
    
    // 使用批量查询获取标签
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
    console.error('获取游戏列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取游戏列表失败'
    });
  }
});

// 获取单个游戏详情（管理员专用）
router.get('/admin/games/:id', requireAdmin, async (req, res) => {
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
    console.error('获取游戏详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取游戏详情失败'
    });
  }
});

// 创建新游戏（管理员专用）
router.post('/admin/games', requireAdmin, async (req, res) => {
  try {
    const { title, alias, link, coverImage, description, rating, tags } = req.body;
    
    // 验证必要字段
    if (!title || typeof title !== 'string') {
      return res.status(400).json({
        success: false,
        message: '游戏标题是必需的'
      });
    }
    
    if (title.trim().length < 1 || title.length > 255) {
      return res.status(400).json({
        success: false,
        message: '游戏标题长度必须在1-255字符之间'
      });
    }
    
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 10)) {
      return res.status(400).json({
        success: false,
        message: '评分必须在0-10之间'
      });
    }
    
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
    
    // 处理标签
    if (tags && Array.isArray(tags)) {
      const validTags = tags.slice(0, 20).filter(t => typeof t === 'string' && t.trim().length > 0);
      
      for (const tagName of validTags) {
        const trimmedName = tagName.trim().substring(0, 100);
        let [existingTags] = await db.execute('SELECT id FROM tags WHERE name = $1', [trimmedName]);
        
        let tagId;
        if (existingTags.length > 0) {
          tagId = existingTags[0].id;
        } else {
          const [newTag] = await Tag.create(db, trimmedName);
          tagId = newTag.insertId;
        }
        
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
    console.error('创建游戏失败:', error);
    res.status(500).json({
      success: false,
      message: '创建游戏失败'
    });
  }
});

// 更新游戏信息（管理员专用）
router.put('/admin/games/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const gameId = parseInt(id);
    const { title, alias, link, coverImage, description, rating, tags } = req.body;
    
    if (isNaN(gameId) || gameId < 1) {
      return res.status(400).json({
        success: false,
        message: '无效的游戏ID'
      });
    }
    
    // 验证字段
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length < 1 || title.length > 255) {
        return res.status(400).json({
          success: false,
          message: '游戏标题长度必须在1-255字符之间'
        });
      }
    }
    
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 10)) {
      return res.status(400).json({
        success: false,
        message: '评分必须在0-10之间'
      });
    }
    
    if (link !== undefined && link !== null) {
      if (typeof link !== 'string' || link.length === 0) {
        link = null;
      } else {
        try {
          new URL(link);
        } catch {
          return res.status(400).json({
            success: false,
            message: '链接格式无效'
          });
        }
      }
    }
    
    // 构建更新SQL
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      updateValues.push(title.trim());
    }
    if (alias !== undefined) {
      updateFields.push(`alias = $${paramIndex++}`);
      updateValues.push(alias?.trim() || null);
    }
    if (link !== undefined) {
      updateFields.push(`link = $${paramIndex++}`);
      updateValues.push(link);
    }
    if (coverImage !== undefined) {
      updateFields.push(`cover_image = $${paramIndex++}`);
      updateValues.push(coverImage || null);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(description?.trim() || null);
    }
    if (rating !== undefined) {
      updateFields.push(`rating = $${paramIndex++}`);
      updateValues.push(rating);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '至少需要提供一个要更新的字段'
      });
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(gameId);
    
    const sql = `UPDATE games SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const [updatedGames] = await db.execute(sql, updateValues);
    
    if (updatedGames.length === 0) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      });
    }
    
    // 处理标签更新（如果提供了tags字段）
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          message: '标签必须是数组格式'
        });
      }
      
      // 先删除现有标签关联
      await db.execute('DELETE FROM game_tags WHERE game_id = $1', [gameId]);
      
      // 添加新标签
      const validTags = tags.slice(0, 20).filter(t => typeof t === 'string' && t.trim().length > 0);
      for (const tagName of validTags) {
        const trimmedName = tagName.trim().substring(0, 100);
        let [existingTags] = await db.execute('SELECT id FROM tags WHERE name = $1', [trimmedName]);
        
        let tagId;
        if (existingTags.length > 0) {
          tagId = existingTags[0].id;
        } else {
          const [newTag] = await Tag.create(db, trimmedName);
          tagId = newTag.insertId;
        }
        
        await Tag.addTagToGame(db, gameId, tagId);
      }
    }
    
    const [tagsResult] = await Tag.findByGameId(db, gameId);
    
    res.json({
      success: true,
      data: {
        ...updatedGames[0],
        tags: tagsResult
      }
    });
  } catch (error) {
    console.error('更新游戏失败:', error);
    res.status(500).json({
      success: false,
      message: '更新游戏失败'
    });
  }
});

// 删除游戏（管理员专用）
router.delete('/admin/games/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const gameId = parseInt(id);
    
    if (isNaN(gameId) || gameId < 1) {
      return res.status(400).json({
        success: false,
        message: '无效的游戏ID'
      });
    }
    
    // 先检查游戏是否存在
    const [existingGames] = await Game.findById(db, gameId);
    if (existingGames.length === 0) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      });
    }
    
    // 删除游戏标签关联
    await db.execute('DELETE FROM game_tags WHERE game_id = $1', [gameId]);
    
    // 删除游戏相关的评论
    await db.execute('DELETE FROM reviews WHERE game_id = $1', [gameId]);
    
    // 删除游戏
    await db.execute('DELETE FROM games WHERE id = $1', [gameId]);
    
    res.json({
      success: true,
      message: '游戏删除成功'
    });
  } catch (error) {
    console.error('删除游戏失败:', error);
    res.status(500).json({
      success: false,
      message: '删除游戏失败'
    });
  }
});

module.exports = router;