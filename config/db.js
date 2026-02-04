const { Pool } = require('pg');
const config = require('./index');

// 创建数据库连接池
const pool = new Pool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  port: config.database.port,
  max: config.database.max
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