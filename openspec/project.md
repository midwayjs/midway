# Project Context

## Purpose
Midway v4 是一个面向未来的云端一体 Node.js 框架，用于构建企业级应用。项目支持多种应用场景：
- Web 应用（基于 Koa/Express）
- Serverless/FaaS 应用
- 微服务应用
- 小程序后端
- WebSocket、gRPC、RabbitMQ 等多种协议支持

核心目标：
- 提供基于装饰器和依赖注入的开发体验
- 支持云端一体化全栈应用开发（零 API 调用）
- 跨平台部署（传统服务器、Serverless、FaaS）
- 组件化扩展能力，兼容 Koa/Express/Egg.js 生态

## Tech Stack

### 核心技术
- **语言**: TypeScript 5.6.3 (严格模式关闭，启用装饰器)
- **运行时**: Node.js >= 20
- **包管理**: pnpm >= 9
- **Monorepo 管理**: Lerna 8.1.2 + pnpm workspace
- **构建工具**: TypeScript Compiler (tsc)
- **测试框架**: Jest 29.7.0 + ts-jest
- **代码规范**: mwts (Midway TypeScript Style)

### 项目结构
- `packages/` - 核心包和组件包（71+ 包）
- `packages-serverless/` - Serverless 相关包
- `packages-resource/` - 资源相关包
- `site/` - 文档站点 (Docusaurus)
- `benchmark/` - 性能测试
- `scripts/` - 构建和发布脚本

### 关键依赖
- `reflect-metadata` - 元数据反射支持
- `picomatch` - 文件匹配
- 各类 Web 框架适配器 (Koa, Express)
- 各类数据库 ORM (TypeORM, Sequelize, Mongoose, MikroORM, Leoric)
- 各类中间件和扩展

## Project Conventions

### Code Style
- **Linter**: 使用 `mwts` (Midway TypeScript Style)
  - 运行 `npm run lint` 检查代码规范
  - 运行 `npm run lint:fix` 自动修复问题
- **格式化**: 继承 mwts 配置
- **命名约定**:
  - 类名使用 PascalCase
  - 文件名使用 camelCase 或 kebab-case
  - 装饰器类使用 `@Provide()`, `@Controller()` 等
  - 接口文件通常命名为 `interface.ts`
- **注释要求**: 为所有函数/类/接口/枚举添加有意义的注释
- **TypeScript 配置**:
  - 启用装饰器: `experimentalDecorators: true`, `emitDecoratorMetadata: true`
  - 模块系统: `NodeNext`
  - 目标版本: `ES2022`
  - 跳过类型检查: `skipLibCheck: true`

### Architecture Patterns
- **IoC 容器**: 核心采用依赖注入容器 (MidwayContainer)
  - 所有组件通过 `@Provide()` 注册到容器
  - 使用 `@Inject()` 进行依赖注入
- **装饰器驱动**: 大量使用装饰器声明元数据
  - 路由装饰器: `@Controller()`, `@Get()`, `@Post()` 等
  - 生命周期装饰器: `@Init()`, `@Destroy()`
  - 作用域装饰器: `@Scope()`
  - AOP 装饰器: `@Aspect()`, `@Around()` 等
- **元数据管理**: 
  - DecoratorManager - 装饰器管理
  - MetadataManager - 元数据管理
- **分层架构**:
  - Controller 层 - 处理 HTTP 请求
  - Service 层 - 业务逻辑
  - Configuration 层 - 配置和组件加载
- **组件化设计**: 每个功能包都是独立的 npm 包，可以独立发布和使用
- **中间件管理**: 统一的中间件管理器 (MiddlewareManager)
- **过滤器和守卫**: 统一的过滤器 (FilterManager) 和守卫 (GuardManager)

### Testing Strategy
- **测试框架**: Jest 29.7.0
- **测试命令**:
  - 单个包: `pnpm -C <package> test`
  - 所有包: `npm run test` (通过 lerna 运行)
  - 覆盖率: `npm run cov`
