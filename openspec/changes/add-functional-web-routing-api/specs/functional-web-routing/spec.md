## ADDED Requirements

### Requirement: defineApi Chain DSL
系统 SHALL 提供 `defineApi('/prefix', api => ({ ... }))` 的链式声明 DSL 作为 Functional Web 路由的首选用户入口。

#### Scenario: 使用 defineApi 定义一组同前缀路由
- **WHEN** 用户使用 `defineApi('/users', api => ({ ... }))` 声明多个 API
- **THEN** 每个 API 节点都归属于同一 controller 前缀 `/users`
- **AND** 每个节点可通过 `api.get/post/...` 指定 HTTP method 与子路径

#### Scenario: 使用 RouteBuilder 链式定义输入输出和处理器
- **WHEN** 用户通过 `api.get('/:id').input(...).output(...).handle(...)` 声明路由
- **THEN** 系统保留 method/path/input/output/handler 的完整定义
- **AND** 路由注册行为与装饰器模式下的等价定义保持一致

#### Scenario: defineApi 从 core/functional 导出
- **WHEN** 用户使用 functional routing API
- **THEN** 可通过 `@midwayjs/core/functional` 导入 `defineApi`
- **AND** 不要求依赖额外独立包入口

### Requirement: Intuitive API Registration
系统 SHALL 提供直觉化的 defineApi 注册方式，避免额外的嵌套配置心智负担。

#### Scenario: 通过业务侧 detector 显式发现 defineApi 模块
- **WHEN** 用户在业务配置中声明 `detector`（如 `CommonJSFileDetector`）并包含 API 模块
- **THEN** 系统在模块加载阶段执行 `defineApi(...)` 并完成定义注册
- **AND** 用户无需在 configuration 中编写 `web.apis` 嵌套配置

#### Scenario: 通过入口导出加载 defineApi 模块
- **WHEN** 用户通过业务入口文件显式导出 API 模块
- **THEN** 系统可加载并注册这些 API 定义
- **AND** 不要求使用 `imports` 作为 API 注册机制

### Requirement: Monorepo Fullstack Co-Development
系统 SHALL 支持前后端在同一项目中协同开发，并保持运行时职责清晰分离。

#### Scenario: React 与 Midway 在最小两层结构同仓开发
- **WHEN** 用户在同仓中维护 `src/server` 与 `src/web`
- **AND** `src/web` 采用 React
- **THEN** 前端可直接复用 `src/server/api` 的 API 定义
- **AND** React 应用不需要直接依赖 Midway server 运行时代码

#### Scenario: Vue 与 Midway 在最小两层结构同仓开发
- **WHEN** 用户在同仓中维护 `src/server` 与 `src/web`
- **AND** `src/web` 采用 Vue
- **THEN** 前端可直接复用 `src/server/api` 的 API 定义
- **AND** Vue 应用不需要直接依赖 Midway server 运行时代码

#### Scenario: Next.js 单应用一体化开发
- **WHEN** 用户选择 Next.js 单应用结构（页面与 API 同仓同应用）
- **THEN** 系统支持在该结构下复用 server API 语义定义
- **AND** 用户不需要强制拆分独立 server/web 工程

### Requirement: Server API As Single Source of Truth
系统 SHALL 以 `src/server/api` 作为前后端 API 定义的单一真相源，避免重复维护 contracts。

#### Scenario: 前端复用 server API 类型与 schema
- **WHEN** 用户在 `src/server/api` 中维护 schema 与类型
- **THEN** server 与 web 可共同消费同一份定义语义
- **AND** 前后端不需要各自重复声明同一请求/响应结构

#### Scenario: 复用路径与路由标识
- **WHEN** 用户在 `src/server/api` 中变更路径或操作名
- **THEN** 前端调用层与后端路由声明可引用同一来源
- **AND** 路径变更可在编译阶段暴露影响范围

