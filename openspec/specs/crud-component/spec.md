# crud-component Specification

## Purpose
TBD - created by archiving change add-rest-crud-component. Update Purpose after archive.
## Requirements
### Requirement: Service-first CRUD Core
系统 SHALL 先提供可组合的 CRUD service 核心能力，使用户在不生成任何路由的情况下复用标准资源操作。

#### Scenario: 上层业务服务直接组合 CRUD service
- **WHEN** 用户在普通业务 Service 中注入 `CrudServiceAdapter<T>` 或其官方实现
- **THEN** 用户可以直接调用统一的列表、详情、创建、更新、删除能力
- **AND** 该用法不要求声明 `@Crud()` 或自动生成任何 HTTP 路由

#### Scenario: CRUD service 作为业务编排基座
- **WHEN** 用户需要在资源操作外增加事务、审计、通知或权限逻辑
- **THEN** 用户可以在上层业务 Service 中组合调用 CRUD service 与其他领域服务
- **AND** CRUD 组件不要求复杂业务只能通过自动生成路由承载

#### Scenario: CRUD service 暴露最小稳定方法面
- **WHEN** 用户依赖 CRUD 组件的核心 service 能力
- **THEN** 系统至少提供 `list`、`findOne`、`create`、`update`、`delete` 五个标准方法
- **AND** 不要求用户依赖 HTTP 路由层即可完成资源操作组合

#### Scenario: 列表结果采用稳定分页结构
- **WHEN** 用户调用 `CrudService.list()`
- **THEN** 系统返回包含 `data` 与 `meta` 的统一分页对象
- **AND** `meta` 至少包含 `page`、`limit`、`total`、`pageCount`、`hasNext`、`hasPrev`
- **AND** 系统不直接返回裸数组作为列表默认结果

### Requirement: Minimal Public API Surface
系统 SHALL 以尽量小的公开 API 面提供 CRUD 能力，避免为同一职责引入重复概念。

#### Scenario: 用户主路径仅依赖核心类型与装饰器
- **WHEN** 用户使用 CRUD 组件的主路径能力
- **THEN** 用户主路径应主要围绕 `CrudService<T>`、`CrudQuery`、`CrudOptions` 和 `@Crud()` 展开
- **AND** TypeORM、Sequelize、Mongoose 用户分别通过 `TypeOrmCrudService<T>`、`SequelizeCrudService<T>`、`MongooseCrudService<T>` 获得官方默认实现

#### Scenario: 不为注入与控制器外观引入重复抽象
- **WHEN** 用户在 Controller 中暴露 CRUD service
- **THEN** 系统复用现有 `@Inject()` 完成依赖注入
- **AND** 系统不要求用户依赖额外的专用注入装饰器或仅作外观约束的控制器接口

### Requirement: Declarative CRUD Resource Registration
系统 SHALL 将声明式 CRUD 资源注册作为可选的 HTTP 适配能力，使用户可以在需要时用单个资源装饰器快速生成标准 REST CRUD 接口。

#### Scenario: 使用 `@Crud()` 声明资源
- **WHEN** 用户在一个 Midway Web Controller 上声明 `@Crud({ model, service, dto, query, routes })`
- **THEN** 系统将该 Controller 识别为 CRUD 资源控制器
- **AND** 系统根据配置生成对应的 CRUD 路由定义

#### Scenario: CRUD 为可选组件能力
- **WHEN** 用户未引入 `@midwayjs/crud`
- **THEN** 现有手写 `@Controller()` 和路由装饰器行为保持不变
- **AND** 系统不会自动注入任何 CRUD 路由

#### Scenario: 仅使用 CRUD service 而不启用路由层
- **WHEN** 用户引入 `@midwayjs/crud` 但未在 Controller 上声明 `@Crud()`
- **THEN** 用户仍可使用 CRUD service 核心能力
- **AND** 系统不会因为引入组件而自动暴露 REST 路由

