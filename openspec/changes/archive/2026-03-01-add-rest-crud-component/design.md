## Context
Midway 已有以下基础能力可支撑声明式 CRUD：
- `@midwayjs/web` 提供基于装饰器的路由声明与控制器生命周期。
- `@midwayjs/typeorm`、`@midwayjs/sequelize`、`@midwayjs/mongoose` 已提供各自的数据访问组件，可作为 CRUD 适配的首批落地目标。
- `@midwayjs/validation` 已提供 DTO 元数据与 `PickDto`、`OmitDto`、`PartialDto` 等派生能力。
- `@midwayjs/swagger` 已具备从控制器与 DTO 元数据中生成 OpenAPI 文档的能力。

当前缺口不在底层能力，而在“将这些能力收敛为统一 CRUD 开发模型”。如果继续让每个业务模块手写 CRUD，会重复实现以下逻辑：
- 路由矩阵定义
- `id` 参数解析与 404 处理
- 分页、排序、过滤查询解析
- create/update DTO 装配
- 仓储层标准增删改查
- Swagger 参数与响应注释

因此本方案优先定义一个薄而稳定的 CRUD 编排层，而不是重做一套新的 ORM 或路由系统。并且这个编排层应以 service 为核心，HTTP 路由只是它的一个可选暴露方式。

## Goals / Non-Goals
- Goals:
  - 让用户先获得可组合的 CRUD service 基座，并在需要时用极少配置生成标准 REST CRUD 接口。
  - 复用现有 Web 装饰器与元数据收集机制，不引入平行路由系统。
  - 通过仓储适配器屏蔽不同 ORM 的差异，首阶段落地 TypeORM、Sequelize、Mongoose。
  - 复用 DTO 元数据接入 validation 和 swagger。
  - 允许用户完全不启用路由层，只把 CRUD 能力作为普通 service 使用。
  - 允许用户按资源关闭默认路由、覆写实现或插入鉴权/钩子。
- Non-Goals:
  - 不完整复刻 `nestjsx/crud` 的全部能力与全部查询语法。
  - 不在首阶段支持 GraphQL、前端 SDK 生成、嵌套资源关系写操作。
- 不要求首阶段覆盖所有 Midway ORM 组件，但首批需覆盖关系型和文档型的主流适配。

## Phase Strategy
首阶段采用“最小可上线 + 明确扩展缝隙”的策略：
- 只交付单主键、基础 CRUD、基础 query、TypeORM / Sequelize / Mongoose 适配、validation/swagger 集成。
- 不把 restore、复合主键、多层 join、复杂查询表达式塞进首版。
- 但类型、配置项和 URL 语义需为这些能力保留自然演进路径。

演进原则：
- 优先扩展现有配置结构，而不是新增平行 API。
- 优先保持 `@Crud()`、`CrudService<T>`、`CrudQuery` 的主路径不变。
- 未来新增能力应优先表现为“新增可选配置 / 新增可选 service 方法 / 新增可选 route”，而不是重写现有默认语义。

## Architecture Overview
整体分为 4 层：

1. Crud Service Layer
- `CrudServiceAdapter<T>` 定义统一的数据访问与资源操作契约。
- `TypeOrmCrudService<T>` 作为首个官方实现，基于 `Repository<T>` 完成缺省行为。
- 上层业务服务可以直接注入并组合这一层，而不依赖任何 CRUD 路由。

2. Decorator Definition Layer
- 用户在需要快捷 REST 接口时，才通过 `@Crud()` 在 Controller 类上声明资源元数据。
- 元数据包含模型类型、绑定的 service 类型、DTO、路由开关、查询规则、序列化和授权钩子。
- Controller 内部复用现有 `@Inject()` 注入 service，不单独引入 CRUD 专用注入装饰器。

3. Route Expansion Layer
- 在模块加载阶段将 `@Crud()` 元数据展开为标准 Web 路由定义。
- 展开结果复用现有 `@midwayjs/web` 的路由注册协议，不创建独立 HTTP runtime。
- 默认只生成启用的 CRUD 路由，且允许 route 级覆写。

4. Query Translation Layer
- 将 HTTP query 参数解析为 `CrudQuery` 对象。
- `CrudQuery` 再由适配器翻译为 ORM 可执行的查询条件。
- 首阶段要求统一分页、排序、过滤、关键词搜索与基础 join 语义。

数据流：
- 纯 service 模式：Business Service -> `CrudServiceAdapter` -> ORM repository
- HTTP 模式：HTTP Request -> Midway route -> CRUD query parser -> `CrudServiceAdapter` -> ORM repository -> response serializer

## Proposed Package Layout
建议采用最小拆分：

- `packages/crud`
  - 核心装饰器、类型、查询解析、默认控制器行为、基础服务抽象
- `packages/crud-typeorm` 或 `packages/crud/src/typeorm/*`
  - TypeORM 仓储适配与辅助基类

为减少首阶段包数量，优先建议在同一个 `packages/crud` 内提供二级导出：

```ts
import { Crud } from '@midwayjs/crud';
import { TypeOrmCrudService } from '@midwayjs/crud/typeorm';
```

