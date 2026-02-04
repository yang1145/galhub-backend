const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/index');

// 获取JWT密钥
const getJwtSecret = () => {
  const secret = config.jwt.secret;
  if (!secret) {
    console.warn('警告: JWT_SECRET未在配置文件中设置，请确保在生产环境中设置安全的密钥');
    return 'dev_secret_key_do_not_use_in_production';
  }
  return secret;
};

// 生成JWT令牌
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    getJwtSecret(),
    { expiresIn: '24h' }
  );
};

// 验证JWT令牌
const verifyToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
};

// 验证密码
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// 认证中间件
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供访问令牌'
      });
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '无效的访问令牌'
      });
    }

    // 将用户信息附加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  verifyPassword,
  authenticate
};