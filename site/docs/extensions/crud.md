import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# CRUD

`@midwayjs/crud` 提供一套面向资源的 CRUD 基础能力，核心是可复用的 `CrudService`，并在其上提供类式和函数式两种可选的 HTTP 路由适配层。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |

## 安装依赖

```bash
$ npm i @midwayjs/crud@4 --save
```

如果你使用不同数据库适配，则还需要安装对应依赖。

```bash
$ npm i @midwayjs/typeorm@4 typeorm --save
$ npm i @midwayjs/sequelize@4 sequelize sequelize-typescript --save
$ npm i @midwayjs/mongoose@4 mongoose --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/crud": "^4.0.0",
    "@midwayjs/typeorm": "^4.0.0",
    "@midwayjs/sequelize": "^4.0.0",
    "@midwayjs/mongoose": "^4.0.0",
    "typeorm": "^0.3.26",
    "sequelize": "^6.37.5",
    "sequelize-typescript": "^2.1.6",
    "mongoose": "^8.9.5"
  }
}
```

## 开启组件

在 `configuration.ts` 中增加组件。

```typescript
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as crud from '@midwayjs/crud';
import * as typeorm from '@midwayjs/typeorm';

@Configuration({
  imports: [
    koa,
    typeorm,
    crud,
  ],
})
export class MainConfiguration {}
```

## 核心概念

这个组件分为三层：

1. `CrudService<T>`：稳定的 CRUD 核心抽象。
2. 适配层：`TypeOrmCrudService<T>`、`SequelizeCrudService<T>`、`MongooseCrudService<T>`。
3. `@Crud()` / `defineCrudRoutes()`：可选的 HTTP 暴露层。

这意味着你可以先只复用 service，在需要时再快速展开 REST 路由。

## Service-only 模式

如果业务层只需要标准化的数据操作能力，不需要自动生成路由，可以直接复用对应数据库的 CRUD service。

```typescript
import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { TypeOrmCrudService } from '@midwayjs/crud/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entity/user';

@Provide()
export class UserCrudService extends TypeOrmCrudService<UserEntity> {
  @InjectEntityModel(UserEntity)
  repo: Repository<UserEntity>;
}
```

然后在上层业务 service 中直接组合它。

```typescript
import { Provide, Inject } from '@midwayjs/core';

@Provide()
export class UserService {
  @Inject()
  userCrudService: UserCrudService;

  async listUsers() {
    return this.userCrudService.list({
      page: 1,
      limit: 20,
      sort: [],
      filters: [],
    });
  }

  async createUser(input: CreateUserDTO) {
    return this.userCrudService.create(input);
  }
}
```

这种模式下不会自动注册任何 HTTP 路由。

## 其他数据库适配

除了 `TypeOrmCrudService<T>`，组件还提供了 `SequelizeCrudService<T>` 和 `MongooseCrudService<T>` 两个官方适配基类。

Sequelize 示例：

```typescript
import { Provide } from '@midwayjs/core';
import { InjectRepository } from '@midwayjs/sequelize';
import { SequelizeCrudService } from '@midwayjs/crud/sequelize';
import { Repository } from 'sequelize-typescript';

@Provide()
export class UserCrudService extends SequelizeCrudService<UserModel> {
  @InjectRepository(UserModel)
  repo: Repository<UserModel>;
}
```

Mongoose 示例：

```typescript
import { Inject, Provide } from '@midwayjs/core';
import { MongooseDataSourceManager } from '@midwayjs/mongoose';
import { MongooseCrudService } from '@midwayjs/crud/mongoose';

@Provide()
export class UserCrudService extends MongooseCrudService<UserDocument> {
  @Inject()
  mongooseDataSourceManager: MongooseDataSourceManager;

  async onReady() {
    this.repo = this.mongooseDataSourceManager
      .getDataSource('default')
      .model('User');
  }
}
```

## 类式路由快捷模式

如果你使用类式 Controller，可以在已有 `@Controller()` 的基础上使用 `@Crud()` 快速生成标准资源路由。

