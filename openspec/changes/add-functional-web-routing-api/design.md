## Context
Midway 已有 `defineConfiguration`，证明 functional 配置模式可行；但 Web 路由仍主要由装饰器定义并通过元数据收集。为了进入前端生态，需要把“路由声明”抽象成可序列化、可组合、可跨运行时共享的函数式模型。
同时，functional 路由也需要支持纯后端服务开发，不应被限定为“仅前端适配层能力”。

现有约束：
- 不能破坏 `@Controller/@Get/@Post` 既有行为。
- 路由最终仍需被 `MidwayWebRouterService` 统一消费。
- 用户希望可在 React/Vue/Next 生态中使用同一套声明。

## Architecture Overview
核心分为 4 层：
1. Definition Layer
- 位置：`src/server/api/**/*.api.ts`
- 职责：`defineApi` 声明 method/path/input/output/handler 元信息

2. Compile Layer
- 职责：扫描 API 定义、做静态分析、输出前端可消费 client/types
- 产物：内存调用重写结果（dev）或中间文件（build）

3. Runtime Adapter Layer
- 职责：把前端对 `server/api` 的调用转换为 HTTP 请求
- 附加能力：鉴权 header 注入、错误映射、超时重试策略（可配置）

4. Service Bridge Layer
- 职责：在 Next/Nuxt/React/Vue 生态中注入 Midway 服务能力
- 关键约束：不接管框架原生路由匹配

数据流：
- `defineApi` -> compile layer（重写 `server/api` 调用） -> transport adapter -> HTTP -> server route handler -> Midway service

## Decorator Evolution Matrix
本方案按“现有装饰器族”做 functional 等价演进，而非仅针对 HTTP。

| 现有装饰器族 | 当前代表装饰器 | Functional 草案 | 客户端草案 |
|---|---|---|---|
| Web HTTP | `@Controller` + `@Get/@Post/...` | `defineApi`（HTTP） | `httpApiClient`（fetch/axios） |
| WebSocket | `@WSController` + `@OnWSMessage` | `defineWebSocketApi` | `wsApiClient` |
| Socket.IO | `@WSController` + socket 事件 | `defineSocketIOApi` | `socketIoApiClient` |
| gRPC / 微服务 | `@Provider/@Consumer`、`@KafkaListener`、`@RabbitMQListener` | `defineRpcApi` / `defineMessageApi` | `grpcApiClient` / `messageApiClient` |
| Serverless Trigger | `@ServerlessTrigger` | `defineServerlessApi`（后续阶段） | `functionInvokeClient`（后续阶段） |
| Task / Queue | `@Queue`、`@TaskLocal`、`@Schedule` | `defineTaskApi` | `taskClient`（调度/入队） |

说明：
- 命名可在评审后冻结，但演进维度必须与装饰器族一一对应。
- 不采用 `defineApi({ protocol })` 统一入口；按协议分别导出对应 define API。

## Workspace Topology (Monorepo)
建议采用最小两层结构（路径可配置，以下为默认示例）：
1. `serverDir`（默认 `src/server`）：Midway 后端运行时，持有 `defineApi` 实现与 handler。
2. `webDir`（默认 `src/web`）：React 或 Vue 前端应用（按团队选择其一）。

约束：
- `apiDir`（默认 `src/server/api`）作为 API 定义单一真相源（method/path/schema/type）。
- 前端允许依赖 `apiDir`，但通过编译期转换消费 web-safe 产物。
- 浏览器 bundle 不得包含 Midway runtime 与 Node 专属模块。

推荐导出规范（单一入口）：

```ts
// src/server/api/index.ts
export { userApi } from './user.api';
export { orderApi } from './order.api';
export type * from './user.api';
export type * from './order.api';
```

约束：
- 仅导出 `defineApi` 结果与类型，禁止导出 IoC 实例/运行时对象。
- 前后端统一从 `src/server/api/index.ts` 导入，保证语义来源一致。

简化可选：Next.js 一体化单应用
- 单一 `src/app` 下同时承载页面与 API route handlers。
- `defineApi` 可作为路由语义源，映射到 Next route handlers（按适配器策略）。
- 不要求额外抽取独立 contracts 层。

