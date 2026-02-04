class Tag {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  // 创建标签表
  static createTable(db) {
    const sql = `
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    return db.execute(sql);
  }

  // 创建游戏标签关联表
  static createGameTagsTable(db) {
    const sql = `
      CREATE TABLE IF NOT EXISTS game_tags (
        id SERIAL PRIMARY KEY,
        game_id INT NOT NULL,
        tag_id INT NOT NULL,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        UNIQUE (game_id, tag_id)
      )
    `;
    return db.execute(sql);
  }

  // 创建新标签
  static async create(db, tagName) {
    const sql = 'INSERT INTO tags (name) VALUES ($1) RETURNING id';
    const [rows, result] = await db.execute(sql, [tagName]);
    return [{ insertId: rows[0].id }, result];
  }

  // 获取所有标签
  static findAll(db) {
    const sql = 'SELECT * FROM tags ORDER BY name';
    return db.execute(sql);
  }

  // 根据游戏ID获取标签
  static findByGameId(db, gameId) {
    const sql = `
      SELECT t.* FROM tags t
      JOIN game_tags gt ON t.id = gt.tag_id
      WHERE gt.game_id = $1
    `;
    return db.execute(sql, [gameId]);
  }

  // 关联游戏和标签
  static addTagToGame(db, gameId, tagId) {
    const sql = 'INSERT INTO game_tags (game_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
    return db.execute(sql, [gameId, tagId]);
  }
}

module.exports = Tag;