- **测试文件位置**: 每个包的 `test/` 目录
- **测试文件命名**: `*.test.ts`
- **测试风格**:
  - 使用 `describe()` 和 `it()` 组织测试
  - 测试类和方法的行为，而非实现细节
  - 使用 MidwayContainer 进行依赖注入测试
  - 使用 `mm` 库进行 mock
- **测试要求**:
  - 新功能必须包含测试
  - 修改现有功能必须确保测试通过
  - 每个包必须有独立的测试套件
- **测试配置**: 每个包有独立的 `jest.config.js` 和 `jest.setup.js`

### Git Workflow
- **主分支**: `v4-next` (当前开发分支)
- **提交规范**: 遵循 conventional commits
  - `feat:` - 新功能
  - `fix:` - Bug 修复
  - `docs:` - 文档变更
  - `refactor:` - 重构
  - `test:` - 测试相关
  - `chore:` - 构建/工具相关
- **PR 要求** (见 `.github/PULL_REQUEST_TEMPLATE.md`):
  - [ ] `npm test` 通过
  - [ ] 包含测试和/或基准测试
  - [ ] 文档已更新
  - [ ] 提交信息符合规范
  - 说明受影响的核心子系统
  - 提供变更描述
- **版本管理**: 使用 lerna 管理版本
  - 版本号格式: `4.0.0-beta.10` (当前为 beta 阶段)
  - 发布渠道: `canary`, `beta`, `next`, 正式版
- **Changelog**: 自动生成 (使用 lerna-changelog)

## Domain Context

### IoC 容器核心概念
- **MidwayContainer**: 核心 IoC 容器实现，管理所有类的实例化和生命周期
- **DecoratorManager**: 装饰器元数据管理器，存储和检索装饰器信息
- **MetadataManager**: 通用元数据管理，基于 reflect-metadata
- **作用域 (Scope)**:
  - `Singleton` - 单例模式
  - `Request` - 请求级别
  - `Prototype` - 原型模式
- **生命周期**:
  - `@Init()` - 初始化方法
  - `@Destroy()` - 销毁方法
  - Configuration 生命周期钩子

### 核心服务
位于 `packages/core/src/service/`:
- `ConfigService` - 配置服务
- `LoggerService` - 日志服务
- `EnvironmentService` - 环境变量服务
- `InformationService` - 应用信息服务
- `LifeCycleService` - 生命周期服务
- `AspectService` - AOP 切面服务
- `MiddlewareService` - 中间件服务
- `WebRouterService` - Web 路由服务

### 组件包类型
- **Web 框架**: `@midwayjs/web` (Koa), `@midwayjs/web-express`, `@midwayjs/web-koa`
- **视图引擎**: `@midwayjs/view`, `@midwayjs/view-ejs`, `@midwayjs/view-nunjucks`
- **数据库 ORM**: `@midwayjs/typeorm`, `@midwayjs/sequelize`, `@midwayjs/mongoose`, `@midwayjs/mikro`, `@midwayjs/leoric`
- **消息队列**: `@midwayjs/rabbitmq`, `@midwayjs/kafka`, `@midwayjs/bull`, `@midwayjs/bullmq`
- **实时通信**: `@midwayjs/socketio`, `@midwayjs/ws`, `@midwayjs/mqtt`, `@midwayjs/grpc`
- **缓存/存储**: `@midwayjs/redis`, `@midwayjs/cache-manager`, `@midwayjs/oss`, `@midwayjs/cos`
- **安全/认证**: `@midwayjs/security`, `@midwayjs/jwt`, `@midwayjs/passport`, `@midwayjs/session`
- **验证**: `@midwayjs/validate`, `@midwayjs/validation`, `@midwayjs/validation-zod`, `@midwayjs/validation-joi`
- **监控**: `@midwayjs/prometheus`, `@midwayjs/otel`
- **工具**: `@midwayjs/swagger`, `@midwayjs/i18n`, `@midwayjs/upload`, `@midwayjs/mock`

