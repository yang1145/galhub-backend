const express = require('express');
const db = require('../config/db');
const Review = require('../models/Review');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 创建评论（需要认证）
router.post('/reviews', authenticate, async (req, res) => {
  try {
    const { gameId, rating, comment } = req.body;
    const userId = req.user.id;

    // 验证gameId
    const parsedGameId = parseInt(gameId);
    if (!gameId || isNaN(parsedGameId) || parsedGameId < 1) {
      return res.status(400).json({
        success: false,
        message: '游戏ID无效'
      });
    }

    // 验证评分
    const parsedRating = parseInt(rating);
    if (!rating || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: '评分必须在1-5之间'
      });
    }

    // 验证评论内容
    if (comment && (typeof comment !== 'string' || comment.length > 2000)) {
      return res.status(400).json({
        success: false,
        message: '评论内容不能超过2000字符'
      });
    }

    // 检查游戏是否存在
    const [games] = await db.execute('SELECT id FROM games WHERE id = $1', [parsedGameId]);
    if (games.length === 0) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      });
    }

    // 检查是否已经对该游戏发表过评论
    const [existingReviews] = await db.execute(
      'SELECT id FROM reviews WHERE user_id = $1 AND game_id = $2',
      [userId, parsedGameId]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({
        success: false,
        message: '您已经对该游戏发表过评论'
      });
    }

    // 创建评论
    const [result] = await Review.create(db, {
      userId,
      gameId: parsedGameId,
      rating: parsedRating,
      comment: comment?.trim() || null
    });

    const reviewId = result.insertId;

    // 获取创建的评论信息
    const [reviews] = await Review.findById(db, reviewId);

    res.status(201).json({
      success: true,
      message: '评论创建成功',
      data: reviews[0]
    });
  } catch (error) {
    console.error('创建评论错误:', error);
    res.status(500).json({
      success: false,
      message: '创建评论失败'
    });
  }
});

// 获取特定游戏的所有评论
router.get('/reviews/game/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const parsedGameId = parseInt(gameId);

    if (isNaN(parsedGameId) || parsedGameId < 1) {
      return res.status(400).json({
        success: false,
        message: '游戏ID无效'
      });
    }

    const [reviews] = await Review.findByGameId(db, parsedGameId);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('获取游戏评论错误:', error);
    res.status(500).json({
      success: false,
      message: '获取游戏评论失败'
    });
  }
});

// 获取特定用户的所有评论
router.get('/reviews/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const parsedUserId = parseInt(userId);

    if (isNaN(parsedUserId) || parsedUserId < 1) {
      return res.status(400).json({
        success: false,
        message: '用户ID无效'
      });
    }

    const [reviews] = await Review.findByUserId(db, parsedUserId);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('获取用户评论错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户评论失败'
    });
  }
});

// 更新评论（需要认证，只能更新自己的评论）
router.put('/reviews/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId < 1) {
      return res.status(400).json({
        success: false,
        message: '评论ID无效'
      });
    }

    // 验证评分范围
    const parsedRating = parseInt(rating);
    if (rating !== undefined && (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5)) {
      return res.status(400).json({
        success: false,
        message: '评分必须在1-5之间'
      });
    }

    // 验证评论内容
    if (comment && (typeof comment !== 'string' || comment.length > 2000)) {
      return res.status(400).json({
        success: false,
        message: '评论内容不能超过2000字符'
      });
    }

    // 检查评论是否存在且属于当前用户
    const [reviews] = await db.execute(
      'SELECT id, rating FROM reviews WHERE id = $1 AND user_id = $2',
      [parsedId, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: '评论未找到或无权限修改'
      });
    }

    // 更新评论
    await Review.update(db, parsedId, { 
      rating: parsedRating || reviews[0].rating, 
      comment: comment?.trim() 
    });

    // 获取更新后的评论信息
    const [updatedReviews] = await Review.findById(db, parsedId);

    res.json({
      success: true,
      message: '评论更新成功',
      data: updatedReviews[0]
    });
  } catch (error) {
    console.error('更新评论错误:', error);
    res.status(500).json({
      success: false,
      message: '更新评论失败'
    });
  }
});

// 删除评论（需要认证，只能删除自己的评论）
router.delete('/reviews/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId < 1) {
      return res.status(400).json({
        success: false,
        message: '评论ID无效'
      });
    }

    // 检查评论是否存在且属于当前用户
    const [reviews] = await db.execute(
      'SELECT id FROM reviews WHERE id = $1 AND user_id = $2',
      [parsedId, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: '评论未找到或无权限删除'
      });
    }

    // 删除评论
    await Review.delete(db, parsedId);

    res.json({
      success: true,
      message: '评论删除成功'
    });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({
      success: false,
      message: '删除评论失败'
    });
  }
});

module.exports = router;
