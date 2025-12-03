# GalHub API Documentation

## 概述

GalHub 是一个游戏信息管理平台，提供游戏信息、标签、用户评论等相关功能。本文档详细说明了所有可用的 API 接口。

## 基础URL

```
http://localhost:3000/api
```

> 注：端口号可能根据环境配置有所不同

## 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |

## 认证

大部分写操作需要用户认证，通过 JWT Token 实现。获取 Token 的方法请参考[用户认证](#用户认证接口)部分。

在需要认证的请求中，在请求头中添加：

```
Authorization: Bearer <your_token>
```

---

## 用户认证接口

### 用户注册

**接口地址**: `POST /register`

**请求参数**:

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |

**请求示例**:

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**响应示例**:

```json
{
  "success": true,
  "message": "用户注册成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 用户登录

**接口地址**: `POST /login`

**请求参数**:

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**请求示例**:

```json
{
  "username": "testuser",
  "password": "password123"
}
```

**响应示例**:

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 获取当前用户信息

**接口地址**: `GET /me`

**请求头**:
```
Authorization: Bearer <your_token>
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    }
  }
}
```

---

## 游戏接口

### 获取最新游戏列表

**接口地址**: `GET /games/latest`

**查询参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| limit | integer | 否 | 10 | 返回的游戏数量，最大50 |

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "塞尔达传说：旷野之息",
      "alias": "Breath of the Wild",
      "link": "https://www.nintendo.co.jp/switch/azge/index.html",
      "cover_image": "https://example.com/zelda-cover.jpg",
      "description": "《塞尔达传说：旷野之息》是任天堂企划制作本部开发并发行的动作冒险游戏...",
      "rating": "9.50",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "tags": [
        {
          "id": 1,
          "name": "动作",
          "created_at": "2023-01-01T00:00:00.000Z",
          "updated_at": "2023-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

### 获取热门游戏列表

**接口地址**: `GET /games/popular`

**查询参数**:

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| limit | integer | 否 | 10 | 返回的游戏数量，最大50 |

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "塞尔达传说：旷野之息",
      "alias": "Breath of the Wild",
      "link": "https://www.nintendo.co.jp/switch/azge/index.html",
      "cover_image": "https://example.com/zelda-cover.jpg",
      "description": "《塞尔达传说：旷野之息》是任天堂企划制作本部开发并发行的动作冒险游戏...",
      "rating": "9.50",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "tags": [
        {
          "id": 1,
          "name": "动作",
          "created_at": "2023-01-01T00:00:00.000Z",
          "updated_at": "2023-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

### 获取游戏列表

**接口地址**: `GET /games`

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "塞尔达传说：旷野之息",
      "alias": "Breath of the Wild",
      "link": "https://www.nintendo.co.jp/switch/azge/index.html",
      "cover_image": "https://example.com/zelda-cover.jpg",
      "description": "《塞尔达传说：旷野之息》是任天堂企划制作本部开发并发行的动作冒险游戏...",
      "rating": "9.50",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "tags": [
        {
          "id": 1,
          "name": "动作",
          "created_at": "2023-01-01T00:00:00.000Z",
          "updated_at": "2023-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

### 创建新游戏

**接口地址**: `POST /games`

**请求头**:
```
Authorization: Bearer <your_token>
```

**请求参数**:

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| title | string | 是 | 游戏标题 |
| alias | string | 否 | 游戏别名 |
| link | string | 否 | 游戏链接 |
| coverImage | string | 否 | 游戏封面图片链接 |
| description | string | 否 | 游戏简介 |
| rating | number | 否 | 游戏评分 |
| tags | array | 否 | 标签数组 |

**请求示例**:

```json
{
  "title": "新游戏",
  "alias": "New Game",
  "link": "https://example.com/new-game",
  "coverImage": "https://example.com/new-game-cover.jpg",
  "description": "这是一个新游戏的介绍",
  "rating": 8.5,
  "tags": ["动作", "冒险"]
}
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "新游戏",
    "alias": "New Game",
    "link": "https://example.com/new-game",
    "cover_image": "https://example.com/new-game-cover.jpg",
    "description": "这是一个新游戏的介绍",
    "rating": "8.50",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "tags": [
      {
        "id": 1,
        "name": "动作",
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

## 标签接口

### 获取标签列表

**接口地址**: `GET /tags`

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "动作",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "冒险",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### 创建新标签

**接口地址**: `POST /tags`

**请求头**:
```
Authorization: Bearer <your_token>
```

**请求参数**:

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| name | string | 是 | 标签名称 |

**请求示例**:

```json
{
  "name": "策略"
}
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "策略",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

---

## 评论接口

### 创建评论

**接口地址**: `POST /reviews`

**请求头**:
```
Authorization: Bearer <your_token>
```

**请求参数**:

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| gameId | integer | 是 | 游戏ID |
| rating | integer | 是 | 评分 (1-5) |
| comment | string | 否 | 评论内容 |

**请求示例**:

```json
{
  "gameId": 1,
  "rating": 5,
  "comment": "这个游戏真的很棒！"
}
```

**响应示例**:

```json
{
  "success": true,
  "message": "评论创建成功",
  "data": {
    "id": 1,
    "user_id": 1,
    "game_id": 1,
    "rating": 5,
    "comment": "这个游戏真的很棒！",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "username": "testuser"
  }
}
```

### 获取特定游戏的所有评论

**接口地址**: `GET /reviews/game/:gameId`

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| gameId | integer | 游戏ID |

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "game_id": 1,
      "rating": 5,
      "comment": "这个游戏真的很棒！",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "username": "testuser"
    }
  ]
}
```

### 获取特定用户的所有评论

**接口地址**: `GET /reviews/user/:userId`

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| userId | integer | 用户ID |

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "game_id": 1,
      "rating": 5,
      "comment": "这个游戏真的很棒！",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "game_title": "塞尔达传说：旷野之息"
    }
  ]
}
```

### 更新评论

**接口地址**: `PUT /reviews/:id`

**请求头**:
```
Authorization: Bearer <your_token>
```

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | integer | 评论ID |

**请求参数**:

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| rating | integer | 否 | 评分 (1-5) |
| comment | string | 否 | 评论内容 |

**请求示例**:

```json
{
  "rating": 4,
  "comment": "重新评价后，我觉得这个游戏还不错。"
}
```

**响应示例**:

```json
{
  "success": true,
  "message": "评论更新成功",
  "data": {
    "id": 1,
    "user_id": 1,
    "game_id": 1,
    "rating": 4,
    "comment": "重新评价后，我觉得这个游戏还不错。",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "username": "testuser",
    "game_title": "塞尔达传说：旷野之息"
  }
}
```

### 删除评论

**接口地址**: `DELETE /reviews/:id`

**请求头**:
```
Authorization: Bearer <your_token>
```

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | integer | 评论ID |

**响应示例**:

```json
{
  "success": true,
  "message": "评论删除成功"
}
```