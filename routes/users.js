const express = require('express');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const db = require('../config/db');
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

// 输入验证辅助函数
const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return '用户名是必需的';
  }
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 50) {
    return '用户名长度必须在3-50字符之间';
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(trimmed)) {
    return '用户名只能包含字母、数字、下划线和中文';
  }
  return null;
};

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '邮箱是必需的';
  }
  if (!validator.isEmail(email)) {
    return '邮箱格式无效';
  }
  if (email.length > 100) {
    return '邮箱长度不能超过100字符';
  }
  return null;
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return '密码是必需的';
  }
  if (password.length < 8) {
    return '密码长度至少8个字符';
  }
  if (password.length > 128) {
    return '密码长度不能超过128字符';
  }
  // 检查密码强度：至少包含字母和数字
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return '密码必须包含字母和数字';
  }
  return null;
};

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 输入验证
    const usernameError = validateUsername(username);
    if (usernameError) {
      return res.status(400).json({ success: false, message: usernameError });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ success: false, message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const trimmedUsername = username.trim();
    const normalizedEmail = validator.normalizeEmail(email);

    // 检查用户名是否已存在
    const [existingUsersByName] = await User.findByUsername(db, trimmedUsername);
    if (existingUsersByName.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名已被使用'
      });
    }

    // 检查邮箱是否已存在
    const [existingUsersByEmail] = await User.findByEmail(db, normalizedEmail);
    if (existingUsersByEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: '邮箱已被使用'
      });
    }

    // 密码加密
    const saltRounds = 12; // 提高到12轮以增强安全性
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const [result] = await User.create(db, {
      username: trimmedUsername,
      email: normalizedEmail,
      password: hashedPassword
    });

    const userId = result.insertId;

    // 获取创建的用户信息（不包含密码）
    const [users] = await db.execute(
      'SELECT id, username, email FROM users WHERE id = $1',
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
    const [users] = await User.findByUsername(db, username.trim());
    if (users.length === 0) {
      // 使用统一的错误消息防止用户名枚举攻击
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const user = users[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
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

// 获取当前用户信息（需要认证）
router.get('/me', authenticate, async (req, res) => {
  try {
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