这样可先稳定用户入口，再根据后续 ORM 适配数量决定是否拆包。无论是否拆包，核心都应先暴露 service 抽象，再暴露路由快捷层。

按现有 Midway 组件风格，首阶段更适合采用单包 + 二级导出的落地方式：

```txt
packages/crud/
  src/
    configuration.ts
    constants.ts
    decorator.ts
    error.ts
    index.ts
    interface.ts
    service.ts
    queryParser.ts
    routeBuilder.ts
    functional/
      index.ts
      routeBuilder.ts
    swagger.ts
    validation.ts
    typeorm/
      index.ts
      service.ts
      utils.ts
  test/
    index.test.ts
    query.test.ts
    typeorm.test.ts
    fixtures/
      base-app/
```

模块职责建议：
- `configuration.ts`: 注册组件、默认配置、与 web 生命周期挂接。
- `constants.ts`: CRUD 元数据 key、默认限制、错误码常量。
- `decorator.ts`: `@Crud()` 装饰器定义与元数据写入。
- `interface.ts`: `CrudOptions`、`CrudQuery`、`CrudService<T>`、`CrudPageResult<T>` 等类型。
- `service.ts`: 抽象基类、默认通用逻辑、service 级辅助方法。
- `queryParser.ts`: URL query 到 `CrudQuery` 的解析与校验。
- `routeBuilder.ts`: 将 `@Crud()` 元数据展开为 Midway Web 路由定义。
- `functional/routeBuilder.ts`: 将 CRUD 配置转换为 `defineApi()` 可消费的函数式路由定义。
- `swagger.ts`: 为生成路由补齐 swagger 元数据的桥接层。
- `validation.ts`: 将 DTO 配置映射到现有 validation 入口。
- `typeorm/service.ts`: `TypeOrmCrudService<T>` 实现。
- `typeorm/utils.ts`: TypeORM query/operator 映射与软删检查。

## Draft API Surface
最小 API 面如下：

```ts
interface CrudOptions {
  model: ClassType<any>;
  service?: ClassType<CrudServiceAdapter<any>>;
  id?: string;
  dto?: {
    create?: ClassType<any>;
    update?: ClassType<any>;
    replace?: ClassType<any>;
    query?: ClassType<any>;
  };
  routes?: {
    only?: CrudRouteName[];
    exclude?: CrudRouteName[];
    overrides?: Partial<Record<CrudRouteName, CrudRouteOverride>>;
  };
  query?: {
    maxLimit?: number;
    defaultLimit?: number;
    sortable?: string[];
    filterable?: string[];
    searchable?: string[];
    join?: string[];
    defaultSort?: Array<{ field: string; order: 'ASC' | 'DESC' }>;
  };
  serialize?: {
    get?: ClassType<any>;
    list?: ClassType<any>;
    create?: ClassType<any>;
    update?: ClassType<any>;
  };
  delete?: {
    mode?: 'hard' | 'soft';
  };
}

type CrudRouteName =
  | 'list'
  | 'detail'
  | 'create'
  | 'update'
  | 'replace'
  | 'delete'
  | 'createMany'
  | 'deleteMany';

interface CrudQuery {
  page: number;
  limit: number;
  sort: Array<{ field: string; order: 'ASC' | 'DESC' }>;
  filters: Array<{ field: string; operator: CrudFilterOperator; value: unknown }>;
  search?: string;
  joins?: string[];
  fields?: string[];
}

interface CrudServiceAdapter<T> {
  list(query: CrudQuery, options: CrudContext): Promise<CrudPageResult<T>>;
  findOne(id: CrudIdValue, options: CrudContext): Promise<T | null>;
  create(data: unknown, options: CrudContext): Promise<T>;
  update(id: CrudIdValue, data: unknown, options: CrudContext): Promise<T>;
  replace?(id: CrudIdValue, data: unknown, options: CrudContext): Promise<T>;
  delete(id: CrudIdValue, options: CrudContext): Promise<void>;
}
```

为降低首阶段复杂度，`CrudService<T>` 的最小稳定方法面应与 `CrudServiceAdapter<T>` 对齐，不引入额外的批量操作或框架专属包装：

```ts
interface CrudService<T> {
  list(query: CrudQuery, ctx?: CrudContext): Promise<CrudPageResult<T>>;
  findOne(id: CrudIdValue, ctx?: CrudContext): Promise<T | null>;
  create(data: unknown, ctx?: CrudContext): Promise<T>;
  update(id: CrudIdValue, data: unknown, ctx?: CrudContext): Promise<T>;
  delete(id: CrudIdValue, ctx?: CrudContext): Promise<void>;
}
```

补充约束：
- `findOne()` 返回 `null`，由 HTTP 路由适配层决定是否转换为 404。
- `update()` 默认语义对应局部更新（PATCH）。
- `replace()`、`createMany()`、`deleteMany()` 保留为后续可选扩展，不进入首阶段核心接口。
- `ctx` 作为可选上下文扩展槽，用于承载请求上下文、租户信息、操作者信息等，而不是把这些字段塞进 `CrudQuery`。
- 首阶段 `CrudIdValue` 以单值（`string | number`）为准，不支持复合键对象。
- 若后续支持复合主键，应扩展 `CrudIdValue`，而不是重写现有单主键调用方式。

