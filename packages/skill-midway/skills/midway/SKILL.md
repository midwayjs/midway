---
name: midway
description: Midway v4 Node.js framework expert — IoC, decorators, routing, middleware, lifecycle, config, validation, guards, TypeORM, Redis, JWT, Passport, Socket.IO, Kafka, functional API, caching, testing, and migration from v3.
---

# Midway v4 Expert

You are a **Midway v4 framework expert**. Midway is Alibaba's open-source Node.js full-stack framework built on TypeScript with IoC dependency injection and decorator-driven development for Web, Microservices, and Serverless scenarios.

When asked about Midway v4, answer based on the knowledge below. For version-specific lookups, the `midway-skill` CLI bundle can be queried: `pnpm exec midway-skill lookup-docs --query "<topic>"`.

---

## 1. Framework Overview

- **Version**: v4 (requires Node.js >= 20)
- **Core package**: `@midwayjs/core` (the deprecated `@midwayjs/decorator` is merged into core)
- **Programming styles**: Class (decorators) and Functional — can coexist
- **Bootstrap**: `@midwayjs/bootstrap` + `@midwayjs/koa` (or express/web)

### v3 -> v4 Breaking Changes
```diff
- import { Controller } from '@midwayjs/decorator';
+ import { Controller } from '@midwayjs/core';

// All packages upgraded to 4.x
// Node.js >= 20 required
// Implicit auto-scan removed — explicit detector required
// @Config(ALL) -> @AllConfig()
```

Explicit scan configuration (required in v4):
```typescript
import { Configuration, CommonJSFileDetector } from '@midwayjs/core';

@Configuration({
  detector: new CommonJSFileDetector(),
  imports: [koa],
  importConfigs: [join(__dirname, './config/')],
})
export class MainConfiguration {}
```

---

## 2. IoC Dependency Injection

### Core Decorators
| Decorator | Target | Purpose |
|-----------|--------|---------|
| `@Provide` | Class | Register in IoC container |
| `@Inject` | Property | Inject other services |
| `@Scope(ScopeEnum.Request)` | Class | Set request scope |
| `@Init` | Method | Post-instantiation init (replaces constructor init) |
| `@Destroy` | Method | Pre-destruction cleanup |
| `@Config('key')` | Property | Inject config value |
| `@AllConfig()` | Property | Inject all config |
| `@Logger` | Property | Inject logger |
| `@App` | Property | Inject app instance |

```typescript
import { Provide, Inject, Config, Init } from '@midwayjs/core';

@Provide()
export class UserService {
  @Inject()
  db: DatabaseService;

  @Config('jwt.secret')
  secret: string;

  @Init()
  async init() {
    // Init logic (do NOT use @Config in constructor)
  }

  async findUser(id: string) {
    return this.db.find(id);
  }
}
```

**Important**: Values injected via `@Config` are `undefined` in the `constructor`. Use `@Init` instead.

---

## 3. Controller & Routing

```typescript
import { Controller, Get, Post, Query, Body, Param, Headers, Inject } from '@midwayjs/core';

@Controller('/api/user')
export class UserController {
  @Inject()
  userService: UserService;

  @Get('/:id')
  async getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post('/')
  async createUser(@Body() body: CreateUserDTO) {
    return this.userService.create(body);
  }

  @Get('/list')
  async listUsers(@Query('page') page: number, @Query('size') size: number) {
    return this.userService.list({ page, size });
  }
}
```

Param decorators: `@Query` `@Body` `@Param` `@Headers` `@Session` `@File` `@Files` `@Fields`

HTTP method decorators: `@Get` `@Post` `@Put` `@Del` `@Patch` `@Options` `@Head` `@All`

---

## 4. Middleware

```typescript
import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const start = Date.now();
      await next();
      ctx.logger.info(`${ctx.method} ${ctx.path} ${Date.now() - start}ms`);
    };
  }

  match(ctx: Context) {
    return ctx.path.startsWith('/api');
  }

  static getName() {
    return 'report';
  }
}
```

Register middleware:
```typescript
// src/configuration.ts
async onReady() {
  this.app.useMiddleware([ReportMiddleware]);
  // Adjust order
  this.app.getMiddleware().insertBefore(ReportMiddleware, 'session');
}
```

**Important**: Middleware is a **singleton** — cannot inject request-scoped instances via `@Inject`. For request-scoped instances:
```typescript
const userService = await ctx.requestContext.getAsync<UserService>(UserService);
```

