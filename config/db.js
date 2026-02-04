const { Pool } = require('pg');

// 创建数据库连接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'galhub',
  port: process.env.DB_PORT || 5432,
  max: 10
});

// 封装查询方法，使返回格式与mysql2兼容
const db = {
  query: async (sql, params) => {
    const result = await pool.query(sql, params);
    return [result.rows, result];
  },
  execute: async (sql, params) => {
    const result = await pool.query(sql, params);
    return [result.rows, result];
  },
  end: () => pool.end()
};

module.exports = db;