```typescript
import { Controller, Inject } from '@midwayjs/core';
import { Crud } from '@midwayjs/crud';

import { UserEntity } from '../entity/user';
import { UserCrudService } from '../service/user.crud';
import { CreateUserDTO, UpdateUserDTO, UserQueryDTO } from '../dto/user';

@Controller('/users')
@Crud<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
  dto: {
    create: CreateUserDTO,
    update: UpdateUserDTO,
    query: UserQueryDTO,
  },
  query: {
    defaultLimit: 20,
    maxLimit: 100,
    sortable: ['id', 'createdAt'],
    filterable: ['status'],
    searchable: ['name', 'email'],
    join: ['profile'],
  },
})
export class UserController {
  @Inject()
  crudService: UserCrudService;
}
```

默认会展开这些路由：

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

如果你只想暴露部分路由，可以通过 `routes.only` 或 `routes.exclude` 控制。

```typescript
@Crud<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
  routes: {
    only: ['list', 'detail', 'create'],
  },
})
```

同名方法会优先使用你手写的实现，因此你可以只覆写个别默认行为。

```typescript
@Controller('/users')
@Crud<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
})
export class UserController {
  @Inject()
  crudService: UserCrudService;

  async create() {
    // 自定义事务或聚合逻辑
  }
}
```

## 函数式路由模式

如果项目使用函数式 API，可以从 `@midwayjs/crud/functional` 导入 `defineCrudRoutes()`。

```typescript
import { defineApi } from '@midwayjs/core/functional';
import { defineCrudRoutes } from '@midwayjs/crud/functional';

import { UserEntity } from '../entity/user';
import { UserCrudService } from '../service/user.crud';

const crudRoutes = defineCrudRoutes<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
  query: {
    sortable: ['id', 'createdAt'],
    filterable: ['status'],
    searchable: ['name', 'email'],
    join: ['profile'],
  },
});

export default defineApi('/users', api => ({
  ...crudRoutes(api),
  resetPassword: api
    .post('/:id/reset-password')
    .handle(async ({ input, ctx }) => {
      return { ok: true };
    }),
}));
```

这种写法会把 CRUD 默认路由和自定义业务动作放在同一个 `defineApi()` 路由对象里。

## 查询协议

列表接口使用统一的 query 协议。

- `page=<number>`
- `limit=<number>`
- `sort=<field>:<ASC|DESC>`，可重复传入
- `filter=<field>||<operator>||<value>`，可重复传入
- `search=<keyword>`
- `join=<relation>`，可重复传入
- `fields=<field1,field2,...>`

例如：

```text
GET /users?page=1&limit=20&sort=createdAt:DESC&filter=status||eq||active&search=harry&join=profile
```

首阶段支持的 filter operator 如下：

- `eq`
- `ne`
- `gt`
- `gte`
- `lt`
- `lte`
- `in`
- `like`

限制说明：

- `sort` 和 `filter` 字段必须在白名单中。
- `search` 只会对 `query.searchable` 中声明的字段执行 `OR + like('%keyword%')`。
- `join` 首阶段只支持一层关系名，不支持 `profile.company` 这种点路径。

## 返回结构

`list()` 默认返回统一的分页结构：

```typescript
type CrudPageResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};
```

`detail`、`create`、`update` 默认返回单个资源对象，`delete` 默认返回 `204 No Content`。

## DTO、Validation 与 Swagger

- `dto.create`、`dto.update`、`dto.replace` 会自动接入请求体验证。
- `dto.query` 会用于列表查询参数验证与文档生成。
- 自动生成的 CRUD 路由会复用现有的 Web 元数据链，因此可以被 Swagger 组件扫描到。

如果你使用 `@midwayjs/validation` 的 DTO 派生能力，例如 `PartialDto()`，也可以直接作为 `dto.update` 复用。

## 软删除

默认行为是硬删除。如果资源需要软删除，需要显式开启。

```typescript
@Crud<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
  delete: {
    mode: 'soft',
  },
})
```

开启后：

- `DELETE /:id` 会走软删除
- `list` / `detail` 默认排除已软删数据
- 如果实体或适配器不支持软删除，会直接报错，而不是静默降级为硬删除

## 二级导出

组件提供五个稳定入口：

- `@midwayjs/crud`
- `@midwayjs/crud/typeorm`
- `@midwayjs/crud/sequelize`
- `@midwayjs/crud/mongoose`
- `@midwayjs/crud/functional`

建议主入口只用于核心类型和类式路由适配；ORM 与函数式能力通过二级导入使用。