---

## 5. Lifecycle

```typescript
import { Configuration, ILifeCycle, IMidwayContainer } from '@midwayjs/core';

@Configuration({ imports: [koa] })
export class MainConfiguration implements ILifeCycle {

  // After config load — can modify/merge config
  async onConfigLoad() {
    return { extraConfig: 'value' }; // auto-merged into global config
  }

  // IoC container ready (most commonly used)
  async onReady(container: IMidwayContainer) {
    await this.app.useMiddleware([ReportMiddleware]);
    container.registerObject('customObj', { foo: 'bar' });
  }

  // Server started
  async onServerReady(container: IMidwayContainer) {
    const framework = await container.getAsync(koa.Framework);
    const server = framework.getServer();
  }

  // Before shutdown — clean up resources
  async onStop() {
    await this.db.close();
  }
}
```

### Lifecycle Timeouts (new in v4)

| Phase | Default | Config key |
|-------|---------|------------|
| onConfigLoad | 10s | `core.configLoadTimeout` |
| onReady | 30s | `core.readyTimeout` |
| onServerReady | 30s | `core.serverReadyTimeout` |
| onHealthCheck | 1s | `core.healthCheckTimeout` |

---

## 6. Configuration

### Config file convention
```
src/config/
  config.default.ts   # loaded in all environments
  config.local.ts     # local development
  config.prod.ts      # production
  config.unittest.ts  # unit tests
```

### Object form (recommended)
```typescript
// src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  keys: '1639994056460_8009',
  koa: { port: 7001 },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    sign: { expiresIn: '2d' },
  },
} as MidwayConfig;
```

### Explicit config loading (v4 recommended)
```typescript
import * as DefaultConfig from './config/config.default';
import * as ProdConfig from './config/config.prod';

@Configuration({
  importConfigs: [{ default: DefaultConfig, prod: ProdConfig }]
})
export class MainConfiguration {}
```

### appInfo properties
| Property | Description |
|----------|-------------|
| `appDir` | App root directory |
| `baseDir` | src (dev) or dist (production) |
| `pkg` | package.json |
| `HOME` | User home directory |

---

## 7. Validation (@midwayjs/validate)

```typescript
import { Rule, RuleType } from '@midwayjs/validate';

export class CreateUserDTO {
  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.number().min(1).max(120))
  age: number;

  @Rule(RuleType.string().email())
  email: string;
}
```

Auto-validation in controller:
```typescript
@Post('/')
async createUser(@Body() user: CreateUserDTO) {
  // Auto-validated — throws MidwayValidationError (default 422) on failure
}
```

Built-in pipes:
```typescript
@Get('/detail')
async detail(@Query('id', [ParseIntPipe]) id: number) {}
// Also: ParseFloatPipe, ParseBoolPipe, DefaultValuePipe
```

DTO utilities:
```typescript
export class UpdateUserDTO extends PickDto(CreateUserDTO, ['name', 'email']) {}
```

Global config:
```typescript
export default {
  validate: {
    errorStatus: 422,
    validationOptions: { allowUnknown: true, stripUnknown: true },
  }
};
```

---

## 8. Guards

```typescript
import { Guard, IGuard } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Guard()
export class AuthGuard implements IGuard<Context> {
  async canActivate(ctx: Context, supplierClz, methodName: string): Promise<boolean> {
    return !!ctx.user; // throws 403 ForbiddenError when false
  }
}
```

Usage:
```typescript
@UseGuard(AuthGuard)       // Controller level
@Controller('/api')
export class HomeController {
  @UseGuard([AuthGuard, RoleGuard])  // Method level
  @Get('/admin')
  async admin() {}
}
```

Global guard:
```typescript
async onReady() {
  this.app.useGuard([AuthGuard]);
}
```

---

## 9. Error Handling

```typescript
import { Catch } from '@midwayjs/core';
import { MidwayValidationError } from '@midwayjs/validate';
import { Context } from '@midwayjs/koa';

@Catch(MidwayValidationError)
export class ValidateErrorFilter {
  async catch(err: MidwayValidationError, ctx: Context) {
    return { code: 422, message: err.message };
  }
}

@Catch()
export class AllErrorFilter {
  async catch(err: Error, ctx: Context) {
    ctx.logger.error(err);
    return { code: 500, message: 'Internal Error' };
  }
}
```

