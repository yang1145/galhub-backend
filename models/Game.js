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
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        alias VARCHAR(255),
        link TEXT,
        cover_image VARCHAR(255),
        description TEXT,
        rating DECIMAL(3,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    return db.execute(sql);
  }

  // 插入新游戏
  static create(db, gameData) {
    const { title, alias, link, coverImage, description, rating } = gameData;
    const sql = `
      INSERT INTO games (title, alias, link, cover_image, description, rating)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return db.execute(sql, [title, alias, link, coverImage, description, rating || 0.00]);
  }

  // 获取所有游戏
  static findAll(db) {
    const sql = 'SELECT * FROM games ORDER BY created_at DESC';
    return db.execute(sql);
  }

  // 根据ID查找游戏
  static findById(db, id) {
    const sql = 'SELECT * FROM games WHERE id = ?';
    return db.execute(sql, [id]);
  }
}

module.exports = Game;