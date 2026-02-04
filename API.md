# GalHub 游戏管理API文档

## 概述
GalHub Backend 是一个基于 Node.js 和 PostgreSQL 构建的游戏管理系统后端 API，提供用户认证、游戏管理、标签分类、评论评分等核心功能。

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **请求格式**: JSON
- **响应格式**: JSON
- **速率限制**: 
  - 全局：每个IP 15分钟最多100个请求
  - 认证相关：每个IP 15分钟最多10次尝试

## 响应格式
所有API响应都遵循统一的JSON格式：

```json
{
  "success": true|false,
  "message": "操作描述信息",
  "data": {} // 返回的数据
}
```

错误响应示例：
```json
{
  "success": false,
  "message": "错误描述"
}
```

## 认证
需要认证的API必须在请求头中包含JWT令牌：
```
Authorization: Bearer <your-jwt-token>
```

---

## 用户相关API

### 1. 用户注册
**POST** `/api/register`

**请求体**:
```json
{
  "username": "用户名",
  "email": "邮箱地址",
  "password": "密码"
}
```

**验证规则**:
- 用户名：3-50字符，只能包含字母、数字、下划线和中文
- 邮箱：有效的邮箱格式，不超过100字符
- 密码：至少8字符，必须包含字母和数字，不超过128字符

**成功响应**:
```json
{
  "success": true,
  "message": "用户注册成功",
  "data": {
    "user": {
      "id": 1,
      "username": "用户名",
      "email": "邮箱地址"
    },
    "token": "jwt-token"
  }
}
```

### 2. 用户登录
**POST** `/api/login`

**请求体**:
```json
{
  "username": "用户名",
  "password": "密码"
}
```

**成功响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "用户名",
      "email": "邮箱地址"
    },
    "token": "jwt-token"
  }
}
```

### 3. 获取当前用户信息
**GET** `/api/me` (需要认证)

**成功响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "用户名",
      "email": "邮箱地址"
    }
  }
}
```

---

## 游戏相关API

### 1. 获取最新游戏列表
**GET** `/api/games/latest`

**查询参数**:
- `limit`: 数量限制 (1-50，默认10)

**成功响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "游戏标题",
      "alias": "别名",
      "link": "链接",
      "coverImage": "封面图片URL",
      "description": "描述",
      "rating": 8.5,
      "createdAt": "创建时间",
      "tags": [
        {"id": 1, "name": "标签1"},
        {"id": 2, "name": "标签2"}
      ]
    }
  ]
}
```

### 2. 获取热门游戏列表
**GET** `/api/games/popular`

**查询参数**:
- `limit`: 数量限制 (1-50，默认10)

**响应格式**: 同最新游戏列表

### 3. 获取游戏列表（分页）
**GET** `/api/games`

**查询参数**:
- `page`: 页码 (默认1)
- `limit`: 每页数量 (1-100，默认20)

**成功响应**:
```json
{
  "success": true,
  "data": [...], // 游戏数组
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 4. 获取单个游戏详情
**GET** `/api/games/:id`

**路径参数**:
- `id`: 游戏ID

**成功响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "游戏标题",
    "alias": "别名",
    "link": "链接",
    "coverImage": "封面图片URL",
    "description": "描述",
    "rating": 8.5,
    "createdAt": "创建时间",
    "tags": [
      {"id": 1, "name": "标签1"},
      {"id": 2, "name": "标签2"}
    ]
  }
}
```

### 5. 添加新游戏
**POST** `/api/games` (需要认证)

**请求体**:
```json
{
  "title": "游戏标题",
  "alias": "别名",
  "link": "游戏链接",
  "coverImage": "封面图片URL",
  "description": "游戏描述",
  "rating": 8.5,
  "tags": ["标签1", "标签2"]
}
```

**验证规则**:
- 标题：1-255字符（必需）
- 评分：0-10之间
- 链接：有效的URL格式
- 标签：最多20个，每个不超过100字符

**成功响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "游戏标题",
    "alias": "别名",
    "link": "链接",
    "coverImage": "封面图片URL",
    "description": "描述",
    "rating": 8.5,
    "createdAt": "创建时间",
    "tags": [
      {"id": 1, "name": "标签1"},
      {"id": 2, "name": "标签2"}
    ]
  }
}
```