首阶段建议固定分页返回契约：

```ts
interface CrudPageMeta {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CrudPageResult<T> {
  data: T[];
  meta: CrudPageMeta;
}
```

约束：
- `list()` 始终返回 `{ data, meta }`，避免在“是否分页”上产生双形态返回。
- `pageCount` 由 `Math.ceil(total / limit)` 推导；当 `limit` 为合法值时总是可计算。
- `hasNext` 与 `hasPrev` 由 `page`、`pageCount` 推导，不要求各 ORM 适配器自行定义。
- HTTP 路由层不应改写该结构，Swagger 文档应直接反映这一响应形态。

建议的用户主路径只保留以下导出：

```ts
import { Crud, type CrudOptions, type CrudQuery, type CrudService } from '@midwayjs/crud';
import { TypeOrmCrudService } from '@midwayjs/crud/typeorm';
import { defineCrudRoutes } from '@midwayjs/crud/functional';
```

约束：
- `CrudController` 不作为主文档推荐 API。
- 不新增 CRUD 专用注入装饰器，统一复用 `@Inject()`。
- `@Crud()` 的核心职责是“绑定资源与 service 并暴露默认路由”，不是提供另一套控制器继承体系。
- `defineCrudRoutes()` 的核心职责是“生成可合并到 `defineApi()` 的 CRUD 路由对象”，不是创建独立函数式运行时。
- `defineCrudRoutes()` 固定从 `@midwayjs/crud/functional` 导出，不从 `@midwayjs/crud` 主入口导出。

最小路由快捷模式建议：

```ts
@Crud<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
})
export class UserController {
  @Inject()
  crudService: UserCrudService;
}
```

约束：
- `@Crud()` 需显式声明 `service` 作为默认绑定。
- Controller 上的 `crudService` 仍是约定属性名，但注入机制复用现有 `@Inject()`。
- 框架在启动阶段校验 `service` 配置与注入属性类型是否可兼容。
- 首阶段不做按命名或按类型的隐式 service 推断，避免魔法绑定带来的歧义。

## Route Expansion Rules
`@Crud()` 作为可选适配层时，必须展开为清晰且稳定的 REST 路由矩阵：

| Route Name | Method | Path | 默认启用 |
|---|---|---|---|
| `list` | `GET` | `/` | 是 |
| `detail` | `GET` | `/:id` | 是 |
| `create` | `POST` | `/` | 是 |
| `update` | `PATCH` | `/:id` | 是 |
| `replace` | `PUT` | `/:id` | 否 |
| `delete` | `DELETE` | `/:id` | 是 |
| `createMany` | `POST` | `/bulk` | 否 |
| `deleteMany` | `DELETE` | `/bulk` | 否 |

规则：
- `routes.only` 与 `routes.exclude` 互斥；冲突时启动阶段报错。
- 若用户显式实现了同名 handler（如 `async list()`），则以用户实现覆写默认行为。
- 覆写时仍继承该路由的 DTO、查询约束和 Swagger 元数据，除非显式关闭。
- 若用户未声明 `@Crud()`，则上述路由矩阵完全不生成，CRUD 能力仅作为 service 存在。
- 若用户声明 `@Crud()` 且提供 `service`，则路由默认调用该 service。
- 若用户声明 `@Crud()` 但未提供 `service`，则在启动阶段直接报错，不进行隐式推断。
- 首阶段 `/:id` 仅对应单一路径参数，不支持多路径段复合主键路由。

首阶段建议的运行时注册流程：
1. `@Crud()` 在类定义阶段写入资源元数据。
2. `packages/crud/src/configuration.ts` 在组件初始化阶段扫描并读取 CRUD 元数据。
3. `routeBuilder.ts` 将每个资源展开为标准 Midway Web 路由定义。
4. 展开的路由交给现有 Web 路由注册链处理，而不是单独监听 HTTP。
5. 路由 handler 内部调用已注入的 `crudService`，并统一接入 query 解析、DTO 校验、错误映射和序列化。

函数式 CRUD 的首阶段注册流程：
1. `defineCrudRoutes()` 接收与 `@Crud()` 等价的 CRUD 配置。
2. `functional/routeBuilder.ts` 将其展开为标准 CRUD route map。
3. 该 route map 通过 `...userCrud(api)` 的形式合并进 `defineApi('/prefix', api => ({ ... }))`。
4. 每个 route handler 复用同一套 CRUD service 调用、query 解析、DTO 校验、错误映射和序列化逻辑。
5. 函数式 CRUD 不建立额外注册中心，直接依附现有 functional routing 生命周期。

首阶段建议冻结的函数式类型签名：

```ts
type FunctionalCrudRouteFactory<T = any> = (
  api: FunctionalApiBuilder
) => Record<string, FunctionalRouteBuilder | FunctionalRouteDefinition>;

declare function defineCrudRoutes<T = any>(
  options: CrudOptions
): FunctionalCrudRouteFactory<T>;
```

签名约束：
- 返回值必须是“接收 `api`、返回 route map”的工厂函数，而不是直接返回已绑定 prefix 的独立注册对象。
- 这样用户可以通过 `...crudRoutes(api)` 将 CRUD 默认路由与手写函数式路由放在同一对象中组合。
- `FunctionalApiBuilder`、`FunctionalRouteBuilder`、`FunctionalRouteDefinition` 复用已有 functional routing 协议；CRUD 不重复定义平行类型。