### 装饰器系统
- **通用**: `@Provide()`, `@Inject()`, `@Scope()`, `@Init()`, `@Destroy()`
- **Web**: `@Controller()`, `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Query()`, `@Body()`, `@Param()`
- **配置**: `@Configuration()`, `@App()`, `@Config()`
- **AOP**: `@Aspect()`, `@Around()`, `@Before()`, `@After()`
- **中间件**: `@Middleware()`
- **任务**: `@Queue()`, `@Processor()`, `@Schedule()`
- **微服务**: `@Provider()`, `@Consumer()`, `@KafkaListener()`, `@RabbitMQListener()`

## Important Constraints

### 技术约束
- **Node.js 版本**: >= 20 (必须)
- **pnpm 版本**: >= 9 (必须)
- **TypeScript 版本**: 5.6.3 (锁定)
- **模块系统**: 使用 ES2022 + NodeNext 模块解析
- **装饰器**: 必须启用实验性装饰器支持

### 构建约束
- 所有包使用 `tsc` 构建，不使用 webpack/rollup
- 构建输出到 `dist/` 目录
- 必须生成 `.d.ts` 类型声明文件
- 支持 ESM 导出 (通过 `exports` 字段)

### 测试约束
- 每个包必须有独立的测试套件
- 测试必须使用 `--runInBand` 顺序执行
- 覆盖率测试使用 `--forceExit` 确保进程退出
- 不允许在测试中使用真实的外部服务（使用 mock）

### 发布约束
- 使用 lerna 统一管理版本
- 所有包版本号保持同步
- 发布前必须通过所有测试
- 发布渠道：canary (金丝雀) → beta (测试) → next (预览) → 正式版

### 代码质量约束
- 必须通过 mwts lint 检查
- 必须通过循环依赖检查 (`madge --circular`)
- 禁止在 `packages/version` 中进行循环依赖检查（版本包除外）
- 关键文件必须包含注释

### 兼容性约束
- 保持向后兼容（除非是 breaking change）
- Breaking changes 必须在 CHANGELOG 中明确标注
- 支持 Koa/Express/Egg.js 生态插件

## External Dependencies

### 云服务集成
- **阿里云**: OSS (对象存储), FC (函数计算), TableStore (表格存储)
- **腾讯云**: COS (对象存储)
- **AWS**: 通过 Serverless 框架支持

### 数据库
- **关系型**: MySQL, PostgreSQL, SQLite (通过 TypeORM/Sequelize/MikroORM/Leoric)
- **NoSQL**: MongoDB (通过 Mongoose/Typegoose), Redis
- **时序数据库**: 通过 ORM 适配器支持

### 消息队列
- **RabbitMQ**: 通过 `@midwayjs/rabbitmq`
- **Kafka**: 通过 `@midwayjs/kafka`
- **Bull/BullMQ**: Redis 基础的任务队列

### 服务发现与配置
- **Consul**: 服务发现和配置中心
- **Etcd**: 分布式配置存储

### 监控与追踪
- **Prometheus**: 指标收集
- **OpenTelemetry**: 分布式追踪

### 外部服务
- **HTTP 客户端**: 通过 `@midwayjs/axios` 和内置 httpclient
- **HTTP 代理**: 通过 `@midwayjs/http-proxy`
- **验证码**: 通过 `@midwayjs/captcha`

### 开发工具
- **Gitpod**: 在线开发环境支持
- **GitHub Actions**: CI/CD 流程
- **Vercel**: ncc 打包工具

### Web 生态
- **Next.js**: 通过 `@midwayjs/nextjs` 集成
- **Socket.IO**: 实时通信
- **WebSocket**: 原生 WebSocket 支持
- **gRPC**: 微服务通信

### 认证与授权
- **Passport.js**: 多种认证策略
- **JWT**: Token 认证
- **Casbin**: 权限管理（支持 Redis 和 TypeORM 适配器）

### 文件处理
- **Busboy**: 文件上传
- **Static File**: 静态文件服务

### 其他
- **Swagger**: API 文档生成
- **I18n**: 国际化支持
- **Code Dye**: 染色日志
- **Piscina**: 工作线程池