#### Scenario: 通过统一入口导出 API 定义
- **WHEN** 用户在 `src/server/api/index.ts` 汇总导出 `*.api.ts` 模块
- **THEN** 前端与后端都可通过该入口消费同一批 API 定义
- **AND** 该入口仅导出 API 定义与类型，不导出 server runtime 实例

### Requirement: Direct-like Frontend API Access
系统 SHALL 提供让前端“接近直接调用后端 API”的开发体验层，同时保持运行时边界。

#### Scenario: 前端通过 typed client 调用 API
- **WHEN** 前端直接导入 `src/server/api` 中定义的 API 并调用（如 `userApi.getUser(...)`）
- **THEN** 系统自动完成 HTTP method/path 映射与请求发送
- **AND** 前端无需手写 fetch/axios 路径拼接逻辑

#### Scenario: typed client 来源于 defineApi
- **WHEN** 后端 `defineApi` 的输入输出 schema 发生变更
- **THEN** 前端 client 类型同步更新并在编译阶段暴露不兼容调用
- **AND** client 运行时不直接依赖 server runtime 模块（经编译层剥离）

#### Scenario: typed client 产物包含稳定契约字段
- **WHEN** 编译层为 `src/server/api` 生成 typed client 产物
- **THEN** 产物契约至少包含 `moduleId`、`dtsModuleId`、`operations`
- **AND** 每个 operation 至少包含 `operationId`、`method`、`path`、`fullPath`

### Requirement: Pluggable Transport Adapter
系统 SHALL 支持可插拔传输层，以便在默认 HTTP 之外接入自定义调用实现（如 tRPC）。

#### Scenario: 默认 HTTP 传输可用
- **WHEN** 用户未显式配置 transport adapter
- **THEN** typed client 默认使用 HTTP 调用后端
- **AND** 调用行为包含 method/path/序列化处理

#### Scenario: 自定义 transport adapter 可替换
- **WHEN** 用户注册自定义 transport adapter（例如 tRPC）
- **THEN** typed client 调用通过自定义 adapter 执行
- **AND** 前端调用签名与类型推导保持不变

### Requirement: Same Protocol Multi-client Adapter
系统 SHALL 支持同一协议下的多客户端实现适配，以满足不同前端工程偏好。

#### Scenario: HTTP 协议切换 fetch/axios
- **WHEN** 用户在 HTTP 协议下选择不同客户端实现（如 fetch 或 axios）
- **THEN** 调用签名与类型推导保持一致
- **AND** 仅底层请求执行器发生替换

#### Scenario: 客户端实现切换不影响 API 定义
- **WHEN** 用户切换同协议客户端实现
- **THEN** `defineApi` 声明无需修改
- **AND** 运行时行为遵循对应客户端适配器策略

### Requirement: Multi-protocol Define API Extension
系统 SHALL 支持将 define API 扩展到 HTTP 之外的 Midway 协议生态（gRPC/WS/Socket.IO）。

#### Scenario: 协议能力按 define API 分别导出
- **WHEN** 用户使用多协议 functional API
- **THEN** 用户通过分协议导出入口使用能力（如 `defineApi`/`defineWebSocketApi`/`defineGrpcApi`）
- **AND** 系统不要求通过 `defineApi({ protocol })` 的统一入口声明

#### Scenario: gRPC 协议定义与客户端适配
- **WHEN** 用户使用 gRPC 协议扩展定义 API
- **THEN** 系统可生成对应客户端调用入口
- **AND** 输入输出类型沿用统一 schema 推导机制

#### Scenario: WS/Socket.IO 协议定义与客户端适配
- **WHEN** 用户使用 WS 或 Socket.IO 协议扩展定义 API
- **THEN** 系统可生成事件/通道调用入口
- **AND** 调用层仍复用统一 adapter 扩展机制

### Requirement: Decorator-family Functional Evolution
系统 SHALL 按 Midway 现有装饰器族提供对应 functional 演进路径（当前阶段不含 ServerlessTrigger），而非仅覆盖 HTTP。

