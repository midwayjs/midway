# 实施任务清单

## 1. 核心 Service API 与元数据
- [x] 1.1 创建 `@midwayjs/crud` 组件骨架与导出入口
- [x] 1.2 定义 `CrudServiceAdapter<T>`、`CrudService<T>`、`CrudQuery`、分页结果等核心类型
- [x] 1.3 定义 `@Crud()`、`CrudOptions`、`CrudRouteName` 作为可选路由适配层类型，并支持在 `@Crud()` 中声明绑定的 service 与删除策略
- [x] 1.4 定义 CRUD 元数据存储与读取协议，区分 service 核心层与路由扩展层，并复用现有 `@Inject()` 注入模式
- [x] 1.5 实现默认 REST 路由矩阵展开逻辑，并支持 `only`/`exclude` 配置
- [x] 1.6 实现用户自定义同名 handler 覆写默认 CRUD 行为的检测与绑定
- [x] 1.7 固定首阶段仅支持单主键资源，并为未来复合主键保留类型扩展空间

## 1A. 包结构与组件装配
- [x] 1A.1 创建 `src/configuration.ts`、`src/decorator.ts`、`src/interface.ts`、`src/service.ts`、`src/queryParser.ts`、`src/routeBuilder.ts`、`src/error.ts`、`src/constants.ts`
- [x] 1A.1A 创建 `src/functional/index.ts`、`src/functional/routeBuilder.ts`
- [x] 1A.2 创建 `src/typeorm/index.ts`、`src/typeorm/service.ts`、`src/typeorm/utils.ts`，并补充 `src/sequelize/*`、`src/mongoose/*` 二级适配目录
- [x] 1A.3 创建 `src/swagger.ts` 与 `src/validation.ts` 作为桥接层，而不是复制现有组件逻辑
- [x] 1A.4 创建 `packages/crud/package.json`，并显式定义 `exports`、二级入口与依赖边界

## 2. 查询协议与请求处理
- [x] 2.1 实现 `CrudQuery` 解析器，支持 `page`、`limit`、`sort`、`filter`、`search`、`join`、`fields`
- [x] 2.2 实现查询字段白名单校验与统一错误返回
- [x] 2.3 实现 `id` 参数解析与不存在资源的 404 语义
- [x] 2.4 为列表接口实现统一分页返回结构与元信息
- [x] 2.5 固定首阶段 filter operator 集合，并校验非法或未支持的 operator
- [x] 2.6 实现 `search` 的固定语义：对白名单 `searchable` 字段执行 OR + like，并处理未配置时的错误
- [x] 2.7 固定 `join` 首阶段只支持一层关系名，并对点路径直接返回错误

## 3. 服务抽象与数据库适配
- [x] 3.1 定义 `CrudServiceAdapter<T>` 通用契约
- [x] 3.2 实现 `TypeOrmCrudService<T>` 基类，覆盖 `list/findOne/create/update/delete`
- [x] 3.3 将 `CrudQuery` 翻译为 TypeORM 查询条件，并处理排序、过滤、join 与分页
- [x] 3.3A 按规范实现 `eq/ne/gt/gte/lt/lte/in/like` 到 TypeORM 操作符的映射
- [x] 3.4 统一映射常见数据库异常（唯一键冲突、外键冲突、实体不存在）
- [x] 3.5 固定 `TypeOrmCrudService.delete()` 的默认行为为硬删除，并支持通过 `delete.mode = 'soft'` 显式切换软删
- [x] 3.6 在软删模式下，让默认 `list/findOne` 排除已删除记录，并对不支持软删的实体给出明确错误
- [x] 3.7 验证 CRUD service 可在无 `@Crud()` 路由的场景中被上层业务服务直接组合使用
- [x] 3.8 为后续 ORM 适配预留清晰的二级导出结构与扩展接口
- [x] 3.9 提供 `SequelizeCrudService<T>` 官方适配，并覆盖列表、详情、创建、更新、删除与软删能力边界
- [x] 3.10 提供 `MongooseCrudService<T>` 官方适配，并覆盖列表、详情、创建、更新、删除与软删能力边界

## 4. Validation 与 Swagger 集成
- [x] 4.1 将 `dto.create`、`dto.update`、`dto.replace` 自动接入请求体验证
- [x] 4.2 支持 `dto.query` 或最小 query 参数模型的文档生成
- [x] 4.3 为自动生成的 CRUD 路由补齐 Swagger method、params、body、response 元数据
- [x] 4.4 验证 `PartialDto()` 等 DTO 派生能力在 CRUD update 场景下可复用

## 4A. 生命周期集成
- [x] 4A.1 在 `configuration.ts` 中接入 web 组件的初始化/路由注册时机
- [x] 4A.2 保证 CRUD 路由复用现有 web 路由注册链，而不是创建独立 HTTP 注册路径
- [x] 4A.3 保证 CRUD 组件未启用时不影响现有 web 行为

## 4B. 函数式路由集成
- [x] 4B.1 实现 `defineCrudRoutes()`，让其输出 `defineApi()` 可合并的 route map
- [x] 4B.2 保证函数式 CRUD 复用现有 functional routing 生命周期，不创建独立注册中心
- [x] 4B.3 验证 CRUD 默认路由与自定义函数式动作可在同一个 `defineApi()` 中共存
- [x] 4B.4 固定 `@midwayjs/crud/functional` 作为函数式二级导出路径，并补充导出测试

## 5. 测试与文档
- [x] 5.1 为核心路由生成、配置校验、查询解析和错误语义补充单元测试
- [x] 5.2 为 TypeORM、Sequelize、Mongoose 适配提供集成测试（列表、详情、创建、更新、删除）
- [x] 5.3 为 service-only 组合场景提供测试（无路由，业务服务直接调用 CRUD service）
- [x] 5.4 为单主键、软删模式和一层 join 限制补充回归测试
- [x] 5.5 为 validation 与 swagger 集成提供回归测试
- [x] 5.6 为函数式 CRUD 提供回归测试（`defineCrudRoutes()` + `defineApi()` 混用）
- [x] 5.7 编写 CRUD 组件文档，包含 service-only 模式、基于 `@Crud({ service }) + @Inject()` 的路由快捷模式、函数式 `defineCrudRoutes()` 模式、查询协议说明、软删模式与扩展示例
- [x] 5.8 为主入口、`./typeorm`、`./sequelize`、`./mongoose`、`./functional` 五个导出入口补充导出/导入测试
- [x] 5.9 运行 `pnpm -C packages/crud test`
- [x] 5.10 运行 `openspec validate add-rest-crud-component --strict --no-interactive`

推荐实施顺序：
- 先完成 `1` + `1A`
- 再完成 `2` + `3`
- 然后完成 `4` + `4A` + `4B`
- 最后完成 `5`