## Draft API Surface
以下为提案阶段建议的最小 API 面，目标是与装饰器语义对齐。

```ts
type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'
  | 'all';

interface FunctionalControllerOptions {
  middleware?: any[];
  sensitive?: boolean;
  description?: string;
  tagName?: string;
  ignoreGlobalPrefix?: boolean;
  version?: string | string[];
  versionType?: 'URI' | 'HEADER' | 'MEDIA_TYPE' | 'CUSTOM';
  versionPrefix?: string;
  children: FunctionalRouteDefinition[];
}

interface FunctionalRouteOptions {
  routerName?: string;
  middleware?: any[];
  summary?: string;
  description?: string;
  ignoreGlobalPrefix?: boolean;
  input?: {
    params?: unknown;
    query?: unknown;
    body?: unknown;
    headers?: unknown;
  };
  output?: unknown;
}

interface FunctionalRouteDefinition {
  method: HttpMethod;
  path: string | RegExp;
  options: FunctionalRouteOptions;
  handle: (args: {
    input: {
      params?: unknown;
      query?: unknown;
      body?: unknown;
      headers?: unknown;
    };
    ctx: any;
  }) => any | Promise<any>;
}

declare function defineApi(
  prefix: string,
  factory: (api: {
    get(path?: string | RegExp): RouteBuilder;
    post(path?: string | RegExp): RouteBuilder;
    put(path?: string | RegExp): RouteBuilder;
    delete(path?: string | RegExp): RouteBuilder;
    patch(path?: string | RegExp): RouteBuilder;
    options(path?: string | RegExp): RouteBuilder;
    head(path?: string | RegExp): RouteBuilder;
    all(path?: string | RegExp): RouteBuilder;
  }) => Record<string, RouteBuilder | FunctionalRouteDefinition>
): any;

interface RouteBuilder {
  input(schema: FunctionalRouteOptions['input']): RouteBuilder;
  output(schema: FunctionalRouteOptions['output']): RouteBuilder;
  middleware(mw: any[]): RouteBuilder;
  meta(options: Omit<FunctionalRouteOptions, 'input' | 'output'>): RouteBuilder;
  handle(fn: FunctionalRouteDefinition['handle']): FunctionalRouteDefinition;
}
```

协议扩展草案（后续阶段）：

```ts
declare function defineApi(
  prefix: string,
  factory: (api: any) => Record<string, any>
): any; // HTTP

declare function defineWebSocketApi(namespace: string, factory: (api: any) => Record<string, any>): any;
declare function defineSocketIOApi(namespace: string, factory: (api: any) => Record<string, any>): any;
declare function defineGrpcApi(service: string, factory: (api: any) => Record<string, any>): any;
declare function defineMessageApi(topic: string, factory: (api: any) => Record<string, any>): any;
declare function defineTaskApi(taskNamespace: string, factory: (api: any) => Record<string, any>): any;
```

默认值策略：
- `controller.prefix` 默认 `/`。
- `route.path` 默认 `/`。
- `route.middleware` 默认 `[]`。
- `ignoreGlobalPrefix` 默认 `false`。
- 未设置 `output` 时按当前 Midway handler 返回值语义处理。

## Compile Pipeline
为保证“web 直接依赖 server api 定义”可用，采用两阶段编译：

Phase A: Definition Scan
- 输入：业务侧 `detector` 发现的模块集合（可包含 `src/**/*.ts`）
- 输出：`ApiDefinitionGraph`
- 规则：
  1. 在模块加载（require/import）阶段采集 `defineApi` 及当前阶段协议等价 API（如 `defineWebSocketApi`）声明
  2. 不执行 handler 运行时代码（仅注册定义）
  3. 记录 operationId、protocol、method/event/path/schema AST 引用

Phase B: Client Emit
- dev 模式：
  - 在内存中重写 `server/api` 调用与类型引用
  - HMR：API 变更后增量更新模块
- build 模式：
  - 输出中间产物到临时目录（如 `.midway/.generated`）
  - web 打包只消费中间产物

typed client 产物契约（最小）：

