# GalHub Backend

一个基于 Node.js 和 PostgreSQL 的游戏管理系统后端 API。

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [安装指南](#安装指南)
- [配置文件说明](#配置文件说明)
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
- 分页查询支持
- 安全防护（Helmet、速率限制、输入验证）

## 技术栈

- Node.js
- Express.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs（密码加密）
- Helmet（安全响应头）
- express-rate-limit（速率限制）
- validator（输入验证）

## 安装指南

1. 克隆项目到本地：
   ```bash
   git clone <repository-url>
   ```

2. 进入项目目录：
   ```bash
   cd galhub-backend
   ```

3. 安装依赖：
   ```bash
   npm install
   ```

4. 配置应用设置：
   编辑 `config/index.js` 文件，根据你的环境修改配置：
   ```javascript
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
       corsOrigin: ['http://localhost:3000']
     },
     
     // JWT配置
     jwt: {
       secret: 'your-jwt-secret-key-here' // 在生产环境中应该使用更安全的密钥
     }
   };
   ```

5. 创建 PostgreSQL 数据库：
   ```sql
   CREATE DATABASE galhub;
   ```

6. 初始化数据库（创建表结构）：
   ```bash
   npm run init-db
   ```

7. （可选）填充示例数据：
   ```bash
   npm run seed
   ```

8. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 配置文件说明

项目使用 `config/index.js` 文件来管理所有配置，不再依赖环境变量。配置文件包含以下部分：

### 数据库配置 (`database`)
| 配置项 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| host | 数据库主机 | localhost | 否 |
| port | 数据库端口 | 5432 | 否 |
| user | 数据库用户名 | postgres | 否 |
| password | 数据库密码 | '' | 是（如果数据库需要密码） |
| database | 数据库名称 | galhub | 否 |
| max | 最大连接池大小 | 10 | 否 |

### 服务器配置 (`server`)
| 配置项 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| port | 服务器端口 | 3000 | 否 |
| corsOrigin | 允许的跨域来源 | ['http://localhost:3000'] | 否 |

### JWT配置 (`jwt`)
| 配置项 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| secret | JWT签名密钥 | 'your-jwt-secret-key-here' | 生产环境必需 |

**重要提示：**
- 在生产环境中，务必修改 `jwt.secret` 为强随机密钥
- 数据库密码应根据实际数据库设置进行配置
- CORS来源应根据前端部署地址进行调整

## API 接口文档

有关完整的 API 文档，请参阅 [API.md](API.md) 文件。

### 速率限制

- 全局限制：每个 IP 15分钟内最多 100 个请求
- 认证接口（登录/注册）：每个 IP 15分钟内最多 10 次尝试

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

验证规则：
- 用户名：3-50字符，只能包含字母、数字、下划线和中文
- 邮箱：有效的邮箱格式，最长100字符
- 密码：8-128字符，必须包含字母和数字

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

#### 获取游戏列表（支持分页）
```
GET /api/games?page=1&limit=20
```

查询参数：
- page：页码（默认1）
- limit：每页数量（默认20，最大100）

返回示例：
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### 获取最新游戏列表
```
GET /api/games/latest?limit=10
```

#### 获取热门游戏列表
```
GET /api/games/popular?limit=10
```

#### 获取单个游戏详情
```
GET /api/games/:id
```

#### 创建新游戏（需要认证）
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
- title: 游戏标题（必需，1-255字符）
- alias: 游戏别名（可选）
- link: 游戏链接（可选，需为有效URL）
- coverImage: 游戏封面图片链接（可选）
- description: 游戏简介（可选）
- rating: 游戏评分（可选，0-10）
- tags: 标签数组（可选，最多20个）

### 标签相关接口

#### 获取标签列表
```
GET /api/tags
```

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

#### 创建评论（需要认证）
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

验证规则：
- gameId：必需，游戏必须存在
- rating：必需，1-5之间的整数
- comment：可选，最长2000字符

#### 获取特定游戏的所有评论
```
GET /api/reviews/game/:gameId
```

#### 获取特定用户的所有评论
```
GET /api/reviews/user/:userId
```

#### 更新评论（需要认证）
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

#### 删除评论（需要认证）
```
DELETE /api/reviews/:id
```

## 数据库结构

### users 表
| 字段 | 类型 | 描述 |
|------|------|------|
| id | SERIAL (PK) | 用户ID |
| username | VARCHAR(50) | 用户名（唯一） |
| email | VARCHAR(100) | 邮箱地址（唯一） |
| password | VARCHAR(255) | 加密后的密码 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### games 表
| 字段 | 类型 | 描述 |
|------|------|------|
| id | SERIAL (PK) | 游戏ID |
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
| id | SERIAL (PK) | 标签ID |
| name | VARCHAR(100) | 标签名称（唯一） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### game_tags 表（关联表）
| 字段 | 类型 | 描述 |
|------|------|------|
| id | SERIAL (PK) | 主键 |
| game_id | INT (FK) | 游戏ID |
| tag_id | INT (FK) | 标签ID |

### reviews 表
| 字段 | 类型 | 描述 |
|------|------|------|
| id | SERIAL (PK) | 评论ID |
| user_id | INT (FK) | 用户ID |
| game_id | INT (FK) | 游戏ID |
| rating | SMALLINT | 评分 (1-5) |
| comment | TEXT | 评论内容 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 数据库索引

系统启动时会自动创建以下索引以提升查询性能：
- `idx_games_created_at` - 游戏创建时间
- `idx_games_rating` - 游戏评分
- `idx_reviews_game_id` - 评论的游戏ID
- `idx_reviews_user_id` - 评论的用户ID
- `idx_game_tags_game_id` - 游戏标签关联
- `idx_game_tags_tag_id` - 标签游戏关联
- `idx_users_username` - 用户名
- `idx_users_email` - 用户邮箱

## 开发命令

- `npm run dev` - 启动开发服务器（热重载）
- `npm start` - 启动生产服务器
- `npm run init-db` - 初始化数据库表结构
- `npm run seed` - 填充示例数据

## 许可证

MIT