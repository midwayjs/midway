# 路由版本化

在现代 API 开发中，版本化是一个非常重要的话题。当你的 API 需要进行不兼容的更改时，版本化可以确保现有的客户端不会受到影响，同时允许新的客户端使用新的功能。

Midway 提供了灵活的路由版本化方案，支持多种版本化策略，让你可以轻松地管理 API 的不同版本。

## 支持的框架

路由版本化功能在以下框架中可用：

| 框架 | 支持状态 |
| --- | --- |
| @midwayjs/web-koa | ✅ |
| @midwayjs/web | ✅ |
| @midwayjs/web-express | ✅ |
| Serverless | ❌ |

## 快速开始

### 启用版本化

首先，你需要在框架配置中启用版本化：

```typescript
// src/config/config.default.ts
export default {
  // Koa 框架
  koa: {
    versioning: {
      enabled: true,
      type: 'URI', // 版本化类型
      prefix: 'v', // 版本前缀
    }
  },

  // Express 框架
  express: {
    versioning: {
      enabled: true,
      type: 'URI',
      prefix: 'v',
    }
  },

  // Web (Egg) 框架
  egg: {
    versioning: {
      enabled: true,
      type: 'URI',
      prefix: 'v',
    }
  }
};
```

### 在控制器中使用版本

然后在控制器装饰器中指定版本：

```typescript
import { Controller, Get, Post } from '@midwayjs/core';

@Controller('/users', {
  version: '1', // 指定版本
  description: 'Users API v1'
})
export class UsersV1Controller {

  @Get('/')
  async getUsers() {
    return {
      version: 'v1',
      users: [
        { id: 1, name: 'John', email: 'john@example.com' }
      ]
    };
  }

  @Post('/')
  async createUser(@Body() user: any) {
    return {
      version: 'v1',
      user: { id: 2, ...user }
    };
  }
}

@Controller('/users', {
  version: '2', // 新版本
  description: 'Users API v2'
})
export class UsersV2Controller {

  @Get('/')
  async getUsers() {
    return {
      version: 'v2',
      data: {
        users: [
          { id: 1, name: 'John', email: 'john@example.com', profile: { avatar: 'avatar.jpg' } }
        ],
        meta: { total: 1, page: 1 }
      }
    };
  }

  @Post('/')
  async createUser(@Body() user: any) {
    return {
      version: 'v2',
      data: { user: { id: 2, ...user, profile: {} } },
      meta: { created: new Date().toISOString() }
    };
  }
}
```

现在你可以通过不同的 URL 访问不同版本的 API：

```bash
# 访问 v1 版本
curl http://localhost:7001/v1/users

# 访问 v2 版本
curl http://localhost:7001/v2/users
```

## 版本化策略

Midway 支持多种版本化策略，你可以根据需要选择合适的方式。

### URI 版本化（推荐）

这是最常见和直观的版本化方式，版本信息包含在 URL 路径中。

```typescript
// 配置
export default {
  koa: {
    versioning: {
      enabled: true,
      type: 'URI',
      prefix: 'v', // 可自定义前缀
    }
  }
};
```

```bash
# 请求示例
GET /v1/users
GET /v2/users
POST /v1/users
```

### Header 版本化

通过 HTTP Header 指定版本信息。

```typescript
// 配置
export default {
  koa: {
    versioning: {
      enabled: true,
      type: 'HEADER',
      header: 'x-api-version', // 可自定义 header 名称
    }
  }
};
```

```bash
# 请求示例
curl -H "x-api-version: 1" http://localhost:7001/users
curl -H "x-api-version: 2" http://localhost:7001/users
```

### Media Type 版本化

通过 `Accept` header 的参数指定版本。

```typescript
// 配置
export default {
  koa: {
    versioning: {
      enabled: true,
      type: 'MEDIA_TYPE',
      mediaTypeParam: 'version', // 参数名称
    }
  }
};
```

```bash
# 请求示例
curl -H "Accept: application/json;version=1" http://localhost:7001/users
curl -H "Accept: application/json;version=2" http://localhost:7001/users
```

### 自定义版本化

你还可以提供自定义的版本提取函数：

