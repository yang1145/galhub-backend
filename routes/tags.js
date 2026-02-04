const express = require('express');
const Tag = require('../models/Tag');
const db = require('../config/db');

const router = express.Router();

// 获取标签列表
router.get('/tags', async (req, res) => {
  try {
    const [tags] = await Tag.findAll(db);
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '获取标签列表失败'
    });
  }
});

// 添加新标签
router.post('/tags', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '标签名称是必需的'
      });
    }
    
    const [result] = await Tag.create(db, name);
    const tagId = result.insertId;
    
    // 返回创建的标签
    const [tags] = await db.execute('SELECT * FROM tags WHERE id = $1', [tagId]);
    
    res.status(201).json({
      success: true,
      data: tags[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '创建标签失败'
    });
  }
});

module.exports = router;