#### Scenario: WebSocket 装饰器族演进
- **WHEN** 用户从 `@WSController` 与事件装饰器迁移
- **THEN** 系统提供等价的 `defineWebSocketApi`
- **AND** 事件语义与上下文能力保持一致

#### Scenario: 微服务监听装饰器演进
- **WHEN** 用户从 `@KafkaListener`、`@RabbitMQListener`、`@Provider/@Consumer` 迁移
- **THEN** 系统提供等价的消息/服务通信 define API
- **AND** 消息模式与处理语义保持可映射

#### Scenario: 任务调度装饰器演进
- **WHEN** 用户从 `@Queue`、`@TaskLocal`、`@Schedule` 迁移
- **THEN** 系统提供等价的 `defineTaskApi`（或等价预置）
- **AND** 调度与任务执行语义保持一致

### Requirement: ServerlessTrigger Deferred in Current Phase
系统 SHALL 在当前 change 中将 `@ServerlessTrigger` 的 functional 演进定义为延期事项。

#### Scenario: 当前阶段不要求 serverless functional API
- **WHEN** 评审本 change 的实现范围
- **THEN** `defineServerlessApi` 不作为本阶段必交付能力
- **AND** 后续可通过独立 change 补充 serverless 协议与客户端适配

### Requirement: Build Separation and Output Boundaries
系统 SHALL 定义清晰的构建分离策略，确保共享定义、后端运行时、前端产物独立构建。

#### Scenario: dev 阶段使用内存编译
- **WHEN** 开发者在同仓模式启动 web dev
- **THEN** 系统可在内存中将已发现的 API 定义转换为 web 可消费 client/types
- **AND** API 变更可触发前端类型与调用代理热更新

#### Scenario: 单一 dev 命令入口
- **WHEN** 开发者启动本地开发环境
- **THEN** 开发者只需执行一个 `dev` 命令
- **AND** 系统内部自动协调 server watcher、web dev server 与 bridge compiler

#### Scenario: server 与 web 构建互不污染
- **WHEN** 分别构建 server 与 web
- **THEN** server 构建不包含前端 bundler 产物
- **AND** web 构建不打入 Midway runtime 依赖
- **AND** 发布产物保持 server 与 web 分离

### Requirement: Directory Convention for Functional API
系统 SHALL 提供推荐目录约定，降低团队落地成本并提升可发现性。

#### Scenario: 目录路径可配置
- **WHEN** 用户不使用默认目录（如 `src/server`、`src/web`）
- **THEN** 系统允许通过配置指定 `serverDir`、`webDir`、`apiDir`
- **AND** 发现、编译重写与构建分离行为保持一致

#### Scenario: 约定目录组织 defineApi
- **WHEN** 用户采用推荐目录规范
- **THEN** `defineApi` 模块可放置在 `src/server/api/**/*.api.ts`
- **AND** 业务侧 `detector` 可显式包含该目录完成发现

#### Scenario: 约定目录组织共享 contracts
- **WHEN** 用户采用推荐目录规范
- **THEN** 前端可直接依赖 `src/server/api` 中的 API 定义
- **AND** 通过编译层确保浏览器侧不会引入 server runtime 代码

### Requirement: Module-load Registration Semantics
系统 SHALL 在模块加载阶段注册 functional API 定义，并避免在发现阶段执行业务处理逻辑。

#### Scenario: defineApi 在模块加载阶段完成注册
- **WHEN** API 模块被 detector 或入口导出机制加载
- **THEN** `defineApi`（及分协议 define API）在模块顶层执行并完成定义注册
- **AND** 注册结果可进入统一路由收集流程

#### Scenario: 发现阶段不执行 handler
- **WHEN** 系统进行 API 发现与注册
- **THEN** 路由 `handle` 函数不会在该阶段执行
- **AND** `handle` 仅在真实请求/消息到达时执行

