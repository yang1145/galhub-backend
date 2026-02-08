class User {
  constructor(id, username, email, password, role) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role || 'user'; // 默认角色为普通用户
  }

  // 创建用户表
  static createTable(db) {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    return db.execute(sql);
  }

  // 根据用户名查找用户（包含角色信息）
  static findByUsername(db, username) {
    const sql = 'SELECT * FROM users WHERE username = $1';
    return db.execute(sql, [username]);
  }

  // 根据邮箱查找用户（包含角色信息）
  static findByEmail(db, email) {
    const sql = 'SELECT * FROM users WHERE email = $1';
    return db.execute(sql, [email]);
  }

  // 根据ID查找用户（包含角色信息）
  static findById(db, id) {
    const sql = 'SELECT id, username, email, role FROM users WHERE id = $1';
    return db.execute(sql, [id]);
  }

  // 创建新用户
  static async create(db, userData) {
    const { username, email, password, role = 'user' } = userData;
    const sql = `
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const [rows, result] = await db.execute(sql, [username, email, password, role]);
    return [{ insertId: rows[0].id }, result];
  }

  // 更新用户密码
  static async updatePassword(db, userId, hashedPassword) {
    const sql = `
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    return await db.execute(sql, [hashedPassword, userId]);
  }
}

module.exports = User;