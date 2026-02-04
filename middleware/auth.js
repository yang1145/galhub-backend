const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 获取JWT密钥（生产环境必须设置环境变量）
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('生产环境必须设置JWT_SECRET环境变量');
    }
    console.warn('警告: 未设置JWT_SECRET，使用开发环境默认密钥（不要在生产环境使用）');
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