### Requirement: Functional Controller Definition
系统 SHALL 提供与 `@Controller` 等价的 Functional Controller 声明能力，使用户可在不依赖类装饰器的前提下定义路由分组。

#### Scenario: 使用 functional API 定义控制器前缀与选项
- **WHEN** 用户通过 functional API 定义一个 controller 组并设置 `prefix`、`middleware` 或版本选项
- **THEN** 系统生成等价于 `@Controller(prefix, options)` 的控制器元信息
- **AND** 该元信息可被现有路由收集流程识别

#### Scenario: 配置控制器级 ignoreGlobalPrefix
- **WHEN** 用户在 functional controller 级别设置 `ignoreGlobalPrefix`
- **THEN** 该控制器下的路由默认忽略全局前缀
- **AND** 行为与装饰器模式保持一致

#### Scenario: controller 参数采用与装饰器一致的默认值
- **WHEN** 用户调用 functional controller API 时未传 `prefix` 与 router options
- **THEN** 系统使用 `prefix = '/'` 作为默认值
- **AND** 未显式配置的路由选项采用与装饰器一致的默认行为

### Requirement: Functional HTTP Method Definition
系统 SHALL 提供与 `@Get`、`@Post`、`@Put`、`@Delete`、`@Patch`、`@Options`、`@Head`、`@All` 等价的 Functional 路由声明能力。

#### Scenario: 定义 GET 与 POST 路由
- **WHEN** 用户通过 functional API 声明 `GET /users` 与 `POST /users`
- **THEN** 系统产生包含 `requestMethod`、`path`、`handler` 的标准路由定义
- **AND** 路由信息在运行时注册后与装饰器声明结果等价

#### Scenario: 设置 route 级 middleware 与 routerName
- **WHEN** 用户为 functional route 声明 `middleware` 与 `routerName`
- **THEN** 系统在路由定义中保留这些字段
- **AND** 字段行为与装饰器模式一致

#### Scenario: 设置 route 级 ignoreGlobalPrefix
- **WHEN** 用户在某个 functional route 上单独设置 `ignoreGlobalPrefix`
- **THEN** 该路由忽略全局前缀而不影响同 controller 下其他路由
- **AND** 优先级规则与现有装饰器行为一致

#### Scenario: route 参数采用与装饰器一致的默认值
- **WHEN** 用户调用 `route.get()` 且未显式传入 path 或 options
- **THEN** 系统使用 `path = '/'` 且 `middleware = []` 的默认行为
- **AND** `requestMethod` 与对应 helper 的 HTTP method 保持一致

### Requirement: Schema-driven Input and Output
系统 SHALL 支持在 Functional Route 声明中使用 schema 描述输入与输出，以支持类型推导与运行时校验。

#### Scenario: 使用 zod 定义 params 和 body 输入
- **WHEN** 用户在 `.input()` 中声明 `params/body/query/headers` 的 zod schema
- **THEN** `handle` 回调中的 `input` 结构与 schema 字段保持一致
- **AND** 非法输入会触发统一的校验失败行为

#### Scenario: 使用 zod 定义 output 输出
- **WHEN** 用户在 `.output()` 中声明返回值 schema
- **THEN** 路由返回值可按 schema 执行校验或序列化约束（取决于运行时策略）
- **AND** 该输出 schema 信息可进入 route manifest 供工具链消费

### Requirement: IoC Access in Functional Handlers
系统 SHALL 在 functional handler 中通过 hooks 方式提供 IoC 访问能力。

#### Scenario: 使用 useInject 获取服务
- **WHEN** 用户在 functional handler 中调用 `useInject('userService')`
- **THEN** 系统返回与当前请求上下文一致的可用服务实例
- **AND** 该方式作为推荐写法记录在用户文档中

### Requirement: Pure Functional Midway Service Authoring
系统 SHALL 支持在不使用 class/controller 装饰器的情况下，基于 functional API 完整开发 Midway 服务。

