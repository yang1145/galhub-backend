const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码都是必需的'
      });
    }

    // 检查用户名是否已存在
    const [existingUsersByName] = await User.findByUsername(db, username);
    if (existingUsersByName.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名已被使用'
      });
    }

    // 检查邮箱是否已存在
    const [existingUsersByEmail] = await User.findByEmail(db, email);
    if (existingUsersByEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: '邮箱已被使用'
      });
    }

    // 密码加密
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const [result] = await User.create(db, {
      username,
      email,
      password: hashedPassword
    });

    const userId = result.insertId;

    // 获取创建的用户信息（不包含密码）
    const [users] = await db.execute(
      'SELECT id, username, email FROM users WHERE id = ?',
      [userId]
    );

    // 生成JWT令牌
    const token = generateToken(users[0]);

    res.status(201).json({
      success: true,
      message: '用户注册成功',
      data: {
        user: users[0],
        token
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码都是必需的'
      });
    }

    // 查找用户
    const [users] = await User.findByUsername(db, username);
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const user = users[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成JWT令牌
    const token = generateToken(user);

    // 返回用户信息（不包含密码）
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: userInfo,
        token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    // 从请求中获取用户信息（由认证中间件添加）
    const userId = req.user.id;

    // 获取用户信息
    const [users] = await User.findById(db, userId);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户未找到'
      });
    }

    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

module.exports = router;