## Query Protocol
为避免首阶段过度复杂，查询协议只定义最小子集：

- `page`: 页码，默认 `1`
- `limit`: 每页条数，受 `defaultLimit` 和 `maxLimit` 约束
- `sort`: 允许多字段，URL 格式为重复参数 `sort=field:ASC|DESC`
- `filter`: 允许重复出现，URL 格式为重复参数 `filter=field||operator||value`
- `search`: 面向 `searchable` 字段的模糊检索关键字
- `join`: 允许展开的关联字段，URL 格式为重复参数 `join=relation`
- `join`: 首阶段仅允许一层关系名
- `fields`: 响应字段选择，URL 格式为 `fields=field1,field2`，用于序列化裁剪

推荐 URL 示例：

```txt
GET /users?page=1&limit=20&sort=createdAt:DESC&sort=id:ASC&filter=status||eq||active&filter=tenantId||eq||t1&search=harry&join=profile&fields=id,name,email
```

解析规范：
- `sort` 为重复 query key；按出现顺序保留优先级。
- `filter` 为重复 query key；每项拆解为 `field`、`operator`、`value` 三段。
- `fields` 采用逗号分隔字符串，不使用重复 key，便于文档描述。
- `join` 为重复 query key，且每项必须命中白名单。
- `join` 首阶段仅接受单段关系名，不接受包含 `.` 的路径。
- 不采用深层嵌套对象 query（如 `filter[name][eq]=x`），以降低不同客户端和文档工具的兼容成本。

首阶段支持的过滤操作符建议：
- `eq`
- `ne`
- `gt`
- `gte`
- `lt`
- `lte`
- `in`
- `like`

各操作符的语义约束：
- `eq`: 字段等于给定值
- `ne`: 字段不等于给定值
- `gt`: 字段大于给定值
- `gte`: 字段大于等于给定值
- `lt`: 字段小于给定值
- `lte`: 字段小于等于给定值
- `in`: 字段命中给定值集合，URL 中的 value 采用逗号分隔
- `like`: 字段按模糊匹配处理，默认由适配器追加通配符策略

首阶段不支持：
- `between`
- `isnull`
- `notnull`
- 手工声明 `OR` 分组或括号嵌套条件

TypeORM 首阶段映射策略：
- `eq` -> `Equal(value)`
- `ne` -> `Not(value)`
- `gt` -> `MoreThan(value)`
- `gte` -> `MoreThanOrEqual(value)`
- `lt` -> `LessThan(value)`
- `lte` -> `LessThanOrEqual(value)`
- `in` -> `In(value.split(','))`
- `like` -> `Like('%value%')`

实现约束：
- `in` 的空值集合视为非法输入，直接返回 400。
- `like` 首阶段统一使用 `%value%` 包裹，不做前缀/后缀模式细分。
- 不要求首阶段支持数据库方言差异下的大小写无关模糊查询；如需扩展，由适配器后续增强。

`search` 的首阶段固定语义：
- 仅在资源声明了 `searchable` 白名单时可用。
- 将 `search` 展开为对所有 `searchable` 字段的 OR 模糊匹配。
- 每个字段的基础匹配策略与 `like` 保持一致，即 `%keyword%`。
- 不支持在首阶段为 `search` 指定字段级权重、精确匹配或高级分词策略。

TypeORM 首阶段建议映射：
- 将 `searchable` 中的每个字段转换为一条 `Like('%keyword%')` 条件。
- 这些条件按 OR 组合，再与普通 `filters` 按 AND 合并。

示意语义：
- `(name LIKE '%harry%' OR email LIKE '%harry%') AND status = 'active'`

错误边界：
- 若资源未声明 `searchable` 却收到 `search`，返回 400。
- 若 `search` 为空字符串，按非法输入处理，返回 400。

安全边界：
- 非白名单字段直接拒绝，而不是静默忽略。
- 未声明 `join` 的资源拒绝任意关联展开。
- `limit` 超过 `maxLimit` 时按明确策略处理，推荐直接裁剪并保留一致返回。
- `sort` 或 `filter` 格式不合法时直接返回 400，而不是降级忽略。
- 包含 `.` 的 `join` 在首阶段直接返回 400，而不是尝试降级为一层关系。

## Validation and Swagger Integration
不新建独立校验系统，直接复用现有 DTO 元数据：

- `dto.create` 用于 `POST /`
- `dto.update` 用于 `PATCH /:id`
- `dto.replace` 用于 `PUT /:id`
- `dto.query` 用于 query 参数映射；若未提供，则按 `CrudOptions.query` 生成基础参数文档

首阶段默认路由的 DTO / 序列化绑定规则：

| Route | Request DTO | Response Shape |
|---|---|---|
| `list` | `dto.query`（query） | `CrudPageResult<serialize.list ?? model>` |
| `detail` | 无 body；可用 path/query 元数据 | `serialize.get ?? model` |
| `create` | `dto.create`（body） | `serialize.create ?? serialize.get ?? model` |
| `update` | `dto.update`（body） | `serialize.update ?? serialize.get ?? model` |
| `delete` | 无 | 空响应 |