#### Scenario: 仅使用 defineApi 构建后端服务
- **WHEN** 用户项目中只使用 `defineApi` 声明 API 并提供 handler
- **THEN** 系统可完成路由注册与请求处理
- **AND** 不要求用户额外编写 class/controller 装饰器代码

#### Scenario: 纯函数式服务与装饰器模块共存
- **WHEN** 用户在同一应用中同时存在 functional API 模块与装饰器模块
- **THEN** 系统可统一收集并注册路由
- **AND** 两种写法都保持官方支持地位

### Requirement: Shared Route Definition for Frontend Ecosystem
系统 SHALL 暴露框架无关的 Route Definition，以支持 React、Vue、Next.js 及其他框架进行路由复用或适配。

#### Scenario: 导出可被前端路由适配器消费的路由清单
- **WHEN** 用户创建 functional controller 和 routes
- **THEN** 系统可输出稳定结构的路由清单（包含 method、fullPath、name、metadata）
- **AND** 该清单不绑定特定前端框架运行时

#### Scenario: 第三方框架基于统一协议适配
- **WHEN** 适配层读取 Route Definition
- **THEN** 适配层可无损映射到目标框架路由结构（如 React Router、Vue Router、Next handlers）
- **AND** 不需要解析装饰器反射元数据

### Requirement: Stable Route Manifest Contract
系统 SHALL 提供稳定字段的 Route Manifest 导出能力，供外部工具链与前端框架适配层消费。

#### Scenario: 导出 manifest 包含稳定基础字段
- **WHEN** 用户导出 route manifest
- **THEN** 每条记录至少包含 `source`、`operationId`、`method`、`path`、`fullPath`、`ignoreGlobalPrefix`
- **AND** 对应 controller 级字段可被追踪（如 `controllerPrefix`、`version`、`versionType`）

#### Scenario: operationId 命名与唯一性
- **WHEN** 系统生成 route manifest
- **THEN** `operationId` 优先使用 `routerName`，否则由 `method + fullPath` 归一化生成
- **AND** 在同一 manifest 作用域内 `operationId` 必须唯一，冲突时抛出错误

#### Scenario: fullPath 由统一规则计算
- **WHEN** manifest 中存在全局前缀、controller 前缀、版本前缀、route path
- **THEN** 系统按照与运行时注册一致的拼接规则计算 `fullPath`
- **AND** manifest 中 `fullPath` 与真实可访问路由保持一致

### Requirement: Adapter Contract for Frontend Frameworks
系统 SHALL 定义统一的 adapter 输入契约，使 React/Vue/Next 等生态可基于 Route Manifest 适配，而不依赖 Midway 私有运行时。

#### Scenario: adapter 以 manifest 为唯一输入
- **WHEN** 开发者编写任意框架适配器
- **THEN** 适配器可仅依赖 Route Manifest 完成路由结构转换
- **AND** 不要求访问装饰器元数据或容器内部对象

#### Scenario: routerName 与路径信息可直接映射
- **WHEN** adapter 将 manifest 映射到目标框架路由定义
- **THEN** `routerName`、`fullPath` 等字段可直接用于目标框架的 `name/path` 映射
- **AND** method 信息可用于区分 loader/action/handler 注册策略

### Requirement: Framework Integration Coverage (Next/Nuxt/React/Vue)
系统 SHALL 为 Next.js、Nuxt、React、Vue 四类框架提供明确的一体化接入设计。

#### Scenario: Next.js 集成方案可用
- **WHEN** 用户在 Next.js 项目中启用 functional API 集成
- **THEN** 系统可从 `src/server/api` 生成可调用 client 代理
- **AND** 系统不接管 Next 原生路由匹配流程
- **AND** Next client bundle 不包含 Midway runtime

#### Scenario: Nuxt 集成方案可用
- **WHEN** 用户在 Nuxt 项目中启用 functional API 集成
- **THEN** 系统可生成 `$api` 或等价 composable 调用入口
- **AND** 系统不接管 Nuxt/Nitro 原生路由匹配流程
- **AND** Nitro server 与 client bundle 依赖边界保持清晰

