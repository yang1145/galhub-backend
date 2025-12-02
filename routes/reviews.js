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

    // 验证必填字段
    if (!gameId || !rating) {
      return res.status(400).json({
        success: false,
        message: '游戏ID和评分都是必需的'
      });
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: '评分必须在1-5之间'
      });
    }

    // 检查是否已经对该游戏发表过评论
    const [existingReviews] = await db.execute(
      'SELECT id FROM reviews WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
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
      gameId,
      rating,
      comment
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

    const [reviews] = await Review.findByGameId(db, gameId);

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

    const [reviews] = await Review.findByUserId(db, userId);

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

    // 验证评分范围
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: '评分必须在1-5之间'
      });
    }

    // 检查评论是否存在且属于当前用户
    const [reviews] = await db.execute(
      'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: '评论未找到或无权限修改'
      });
    }

    // 更新评论
    await Review.update(db, id, { rating, comment });

    // 获取更新后的评论信息
    const [updatedReviews] = await Review.findById(db, id);

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

    // 检查评论是否存在且属于当前用户
    const [reviews] = await db.execute(
      'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: '评论未找到或无权限删除'
      });
    }

    // 删除评论
    await Review.delete(db, id);

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