```ts
interface TypedClientBuildArtifact {
  moduleId: string;
  dtsModuleId: string;
  contract: {
    source: string;
    transport: 'http';
    operations: Record<
      string,
      {
        operationId: string;
        method: string;
        path: string;
        fullPath: string;
      }
    >;
  };
}
```

## Web-safe Boundary Rules
前端直接引用 `src/server/api` 时，编译层必须执行边界检查：
1. 允许导出：
- `defineApi` 声明对象
- schema 常量（zod 等）
- 纯类型导出

2. 禁止进入 web bundle：
- `useInject`、`@Inject`、`@Config` 等 Midway 运行时依赖
- `fs`、`path`、`process` 等 Node 专属模块
- handler 函数体及其运行时闭包引用

3. 违规处理：
- dev：编译错误 + 明确定位到 API 文件与字段
- build：阻断 web 构建

## Goals / Non-Goals
- Goals:
  - 提供与装饰器等价语义的 functional API。
  - 提供框架无关的路由定义对象，支持适配到多种前端/全栈框架。
  - 支持纯函数式 Midway 服务开发（不依赖 class/controller 装饰器）。
  - 支持与装饰器共存与渐进迁移。
  - 明确 class 与 functional 是“偏好层面的并行写法”，不是替代关系。
  - 降低前端开发者理解门槛（更接近函数式、链式声明习惯）。
  - 采用 Example-First 文档策略：每个新增 API 能力都提供用户可直接使用的范例。
- Non-Goals:
  - 本次不定义每个框架的完整 runtime 适配实现。
  - 本次不替换或废弃装饰器 API。
  - 本次不引入新的业务协议（如 GraphQL、RPC DSL）。

## Documentation Principle
- Example-First：后续所有设计增量必须同时提供“用户如何使用”的代码范例。
- 每个范例至少包含：导入方式、最小可运行声明、handler 写法、输入输出 schema（如适用）。
- 涉及框架适配的设计项，至少给出一份该框架的映射示例。

## Decisions
- Decision 1: 引入“声明对象优先”的路由模型
  - Functional API 的输出不是立即注册路由，而是产出标准 Route Definition，再由框架层注册。
  - 理由：可复用、可测试、可跨运行时传递。

- Decision 2: 语义与装饰器 1:1 对齐
  - `controller` 级能力：`prefix`、`middleware`、`version`、`versionType`、`versionPrefix`、`ignoreGlobalPrefix`。
  - `route` 级能力：`method`、`path`、`routerName`、`middleware`、`summary/description`、`ignoreGlobalPrefix`。
  - 理由：降低用户心智负担，避免双语义系统。

- Decision 3: 提供 Adapter Contract 而非内置重耦合适配
  - 输出稳定结构：`{ controller, routes, metadata }`（命名以实现为准）。
  - 允许第三方实现 `toReactRouter()`、`toVueRouter()`、`toNextHandlers()` 等转换。
  - 理由：避免 core 与特定前端框架生命周期强耦合。

- Decision 4: 合并策略采用“统一路由表”
  - Decorator 与 Functional 声明最终都进入统一路由收集与冲突检测流程。
  - 理由：确保重复路由检查、排序策略、版本策略保持一致。

- Decision 4A: 复用装饰器元数据定义协议
  - `defineApi` 产出的路由定义复用现有 class 装饰器元数据字段与收集协议（含 controller/route/version/middleware 等）。
  - 不引入第二套平行元数据模型。
  - 理由：降低实现分叉风险，保证 class/functional 行为严格对齐。

- Decision 5: 输出标准 Route Manifest
  - 在 functional 声明层可导出 `RouteManifestItem[]`，供前端生态适配。
  - 理由：降低对反射元数据和运行时容器的依赖。

- Decision 6: 采用链式 RouteBuilder DSL
  - 以 `defineApi('/prefix', api => ({ ... }))` + `.input().output().handle()` 作为首选写法。
  - 理由：更符合前端/全栈函数式 API 习惯，并天然支持 schema 驱动。

- Decision 7: defineApi 归属 core/functional
  - `defineApi` 与 `defineConfiguration` 保持同一入口：`@midwayjs/core/functional`。
  - 理由：避免生态出现多入口与语义分裂，保证长期维护与版本演进一致性。

