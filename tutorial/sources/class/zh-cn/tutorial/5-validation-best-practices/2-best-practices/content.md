---
type: lesson
title: 最佳实践总结
focus: /src/configuration.ts
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: false
  panels:
    - output
    - terminal
previews:
  - port: 7001
    title: Midway 应用
autoReload: true
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
  async sendWelcomeEmail(email: string) { }
  async uploadAvatar(file: any) { }
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
  @Get('/')
  async list() { }

  @Get('/:id')
  async detail(@Param('id') id: string) { }

  @Post('/')
  async create(@Body() dto: CreateUserDTO) { }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDTO) { }

  @Patch('/:id')
  async patch(@Param('id') id: string, @Body() dto: Partial<UpdateUserDTO>) { }

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
      timestamp: new Date().toISOString(),
    };
  }
}
```

## 单元测试最佳实践

Midway 推荐使用 `@midwayjs/mock` 配合 Jest 做接口测试。

安装依赖：

```bash
npm install -D @midwayjs/mock
```

`package.json`：

```json
{
  "devDependencies": {
    "@midwayjs/mock": "^4.0.0"
  }
}
```

示例测试：

```typescript
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/koa';

describe('test/controller/home.test.ts', () => {
  let app: Application;

  beforeAll(async () => {
    // 只创建一次 app，测试用例复用
    app = await createApp<Framework>();
  });

  afterAll(async () => {
    // 关闭 app 释放资源
    await close(app);
  });

  it('should GET /', async () => {
    const result = await createHttpRequest(app).get('/');

    expect(result.status).toBe(200);
    expect(result.text).toBe('Hello Midwayjs!');
  });
});
```

## 安全性最佳实践

1. **输入验证**
   - 所有用户输入必须验证
   - 使用 DTO 和验证装饰器

2. **身份认证**
   - 使用 JWT 或 Session
   - 重要操作需要二次验证

3. **权限控制**
   - 基于角色的访问控制（RBAC）
   - 最小权限原则

4. **敏感信息保护**
   - 密码加密存储（bcrypt）
   - API 密钥使用环境变量
   - 不在日志中输出敏感数据

## 性能优化最佳实践

1. **缓存**
   - 使用 Redis 缓存热点数据
   - 设置合理的缓存过期时间

2. **数据库优化**
   - 避免 N+1 查询
   - 使用索引优化查询
   - 合理分页

3. **异步任务**
   - 耗时任务使用队列
   - 邮件发送异步处理

4. **限流**
   - 防止接口被滥用
   - 使用中间件实现限流

## 日志与监控最佳实践

1. **结构化日志**
   - 记录关键业务日志
   - 包含请求 ID 便于追踪

2. **错误监控**
   - 使用 Sentry 等工具
   - 及时报警

3. **性能监控**
   - 监控接口响应时间
   - 监控系统资源使用

## 部署最佳实践

1. **环境隔离**
   - 开发/测试/生产环境严格分离
   - 使用不同的配置文件

2. **CI/CD**
   - 自动化测试
   - 自动化部署

3. **容器化**
   - 使用 Docker 部署
   - 配合 Kubernetes 管理

## 小结

✅ 合理组织项目结构
✅ 遵循单一职责原则
✅ 设计规范的 RESTful API
✅ 统一响应格式
✅ 使用测试保障质量
✅ 关注安全、性能与监控

恭喜！您已经完成了 Midway.js 的核心教程！