补充约束：
- `list` 的 query 参数既可由 `dto.query` 描述，也必须继续叠加通用 `CrudQuery` 协议参数。
- `detail`、`update`、`delete` 均自动包含主键 path 参数文档。
- `delete` 默认不返回资源实体，以降低不必要的序列化与数据库返查成本。
- 若用户未提供 `serialize.*`，则按原始 `model` 的可见字段输出；具体字段裁剪仍可由后续序列化配置扩展。

首阶段集成策略：
- CRUD 组件不直接复制 validation 或 swagger 的核心逻辑，只负责把自动生成路由转成它们已能识别的元数据形态。
- 对 validation，优先复用现有 DTO + pipe 入口，避免维护第二套请求体验证流程。
- 对 swagger，优先在路由展开阶段补充 `ApiOperation`、`ApiParam`、`ApiQuery`、`ApiBody`、`ApiResponse` 等等价描述。
- 若某项 swagger 能力在首阶段无法完全自动推导，优先保证运行时行为正确，再通过显式配置补足文档。

删除语义约束：
- `CrudService.delete()` 的接口语义只保证“该资源被删除”，不强制规定必须硬删或软删。
- `TypeOrmCrudService` 首阶段默认采用硬删除，以保持基础行为直观、可预测。
- 若业务需要软删除、归档删除或审计删除，必须通过覆写 `delete()` 明确实现。
- `DELETE` 路由默认返回 `204 No Content`，不隐式回查并返回已删除实体。

软删除扩展约束（首阶段纳入最小能力）：
- `CrudOptions.delete.mode` 支持 `hard` 与 `soft` 两种策略，默认 `hard`。
- 当 `mode = 'soft'` 时，`TypeOrmCrudService.delete()` 应改为执行软删除。
- 当 `mode = 'soft'` 时，`list()` 与 `findOne()` 的默认查询必须排除已软删记录。
- 首阶段不自动暴露 restore 接口，也不支持 `withDeleted` / `onlyDeleted` 查询参数。
- 若用户配置 `mode = 'soft'` 但底层实体或 ORM 适配器不具备软删能力，应在启动阶段或首次使用时返回明确错误，而不是静默降级为硬删。

TypeORM 首阶段实现建议：
- 对具备软删能力的实体，`mode = 'soft'` 时使用 `softDelete()`（或等价能力）。
- 默认查询路径不包含已软删记录。
- 如后续要支持恢复能力，应通过独立 change 新增 `restore()` 和对应路由，而不是隐式附带在本阶段。

## Extension Seams
为保证首阶段可上线且后续可扩展，需明确保留以下扩展缝隙：

1. Primary Key Expansion
- 当前仅支持单主键。
- 未来可扩展为复合主键对象或自定义解析器，但不改变现有单值 `id` 路由与方法签名主路径。

2. Query Expansion
- 当前 `filter`、`search`、`join` 都是最小子集。
- 未来可增加新 operator、`withDeleted`、多层 join，但复用相同 query key 体系。

3. Delete Lifecycle Expansion
- 当前仅支持 `hard` / `soft` 两种删除模式。
- 未来可增加 `restore()`、归档删除，但作为新增能力，不反转默认删除语义。

4. Adapter Expansion
- 当前只定义 TypeORM 官方适配。
- 未来其他 ORM 应实现相同 service 契约，并尽量共享同一查询协议解释层。

5. Presentation Expansion
- 当前同时支持 class-based 与 functional 两种暴露层。
- 未来若新增其他暴露方式（如 RPC 资源映射），也应复用同一 CRUD core，而不是复制 service / query 逻辑。

## Gap Analysis vs `@nestjsx/crud`
基于 `@nestjsx/crud` 的公开 README 与 Wiki，本方案当前与其能力对比可分为三类：已覆盖、首阶段未覆盖但未来可自然扩展、以及当前刻意不纳入主路径的能力。

### 已覆盖的核心方向
- 声明式 `@Crud()` 资源装饰器
- 可扩展的 service-first 设计
- TypeORM 默认 service 基类
- query/path/DTO 校验
- 路由覆写
- Swagger 集成
- 通过配置裁剪默认路由

### 首阶段未覆盖，但按当前设计可自然扩展
- 全局 CRUD 配置
  - `@nestjsx/crud` 支持全局配置；当前方案只定义资源级配置
  - 可后续在 `configuration.ts` 中增加全局默认项并与资源级配置合并，不破坏 `@Crud()` 主路径
- 更丰富的 query 参数
  - `@nestjsx/crud` 支持 `or`、复杂 `search(s)`、`offset`、`cache`
  - 当前方案只支持 `page/limit/sort/filter/search/join/fields`
  - 可后续扩展 `CrudQuery` 与 `queryParser.ts`，保持同一 query key 体系
- 多层 relation join
  - `@nestjsx/crud` 支持 `relation.nested`
  - 当前方案首阶段仅一层 `join`
  - 可后续放宽 `join` 校验，不改变 `join=` URL 形式