- Decision 8: IoC 连续性采用 hooks-first
  - functional handler 中使用 `useInject()` 获取依赖，保持 hooks 风格一致。
  - 理由：保证函数式体验一致性，并避免出现多套依赖获取心智模型。

- Decision 9: 双风格长期共存
  - class decorator 与 functional API 都是官方推荐入口，按团队偏好选择。
  - 文档和示例必须避免“迁移即替换”的表述。
  - 理由：目标是降低前端理解成本，而不是改变现有服务端团队习惯。

- Decision 9A: 纯函数式服务为一等场景
  - 即使不接入 React/Vue/Next/Nuxt，用户也可仅基于 `defineApi + useInject` 构建 Midway 服务。
  - 理由：functional 是编程范式入口，不是前端专用适配层。

- Decision 10: 简化 API 注册模型
  - 不采用 `defineConfiguration({ web: { apis: [...] } })` 的嵌套注册方式。
  - 业务侧通过 v4 `detector` 显式配置发现范围，或通过入口导出模块加载；不使用 `imports` 作为 API 注册机制。
  - 理由：与 Midway v4 发现机制保持一致，避免混淆 `imports` 的组件扩展职责。

- Decision 11: 共享协议与运行时分层
  - `src/server/api` 既承担后端路由定义，也承担前端类型与调用语义来源。
  - 前端直接导入 `src/server/api`，由编译层重写调用，避免重复维护一套 contracts。
  - 理由：实现“单一真相源”并降低维护成本。

- Decision 12: 构建与发布解耦
  - dev：内存编译将 `server/api` 调用重写为前端可用调用代码并同步类型。
  - build：server 与 web 产物分开，web 仅消费提取后的 web-safe 中间产物。
  - CI/CD 串行执行 `server-api-check -> server-build -> web-build`。
  - 理由：降低耦合，提高构建可预测性与缓存命中率。

- Decision 13: 提供 Next.js 一体化落地路径
  - Next.js/Nuxt 集成优先采用各自原生路由体系。
  - Midway 在该模式下仅提供服务层适配（IoC、配置、日志、客户端生成）。
  - 理由：避免框架路由能力冲突，降低迁移与理解成本。

- Decision 14: 引入 Direct-like Typed Client（开发体验层）
  - 前端直接导入 `server/api` 导出的 API 定义，调用方式接近直接函数调用。
  - 底层自动完成 method/path/序列化/反序列化与 HTTP 请求发送。
  - 理由：抹平前后端协作心智差异，同时不破坏运行时边界。

- Decision 14A: Client Runtime 下沉到 `@midwayjs/api-bridge`
  - typed client 与 transport SPI 的通用实现放在 `@midwayjs/api-bridge`。
  - `@midwayjs/react`、`@midwayjs/nextjs` 等仅保留框架胶水（插件/hook/module）。
  - 理由：避免多框架重复实现与行为分叉。

- Decision 15: 编译层强约束 web-safe 边界
  - 前端对 `server/api` 的依赖必须经过 compile layer 的静态裁剪与校验。
  - 理由：防止 server runtime 泄露到浏览器包。

- Decision 16: 统一 operationId 命名
  - operationId 优先使用 route `routerName`；未设置时由 `method + fullPath` 归一化生成。
  - 要求在同一 route manifest 作用域内唯一，冲突时抛错。
  - 理由：保证 typed client 稳定可追踪，利于缓存与监控。

- Decision 17: 单一 Dev 入口
  - 用户侧只暴露一个 `dev` 命令入口。
  - 该入口内部可以启动多个 watcher/worker，但不要求用户手动分别启动 server 与 web dev。
  - 理由：降低一体化开发心智负担，符合前端一键启动习惯。

- Decision 18: 协议能力按 API 分别导出
  - 不提供 `defineApi({ protocol })` 统一入口。
  - HTTP 使用 `defineApi`，其他协议使用 `defineWebSocketApi`、`defineSocketIOApi`、`defineGrpcApi` 等分协议导出。
  - 理由：协议语义更直观，避免统一入口参数复杂化。

## Route Manifest Contract
建议输出结构（实现阶段可增加字段，但不能破坏基础字段语义）：

