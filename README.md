# GalHub Backend

一个基于 Node.js 和 MySQL 的游戏管理系统后端 API。

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [安装指南](#安装指南)
- [API 接口文档](#api-接口文档)
- [数据库结构](#数据库结构)
- [开发命令](#开发命令)
- [许可证](#许可证)

## 功能特性

- 用户注册与登录（JWT认证）
- 游戏管理（增删改查）
- 标签管理（增删改查）
- 游戏与标签的多对多关系
- 用户评论和评分功能
- RESTful API 设计

## 技术栈

- Node.js
- Express.js
- MySQL
- mysql2 驱动

## 安装指南

1. 克隆项目到本地：
   ```
   git clone <repository-url>
   ```

2. 进入项目目录：
   ```
   cd galhub-backend
   ```

3. 安装依赖：
   ```
   npm install
   ```

4. 配置数据库：
   在 `.env` 文件中设置你的 MySQL 数据库连接信息：
   ```
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=galhub
   ```

5. 初始化数据库（创建表结构）：
   ```
   npm run init-db
   ```

6. （可选）填充示例数据：
   ```
   npm run seed
   ```

7. 启动开发服务器：
   ```
   npm run dev
   ```

## API 接口文档

有关完整的 API 文档，请参阅 [API.md](API.md) 文件。

以下是主要 API 接口的简要说明：

### 用户认证接口

#### 用户注册
```
POST /api/register
```

请求体示例：
```json
{
  "username": "用户名",
  "email": "邮箱地址",
  "password": "密码"
}
```

#### 用户登录
```
POST /api/login
```

请求体示例：
```json
{
  "username": "用户名",
  "password": "密码"
}
```

#### 获取当前用户信息
```
GET /api/me
```
需要在请求头中包含有效的JWT令牌：
```
Authorization: Bearer <token>
```

### 游戏相关接口

#### 获取游戏列表
```
GET /api/games
```

返回所有游戏及其标签信息。

#### 创建新游戏
```
POST /api/games
```

请求体示例：
```json
{
  "title": "游戏标题",
  "alias": "游戏别名",
  "link": "游戏链接",
  "coverImage": "游戏封面图片链接",
  "description": "游戏简介",
  "rating": 9.5,
  "tags": ["标签1", "标签2"]
}
```

参数说明：
- title: 游戏标题（必需）
- alias: 游戏别名（可选）
- link: 游戏链接（可选）
- coverImage: 游戏封面图片链接（可选）
- description: 游戏简介（可选）
- rating: 游戏评分（可选，默认为0.00）
- tags: 标签数组（可选）

### 标签相关接口

#### 获取标签列表
```
GET /api/tags
```

返回所有标签。

#### 创建新标签
```
POST /api/tags
```

请求体示例：
```json
{
  "name": "新标签名称"
}
```

### 评论相关接口

#### 创建评论
```
POST /api/reviews
```

请求体示例：
```json
{
  "gameId": 1,
  "rating": 5,
  "comment": "这个游戏真的很棒！"
}
```
需要在请求头中包含有效的JWT令牌：
```
Authorization: Bearer <token>
```

#### 获取特定游戏的所有评论
```
GET /api/reviews/game/:gameId
```

#### 获取特定用户的所有评论
```
GET /api/reviews/user/:userId
```

#### 更新评论
```
PUT /api/reviews/:id
```

请求体示例：
```json
{
  "rating": 4,
  "comment": "重新评价后，我觉得这个游戏还不错。"
}
```
需要在请求头中包含有效的JWT令牌：
```
Authorization: Bearer <token>
```

#### 删除评论
```
DELETE /api/reviews/:id
```
需要在请求头中包含有效的JWT令牌：
```
Authorization: Bearer <token>
```

## 数据库结构

### users 表
| 字段 | 类型 | 描述 |
|------|------|------|
| id | INT (PK) | 用户ID |
| username | VARCHAR(50) | 用户名（唯一） |
| email | VARCHAR(100) | 邮箱地址（唯一） |
| password | VARCHAR(255) | 加密后的密码 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### games 表
| 字段 | 类型 | 描述 |
|------|------|------|
| id | INT (PK) | 游戏ID |
| title | VARCHAR(255) | 游戏标题 |
| alias | VARCHAR(255) | 游戏别名 |
| link | TEXT | 游戏链接 |
| cover_image | VARCHAR(255) | 游戏封面图片链接 |
| description | TEXT | 游戏简介 |
| rating | DECIMAL(3,2) | 游戏评分（默认0.00） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### tags 表
| 字段 | 类型 | 描述 |
|------|------|------|
| id | INT (PK) | 标签ID |
| name | VARCHAR(100) | 标签名称 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### game_tags 表（关联表）
| 字段 | 类型 | 描述 |
|------|------|------|
| id | INT (PK) | 主键 |
| game_id | INT (FK) | 游戏ID |
| tag_id | INT (FK) | 标签ID |

### reviews 表
| 字段 | 类型 | 描述 |
|------|------|------|
| id | INT (PK) | 评论ID |
| user_id | INT (FK) | 用户ID |
| game_id | INT (FK) | 游戏ID |
| rating | TINYINT | 评分 (1-5) |
| comment | TEXT | 评论内容 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 开发命令

- `npm run dev` - 启动开发服务器
- `npm start` - 启动生产服务器
- `npm run init-db` - 初始化数据库表结构
- `npm run seed` - 填充示例数据

## 许可证

MIT