- 字段 allow/exclude/persist
  - `@nestjsx/crud` 提供 `allow`、`exclude`、`persist`
  - 当前方案仅有 `fields` + `serialize`
  - 可后续在 `CrudOptions.query` 和序列化层加白名单/保留字段策略
- 路由级 decorators / interceptors
  - `@nestjsx/crud` 支持给生成路由挂 decorators/interceptors
  - 当前方案只保证继续兼容现有 Guard/Middleware/Decorator 体系，未定义专门 route 配置
  - 可后续在 `routes.overrides` 中扩展元数据挂载项
- `returnDeleted` / `returnShallow`
  - 当前方案固定 `DELETE` 返回空响应
  - 可后续作为 `delete.returnEntity` 一类配置扩展
- `replace` / `createMany` / `deleteMany`
  - 已保留 route 名，但不进首阶段核心交付

### 当前未覆盖且短期内不建议纳入主路径
- 前端 query builder（类似 `@nestjsx/crud-request` 的 `RequestQueryBuilder`）
  - 当前方案只定义服务端 query 解析协议
  - 这是独立子能力，更适合后续作为 `@midwayjs/crud-request` 一类工具包单独引入
- 附加 ACL helper decorators（如 `@Feature()` / `@Action()`）
  - Midway 现有鉴权体系并不依赖这类专用 helper
  - 当前方案更适合复用 Guard / Middleware / 装饰器，不额外定义 CRUD 专属 ACL 元数据
- 缓存 query（`cache`）
  - 当前方案没有统一缓存抽象
  - 如果强行加入，会把 CRUD 组件和缓存策略耦合过早

### 可能影响未来但当前需注意的缺口
- `offset`
  - 当前方案只有 `page + limit`
  - 若未来要补 `offset`，需定义其与 `page` 是否互斥；当前实现时应把分页计算封装在 `queryParser.ts`，避免散落逻辑难以演进
- 复杂 `OR` / 分组搜索
  - 当前固定为简单 AND filters + OR searchable-like
  - 若未来要支持，应优先扩展 AST 结构，而不是在字符串上追加越来越多特殊语法
- 自定义 path param 类型（如 `uuid`）
  - `@nestjsx/crud` 支持 param 类型配置
  - 当前方案只定义单主键，不含类型级 path param 规则
  - 后续可在 `id` 配置上扩展 `name/type` 结构，但当前不影响单主键主路径

## Implementation Blueprint
为直接进入 apply 阶段，建议按以下顺序落地，降低集成风险：

1. Core Types First
- 先完成 `interface.ts`、`constants.ts`、`error.ts`。
- 固定所有对外类型，再实现运行时，避免边写边改签名。

2. Query Parser Second
- 单独完成 `queryParser.ts` 和对应测试。
- 先让 `CrudQuery` 的输入输出稳定，再接 ORM 映射。

3. TypeORM Service Third
- 实现 `typeorm/service.ts` 与 `typeorm/utils.ts`。
- 先完成 service-only 场景，确保不依赖路由也可工作。

4. Route Expansion Fourth
- 实现 `decorator.ts`、`routeBuilder.ts`、`configuration.ts`。
- 仅在核心 service 能力稳定后再接 HTTP 适配层。

5. Validation / Swagger Fifth
- 最后补自动元数据接线，避免在核心行为未稳定时反复改文档层映射。

6. Fixture-led Verification
- 通过一个最小 `base-app` fixture 覆盖：
  - 普通硬删资源
  - 启用软删资源
  - 非法 query 场景
  - service-only 使用场景

## Pre-implementation Checklist
下面这份清单面向 apply 阶段，目标是让每个文件在首次提交时就具备最小可用导出，而不是边实现边发散。

## Package Manifest Plan
为保证 `@midwayjs/crud`、`@midwayjs/crud/typeorm`、`@midwayjs/crud/sequelize`、`@midwayjs/crud/mongoose`、`@midwayjs/crud/functional` 五个入口在上线后稳定可用，首阶段建议直接为 `packages/crud/package.json` 定义明确的 `exports` 边界，而不是依赖隐式路径约定。

建议的 `package.json` 轮廓：

```json
{
  "name": "@midwayjs/crud",
  "version": "4.0.0-beta.15",
  "description": "Midway Component for declarative CRUD APIs",
  "main": "dist/index.js",
  "typings": "index.d.ts",
  "files": [
    "dist/**/*.js",
    "dist/**/*.d.ts",
    "index.d.ts"
  ],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./typeorm": {
      "types": "./dist/typeorm/index.d.ts",
      "default": "./dist/typeorm/index.js"
    },
    "./functional": {
      "types": "./dist/functional/index.d.ts",
      "default": "./dist/functional/index.js"
    }
  },
  "engines": {
    "node": ">=20"
  },
  "license": "MIT",
  "scripts": {
    "build": "tsc",
    "test": "node -r ts-node/register ../../node_modules/jest/bin/jest.js --runInBand",
    "cov": "node -r ts-node/register ../../node_modules/jest/bin/jest.js --runInBand --coverage --forceExit"
  }
}
```