```ts
interface RouteManifestItem {
  source: 'functional' | 'decorator';
  controllerId?: string;
  controllerPrefix: string;
  method: HttpMethod | Uppercase<HttpMethod>;
  path: string;
  fullPath: string;
  routerName?: string;
  middlewareCount: number;
  ignoreGlobalPrefix: boolean;
  version?: string | string[];
  versionType?: 'URI' | 'HEADER' | 'MEDIA_TYPE' | 'CUSTOM';
  versionPrefix?: string;
  summary?: string;
  description?: string;
}
```

说明：
- `fullPath` 为前缀拼接和版本处理后的可访问路径。
- `source` 用于冲突错误与调试定位。
- `middlewareCount` 只用于 manifest 诊断，不暴露具体 middleware 实例。

## Resolution & Priority Rules
统一规则建议：
1. 路由冲突键：`HTTP_METHOD + fullPath`。
2. Controller 级 `ignoreGlobalPrefix` 为默认行为，route 级可覆写。
3. 版本路径前缀行为与现有 `MidwayWebRouterService` 保持一致。
4. 排序与匹配继续复用现有 `sortRouter` 规则，functional 不新增新优先级维度。

## Adapter Mapping (User-facing Examples)
以下是规范目标，不要求在本次 core 内实现全部 adapter。

- React Router:
  - 输入：`RouteManifestItem[]`
  - 输出：`{ path, loader/action/component }[]`
  - 约束：只映射 `GET` 到 `loader`，`POST/PUT/PATCH/DELETE` 到 `action`（策略由 adapter 定义）

- Vue Router:
  - 输入：`RouteManifestItem[]`
  - 输出：`RouteRecordRaw[]`
  - 约束：`routerName` 对应 `name`，`fullPath` 对应 `path`

- Next.js Route Handlers:
  - 输入：`RouteManifestItem[]`
  - 输出：按目录聚合的 handler 映射
  - 约束：adapter 可选择按 `fullPath` 生成虚拟文件树或 runtime registry

## Local Dev Workflow (Example)
1. 执行单一 `dev` 命令（例如 `pnpm dev`）。
2. dev runner 内部统一拉起：
  - server watcher（暴露 API 定义源）
  - web dev server（消费 `server/api` 导入重写结果）
  - bridge compiler（内存重写调用与类型映射）
3. API 变更后由 bridge compiler 触发增量更新与 HMR。
4. 前端以 direct-like 方式调用，避免手写路径与类型。

目录建议（默认示例，最终支持可配置）：
- `${apiDir}/**/*.api.ts`（默认 `src/server/api/**/*.api.ts`）：`defineApi` 模块
- `${webDir}/**`（默认 `src/web/**`）：直接导入并调用 `${apiDir}` 导出 API

## Config Contract
建议配置项（框架插件统一支持）：

```ts
interface FunctionalApiBridgeConfig {
  detectorSource?: 'project-detector' | 'entry-export'; // default: project-detector
  apiEntry?: string; // when detectorSource=entry-export
  runtimeBaseURL?: string; // dev/build 下可覆盖
  emitMode?: 'virtual' | 'file'; // default: dev=virtual, build=file
  outDir?: string; // default: .midway/.generated
  strictWebSafe?: boolean; // default: true
  transport?: 'http' | string; // default: http
  transportAdapter?: ApiTransportAdapter;
  onError?: (error: BridgeError) => void;
}
```

默认策略：
- Next/Nuxt：优先 `virtual`，SSR build 可切换 `file`
- React/Vue：Vite/Rspack 下优先 `virtual`

## Direct-like Client Contract
建议产出（代码生成或虚拟模块）：

```ts
interface GeneratedApiClient {
  [group: string]: {
    [operation: string]: (args: {
      params?: unknown;
      query?: unknown;
      body?: unknown;
      headers?: Record<string, string>;
    }) => Promise<unknown>;
  };
}
```

行为约束：
1. 输入输出类型来自 `defineApi` 对应 schema 推导。
2. 客户端模块不依赖 Midway server runtime（由编译层剥离）。
3. 支持 baseURL、鉴权头、错误映射拦截。
4. dev 模式下支持热更新（API 变更后前端类型自动刷新）。

