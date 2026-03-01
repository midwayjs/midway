# Change: 新增声明式 REST CRUD 组件

## Why
Midway 当前已经具备成熟的 Web 路由、依赖注入、验证、Swagger 和多 ORM 组件能力，但用户仍需要手写大量重复性的增删改查控制器、参数解析、分页过滤和数据库调用逻辑。

对于典型的后台管理、资源管理和内部平台场景，这类样板代码占比很高，且容易出现路由不一致、校验分散、查询能力不统一的问题。`nestjsx/crud` 之所以被广泛使用，核心价值就是用声明式配置快速生成稳定的 CRUD API，并把 DTO、查询约束和仓储访问收敛到统一模型。

本提案目标是在 Midway 中定义一个与其定位相似、但遵循 Midway 组件风格的 CRUD 能力规范，用于提供可组合的 CRUD Service 基座，并在需要时快速生成 REST CRUD 接口，与数据库组件完成低成本集成。

## What Changes
- 新增 capability：`crud-component`。
- 新增 capability：`functional-crud`。
- 设计一个新的 `@midwayjs/crud` 组件，优先提供可组合的 CRUD Service 抽象，并提供声明式 CRUD 控制器作为可选适配层。
- 定义 `CrudServiceAdapter` / `CrudService` 的核心服务契约，供上层业务服务直接组合。
- 定义 `@Crud()` 资源装饰器、路由生成规则和可覆盖的默认行为，作为将 CRUD Service 暴露为 REST 接口的可选能力。
- 定义函数式 CRUD 入口（建议 `defineCrudRoutes()`），作为与 `defineApi()` 协同工作的可选适配层。
- 复用现有 `@Inject()` 完成 CRUD service 注入，不新增 `InjectCrudService` 专用装饰器。
- 定义统一的查询协议（分页、排序、过滤、字段选择、关联展开）的最小子集，并提供白名单约束。
- 定义可插拔的仓储适配器接口，首阶段交付 TypeORM、Sequelize、Mongoose 官方适配，后续可扩展到 MikroORM、Leoric。
- 明确与 `@midwayjs/validation` 和 `@midwayjs/swagger` 的集成要求，确保 DTO、查询参数和返回结构可复用。
- 明确资源级钩子、路由级覆写和授权接入边界，避免生成式能力阻塞业务定制。

## Design Principles
- 首阶段采用最小可上线设计：只交付最常见、最稳定、可预测的能力。
- 所有首阶段限制都必须留下明确扩展缝隙，避免后续升级时推翻用户主路径。
- 默认行为优先直观和安全，复杂能力通过显式配置开启，而不是隐式推断。
- 组件定位是“资源操作基座 + 可选 REST 暴露层”，不是替代业务服务或构建完整低代码平台。
- 类式与函数式只是两种暴露形态，底层必须复用同一套 CRUD service、查询协议和默认行为。

## Proposed Public API
首阶段建议对用户公开的入口尽量少，优先稳定以下 5 个概念：

1. `CrudService<T>`
- 资源操作的统一抽象接口

2. `TypeOrmCrudService<T>`
- `CrudService<T>` 的官方数据库适配实现（TypeORM / Sequelize / Mongoose）

3. `CrudQuery`
- 标准化查询对象，用于承载分页、排序、过滤等条件

4. `@Crud<T>(options)`
- 可选的 REST 路由暴露层

5. `CrudOptions`
- `@Crud()` 的配置类型，至少包含 `model`、`service`、`dto`、`query`、`routes`

6. `defineCrudRoutes<T>(options)`
- 可选的函数式 CRUD 路由生成入口，用于和 `defineApi()` 合并使用

设计约束：
- 不新增 `CrudController` 作为用户主路径必需接口。
- 不新增 `InjectCrudService` 专用装饰器。
- 路由快捷模式统一为 `@Crud({ service }) + @Inject()`。
- 函数式 CRUD 必须输出 `defineApi()` 可消费的路由定义，不创建第二套独立注册机制。
- 函数式 CRUD 固定从 `@midwayjs/crud/functional` 导出，不从主入口混出。

首阶段建议冻结的函数式签名：
- `defineCrudRoutes<T>(options: CrudOptions): (api: FunctionalApiBuilder) => Record<string, FunctionalRouteBuilder | FunctionalRouteDefinition>`
- 用户通过 `const routes = defineCrudRoutes<T>(...); export default defineApi('/prefix', api => ({ ...routes(api), ...customRoutes }))` 使用
- 不额外定义独立的 `defineCrud()` 注册入口，避免与 `defineApi()` 并列出第二套主协议

