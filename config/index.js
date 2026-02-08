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
    corsOrigin: ['http://localhost:3000'],
    // 信任代理设置
    // - false: 不信任任何代理（默认，最安全）
    // - true: 信任所有代理（不推荐，有安全风险）
    // - 数字: 信任指定数量的代理（例如 1 表示信任第一个代理）
    // - 字符串数组: 信任指定的IP地址或子网
    // 本地开发环境建议设为 false，生产环境根据实际代理配置
    trustProxy: false
  },
  
  // JWT配置（如果需要的话）
  jwt: {
    secret: 'your-jwt-secret-key-here' // 在生产环境中应该使用更安全的密钥
  }
};

module.exports = config;