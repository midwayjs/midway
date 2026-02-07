---
type: lesson
title: 最佳实践总结
---

# Midway.js 最佳实践

通过前面的学习，您已经掌握了 Midway.js 的核心概念。让我们总结一些最佳实践，帮助您构建更好的应用。

## 项目结构最佳实践

### 推荐的目录结构

```
src/
├── controller/           # 控制器
│   ├── user.controller.ts
│   ├── auth.controller.ts
│   └── post.controller.ts
├── service/             # 服务层
│   ├── user.service.ts
│   ├── auth.service.ts
│   └── post.service.ts
├── middleware/          # 中间件
│   ├── auth.middleware.ts
│   ├── logger.middleware.ts
│   └── error.middleware.ts
├── filter/              # 过滤器
│   └── default.filter.ts
├── dto/                 # 数据传输对象
│   ├── user.dto.ts
│   └── auth.dto.ts
├── entity/              # 数据库实体
│   └── user.entity.ts
├── error/               # 自定义错误
│   └── custom.error.ts
├── util/                # 工具函数
│   └── crypto.util.ts
├── config/              # 配置文件
│   ├── config.default.ts
│   ├── config.local.ts
│   └── config.prod.ts
├── interface.ts         # TypeScript 接口定义
├── configuration.ts     # 应用配置
└── bootstrap.ts         # 启动文件
```

## 代码组织原则

### 1. 单一职责原则

每个类应该只有一个职责：

```typescript
// ✅ 好的做法 - 职责清晰
@Provide()
export class UserService {
  async findById(id: number) { }
  async create(data: any) { }
  async update(id: number, data: any) { }
}

@Provide()
export class EmailService {
  async sendWelcomeEmail(email: string) { }
  async sendResetPasswordEmail(email: string) { }
}

// ❌ 不好的做法 - 职责混乱
@Provide()
export class UserService {
  async findById(id: number) { }
  async sendWelcomeEmail(email: string) { } // 应该在 EmailService
  async uploadAvatar(file: any) { } // 应该在 FileService
}
```

### 2. 依赖倒置

依赖抽象而不是具体实现：

```typescript
// 定义接口
export interface IUserRepository {
  findById(id: number): Promise<User>;
  create(user: User): Promise<User>;
}

// 实现接口
@Provide()
export class UserRepository implements IUserRepository {
  async findById(id: number) {
    // 数据库查询
  }
  
  async create(user: User) {
    // 数据库插入
  }
}

// Service 依赖接口
@Provide()
export class UserService {
  @Inject()
  userRepository: IUserRepository; // 依赖接口,不是具体实现
  
  async getUser(id: number) {
    return this.userRepository.findById(id);
  }
}
```

### 3. 合理使用异步

```typescript
// ✅ 好的做法 - 使用 async/await
@Provide()
export class UserService {
  async createUser(data: any) {
    const user = await this.userRepository.create(data);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }
}

// ❌ 不好的做法 - 回调地狱
@Provide()
export class UserService {
  createUser(data: any, callback: Function) {
    this.userRepository.create(data, (err, user) => {
      if (err) return callback(err);
      this.emailService.sendWelcomeEmail(user.email, (err) => {
        if (err) return callback(err);
        callback(null, user);
      });
    });
  }
}
```

## API 设计最佳实践

### 1. RESTful 规范

```typescript
@Controller('/api/users')
export class UserController {
  // GET /api/users - 获取列表
  @Get('/')
  async list() { }
  
  // GET /api/users/:id - 获取详情
  @Get('/:id')
  async detail(@Param('id') id: string) { }
  
  // POST /api/users - 创建
  @Post('/')
  async create(@Body() dto: CreateUserDTO) { }
  
  // PUT /api/users/:id - 完整更新
  @Put('/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDTO) { }
  
  // PATCH /api/users/:id - 部分更新
  @Patch('/:id')
  async patch(@Param('id') id: string, @Body() dto: Partial<UpdateUserDTO>) { }
  
  // DELETE /api/users/:id - 删除
  @Del('/:id')
  async delete(@Param('id') id: string) { }
}
```

### 2. 统一响应格式

```typescript
// 定义响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  timestamp?: string;
}

// 在 Controller 中使用
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  async detail(@Param('id') id: string): Promise<ApiResponse> {
    const user = await this.userService.findById(parseInt(id));
    
    if (!user) {
      return {
        success: false,
        message: '用户不存在',
        code: 'USER_NOT_FOUND',
      };
    }
    
    return {
      success: true,
      data: user,
    };
  }
}
```

### 3. 分页规范

```typescript
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Controller('/api/users')
export class UserController {
  @Get('/')
  async list(@Query() query: PaginationQuery): Promise<ApiResponse> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    
    const [items, total] = await this.userService.findAndCount(page, pageSize);
    
    return {
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
```

## 错误处理最佳实践

### 1. 自定义错误类