#### Scenario: React 集成方案可用
- **WHEN** 用户在 React 项目中启用 functional API 集成
- **THEN** 系统可通过构建插件重写 `src/server/api` 调用并保持类型可用
- **AND** React 侧无需手写 method/path 拼接

#### Scenario: Vue 集成方案可用
- **WHEN** 用户在 Vue 项目中启用 functional API 集成
- **THEN** 系统可通过插件注入 `$api` 或 `useApiClient()`
- **AND** Vue 侧调用具备类型提示与校验约束

### Requirement: Compatibility with Existing Decorator Routing
系统 SHALL 支持装饰器路由与 functional 路由共存，并在统一路由表中执行一致的冲突检测与排序策略。

#### Scenario: defineApi 复用装饰器元数据定义
- **WHEN** 系统注册 functional API 定义
- **THEN** 使用与 class 装饰器一致的元数据字段与收集协议
- **AND** 不引入独立的平行元数据体系

#### Scenario: 混用装饰器与 functional 路由
- **WHEN** 应用同时定义 decorator controller 与 functional controller
- **THEN** 系统将它们合并到同一套路由收集流程
- **AND** 最终路由匹配顺序与当前规则一致

#### Scenario: 检测重复 method/path 路由
- **WHEN** functional 路由与现有路由出现重复的 method + full path
- **THEN** 系统抛出重复路由错误
- **AND** 错误信息包含冲突来源与处理器标识以支持定位

#### Scenario: 冲突错误载荷包含来源信息
- **WHEN** 出现 decorator 与 functional 混用冲突
- **THEN** 错误载荷中包含 `existing.source` 与 `current.source`
- **AND** 错误载荷包含 method 与 fullPath 以支持快速排障

### Requirement: Style Preference Parity
系统 SHALL 将 class decorator 与 functional API 定位为并行风格选择，而非替代关系。

#### Scenario: 文档明确双风格并行定位
- **WHEN** 用户查阅 functional routing 相关文档
- **THEN** 文档明确 class 与 functional 均为官方支持写法
- **AND** 文档不将 functional 描述为对 class 的废弃或强制迁移路径

#### Scenario: 前端场景优先提供 functional 示例
- **WHEN** 文档面向 React/Vue/Next 等前端或全栈场景
- **THEN** 提供 functional 示例以降低理解门槛
- **AND** 同时保留 class 对照示例便于团队按偏好选择

### Requirement: User-Facing Migration Experience
系统 SHALL 提供从装饰器写法迁移到 functional 写法的清晰路径，且迁移过程不要求一次性重写。

#### Scenario: 按 controller 粒度渐进迁移
- **WHEN** 用户仅将一个 controller 从装饰器改为 functional 写法
- **THEN** 其余装饰器 controller 仍可正常工作
- **AND** 新旧两种写法的路由行为保持可预测

#### Scenario: 文档提供并排示例
- **WHEN** 用户查阅官方文档
- **THEN** 可看到装饰器写法与 functional 写法的一一对照
- **AND** 可看到如何将 Route Definition 输出给前端框架适配层

### Requirement: Example-First Documentation Coverage
系统 SHALL 在每个 functional routing 设计能力中提供用户可直接使用的示例代码。

#### Scenario: 每个 API 能力都有最小可运行范例
- **WHEN** 新增或修改 functional routing API 设计
- **THEN** 文档必须包含对应的最小可运行示例
- **AND** 示例至少覆盖导入、声明、`handle` 与输入输出 schema（如适用）

#### Scenario: 框架适配设计附带映射示例
- **WHEN** 文档描述某个前端框架适配策略
- **THEN** 文档必须提供该框架的路由映射范例
- **AND** 示例基于统一 route manifest 输入，不依赖私有反射元数据
