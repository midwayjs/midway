---
type: lesson
title: 应用配置管理
focus: /src/config/config.default.ts
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: true
  panels:
    - output
previews:
  - port: 7001
    title: Midway 应用
autoReload: true
---

# 应用配置管理

应用配置是管理不同环境下参数的重要机制。Midway 提供了强大的配置管理功能。

## 为什么需要配置？

应用中有很多可变的参数：

- 数据库连接地址
- 端口号
- API 密钥
- 功能开关
- 第三方服务配置

这些参数在不同环境（开发、测试、生产）下可能不同，需要统一管理。

## 配置文件位置

配置文件放在 `src/config/` 目录下：

```
src/
└── config/
    ├── config.default.ts    # 默认配置（所有环境）
    ├── config.local.ts      # 本地开发配置
    ├── config.prod.ts       # 生产环境配置
    └── config.test.ts       # 测试环境配置
```

## 基础配置

查看 `src/config/config.default.ts`：

```typescript
import { MidwayConfig } from '@midwayjs/core';

export default {
  // 应用端口
  koa: {
    port: 7001,
  },

  // 应用信息
  app: {
    name: 'midway-app',
    version: '1.0.0',
  },

  // 日志配置
  midwayLogger: {
    default: {
      level: 'info',
      consoleLevel: 'info',
    },
  },
} as MidwayConfig;
```

## 多环境配置

### 1. 开发环境配置

`src/config/config.local.ts`：

```typescript
import { MidwayConfig } from '@midwayjs/core';

export default {
  koa: {
    port: 7001, // 开发端口
  },

  database: {
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'midway_dev',
  },

  // 开发环境开启详细日志
  midwayLogger: {
    default: {
      level: 'debug',
    },
  },
} as MidwayConfig;
```

### 2. 生产环境配置

`src/config/config.prod.ts`：

```typescript
import { MidwayConfig } from '@midwayjs/core';

export default {
  koa: {
    port: 8080, // 生产端口
  },

  database: {
    host: 'prod-db.example.com',
    port: 3306,
    username: 'prod_user',
    password: process.env.DB_PASSWORD, // 从环境变量读取
    database: 'midway_prod',
  },

  // 生产环境只记录警告和错误
  midwayLogger: {
    default: {
      level: 'warn',
    },
  },
} as MidwayConfig;
```

## 配置合并规则

配置文件按以下优先级合并：

```
config.default.ts (基础配置)
  ↓
config.{env}.ts (环境配置，覆盖基础配置)
  ↓
最终配置
```

例如，在生产环境下：
- `config.default.ts` 的配置先加载
- `config.prod.ts` 的配置会覆盖同名配置

## 在代码中使用配置

### 1. 在 Service 中使用

```typescript
import { Provide, Config } from '@midwayjs/core';

@Provide()
export class UserService {
  // 注入整个配置对象
  @Config('database')
  databaseConfig;

  // 注入特定配置项
  @Config('app.name')
  appName: string;

  async getConnectionInfo() {
    return {
      host: this.databaseConfig.host,
      database: this.databaseConfig.database,
      appName: this.appName,
    };
  }
}
```

### 2. 在 Controller 中使用

```typescript
import { Controller, Get, Config } from '@midwayjs/core';

@Controller('/api/config')
export class ConfigController {
  @Config('app')
  appConfig;

  @Get('/info')
  async getInfo() {
    return {
      name: this.appConfig.name,
      version: this.appConfig.version,
    };
  }
}
```

### 3. 在 Middleware 中使用

```typescript
import { Middleware, Config } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class AuthMiddleware {
  @Config('auth.enabled')
  authEnabled: boolean;

  @Config('auth.whitelist')
  whitelist: string[];

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      if (!this.authEnabled) {
        return await next();
      }

      if (this.whitelist.includes(ctx.path)) {
        return await next();
      }

      await next();
    };
  }
}
```

## 环境变量

使用 `process.env` 读取环境变量：

```typescript
export default {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    password: process.env.DB_PASSWORD,
  },

  api: {
    key: process.env.API_KEY,
    secret: process.env.API_SECRET,
  },
} as MidwayConfig;
```

### 使用 .env 文件

安装 dotenv：

```bash
npm install dotenv
```

`package.json`：

```json
{
  "dependencies": {
    "dotenv": "^16.4.0"
  }
}
```

在项目根目录创建 `.env`：

```
NODE_ENV=local
DB_HOST=localhost
DB_PORT=3306
DB_PASSWORD=secret
API_KEY=your_api_key
```

在 `bootstrap.ts` 中加载：

```typescript
import { Bootstrap } from '@midwayjs/bootstrap';
import * as dotenv from 'dotenv';

// 加载 .env 文件
dotenv.config();

Bootstrap.run();
```

⚠️ **安全提示**：
- 不要将 `.env` 文件提交到 git
- 在 `.gitignore` 中添加 `.env`
- 生产环境使用服务器的环境变量

## 实战示例：完整的应用配置

### config.default.ts

```typescript
import { MidwayConfig } from '@midwayjs/core';

export default {
  // Koa 配置
  koa: {
    port: 7001,
  },

  // 应用信息
  app: {
    name: 'Midway App',
    version: '1.0.0',
    description: '基于 Midway 的应用',
  },

  // 日志配置
  midwayLogger: {
    default: {
      level: 'info',
      consoleLevel: 'info',
    },
  },

  // 认证配置
  auth: {
    enabled: true,
    whitelist: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/health',
    ],
    tokenExpire: 7200, // 2小时
  },

  // 限流配置
  rateLimit: {
    enabled: true,
    max: 100, // 最大请求数
    duration: 60000, // 时间窗口（毫秒）
  },

  // CORS 配置
  cors: {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  },
} as MidwayConfig;
```

### config.local.ts

```typescript
import { MidwayConfig } from '@midwayjs/core';

export default {
  // 开发环境关闭认证
  auth: {
    enabled: false,
  },

  // 开发环境关闭限流
  rateLimit: {
    enabled: false,
  },

  // 开启详细日志
  midwayLogger: {
    default: {
      level: 'debug',
      consoleLevel: 'debug',
    },
  },
} as MidwayConfig;
```

## 配置最佳实践

### 1. 分类组织配置

```typescript
export default {
  // 应用配置
  app: { /* ... */ },

  // 数据库配置
  database: { /* ... */ },

  // 缓存配置
  redis: { /* ... */ },

  // 第三方服务配置
  thirdParty: {
    wechat: { /* ... */ },
    alipay: { /* ... */ },
  },
} as MidwayConfig;
```

### 2. 使用 TypeScript 类型

```typescript
// src/interface.ts
export interface AppConfig {
  name: string;
  version: string;
  description: string;
}

// config.default.ts
import { AppConfig } from '../interface';

export default {
  app: {
    name: 'Midway App',
    version: '1.0.0',
    description: '应用描述',
  } as AppConfig,
} as MidwayConfig;
```

### 3. 敏感信息使用环境变量

```typescript
export default {
  database: {
    password: process.env.DB_PASSWORD,
  },

  api: {
    secretKey: process.env.SECRET_KEY,
  },
} as MidwayConfig;
```

## 小结

✅ 配置文件放在 `src/config/` 目录
✅ 使用 `config.{env}.ts` 管理不同环境
✅ 使用 `@Config()` 注入配置
✅ 敏感信息使用环境变量
✅ 不要将 `.env` 文件提交到版本控制
✅ 按功能分类组织配置

下一节，我们将学习如何进行数据验证！