#### Scenario: 复用现有 `@Inject()` 注入 CRUD service
- **WHEN** 用户在启用 `@Crud()` 的 Controller 中声明 `crudService` 属性
- **AND** 使用现有 `@Inject()` 注入与 `@Crud().service` 对应的 service
- **THEN** 系统使用该 service 作为默认 CRUD 路由的执行入口
- **AND** 系统不要求用户使用额外的 CRUD 专用注入装饰器

#### Scenario: `@Crud()` 必须显式声明 service
- **WHEN** 用户在 Controller 上使用 `@Crud()`
- **THEN** 用户必须显式提供 `service` 配置
- **AND** 系统不会通过属性名或类型信息隐式推断默认 CRUD service
- **AND** 缺失时系统在启动阶段直接报错

### Requirement: Stable Default REST Route Matrix
系统 SHALL 为 CRUD 资源提供稳定且可配置的默认 REST 路由矩阵。

#### Scenario: 生成默认增删改查路由
- **WHEN** 用户启用默认 CRUD 路由
- **THEN** 系统至少生成 `list`、`detail`、`create`、`update`、`delete` 五个资源路由
- **AND** 其 HTTP method 和路径分别映射为 `GET /`、`GET /:id`、`POST /`、`PATCH /:id`、`DELETE /:id`

#### Scenario: 首阶段默认路由仅支持单主键
- **WHEN** 用户使用首阶段 CRUD 默认路由
- **THEN** 系统仅支持单一路径参数 `:id`
- **AND** 系统不要求首阶段支持复合主键路由模板

#### Scenario: 通过配置裁剪默认路由
- **WHEN** 用户使用 `routes.only` 或 `routes.exclude` 限制可用路由
- **THEN** 系统只注册配置允许的 CRUD 路由
- **AND** 对被排除的默认路由不再暴露 HTTP 入口

#### Scenario: 用户自定义 handler 覆写默认行为
- **WHEN** 用户在 CRUD Controller 中显式实现同名路由处理方法
- **THEN** 系统使用用户实现替代默认 CRUD 处理逻辑
- **AND** 该路由仍保持其 CRUD 路由身份与元数据约束

### Requirement: Unified CRUD Query Protocol
系统 SHALL 为列表查询提供统一的分页、排序、过滤和关联展开协议，并允许按资源声明白名单约束。

#### Scenario: 解析分页与排序参数
- **WHEN** 客户端对列表接口传入 `page`、`limit` 与 `sort`
- **THEN** 系统将其解析为统一的 `CrudQuery`
- **AND** `limit` 行为受资源声明的 `defaultLimit` 与 `maxLimit` 约束

#### Scenario: 解析过滤与搜索参数
- **WHEN** 客户端对列表接口传入 `filter` 或 `search`
- **THEN** 系统根据资源配置生成结构化过滤条件
- **AND** 仅允许访问 `filterable` 与 `searchable` 白名单字段

#### Scenario: URL 参数格式固定且可重复
- **WHEN** 客户端构造列表查询 URL
- **THEN** `sort`、`filter`、`join` 使用重复 query key 表达多值
- **AND** `fields` 使用逗号分隔字符串表达字段集合
- **AND** 系统不要求深层嵌套对象 query 语法

#### Scenario: 首阶段 join 仅支持一层关系
- **WHEN** 客户端传入 `join` 参数
- **THEN** 每个 `join` 值在首阶段只允许表示一层关系名
- **AND** 包含 `.` 的多层路径在首阶段返回 400 错误

#### Scenario: `search` 采用固定 OR 模糊匹配语义
- **WHEN** 客户端传入 `search` 参数
- **AND** 资源声明了 `searchable` 字段白名单
- **THEN** 系统对这些字段执行 OR 组合的模糊匹配
- **AND** 每个字段的基础匹配语义与 `like` operator 保持一致

#### Scenario: 拒绝未授权的排序、过滤或 join 字段
- **WHEN** 客户端使用未在白名单中的 `sort`、`filter` 或 `join` 字段
- **THEN** 系统返回 400 错误
- **AND** 错误信息明确指出被拒绝的字段与原因