```typescript
// 配置
export default {
  koa: {
    versioning: {
      enabled: true,
      type: 'CUSTOM',
      extractVersionFn: (ctx) => {
        // 从查询参数中提取版本
        return ctx.query.version;

        // 或者从其他地方提取版本
        // return ctx.headers['custom-version'];
      }
    }
  }
};
```

```bash
# 请求示例
curl "http://localhost:7001/users?version=1"
curl "http://localhost:7001/users?version=2"
```

## 高级用法

### 多版本支持

一个控制器可以支持多个版本：

```typescript
@Controller('/api', {
  version: ['1', '2'], // 支持 v1 和 v2
})
export class ApiController {

  @Get('/info')
  async getInfo(ctx) {
    // 可以通过 ctx.apiVersion 获取当前请求的版本
    return {
      version: ctx.apiVersion,
      message: `This is API version ${ctx.apiVersion}`
    };
  }
}
```

### 默认版本

你可以设置默认版本，当没有指定版本时使用：

```typescript
export default {
  koa: {
    versioning: {
      enabled: true,
      type: 'URI',
      prefix: 'v',
      defaultVersion: '1', // 默认版本
    }
  }
};
```

### 获取版本信息

在控制器中，你可以通过上下文获取当前请求的版本信息：

```typescript
@Controller('/api')
export class ApiController {

  @Get('/version')
  async getVersion(ctx) {
    return {
      currentVersion: ctx.apiVersion, // 当前版本
      originalPath: ctx.originalPath, // 原始路径（版本化之前）
    };
  }
}
```

## 配置选项

完整的配置选项说明：

```typescript
interface VersioningConfig {
  // 是否启用版本化
  enabled: boolean;

  // 版本化类型
  type?: 'URI' | 'HEADER' | 'MEDIA_TYPE' | 'CUSTOM';

  // 默认版本（当无法提取版本时使用）
  defaultVersion?: string;

  // URI 版本化的前缀（默认：'v'）
  prefix?: string;

  // Header 版本化的 header 名称（默认：'x-api-version'）
  header?: string;

  // Media Type 版本化的参数名称（默认：'version'）
  mediaTypeParam?: string;

  // 自定义版本提取函数
  extractVersionFn?: (ctx) => string | undefined;
}
```

## 最佳实践

### 版本命名

建议使用简单的数字版本号：

- ✅ 推荐：`'1'`, `'2'`, `'3'`
- ❌ 不推荐：`'v1.0'`, `'1.2.3'`, `'latest'`

### 版本策略选择

- **URI 版本化**：最直观，便于缓存，推荐用于公开 API
- **Header 版本化**：URL 保持简洁，适合内部 API
- **Media Type 版本化**：符合 REST 原则，但实现复杂
- **自定义版本化**：最灵活，但需要额外的文档说明

### 向后兼容

在设计新版本时，尽量保持向后兼容：

```typescript
// 好的版本化设计
@Controller('/users', { version: '1' })
export class UsersV1Controller {
  @Get('/')
  async getUsers() {
    return { users: [] }; // 简单格式
  }
}

@Controller('/users', { version: '2' })
export class UsersV2Controller {
  @Get('/')
  async getUsers() {
    return {
      data: { users: [] }, // 添加了 data 包装
      meta: { total: 0 }   // 添加了元信息
    };
  }
}
```

### 版本废弃

当需要废弃旧版本时，建议：

1. 在响应头中添加废弃警告
2. 提供迁移指南
3. 设置合理的废弃时间表

```typescript
@Controller('/users', { version: '1' })
export class UsersV1Controller {

  @Get('/')
  async getUsers(ctx) {
    // 添加废弃警告
    ctx.set('X-API-Deprecated', 'true');
    ctx.set('X-API-Deprecation-Date', '2024-01-01');
    ctx.set('X-API-Sunset-Date', '2024-06-01');

    return { users: [] };
  }
}
```

## 注意事项

1. **版本前缀**：URI 版本化会在路由前添加版本前缀，确保控制器的路由路径设计合理
2. **中间件影响**：版本化中间件会修改请求路径，可能影响其他依赖路径的中间件
3. **性能考虑**：版本化会增加路由匹配的复杂度，但影响通常很小
4. **测试覆盖**：确保为每个版本的 API 编写充分的测试

通过 Midway 的版本化功能，你可以优雅地管理 API 的演进，为用户提供稳定可靠的服务。