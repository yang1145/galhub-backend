class Game {
  constructor(id, title, alias, link, coverImage, description, rating) {
    this.id = id;
    this.title = title;
    this.alias = alias;
    this.link = link;
    this.coverImage = coverImage;
    this.description = description;
    this.rating = rating;
  }

  // 创建游戏表
  static createTable(db) {
    const sql = `
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        alias VARCHAR(255),
        link TEXT,
        cover_image VARCHAR(255),
        description TEXT,
        rating DECIMAL(3,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    return db.execute(sql);
  }

  // 插入新游戏
  static async create(db, gameData) {
    const { title, alias, link, coverImage, description, rating } = gameData;
    const sql = `
      INSERT INTO games (title, alias, link, cover_image, description, rating)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const [rows, result] = await db.execute(sql, [title, alias, link, coverImage, description, rating || 0.00]);
    return [{ insertId: rows[0].id }, result];
  }

  // 获取所有游戏（带分页）
  static findAll(db, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = 'SELECT * FROM games ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    return db.execute(sql, [limit, offset]);
  }

  // 获取游戏总数
  static async count(db) {
    const sql = 'SELECT COUNT(*) as total FROM games';
    const [rows] = await db.execute(sql);
    return parseInt(rows[0].total);
  }

  // 获取最新游戏列表（默认限制10个）
  static findLatest(db, limit = 10) {
    const sql = 'SELECT * FROM games ORDER BY created_at DESC LIMIT $1';
    return db.execute(sql, [limit]);
  }

  // 获取热门游戏列表（按评分降序排列，默认限制10个）
  static findPopular(db, limit = 10) {
    const sql = 'SELECT * FROM games ORDER BY rating DESC, created_at DESC LIMIT $1';
    return db.execute(sql, [limit]);
  }

  // 根据ID查找游戏
  static findById(db, id) {
    const sql = 'SELECT * FROM games WHERE id = $1';
    return db.execute(sql, [id]);
  }

  // 批量获取游戏的标签（解决N+1问题）
  static async findAllWithTags(db, gameIds) {
    if (!gameIds || gameIds.length === 0) return [];
    
    const placeholders = gameIds.map((_, i) => `$${i + 1}`).join(',');
    const sql = `
      SELECT gt.game_id, t.id, t.name, t.created_at, t.updated_at
      FROM game_tags gt
      JOIN tags t ON gt.tag_id = t.id
      WHERE gt.game_id IN (${placeholders})
      ORDER BY t.name
    `;
    const [rows] = await db.execute(sql, gameIds);
    
    // 将结果按game_id分组
    const tagsByGameId = {};
    for (const row of rows) {
      const gameId = row.game_id;
      if (!tagsByGameId[gameId]) {
        tagsByGameId[gameId] = [];
      }
      tagsByGameId[gameId].push({
        id: row.id,
        name: row.name,
        created_at: row.created_at,
        updated_at: row.updated_at
      });
    }
    
    return tagsByGameId;
  }
}

module.exports = Game;