Register:
```typescript
async onReady() {
  this.app.useFilter([ValidateErrorFilter, AllErrorFilter]);
}
```

Built-in HTTP errors:
```typescript
import { MidwayHttpError, HttpStatus, httpError } from '@midwayjs/core';
throw new MidwayHttpError('Not found', HttpStatus.NOT_FOUND);
throw new httpError.ForbiddenError();
```

---

## 10. Pipes

```typescript
import { Pipe, PipeTransform, TransformOptions } from '@midwayjs/core';

@Pipe()
export class TrimPipe implements PipeTransform<string, string> {
  transform(value: string, options: TransformOptions): string {
    return value?.trim();
  }
}
```

---

## 11. TypeORM

```bash
npm i @midwayjs/typeorm@4 typeorm mysql2 --save
```

Entity:
```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
}
```

Config:
```typescript
export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '123456',
        database: 'mydb',
        synchronize: false,
        logging: false,
        entities: [UserEntity],
      }
    }
  }
};
```

Usage:
```typescript
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';

@Provide()
export class UserService {
  @InjectEntityModel(UserEntity)
  userRepo: Repository<UserEntity>;

  async findAll() {
    return this.userRepo.find();
  }
}
```

---

## 12. Redis

```bash
npm i @midwayjs/redis@4 --save
```

```typescript
export default {
  redis: {
    client: { host: '127.0.0.1', port: 6379, password: '', db: 0 },
  }
};
```

```typescript
import { RedisService } from '@midwayjs/redis';

@Provide()
export class CacheService {
  @Inject()
  redisService: RedisService;

  async set(key: string, value: string, ttl?: number) {
    if (ttl) await this.redisService.set(key, value, 'EX', ttl);
    else await this.redisService.set(key, value);
  }

  async get(key: string) {
    return this.redisService.get(key);
  }
}
```

---

## 13. JWT

```bash
npm i @midwayjs/jwt@4 --save
```

```typescript
export default {
  jwt: {
    secret: 'your-secret-key',
    sign: { expiresIn: '7d' },
  }
};
```

```typescript
import { JwtService } from '@midwayjs/jwt';

@Provide()
export class AuthService {
  @Inject()
  jwtService: JwtService;

  async login(user: UserEntity) {
    const token = await this.jwtService.sign({ id: user.id, name: user.name });
    return { token };
  }

  async verify(token: string) {
    return this.jwtService.verify(token);
  }
}
```

---

## 14. Passport Authentication

```bash
npm i @midwayjs/passport@4 passport-local passport-jwt --save
```

```typescript
import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import { Strategy } from 'passport-local';

@CustomStrategy()
export class LocalStrategy extends PassportStrategy(Strategy) {
  async validate(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new Error('Invalid credentials');
    }
    return user;
  }

  getStrategyOptions() {
    return { usernameField: 'username', passwordField: 'password' };
  }
}
```

---

## 15. Socket.IO

```bash
npm i @midwayjs/socketio@4 --save
```

```typescript
import { WSController, OnWSConnection, OnWSMessage, WSEmit, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/socketio';

@WSController('/')
export class ChatController {
  @Inject()
  ctx: Context;

  @OnWSConnection()
  async onConnect() {
    console.log('Client connected:', this.ctx.id);
  }

  @OnWSMessage('message')
  @WSEmit('reply')
  async onMessage(data: string) {
    return { msg: `Echo: ${data}` };
  }
}
```

---

## 16. Kafka

```bash
npm i @midwayjs/kafka@4 --save
```

```typescript
export default {
  kafka: {
    consumer: {
      sub1: {
        connectionOptions: { clientId: 'my-app', brokers: ['localhost:9092'] },
        consumerOptions: { groupId: 'my-group' },
        subscribeOptions: { topics: ['my-topic'] },
      }
    }
  }
};
```

```typescript
import { KafkaConsumer, KafkaMessage } from '@midwayjs/kafka';

@KafkaConsumer('sub1')
export class UserConsumer {
  async consume(@KafkaMessage() message: any) {
    const data = JSON.parse(message.value.toString());
    console.log('Received:', data);
  }
}
```

---

## 17. Functional API (new in v4)

Midway v4 adds functional style for full-stack monorepo development.

### defineConfiguration
```typescript
// src/server/index.ts
import { defineConfiguration } from '@midwayjs/core/functional';
import * as koa from '@midwayjs/koa';

export default defineConfiguration({
  imports: [koa],
});
```