---

## 标签相关API

### 1. 获取标签列表
**GET** `/api/tags`

**成功响应**:
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "标签1"},
    {"id": 2, "name": "标签2"}
  ]
}
```

### 2. 添加新标签
**POST** `/api/tags`

**请求体**:
```json
{
  "name": "标签名称"
}
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "标签名称"
  }
}
```

---

## 评论相关API

### 1. 创建评论
**POST** `/api/reviews` (需要认证)

**请求体**:
```json
{
  "gameId": 1,
  "rating": 4,
  "comment": "评论内容"
}
```

**验证规则**:
- gameId: 有效的游戏ID
- rating: 1-5之间的整数
- comment: 不超过2000字符
- 每个用户对同一游戏只能评论一次

**成功响应**:
```json
{
  "success": true,
  "message": "评论创建成功",
  "data": {
    "id": 1,
    "userId": 1,
    "gameId": 1,
    "rating": 4,
    "comment": "评论内容",
    "createdAt": "创建时间"
  }
}
```

### 2. 获取游戏的所有评论
**GET** `/api/reviews/game/:gameId`

**路径参数**:
- `gameId`: 游戏ID

**成功响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "gameId": 1,
      "rating": 4,
      "comment": "评论内容",
      "createdAt": "创建时间"
    }
  ]
}
```

### 3. 获取用户的所有评论
**GET** `/api/reviews/user/:userId`

**路径参数**:
- `userId`: 用户ID

**成功响应**: 同游戏评论列表

### 4. 更新评论
**PUT** `/api/reviews/:id` (需要认证)

**路径参数**:
- `id`: 评论ID

**请求体**:
```json
{
  "rating": 5,
  "comment": "更新后的评论内容"
}
```

**验证规则**:
- 只能更新自己的评论
- rating: 1-5之间的整数（可选）
- comment: 不超过2000字符（可选）

**成功响应**:
```json
{
  "success": true,
  "message": "评论更新成功",
  "data": {
    "id": 1,
    "userId": 1,
    "gameId": 1,
    "rating": 5,
    "comment": "更新后的评论内容",
    "createdAt": "创建时间"
  }
}
```

### 5. 删除评论
**DELETE** `/api/reviews/:id` (需要认证)

**路径参数**:
- `id`: 评论ID

**成功响应**:
```json
{
  "success": true,
  "message": "评论删除成功"
}
```

---

## 错误状态码

- **400**: 请求参数错误或验证失败
- **401**: 未认证或认证失败
- **404**: 资源未找到
- **429**: 请求过于频繁（速率限制）
- **500**: 服务器内部错误

## 安全特性

1. **输入验证**: 所有用户输入都经过严格验证
2. **密码加密**: 使用bcryptjs加密存储密码
3. **JWT认证**: 无状态认证，令牌有效期24小时
4. **速率限制**: 防止暴力破解和DDoS攻击
5. **CORS控制**: 限制跨域请求来源
6. **Helmet中间件**: HTTP头部安全加固
7. **SQL注入防护**: 使用参数化查询

## 数据库索引优化

系统自动创建以下索引以提升查询性能：
- `idx_games_created_at`: 按创建时间排序
- `idx_games_rating`: 按评分排序  
- `idx_reviews_game_id`: 按游戏ID查询评论
- `idx_reviews_user_id`: 按用户ID查询评论
- `idx_users_username`: 按用户名查询
- `idx_users_email`: 按邮箱查询
- `idx_game_tags_game_id` 和 `idx_game_tags_tag_id`: 游戏标签关联查询