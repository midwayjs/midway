# 实施任务清单

## 1. API 设计冻结
- [ ] 1.1 冻结按协议分别导出的入口签名与命名（HTTP: `defineApi`，WS: `defineWebSocketApi`，等）
- [x] 1.2 冻结 `api.get/post/...` RouteBuilder 链式方法（`input/output/middleware/meta/handle`）
- [x] 1.3 冻结默认值（prefix/path/middleware/ignoreGlobalPrefix）与参数校验规则
- [x] 1.4 冻结与 `@Controller/@Get/@Post` 的语义映射表（字段级）
- [x] 1.5 冻结 `input/output` schema 的运行时校验时机与错误格式
- [x] 1.6 冻结混用冲突错误结构（包含 source 与 handler 定位）
- [x] 1.7 冻结导出入口为 `@midwayjs/core/functional`（不新增独立 `@midwayjs/http` 入口）
- [x] 1.8 冻结 IoC 访问模型：functional handler 使用 `useInject`
- [x] 1.9 冻结 API 注册模型：业务侧 detector 显式发现 + 入口导出加载，不使用 `web.apis` 嵌套注册
- [x] 1.10 冻结装饰器族演进矩阵（HTTP/WS/Socket.IO/gRPC/Task，Serverless 延后）

## 2. 路由定义协议与类型
- [x] 2.1 定义 `FunctionalControllerOptions`、`FunctionalRouteDefinition`、`FunctionalRouteOptions` 类型
- [x] 2.2 定义 `RouteManifestItem` 类型及稳定字段集合
- [x] 2.3 定义 Adapter Contract（输入 RouteManifest，输出框架路由结构）
- [x] 2.4 定义版本控制字段（`version`、`versionType`、`versionPrefix`）与默认行为
- [x] 2.5 定义 `src/server/api` 作为单一真相源的导出规范（web 可消费）
- [x] 2.6 定义 typed client 产物契约（生成文件或虚拟模块）
- [x] 2.7 冻结 operationId 命名与唯一性规则
- [x] 2.8 定义 transport adapter SPI（默认 http + 可插拔自定义）
- [x] 2.9 定义同协议多客户端适配规范（HTTP fetch/axios 等）
- [ ] 2.10 定义多协议扩展规范（grpc/ws/socket.io）及分协议导出契约
- [ ] 2.11 定义 task/message 协议扩展规范（Serverless 延后）

## 3. 与核心路由系统对齐
- [x] 3.1 设计 Functional 声明转统一路由表的映射规则
- [x] 3.1A 冻结 `defineApi` 到现有装饰器元数据结构的映射（字段与收集协议完全复用）
- [x] 3.2 复用现有路由排序与重复检测策略（不新增优先级维度）
- [x] 3.3 明确 `ignoreGlobalPrefix` 在 controller 与 route 级别的优先级与覆写关系
- [x] 3.4 明确 route manifest 生成时 `fullPath` 的拼接和版本前缀规则
- [x] 3.5 明确 detector 发现规则（包含 ignore/conflictCheck）与入口导出加载的共存机制
- [x] 3.6 定义 compile pipeline（scan/analyze/emit）与阶段产物
- [x] 3.7 定义 web-safe 边界检查规则（允许/禁止导入）

## 3A. 一体化工程设计
- [x] 3A.1 冻结目录配置模型（`serverDir/webDir/apiDir`，并给出默认示例 `src/server`、`src/web`、`src/server/api`）
- [x] 3A.2 冻结依赖边界（前端依赖 `src/server/api`，禁止引入 server runtime）
- [x] 3A.3 冻结构建流水线分层（server-api-check -> server-build -> web-build）
- [x] 3A.4 冻结 Next.js 单应用模式作为可选简化路径
- [x] 3A.5 冻结 dev 内存编译链路（server api 调用重写 + 类型映射）
- [x] 3A.6 冻结 Next/Nuxt 路由边界：仅服务层适配，不接管原生路由
- [x] 3A.7 冻结桥接层配置协议（detectorSource/apiEntry/emitMode/outDir/strictWebSafe）
- [x] 3A.8 冻结单一 dev 命令入口（用户无需手动启动两个 dev）
- [x] 3A.9 冻结 transport 配置协议（global transport + adapter 注入）
- [x] 3A.10 冻结协议插件模型（protocol plugin + client emitter + runtime adapter）

## 4. 用户文档与示例（设计阶段）
- [ ] 4.1 编写“装饰器写法 vs functional 写法”一一对照示例
- [ ] 4.2 编写 React Router 适配示例（基于 route manifest）
- [ ] 4.3 编写 Vue Router 适配示例（基于 route manifest）
- [ ] 4.4 编写 Next Route Handler 适配示例（基于 route manifest）
- [ ] 4.5 编写 Nest 适配示例（基于 route manifest）
- [ ] 4.6 编写迁移指南（按 controller 粒度渐进迁移 + 混用避坑）
- [x] 4.7 为每个新增 API 能力补充“最小可运行用户范例”（example-first gate）
- [x] 4.8 在文档中明确“functional 与 class 为并行偏好，不是替代关系”
- [x] 4.9 编写“同仓开发”示例（server + react）
- [ ] 4.10 编写“同仓开发”示例（server + vue）
- [x] 4.11 编写“web 直接依赖 server api 定义”示例
- [x] 4.12 编写 Next.js 单应用示例（不拆分 server/web）
- [x] 4.13 编写 direct-like 调用示例（`import { userApi } from '@/server/api/...'; await userApi.getUser(...)`）
- [x] 4.14 编写 Next.js 集成设计与示例（plugin 重写 `server/api` 调用，Phase 1）
- [ ] 4.15 编写 Nuxt 集成设计与示例（module/$api composable，Phase 2）
- [x] 4.16 编写 React 集成设计与示例（Vite/Rspack plugin + `server/api` 调用重写，Phase 1）
- [ ] 4.17 编写 Vue 集成设计与示例（Vite plugin + useApiClient/$api，Phase 2）
- [ ] 4.18 编写自定义 transport 示例（如 tRPC adapter）
- [ ] 4.19 编写 HTTP 多客户端示例（fetch/axios 切换）
- [ ] 4.20 编写 gRPC define API 与 client 适配示例
- [ ] 4.21 编写 WS/Socket.IO define API 与 client 适配示例
- [ ] 4.23 编写 Task/Queue define API 与调用示例
- [ ] 4.24 编写 Kafka/RabbitMQ define API 与消费示例
- [ ] 4.25 编写“纯函数式 Midway 服务”最小示例（不接入前端框架）
- [ ] 4.26 编写“装饰器 + 纯函数式模块”同项目共存示例

## 5. 验证与验收
- [ ] 5.1 增加规范级测试计划（API 行为、默认值、冲突检测、版本路由、manifest 稳定性、compile pipeline、web-safe）
- [x] 5.2 增加 Phase 1 最小集成样例测试（Next/React）
- [ ] 5.2A 增加 Phase 2 最小集成样例测试（Nuxt/Vue）
- [x] 5.3 运行 `openspec validate add-functional-web-routing-api --strict --no-interactive`
- [ ] 5.4 运行变更评审并确认 Open Questions（命名与 core adapter 边界）
- [ ] 5.5 评审通过后进入 apply 阶段
- [ ] 5.6 增加纯函数式服务路径验收（无需前端集成即可独立运行）