## Client Adapter Matrix
同一协议下支持多客户端实现：

```ts
type HttpClientAdapterType = 'fetch' | 'axios' | string;
```

示例：
- HTTP: `fetchAdapter` / `axiosAdapter`
- gRPC: `grpcWebAdapter` / `grpcNodeAdapter`
- WS: `nativeWsAdapter` / `socketIoCompatAdapter`
- Socket.IO: `socketIoClientAdapter`

## Transport Adapter SPI
为支持“默认 HTTP + 用户自定义调用实现（如 tRPC）”，定义传输层扩展接口：

```ts
interface ApiTransportAdapter {
  name: string;
  protocol: 'http' | 'grpc' | 'ws' | 'socketio' | string;
  call<TInput = unknown, TOutput = unknown>(req: {
    operationId: string;
    method?: string; // http
    path?: string; // http
    rpcService?: string; // grpc
    rpcMethod?: string; // grpc
    event?: string; // ws/socketio
    channel?: string; // ws/socketio
    input: TInput;
    meta?: Record<string, unknown>;
  }): Promise<TOutput>;
}
```

默认实现：
- `httpTransportAdapter`：method/path/序列化 -> HTTP 请求

扩展实现：
- 用户可注册 `trpcTransportAdapter` 或其他 RPC/网关调用器
- compile layer 生成的 client 调用统一走 transport adapter，不绑定 HTTP 实现细节

选择策略：
1. 全局配置选择一个 transport adapter
2. 可选支持 operation 级覆盖（advanced，后续阶段）

## Protocol Plugin Model
为支持 Midway 多 framework（gRPC/WS/Socket.IO），增加协议插件层：

```ts
interface ApiProtocolPlugin {
  protocol: 'http' | 'grpc' | 'ws' | 'socketio' | string;
  createDefinitionBuilder(): unknown; // defineApi factory 的 api 参数
  createClientEmitter(): unknown; // 生成 typed client 的协议逻辑
  createRuntimeAdapter(): ApiTransportAdapter;
}
```

默认内置：
- `http`（首发稳定）
- `ws`（基于现有 WS 装饰器能力映射）
- `socketio`（基于现有 socket 生态适配）

扩展目标：
- `grpc`、`message`（kafka/rabbitmq）、`task` 作为后续协议插件接入，不破坏 defineApi 核心形态。
- `serverless` 作为延后能力，不纳入当前 change 实施范围。

## Evolution Strategy
分阶段演进：
1. Phase 1（核心）：HTTP + `@midwayjs/nextjs` + `@midwayjs/react`
2. Phase 1.5（桥接沉淀）：抽象共用 bridge contract（供后续框架复用）
3. Phase 2（扩展前端框架）：`@midwayjs/nuxt` + Vue 集成包
4. Phase 3（实时）：WebSocket + Socket.IO
5. Phase 4（服务通信）：gRPC + message listeners（Kafka/RabbitMQ）
6. Phase 5（计算与调度）：Task/Queue
7. Phase X（延后能力）：Serverless Trigger

每阶段要求：
- 与现有装饰器行为对齐（语义与默认值）
- 具备对应 client adapter 或调用器
- 不破坏上一阶段 API 与类型稳定性

## Error Handling Model
新增桥接层错误码：
- `MW_API_BRIDGE_UNSAFE_IMPORT`
  - 含义：发现 server runtime 依赖泄露到 web
- `MW_API_BRIDGE_INVALID_DEFINITION`
  - 含义：`defineApi` 声明不完整或无法静态分析
- `MW_API_BRIDGE_DUPLICATE_OPERATION`
  - 含义：同一作用域 operationId 冲突
- `MW_API_BRIDGE_GENERATE_FAILED`
  - 含义：client/types 生成失败

每个错误必须包含：
- file
- operationId（如适用）
- framework（next/nuxt/react/vue）
- suggestedFix

## Framework-specific Integration
统一原则：
- API 定义源：`src/server/api`
- 前端消费形态：直接导入 `server/api`（编译层重写）或框架注入对象
- 运行时边界：浏览器端不引入 Midway runtime