#### Scenario: 拒绝非法 query 片段格式
- **WHEN** 客户端传入格式非法的 `sort` 或 `filter` 片段
- **THEN** 系统返回 400 错误
- **AND** 系统不会静默忽略非法片段

#### Scenario: 首阶段只支持有限 filter operator
- **WHEN** 客户端使用 `filter` 参数
- **THEN** 系统首阶段仅支持 `eq`、`ne`、`gt`、`gte`、`lt`、`lte`、`in`、`like`
- **AND** 对未支持的 operator 返回 400 错误

#### Scenario: 未配置 searchable 时拒绝 search
- **WHEN** 客户端传入 `search` 参数
- **AND** 资源未声明 `searchable`
- **THEN** 系统返回 400 错误
- **AND** 系统不会忽略该参数并继续执行查询

### Requirement: Repository Adapter Abstraction
系统 SHALL 通过统一的仓储适配器契约执行业务 CRUD 操作，使 service 层与 Controller 层都不直接绑定具体 ORM。

#### Scenario: 上层调用方依赖统一 CRUD 服务契约
- **WHEN** 业务 Service 或 CRUD 路由执行列表、详情、创建、更新或删除操作
- **THEN** 调用方通过统一的 `CrudServiceAdapter<T>` 契约访问数据层
- **AND** 调用方逻辑不需要感知底层 ORM 细节

#### Scenario: 首阶段提供官方数据库适配
- **WHEN** 用户使用 `@midwayjs/typeorm`、`@midwayjs/sequelize` 或 `@midwayjs/mongoose`
- **THEN** 系统可通过官方 `TypeOrmCrudService<T>`、`SequelizeCrudService<T>`、`MongooseCrudService<T>` 直接完成默认 CRUD 数据访问
- **AND** 用户无需为基础增删改查重复编写仓储调用代码

#### Scenario: TypeORM 适配遵循固定 operator 映射
- **WHEN** TypeORM 适配处理 `CrudQuery.filters`
- **THEN** `eq/ne/gt/gte/lt/lte/in/like` 按规范映射到对应 TypeORM 查询操作符
- **AND** 相同 filter 输入在不同资源上保持一致的基础语义

#### Scenario: TypeORM 默认删除为硬删除
- **WHEN** 用户直接使用默认 `TypeOrmCrudService.delete()`
- **THEN** 系统执行硬删除
- **AND** 如需软删除，用户需通过覆写或自定义 service 显式改变默认行为

#### Scenario: 通过配置显式开启软删除
- **WHEN** 用户为资源声明 `delete.mode = 'soft'`
- **THEN** 系统对该资源启用软删除策略
- **AND** 默认删除操作不再执行硬删除

#### Scenario: 软删除资源默认查询排除已删数据
- **WHEN** 资源启用了软删除策略
- **THEN** 该资源的默认 `list` 与 `detail` 查询不会返回已软删数据
- **AND** 系统不要求首阶段支持查询已删除数据的额外协议

#### Scenario: 软删除能力缺失时不静默降级
- **WHEN** 用户为资源启用软删除策略
- **AND** 底层 ORM 适配器或实体不具备软删除能力
- **THEN** 系统返回明确错误
- **AND** 系统不会静默改为硬删除

#### Scenario: 主键能力为单主键优先并可扩展
- **WHEN** 用户在首阶段使用 CRUD service 或默认路由
- **THEN** 系统优先支持单主键资源
- **AND** 当前能力边界不会阻止后续扩展到复合主键

#### Scenario: 其他 ORM 通过同一契约扩展
- **WHEN** 后续需要接入 Sequelize、MikroORM、Leoric 或 Mongoose
- **THEN** 新适配器通过实现相同 CRUD 服务契约接入
- **AND** 现有 CRUD Controller API 无需改变

### Requirement: DTO-driven Validation and Serialization
系统 SHALL 复用 Midway DTO 元数据驱动 CRUD 请求体验证与响应序列化。