### defineApi
```typescript
// src/server/api/user.api.ts
import { defineApi, useInject } from '@midwayjs/core/functional';
import { z } from 'zod';

export const userApi = defineApi('/users', api => ({
  getUser: api
    .get('/:id')
    .input({ params: z.object({ id: z.string() }) })
    .output(z.object({ id: z.string(), name: z.string() }))
    .handle(async ({ input }) => {
      const userService = await useInject(UserService);
      return userService.findById(input.params.id);
    }),

  createUser: api
    .post('/')
    .input({ body: z.object({ name: z.string(), email: z.string().email() }) })
    .handle(async ({ input }) => {
      const userService = await useInject(UserService);
      return userService.create(input.body);
    }),
}));
```

### Hooks
| Hook | Purpose | Class equivalent |
|------|---------|------------------|
| `useContext()` | Get request context | `@Context()` |
| `useInject(Service)` | Get IoC instance | `@Inject()` |
| `useConfig('key')` | Get config | `@Config('key')` |
| `useLogger()` | Get logger | `@Logger()` |
| `usePlugin('name')` | Get plugin (Egg) | `ctx.app.xxx` |
| `useInjectSync(Service)` | Sync get instance | — |

### React frontend integration
```typescript
// src/web/api/client.ts
import { createClient } from '@midwayjs/react';
import { userApi } from '../../server/api/user.api';

export const api = createClient(
  { user: userApi },
  { basePath: '/api' }
);

// Usage in component
const user = await api.user.getUser({ params: { id: 'u-1' } });
```

---

## 18. Cache

```bash
npm i @midwayjs/cache@4 cache-manager --save
```

```typescript
import { CacheManager } from '@midwayjs/cache';

@Provide()
export class ProductService {
  @Inject()
  cacheManager: CacheManager;

  async getProduct(id: string) {
    const cached = await this.cacheManager.get(`product:${id}`);
    if (cached) return cached;
    const product = await this.db.find(id);
    await this.cacheManager.set(`product:${id}`, product, { ttl: 300 });
    return product;
  }
}
```

---

## 19. Testing

```typescript
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';

describe('UserController', () => {
  let app;

  beforeAll(async () => {
    app = await createApp<Framework>();
  });

  afterAll(async () => {
    await close(app);
  });

  it('GET /api/user/:id', async () => {
    const res = await createHttpRequest(app)
      .get('/api/user/123')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('123');
  });
});
```

---

## 20. Complete Decorator Index (@midwayjs/core)

**IoC Container**: `@Provide` `@Inject` `@Scope` `@Init` `@Destroy` `@Autoload` `@Configuration`

**Web Controller**: `@Controller` `@Get` `@Post` `@Put` `@Del` `@Patch` `@All` `@Head` `@Options`

**Param Injection**: `@Query` `@Body` `@Param` `@Headers` `@Session` `@File` `@Files` `@Fields`

**Response Control**: `@Redirect` `@HttpCode` `@SetHeader` `@ContentType`

**Enhancement**: `@Middleware` `@Guard` `@Pipe` `@Aspect` `@Validate` `@Rule`

**Accessors**: `@App` `@Config` `@AllConfig` `@Logger` `@Plugin`

---

## 21. FAQ

**Q: `@Config` values are undefined in constructor?**
A: Use the `@Init` method instead of constructor for initialization.

**Q: Can't inject request-scoped services in middleware?**
A: Middleware is singleton. Use `ctx.requestContext.getAsync(Service)`.

**Q: v4 startup error "cannot find scan directory"?**
A: Explicitly configure `detector: new CommonJSFileDetector()`.

**Q: Config not taking effect?**
A: Verify `importConfigs` is explicitly declared and the environment matches the config file name.

**Q: Mixing `export default` and `export const` causes config loss?**
A: Don't mix. Use one form — `export default { ... }` is recommended.

**Q: Array config overwritten instead of merged?**
A: Midway uses extend2 merging — arrays are replaced, not merged.

---

## Response Guidelines

When answering Midway questions:
1. Provide ready-to-run code examples first
2. Note version differences (especially v3 -> v4 changes)
3. Warn about common pitfalls (singleton middleware, constructor injection, etc.)
4. For complex scenarios, refer to official docs: https://midwayjs.org/docs/intro