```typescript
// src/error/business.error.ts
export class BusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

// 使用
throw new BusinessError('用户名已存在', 'USERNAME_EXISTS', 400);
```

### 2. 全局错误处理

```typescript
import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class GlobalErrorFilter {
  async catch(err: Error, ctx: Context) {
    // 记录错误
    ctx.logger.error(err);
    
    // 业务错误
    if (err instanceof BusinessError) {
      ctx.status = err.statusCode;
      return {
        success: false,
        message: err.message,
        code: err.code,
      };
    }
    
    // HTTP 错误
    if (err instanceof MidwayHttpError) {
      ctx.status = err.statusCode;
      return {
        success: false,
        message: err.message,
      };
    }
    
    // 未知错误
    ctx.status = 500;
    return {
      success: false,
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR',
    };
  }
}
```

## 安全最佳实践

### 1. 参数验证

```typescript
// 始终验证用户输入
@Post('/users')
@Validate()
async create(@Body() dto: CreateUserDTO) {
  // 验证通过后才执行
}
```

### 2. 敏感信息处理

```typescript
// ❌ 不要返回敏感信息
@Get('/:id')
async getUser(@Param('id') id: string) {
  const user = await this.userService.findById(id);
  return user; // 包含密码等敏感信息
}

// ✅ 过滤敏感信息
@Get('/:id')
async getUser(@Param('id') id: string) {
  const user = await this.userService.findById(id);
  const { password, ...safeUser } = user;
  return {
    success: true,
    data: safeUser,
  };
}
```

### 3. SQL 注入防护

```typescript
// ✅ 使用参数化查询
await this.repository.find({
  where: { username: userInput }
});

// ❌ 不要拼接 SQL
await this.repository.query(`SELECT * FROM users WHERE username = '${userInput}'`);
```

## 性能优化建议

### 1. 合理使用缓存

```typescript
@Provide()
export class UserService {
  @Inject()
  cacheService: CacheService;
  
  async getUserById(id: number) {
    // 先查缓存
    const cacheKey = `user:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // 查数据库
    const user = await this.userRepository.findById(id);
    
    // 写入缓存
    await this.cacheService.set(cacheKey, user, 3600);
    
    return user;
  }
}
```

### 2. 避免 N+1 查询

```typescript
// ❌ N+1 查询
async getPostsWithAuthors() {
  const posts = await this.postRepository.findAll();
  for (const post of posts) {
    post.author = await this.userRepository.findById(post.authorId);
  }
  return posts;
}

// ✅ 使用关联查询
async getPostsWithAuthors() {
  return this.postRepository.find({
    relations: ['author']
  });
}
```

## 配置管理最佳实践

### 1. 分环境配置

```typescript
// config.default.ts - 基础配置
export default {
  database: {
    type: 'mysql',
    host: process.env.DB_HOST,
    // ...
  },
};

// config.prod.ts - 生产环境覆盖
export default {
  midwayLogger: {
    default: {
      level: 'warn', // 生产环境只记录警告
    },
  },
};
```

### 2. 使用环境变量

```bash
# .env
NODE_ENV=local
DB_HOST=localhost
DB_PASSWORD=secret
JWT_SECRET=your_secret_key
```

```typescript
// 读取环境变量
export default {
  jwt: {
    secret: process.env.JWT_SECRET,
  },
};
```

## 测试最佳实践

### 1. 单元测试

```typescript
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';

describe('test/controller/user.test.ts', () => {
  let app: any;

  beforeAll(async () => {
    app = await createApp<Framework>();
  });

  afterAll(async () => {
    await close(app);
  });

  it('should GET /api/users/1', async () => {
    const result = await createHttpRequest(app)
      .get('/api/users/1');
    
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
  });
});
```

## 日志记录最佳实践

```typescript
@Provide()
export class UserService {
  @Logger()
  logger;

  async createUser(data: any) {
    this.logger.info('创建用户', { data });
    
    try {
      const user = await this.userRepository.create(data);
      this.logger.info('用户创建成功', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('用户创建失败', error);
      throw error;
    }
  }
}
```

## 下一步建议

恭喜您完成了 Midway.js 教程！接下来您可以：

1. **深入学习**
   - 阅读官方文档了解更多组件
   - 学习 TypeORM 进行数据库操作
   - 了解微服务和 Serverless

2. **实践项目**
   - 构建一个博客系统
   - 开发 RESTful API
   - 创建管理后台

3. **加入社区**
   - GitHub: https://github.com/midwayjs/midway
   - 官方文档: https://midwayjs.org

## 小结

✅ 遵循单一职责原则
✅ 合理组织项目结构
✅ 使用 RESTful API 规范
✅ 统一响应格式
✅ 完善错误处理
✅ 注意安全问题
✅ 编写测试用例
✅ 合理使用日志

祝您在 Midway.js 的学习之旅中收获满满！🎉
