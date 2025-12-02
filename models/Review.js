class Review {
  constructor(id, userId, gameId, rating, comment) {
    this.id = id;
    this.userId = userId;
    this.gameId = gameId;
    this.rating = rating;
    this.comment = comment;
  }

  // 创建评论表
  static createTable(db) {
    const sql = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        game_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_game (user_id, game_id)
      )
    `;
    return db.execute(sql);
  }

  // 创建评论
  static create(db, reviewData) {
    const { userId, gameId, rating, comment } = reviewData;
    const sql = `
      INSERT INTO reviews (user_id, game_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `;
    return db.execute(sql, [userId, gameId, rating, comment]);
  }

  // 根据游戏ID获取评论
  static findByGameId(db, gameId) {
    const sql = `
      SELECT r.*, u.username 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.game_id = ?
      ORDER BY r.created_at DESC
    `;
    return db.execute(sql, [gameId]);
  }

  // 根据用户ID获取评论
  static findByUserId(db, userId) {
    const sql = `
      SELECT r.*, g.title as game_title
      FROM reviews r
      JOIN games g ON r.game_id = g.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;
    return db.execute(sql, [userId]);
  }

  // 根据ID查找评论
  static findById(db, id) {
    const sql = `
      SELECT r.*, u.username, g.title as game_title
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN games g ON r.game_id = g.id
      WHERE r.id = ?
    `;
    return db.execute(sql, [id]);
  }

  // 更新评论
  static update(db, id, reviewData) {
    const { rating, comment } = reviewData;
    const sql = `
      UPDATE reviews
      SET rating = ?, comment = ?
      WHERE id = ?
    `;
    return db.execute(sql, [rating, comment, id]);
  }

  // 删除评论
  static delete(db, id) {
    const sql = 'DELETE FROM reviews WHERE id = ?';
    return db.execute(sql, [id]);
  }
}

module.exports = Review;