包级约束：
- 主入口 `.` 只导出 CRUD core 与 class-based 装饰器，不导出 TypeORM 或 functional 二级入口。
- `./typeorm` 只导出 TypeORM 适配层，不反向导出主入口全部 API，避免边界模糊。
- `./functional` 只导出函数式 CRUD 入口，不重导出 `defineApi()` 或其他 core functional API。
- `exports` 一旦发布即视为公共契约，后续扩展优先新增子路径，不随意重排现有导出。

依赖边界建议：

### 运行时依赖（`dependencies`）
- `@midwayjs/core`

原因：
- CRUD core 的装饰器、DI、元数据和配置装配直接依赖 core。

### 可选集成依赖（优先作为 `peerDependencies`）
- `@midwayjs/web`
- `@midwayjs/typeorm`
- `typeorm`

原因：
- `@Crud()` 的 HTTP 暴露层依赖 web 集成。
- `./typeorm` 二级入口依赖 TypeORM 适配，但不应让只用 core/service-only 的用户被迫安装 TypeORM。
- 若仓库当前发布策略不使用 `peerDependencies`，则至少在实现上保持“主入口不直接 import typeorm/web 运行时代码”。

### 开发依赖（`devDependencies`）
- `@midwayjs/mock`
- `@midwayjs/swagger`
- `@midwayjs/validation` 或 `@midwayjs/validate`
- `@midwayjs/web`
- `@midwayjs/typeorm`
- `typeorm`
- `sqlite3`

原因：
- 这些依赖主要用于 fixture 测试、回归测试和类型对齐，不应全部成为主入口硬依赖。

实现边界建议：
- `src/index.ts` 只能依赖 core-level 文件，不直接 import `src/typeorm/*` 或 `src/functional/*`。
- `src/functional/index.ts` 可以依赖 core-level 文件，但不应依赖 `src/typeorm/*`。
- `src/typeorm/index.ts` 可以依赖 core-level 文件和 `typeorm`，但不应依赖 `src/functional/*`。
- 若 `configuration.ts` 需要与 web 集成，尽量把 web 耦合限制在该文件和 `routeBuilder.ts`，避免污染纯 service-only 路径。

### `src/constants.ts`
最小导出：
- `CRUD_KEY`
- `CRUD_SERVICE_KEY`
- `CRUD_DEFAULT_LIMIT`
- `CRUD_MAX_LIMIT`
- `CRUD_DEFAULT_DELETE_MODE`
- `CRUD_ALLOWED_FILTER_OPERATORS`

### `src/error.ts`
最小导出：
- `CrudConfigError`
- `CrudQueryError`
- `CrudFeatureNotSupportedError`

约束：
- 错误类型需要能区分配置错误、请求错误、能力缺失错误，便于 HTTP 层映射。

### `src/interface.ts`
最小导出：
- `CrudOptions`
- `CrudRouteName`
- `CrudFilterOperator`
- `CrudQuery`
- `CrudSort`
- `CrudFilter`
- `CrudContext`
- `CrudPageMeta`
- `CrudPageResult<T>`
- `CrudIdValue`
- `CrudService<T>`
- `CrudServiceAdapter<T>`

### `src/decorator.ts`
最小导出：
- `Crud<T>(options: CrudOptions): ClassDecorator`
- `getCrudOptions(target: unknown): CrudOptions | undefined`
- `isCrudController(target: unknown): boolean`

### `src/queryParser.ts`
最小导出：
- `parseCrudQuery(input: Record<string, unknown>, options: CrudOptions): CrudQuery`
- `parseCrudId(input: unknown, options: CrudOptions): CrudIdValue`
- `assertAllowedJoin(value: string, options: CrudOptions): void`

约束：
- 解析层只负责“转成标准结构 + 校验”，不直接依赖 TypeORM。

### `src/service.ts`
最小导出：
- `AbstractCrudService<T>` 或 `BaseCrudService<T>`
- 可复用辅助方法：
  - `normalizePageResult(...)`
  - `assertEntityFound(...)`
  - `resolveDeleteMode(...)`

约束：
- 这里放与 ORM 无关的通用逻辑，不直接引用 TypeORM API。

### `src/routeBuilder.ts`
最小导出：
- `buildCrudRoutes(options: CrudOptions): CrudRouteDefinition[]`
- `getEnabledCrudRoutes(options: CrudOptions): CrudRouteName[]`
- `createCrudRouteHandler(route: CrudRouteName, controllerInstance: unknown): Function`

约束：
- 仅负责从配置生成路由定义与 handler 包装，不负责真正的 web 注册。

### `src/functional/index.ts`
最小导出：
- `defineCrudRoutes<T>(options: CrudOptions | FunctionalCrudOptions): FunctionalCrudRouteFactory<T>`

约束：
- 二级导出路径固定为 `@midwayjs/crud/functional`。
- 首阶段不从 `@midwayjs/crud` 主入口 re-export。

### `src/functional/routeBuilder.ts`
最小导出：
- `buildFunctionalCrudRoutes(options: FunctionalCrudOptions): FunctionalCrudRouteFactory`
- `createFunctionalCrudRouteMap(api: FunctionalApiBuilder, options: FunctionalCrudOptions): Record<string, unknown>`