#### Scenario: 创建与更新请求复用 DTO 规则
- **WHEN** 用户在 `@Crud()` 中声明 `dto.create` 与 `dto.update`
- **THEN** `POST` 与 `PATCH` 路由自动使用对应 DTO 进行请求体验证
- **AND** 校验失败行为与现有 validation 组件保持一致

#### Scenario: 更新 DTO 支持复用派生工具
- **WHEN** 用户使用 `PartialDto()` 等 DTO 派生工具生成更新 DTO
- **THEN** CRUD 组件可复用派生后的元数据
- **AND** 不要求用户为 update 场景重新手写重复校验规则

#### Scenario: 响应序列化按资源配置执行
- **WHEN** 用户为资源声明 `serialize` 配置
- **THEN** CRUD 路由响应按对应 DTO 或序列化模型输出
- **AND** 未声明时保持与现有 handler 返回值一致的默认序列化行为

#### Scenario: 默认 CRUD 路由遵循固定 DTO 绑定规则
- **WHEN** 用户启用 `@Crud()` 但未单独覆写某个默认路由
- **THEN** `create` 绑定 `dto.create`，`update` 绑定 `dto.update`，`list` 绑定 `dto.query`
- **AND** `list` 返回分页对象，`detail/create/update` 返回单资源对象，`delete` 返回空响应

### Requirement: Swagger Visibility For Generated CRUD Routes
系统 SHALL 让自动生成的 CRUD 路由在 Swagger 中可见，并包含稳定的参数与模型描述。

#### Scenario: 自动生成路由出现在 Swagger 文档中
- **WHEN** 用户启用 `@midwayjs/swagger` 且使用 CRUD 组件
- **THEN** 自动生成的 CRUD 路由会被纳入 Swagger 文档
- **AND** 文档中可区分列表、详情、创建、更新、删除等操作

#### Scenario: 查询参数与请求体模型被正确描述
- **WHEN** 用户为 CRUD 资源声明 query 规则和 DTO
- **THEN** Swagger 文档中包含对应的 query 参数、路径参数和请求体模型
- **AND** 文档模型与实际运行时约束保持一致

### Requirement: Predictable Error Semantics
系统 SHALL 为自动生成的 CRUD 路由提供可预测的错误语义，以降低调用方与文档理解成本。

#### Scenario: 资源不存在时返回 404
- **WHEN** 客户端访问不存在的资源主键
- **THEN** 详情、更新或删除操作返回 404
- **AND** 响应语义与手写 REST Controller 的常规期望一致

#### Scenario: 查询参数非法时返回 400
- **WHEN** 客户端传入非法分页、排序、过滤或 join 参数
- **THEN** 系统返回 400
- **AND** 错误载荷包含字段级原因，便于定位问题

#### Scenario: 数据库约束错误通过适配层映射
- **WHEN** 底层 ORM 或数据库抛出可识别的约束异常
- **THEN** CRUD 组件通过适配层将其映射为稳定的上层异常
- **AND** 默认响应不直接暴露底层驱动特定错误细节

### Requirement: Extensible Resource-level Overrides
系统 SHALL 保留资源级扩展点，使自动生成的 CRUD 能力不阻碍业务定制。

#### Scenario: 服务层按方法粒度覆写默认数据访问
- **WHEN** 用户继承官方 CRUD 服务基类并覆写单个方法（如 `create`）
- **THEN** 该资源只替换对应数据访问逻辑
- **AND** 其他未覆写方法继续使用默认 CRUD 行为

#### Scenario: 业务层在 CRUD service 外再做组合编排
- **WHEN** 用户在普通业务 Service 中组合 CRUD service 和其他领域服务
- **THEN** 业务层可以构建非标准资源流程
- **AND** CRUD 组件不限制其只能暴露标准 REST 语义

#### Scenario: CRUD 路由允许继续挂载现有鉴权能力
- **WHEN** 用户在 CRUD Controller 或路由上使用现有 Guard、Middleware 或其他 Web 装饰器
- **THEN** 自动生成的 CRUD 路由仍可参与现有请求处理链
- **AND** CRUD 组件不要求用户改用独立的鉴权模型

