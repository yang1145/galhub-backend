const express = require('express');
const svgCaptcha = require('svg-captcha');
const captchaStore = require('../utils/captchaStore');

const router = express.Router();

// 生成验证码
router.get('/generate', (req, res) => {
  try {
    const captcha = svgCaptcha.create({
      size: 4, // 验证码长度
      ignoreChars: '0o1i', // 排除容易混淆的字符
      noise: 2, // 干扰线条数量
      color: true, // 彩色验证码
      background: '#fff' // 背景色
    });

    // 生成唯一的会话ID
    const captchaId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // 存储验证码（5分钟过期）
    captchaStore.set(captchaId, {
      text: captcha.text.toLowerCase()
    });

    res.json({
      success: true,
      data: {
        captchaId,
        svg: captcha.data
      }
    });
  } catch (error) {
    console.error('生成验证码错误:', error);
    res.status(500).json({
      success: false,
      message: '生成验证码失败'
    });
  }
});

// 验证验证码
router.post('/verify', (req, res) => {
  try {
    const { captchaId, captchaText } = req.body;

    if (!captchaId || !captchaText) {
      return res.status(400).json({
        success: false,
        message: '验证码ID和验证码文本都是必需的'
      });
    }

    const storedCaptcha = captchaStore.get(captchaId);
    
    if (!storedCaptcha) {
      return res.status(400).json({
        success: false,
        message: '验证码不存在或已过期'
      });
    }

    // 检查是否过期
    if (Date.now() > storedCaptcha.expiresAt) {
      captchaStore.delete(captchaId);
      return res.status(400).json({
        success: false,
        message: '验证码已过期'
      });
    }

    // 验证验证码（不区分大小写）
    const isValid = storedCaptcha.text === captchaText.toLowerCase();
    
    if (isValid) {
      // 验证成功后删除验证码
      captchaStore.delete(captchaId);
      return res.json({
        success: true,
        message: '验证码验证成功'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: '验证码错误'
      });
    }
  } catch (error) {
    console.error('验证验证码错误:', error);
    res.status(500).json({
      success: false,
      message: '验证码验证失败'
    });
  }
});

module.exports = router;