首阶段建议冻结的最小方法面：
- `CrudService<T>.list(query: CrudQuery, ctx?: CrudContext): Promise<CrudPageResult<T>>`
- `CrudService<T>.findOne(id: CrudIdValue, ctx?: CrudContext): Promise<T | null>`
- `CrudService<T>.create(data: unknown, ctx?: CrudContext): Promise<T>`
- `CrudService<T>.update(id: CrudIdValue, data: unknown, ctx?: CrudContext): Promise<T>`
- `CrudService<T>.delete(id: CrudIdValue, ctx?: CrudContext): Promise<void>`

首阶段建议冻结的分页返回结构：
- `CrudPageResult<T> = { data: T[]; meta: { page: number; limit: number; total: number; pageCount: number; hasNext: boolean; hasPrev: boolean; } }`
- `list()` 始终返回对象结构，不直接返回数组
- `detail/create/update` 默认返回单个资源对象
- `delete` 默认返回空响应（HTTP 适配层建议使用 `204 No Content`）

首阶段建议冻结的 URL 查询协议：
- `page=<number>`
- `limit=<number>`
- `sort=<field>:<ASC|DESC>`，允许重复参数
- `filter=<field>||<operator>||<value>`，允许重复参数
- `search=<keyword>`
- `join=<relation>`，允许重复参数
- `fields=<field1,field2,...>`

首阶段建议冻结的 DTO 绑定规则：
- `list`：使用 `dto.query` 作为 query 参数描述；返回 `CrudPageResult<serialize.list | model>`
- `detail`：返回 `serialize.get | model`
- `create`：使用 `dto.create` 作为请求体；返回 `serialize.create | serialize.get | model`
- `update`：使用 `dto.update` 作为请求体；返回 `serialize.update | serialize.get | model`
- `delete`：无请求体；默认空响应

首阶段建议冻结的 service 绑定规则：
- `@Crud()` 推荐且默认要求显式声明 `service`
- 未声明 `service` 时，框架不做隐式推断
- 启动阶段若缺少 `service` 或 Controller 未注入兼容的实例，应直接报错

首阶段建议冻结的过滤操作符：
- `eq`
- `ne`
- `gt`
- `gte`
- `lt`
- `lte`
- `in`
- `like`

首阶段不纳入：
- `between`
- `isnull`
- `notnull`
- 复杂分组逻辑（AND/OR 嵌套表达式）

首阶段建议冻结的 search 语义：
- `search` 仅对 `query.searchable` 白名单字段生效
- 默认语义为“对白名单字段执行 OR + like('%keyword%')”
- 未配置 `searchable` 时传入 `search` 应返回 400，而不是静默忽略

首阶段建议冻结的 delete 语义：
- `CrudService.delete()` 只约定“删除该资源”的接口语义，不强制硬删实现
- 默认 `TypeOrmCrudService` 首阶段执行硬删除
- 业务如需软删，应通过覆写 `delete()` 或自定义 service 显式实现

首阶段建议新增显式删除策略配置：
- `@Crud()` 支持 `delete.mode: 'hard' | 'soft'`
- 默认 `delete.mode = 'hard'`
- 当 `delete.mode = 'soft'` 时，默认列表和详情查询排除已软删数据
- `restore`、`withDeleted`、`onlyDeleted` 不进入首阶段核心能力

首阶段建议冻结的主键策略：
- 首阶段默认只支持单主键资源
- `id` 采用单字段名（如 `'id'`、`'userId'`）
- 复合主键不进入首阶段核心能力，但类型设计保留未来扩展空间

首阶段建议冻结的 join 策略：
- `join` 首阶段仅支持一层关系名（如 `profile`、`department`）
- 首阶段不支持点路径（如 `profile.company`）
- 后续若要支持多层关系，沿用同一 `join` 参数形态扩展，不改变 URL 主格式

## User API Draft (for review)
提案阶段先冻结用户侧最小 API 形态，具体命名可在实现阶段做小幅调整，但行为边界应保持一致。

```ts
import { Provide } from '@midwayjs/core';
import { CrudService, TypeOrmCrudService } from '@midwayjs/crud';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dto/user.dto';
import { UserEntity } from '../entity/user.entity';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';

@Provide()
export class UserCrudService extends TypeOrmCrudService<UserEntity>
  implements CrudService<UserEntity> {
  @InjectEntityModel(UserEntity)
  repo: Repository<UserEntity>;

  protected getCreateDto() {
    return CreateUserDto;
  }

  protected getUpdateDto() {
    return UpdateUserDto;
  }

  protected getQueryDto() {
    return UserQueryDto;
  }

  async create(data) {
    return super.create({
      ...data,
      source: 'admin',
    });
  }
}
```

