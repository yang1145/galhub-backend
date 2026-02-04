const config = {
  // 数据库配置
  database: {
    host: 'localhost',
    user: 'postgres',
    password: '',
    database: 'galhub',
    port: 5432,
    max: 10
  },
  
  // 服务器配置
  server: {
    port: 3000,
    corsOrigin: ['http://localhost:3000']
  },
  
  // JWT配置（如果需要的话）
  jwt: {
    secret: 'your-jwt-secret-key-here' // 在生产环境中应该使用更安全的密钥
  }
};

module.exports = config;