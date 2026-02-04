const db = require('./config/db');
const Game = require('./models/Game');
const Tag = require('./models/Tag');
const User = require('./models/User');
const Review = require('./models/Review');

async function seedDatabase() {
  try {
    // 初始化表
    await User.createTable(db);
    await Game.createTable(db);
    await Tag.createTable(db);
    await Tag.createGameTagsTable(db);
    await Review.createTable(db);
    
    console.log('数据库表初始化完成');
    
    // 插入示例标签
    const tags = ['动作', '冒险', '角色扮演', '策略', '模拟'];
    const tagIds = [];
    
    for (const tagName of tags) {
      try {
        const [result] = await Tag.create(db, tagName);
        tagIds.push(result.insertId);
        console.log(`标签 "${tagName}" 创建成功`);
      } catch (error) {
        // 标签可能已存在，尝试获取现有标签ID
        const [existingTags] = await db.execute('SELECT id FROM tags WHERE name = $1', [tagName]);
        if (existingTags.length > 0) {
          tagIds.push(existingTags[0].id);
          console.log(`标签 "${tagName}" 已存在`);
        }
      }
    }
    
    // 插入示例游戏
    const games = [
      {
        title: '塞尔达传说：旷野之息',
        alias: 'Breath of the Wild',
        link: 'https://www.nintendo.co.jp/switch/azge/index.html',
        coverImage: 'https://example.com/zelda-cover.jpg',
        description: '《塞尔达传说：旷野之息》是任天堂企划制作本部开发并发行的动作冒险游戏，是塞尔达传说系列的第19部作品，于2017年3月3日在Nintendo Switch平台发售。',
        rating: 9.5
      },
      {
        title: '超级马里奥：奥德赛',
        alias: 'Super Mario Odyssey',
        link: 'https://www.nintendo.co.jp/switch/aab6/index.html',
        coverImage: 'https://example.com/mario-cover.jpg',
        description: '《超级马里奥：奥德赛》是任天堂开发并发行的3D超级马里奥系列游戏，于2017年10月27日发售。本作继承了前作《超级马里奥：银河》的3D玩法，并加入了类似《超级马里奥兄弟2》的帽子夺取要素。',
        rating: 9.0
      },
      {
        title: '动物森友会',
        alias: 'Animal Crossing',
        link: 'https://www.nintendo.co.jp/switch/acba/index.html',
        coverImage: 'https://example.com/animal-crossing-cover.jpg',
        description: '《集合啦！动物森友会》是任天堂开发并发行的生活模拟游戏，于2020年3月20日发售。玩家将在无人岛上展开自由自在的生活，可以钓鱼、捉虫、挖掘化石等，还可以和岛上的动物居民们交流互动。',
        rating: 8.5
      }
    ];
    
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      try {
        const [result] = await Game.create(db, game);
        const gameId = result.insertId;
        console.log(`游戏 "${game.title}" 创建成功`);
        
        // 为每个游戏添加一些标签
        const gameTagIds = tagIds.slice(0, Math.min(3, tagIds.length));
        for (const tagId of gameTagIds) {
          await Tag.addTagToGame(db, gameId, tagId);
        }
      } catch (error) {
        console.error(`创建游戏 "${game.title}" 失败:`, error);
      }
    }
    
    console.log('示例数据插入完成');
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error('数据填充过程中出错:', error);
    await db.end();
    process.exit(1);
  }
}

seedDatabase();