```ts
import { Provide, Inject } from '@midwayjs/core';
import { UserCrudService } from '../service/user.crud.service';

@Provide()
export class UserFacadeService {
  @Inject()
  userCrudService: UserCrudService;

  async createAdminUser(input) {
    const user = await this.userCrudService.create(input);
    // 这里继续编排通知、审计、积分等业务逻辑
    return user;
  }
}
```

```ts
import { Provide } from '@midwayjs/core';
import { Inject } from '@midwayjs/core';
import { Controller } from '@midwayjs/web';
import { Crud } from '@midwayjs/crud';
import { UserEntity } from '../entity/user.entity';
import { UserCrudService } from '../service/user.crud.service';

@Provide()
@Controller('/users')
@Crud<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
  id: 'id',
  dto: {
    create: CreateUserDto,
    update: UpdateUserDto,
    query: UserQueryDto,
  },
  routes: {
    only: ['list', 'detail', 'create', 'update', 'delete'],
  },
  query: {
    maxLimit: 100,
    defaultLimit: 20,
    sortable: ['id', 'createdAt'],
    filterable: ['status', 'tenantId'],
    searchable: ['name', 'email'],
    join: ['profile'],
  },
})
export class UserController {
  @Inject()
  crudService: UserCrudService;
}
```

```ts
import { defineApi } from '@midwayjs/core/functional';
import { defineCrudRoutes } from '@midwayjs/crud/functional';
import { UserCrudService } from '../service/user.crud.service';
import { UserEntity } from '../entity/user.entity';

const userCrud = defineCrudRoutes<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
  dto: {
    create: CreateUserDto,
    update: UpdateUserDto,
    query: UserQueryDto,
  },
  query: {
    maxLimit: 100,
    defaultLimit: 20,
    sortable: ['id', 'createdAt'],
    filterable: ['status', 'tenantId'],
    searchable: ['name', 'email'],
    join: ['profile'],
  },
});

export default defineApi('/users', api => ({
  ...userCrud(api),

  resetPassword: api
    .post('/:id/reset-password')
    .handle(async ({ input, ctx }) => {
      // 自定义业务动作
      return { ok: true };
    }),
}));
```

首阶段默认生成的 REST 路由矩阵（仅在启用 `@Crud()` 时生效）：
- `GET /resources`
- `GET /resources/:id`
- `POST /resources`
- `PATCH /resources/:id`
- `DELETE /resources/:id`

可选扩展（同一规范内预留，但不要求首阶段全部实现）：
- `PUT /resources/:id`
- `POST /resources/bulk`
- `DELETE /resources/bulk`

service-first 使用原则：
- 用户可以只使用 `CrudService` / `TypeOrmCrudService`，完全不生成路由。
- `@Crud()` 只是将同一套 CRUD service 能力暴露为标准 REST 接口的快捷适配层。
- `defineCrudRoutes()` 只是将同一套 CRUD service 能力暴露为函数式路由定义的快捷适配层。
- `@Crud()` 在配置中显式声明 `service` 绑定，Controller 内部复用现有 `@Inject()` 注入。
- `defineCrudRoutes()` 直接返回可被 `defineApi()` 合并的路由对象，便于和自定义业务动作共存。
- 复杂业务编排继续放在普通业务 Service 中，由其组合调用 CRUD service。

## Scope Boundaries
- 本提案只定义规范与设计，不包含实现代码。
- 首阶段以 CRUD service 核心能力 + HTTP REST 适配层 + TypeORM / Sequelize / Mongoose 适配为交付基线，不要求一次性覆盖所有 ORM。
- 首阶段不追求完整复刻 `nestjsx/crud` 的全部查询语法，只定义 Midway 需要的最小可用集合。
- 首阶段不包含前端代码生成、GraphQL、嵌套路由资源和复杂跨资源联查 DSL。

## Impact
- Affected specs: `crud-component`（新增）, `functional-crud`（新增）
- Affected code（实施阶段预期）:
  - `packages/crud/*`（新增核心 CRUD 组件）
  - `packages/crud/src/functional/*`（新增函数式 CRUD 适配层）
  - `packages/typeorm/*`（新增 CRUD 适配层或辅助导出）
  - `packages/web/*`（路由注册与元数据整合）
  - `packages/validation/*`（DTO/query 元数据复用）
  - `packages/swagger/*`（生成路由与参数文档）
  - `site/docs/*`（新增 CRUD 组件文档）
- Compatibility:
  - 向后兼容，现有手写 Controller/Service 模式保持不变。
  - CRUD 组件作为可选能力引入，不改变默认 Web 行为。