### Next.js (Phase 1)
- 实现点：
  1. 提供 `@midwayjs/nextjs` 桥接客户端（基于 `@midwayjs/api-bridge`）
  2. 复用 `src/server/api` 类型与路由语义，在 Next Server Component / Route Handler 侧直接调用
  3. 不接管 Next 路由匹配，仅适配服务层能力（`app/api`、`pages/api` 仍由 Next 管理）
- 风险控制：
  - 明确 Client/Server Component 可用能力边界
  - route handler 与 client 调用的异常语义一致（状态码、错误体）

### Nuxt (Phase 2)
- 实现点：
  1. 提供 Nuxt module + Nitro hook
  2. 消费业务侧已发现 API 定义并生成 `$api` composable
  3. 注入 `useApiClient()` 类型提示
  4. 不接管 Nuxt/Nitro 路由匹配，仅适配服务层能力
- 风险控制：
  - 确保 Nitro server 与 client bundle 引用链分离
  - 避免 module 注入顺序导致 `$api` 未注册

### React (Phase 1)
- 实现点：
  1. 提供 Vite/Rspack plugin
  2. 重写 React 侧 `server/api` 调用为 web-safe transport 调用
  3. 支持 React Query/SWR 适配封装（可选）
- 风险控制：
  - 避免 HMR 时类型与运行时代码不同步
  - 兼容 React Query/SWR 的取消请求机制（AbortSignal）

### Vue (Phase 2)
- 实现点：
  1. 提供 Vite plugin + Vue plugin
  2. 暴露 `$api` 与 `useApiClient()`
  3. 支持与 Pinia / Vue Query 集成（可选）
- 风险控制：
  - 避免插件注入时类型丢失
  - 兼容 `<script setup>` 推导与 Volar 类型提示

## Test Strategy
必须覆盖三类测试：
1. Compile tests
- API 扫描、类型提取、web-safe 违规检测

2. Framework integration tests
- Next/Nuxt/React/Vue 各一组最小样例验证
- 验证 client bundle 不含 Midway runtime

3. End-to-end tests
- 前端直接调用 `server/api` 导出的 API 能成功命中后端
- 变更 schema 后前端编译报错可定位

## Error Model
冲突错误建议统一结构：

```ts
interface DuplicateRouteErrorPayload {
  code: 'MIDWAY_DUPLICATE_ROUTE';
  method: string;
  fullPath: string;
  current: { source: 'functional' | 'decorator'; handler: string };
  existing: { source: 'functional' | 'decorator'; handler: string };
}
```

要求：
- 错误包含 method/fullPath/current/existing 四类核心信息。
- 混用场景下必须可看出冲突来源。

## Risks / Trade-offs
- 风险：API 形态过多导致学习成本增加。
  - 缓解：坚持最小 API 面，仅覆盖装饰器高频能力。

- 风险：跨框架适配期望不一致（例如 Next.js 文件路由优先）。
  - 缓解：规范只保证“路由定义协议”，框架特定策略放在 adapter 文档。

- 风险：装饰器与 functional 混用时冲突难定位。
  - 缓解：要求统一冲突错误格式，包含来源（decorator/functional）和定义位置。

## Migration Plan
1. 新项目可直接使用 functional 路由声明。
2. 存量项目可按 controller 粒度逐步替换。
3. 混用阶段通过统一冲突检测保证行为可预期。

## Open Questions (Reviewed)
- Q1: 是否在 core 内提供“官方基础 adapter”（例如仅提供 `toRouteManifest()`），其余框架由独立包实现。
  - 结论：是。core 仅保留协议定义、元数据复用与 route manifest 基础能力；客户端调用与框架桥接统一放在 bridge/framework 包（如 `@midwayjs/api-bridge`、`@midwayjs/react`、`@midwayjs/nextjs`）。
- Q2: 命名是否采用统一入口或按协议分别导出。
  - 结论：按协议分别导出，不做统一入口。当前冻结 HTTP 的 `defineApi`（位于 `@midwayjs/core/functional`）；其他协议 `defineXXX` 在对应组件包中后续推进。
- 当前阶段无阻塞性未决问题，可进入后续 apply/扩展阶段。