约束：
- 函数式路由层只生成 route map，不应重复实现 query 解析、DTO 绑定和 CRUD service 逻辑。
- `FunctionalCrudOptions` 应尽量复用 `CrudOptions`，仅增加函数式场景必需字段（如自定义 operation key 前缀）时才扩展。
- route map 中每个默认 CRUD 路由的 key 应稳定可预测（如 `list`、`detail`、`create`、`update`、`delete`），便于与自定义路由组合。

### `src/validation.ts`
最小导出：
- `resolveCrudValidationMeta(route: CrudRouteName, options: CrudOptions): CrudValidationMeta`
- `applyCrudValidation(...)`

约束：
- 实现上应复用现有 validation 入口，不复制 pipe 实现。

### `src/swagger.ts`
最小导出：
- `resolveCrudSwaggerMeta(route: CrudRouteName, options: CrudOptions): CrudSwaggerMeta`
- `applyCrudSwagger(...)`

约束：
- 先以“能生成准确文档”为目标，不要求首版覆盖所有 swagger 装饰器细节。

### `src/configuration.ts`
最小导出：
- 默认组件配置类（按 Midway `@Configuration()` 风格）

最小职责：
- 注册 CRUD 组件
- 在合适生命周期收集 `@Crud()` 元数据
- 调用 `routeBuilder.ts` 产出路由
- 将结果接入现有 web 路由注册链

### `src/index.ts`
最小导出：
- `Crud`
- 主要类型导出（`CrudOptions`、`CrudQuery`、`CrudService` 等）
- 主要错误类型导出

约束：
- 不默认从主入口导出 TypeORM 实现，保持主包与 ORM 实现边界清晰。
- 不默认从主入口导出 `defineCrudRoutes()`，保持类式与函数式入口边界清晰。

### `src/typeorm/index.ts`
最小导出：
- `TypeOrmCrudService<T>`

### `src/typeorm/utils.ts`
最小导出：
- `buildTypeOrmFindOptions(...)` 或等价 query 翻译函数
- `mapCrudFilterToTypeOrmOperator(...)`
- `assertSoftDeleteSupported(...)`

### `src/typeorm/service.ts`
最小导出：
- `TypeOrmCrudService<T> extends BaseCrudService<T>`

最小职责：
- 接收 `Repository<T>`
- 实现 `list/findOne/create/update/delete`
- 处理 `delete.mode = 'soft'`
- 统一调用 `typeorm/utils.ts` 做 query/operator 翻译

集成要求：
- 若 DTO 已声明 validation 规则，则 CRUD 路由自动启用相同校验。
- Swagger 必须能识别自动生成的 CRUD 路由、query 参数和请求/响应 DTO。
- 对于 `update`，推荐允许结合 `PartialDto()` 派生更新 DTO，而不是要求用户重复声明。

## Extensibility Model
为避免“自动生成后不可控”，需要保留以下扩展点：

1. Service Override
- 用户可继承 `TypeOrmCrudService<T>` 并只覆写某几个方法。

2. Controller Override
- 用户可在 Controller 中实现同名方法以替换默认行为。

3. Business Composition
- 用户可以在普通 `@Provide()` 业务服务中直接注入 CRUD service，并在其外层编排事务、审计、权限、消息、聚合查询等逻辑。
- CRUD 组件不应迫使复杂业务只能通过自动生成路由入口触发。

4. Hook / Policy Slots
- 资源级预留 `beforeCreate`、`beforeUpdate`、`beforeDelete`、`afterRead` 等钩子位。
- 首阶段可先定义接口与调用时机，不必一开始提供完整插件系统。

5. Authorization Bridge
- CRUD 组件不内建 RBAC。
- 但生成路由必须允许继续挂载现有 Guard、Middleware、Decorator 元数据。

## Error Handling
为保证自动生成路由的行为可预测，需要统一基础错误语义：

- 主键资源不存在：返回 404
- DTO 校验失败：复用现有 validation 错误格式
- 查询参数非法：返回 400，包含字段与原因
- 白名单外排序/过滤/关联：返回 400，明确指出被拒绝的字段
- 仓储唯一键冲突、外键冲突等数据库错误：由适配器映射为可扩展的标准异常，避免直接透出底层驱动错误

## ORM Adapter Strategy
首阶段只强制交付 TypeORM，但核心抽象不能被 TypeORM 绑定死。

设计原则：
- `CrudServiceAdapter<T>` 是唯一的资源操作核心契约。
- 业务层应优先依赖 `CrudServiceAdapter<T>` / `CrudService<T>`，而不是依赖自动生成路由。
- `TypeOrmCrudService<T>` 只是其中一个官方实现。
- 其他 ORM 若要接入，应只实现相同契约，而不要求修改 CRUD Controller 层逻辑。

这样后续可平滑新增：
- `@midwayjs/crud/sequelize`
- `@midwayjs/crud/mikro`
- `@midwayjs/crud/leoric`
- `@midwayjs/crud/mongoose`

## Open Questions
- 是否首阶段就需要支持复合主键（当前草案允许 `id` 为 `string[]`，但可在实现时降级为单主键先行）？
- 自动生成的 Swagger summary/tag 是否采用默认英文模板，还是要求可本地化配置？
- `search` 的默认语义是否统一映射为 `OR like`，还是交由各 ORM 适配器定义？
