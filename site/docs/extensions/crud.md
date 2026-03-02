# CRUD

本文档介绍如何在 Midway 中使用 `@midwayjs/crud`。

`@midwayjs/crud` 不是一个“只能自动生成接口”的脚手架，它本质上提供的是一套**面向资源的标准 CRUD 能力**：

- 统一的增删改查 service 抽象
- 统一的分页 / 排序 / 过滤 / 搜索协议
- 可选的 REST 路由快捷生成
- 和现有 validation / swagger / web 路由体系的接入

如果你经常在不同模块里重复写下面这些代码：

- `findAndCount`
- `save`
- `update`
- `delete`
- 手动解析 `page`、`limit`、`sort`
- 为每个资源写一套几乎一样的 Controller

那这个组件就是用来把这些重复劳动收起来的。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |

## 这个组件能做什么

先用一句话概括：

**先提供一个可复用的 CRUD service，再按需把它暴露成 HTTP 接口。**

这意味着它支持两种使用方式：

1. 只把它当数据访问层能力来用  
   适合你的业务逻辑比较复杂，不想让组件替你生成接口。

2. 把它当接口快捷层来用  
   适合资源型接口很多，希望快速拿到统一的 REST API。

所以它解决的是“资源型接口的重复代码”问题，但**不会替代你的业务 service**。

复杂业务依然应该写在你自己的 service 里，例如：

- 下单时要检查库存、优惠券、支付状态
- 创建用户时要同步多个系统
- 删除资源前要做权限和状态机校验

这些逻辑应该继续在你的业务 service 中完成，CRUD 组件只是提供一个稳定的资源操作基座。

## 核心概念

在开始之前，先理解这三个层次。

### 1. `CrudService<T>`

这是最核心的抽象，定义了统一的资源操作接口。

```ts
list(query)
findOne(id)
create(data)
update(id, data)
delete(id)
```

你可以把它理解成“一个标准化的资源仓储服务接口”。

### 2. 数据库适配层

Midway CRUD 目前提供了 4 个官方适配基类：

- `TypeOrmCrudService<T>`
- `MikroCrudService<T>`
- `SequelizeCrudService<T>`
- `MongooseCrudService<T>`

它们都实现了相同的 CRUD 核心接口，但底层分别接不同的数据访问组件。

### 3. HTTP 暴露层

这是可选的。

如果你希望快速生成路由，可以使用：

- 类式：`@Crud()`
- 函数式：`defineCrudRoutes()`

这两种方式都只是把同一个 `CrudService` 暴露成 HTTP 接口，不会生成第二套独立逻辑。

## 什么时候适合用

适合：

- 大量资源型接口，结构相似
- 列表查询都需要统一分页、排序、过滤
- 想减少重复的 Repository / Model 调用代码
- 想让不同模块的 API 风格保持一致

不适合：

- 主要是复杂工作流，不是标准资源接口
- 一个接口需要跨多个聚合、多个事务、多个外部系统
- 你希望所有查询语义都完全自由，不接受统一约束

如果一个模块的核心不是“资源管理”，而是“复杂业务流程”，那更适合直接写普通 Controller + Service，而不是强行套 CRUD。

## 安装依赖

先安装 CRUD 组件本身：

```bash
$ npm i @midwayjs/crud@4 --save
```

然后根据你使用的数据库组件安装对应依赖。

```bash
# TypeORM
$ npm i @midwayjs/typeorm@4 typeorm --save

# MikroORM
$ npm i @midwayjs/mikro@4 @mikro-orm/core --save

# Sequelize
$ npm i @midwayjs/sequelize@4 sequelize sequelize-typescript --save

# Mongoose
$ npm i @midwayjs/mongoose@4 mongoose --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/crud": "^4.0.0",
    "@midwayjs/typeorm": "^4.0.0",
    "@midwayjs/mikro": "^4.0.0",
    "@midwayjs/sequelize": "^4.0.0",
    "@midwayjs/mongoose": "^4.0.0",
    "typeorm": "^0.3.26",
    "@mikro-orm/core": "^6.4.5",
    "sequelize": "^6.37.5",
    "sequelize-typescript": "^2.1.6",
    "mongoose": "^8.9.5"
  }
}
```

## 启用组件

在 `src/configuration.ts` 中引入组件。

下面以 `koa + typeorm + crud` 为例：

```typescript
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as typeorm from '@midwayjs/typeorm';
import * as crud from '@midwayjs/crud';

@Configuration({
  imports: [
    koa,
    typeorm,
    crud,
  ],
})
export class MainConfiguration {}
```

如果你使用其他数据库组件，只需要把对应组件加到 `imports` 中即可。

## 入门：先从 service-only 开始

对于新手来说，最容易理解的方式不是先生成路由，而是先把它当一个“可复用的数据服务”。

这也是推荐的理解顺序。

### 为什么推荐先学 service-only

因为这样你能先理解：

- 组件真正提供的核心是什么
- 业务代码应该写在哪里
- 路由层只是一个可选外壳

如果一上来就只看 `@Crud()`，很容易误以为这只是一个自动生成接口的装饰器。

### 最小 TypeORM 示例

先定义一个资源 service：

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

然后在业务 service 里直接组合它：

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

这时候：

- 你已经获得统一的 CRUD 能力
- 但**不会自动生成任何 HTTP 路由**
- 业务仍然由你自己的 `UserService` 负责组织

这也是最适合复杂业务场景的用法。

## 其他数据库适配

如果你的项目不是 TypeORM，也可以使用其他官方适配。

### MikroORM

```typescript
import { Provide } from '@midwayjs/core';
import { InjectRepository } from '@midwayjs/mikro';
import { MikroCrudService } from '@midwayjs/crud/mikro';

@Provide()
export class UserCrudService extends MikroCrudService<UserEntity> {
  @InjectRepository(UserEntity)
  repo;
}
```

### Sequelize

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

### Mongoose

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

这几个适配基类的对外用法保持一致，区别主要在于底层仓储注入方式和 ORM 行为。

## 快速生成类式 REST 接口

当你已经有一个 `CrudService` 之后，如果希望快速生成标准资源型接口，可以使用 `@Crud()`。

### 最小类式示例

```typescript
import { Controller, Inject } from '@midwayjs/core';
import { Crud } from '@midwayjs/crud';

import { UserEntity } from '../entity/user';
import { UserCrudService } from '../service/user.crud';

@Controller('/users')
@Crud<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
})
export class UserController {
  @Inject()
  crudService: UserCrudService;
}
```

默认会生成：

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

### 为什么还要 `@Inject() crudService`

因为 `@Crud()` 只是声明“这个 Controller 是一个 CRUD 资源”，真正执行业务的是你绑定的 `crudService`。

也就是说：

- `@Crud()` 负责生成默认路由
- `crudService` 负责真正执行 CRUD 逻辑

这是这个组件最重要的设计原则之一。

### 业务逻辑写在哪里

不要把复杂业务逻辑塞到 `@Crud()` 里。

推荐做法是：

- 资源级默认行为：写在 `UserCrudService`
- 复杂业务编排：写在你自己的 `UserService` / Domain Service
- 非标准动作：写成普通路由方法

例如：

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
    // 自定义事务、调用多个 service、做额外校验
  }

  async resetPassword() {
    // 非标准资源动作
  }
}
```

同名方法会优先使用你手写的实现，因此你可以只覆写部分默认行为。

### 裁剪默认路由

如果你不想暴露所有默认路由，可以通过 `routes.only` 或 `routes.exclude` 控制。

```typescript
@Crud<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
  routes: {
    only: ['list', 'detail', 'create'],
  },
})
```

这对于“只能查、不能删”或“只开放后台管理的一部分动作”的场景很有用。

## 函数式路由模式

如果项目使用函数式 API，而不是类式 Controller，可以从 `@midwayjs/crud/functional` 导入 `defineCrudRoutes()`。

### 最小示例

```typescript
import { defineApi } from '@midwayjs/core/functional';
import { defineCrudRoutes } from '@midwayjs/crud/functional';

import { UserEntity } from '../entity/user';
import { UserCrudService } from '../service/user.crud';

const crudRoutes = defineCrudRoutes<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
});

export default defineApi('/users', api => ({
  ...crudRoutes(api),
}));
```

### 和自定义动作一起使用

函数式模式最常见的用法，是把默认 CRUD 路由和自定义动作合并在同一个 `defineApi()` 里。

```typescript
export default defineApi('/users', api => ({
  ...crudRoutes(api),
  resetPassword: api
    .post('/:id/reset-password')
    .handle(async ({ input, ctx }) => {
      return { ok: true };
    }),
}));
```

这样可以让“标准资源动作”和“业务动作”共存在同一个资源路由下。

## 查询协议

列表接口使用统一的查询协议，这是这个组件最重要的能力之一。

### 支持的 query 参数

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

### 支持的过滤操作符

首阶段支持：

- `eq`
- `ne`
- `gt`
- `gte`
- `lt`
- `lte`
- `in`
- `like`

### 查询协议的约束

这些约束是有意设计出来的，用来保证资源接口的一致性：

- `sort` 字段必须在 `sortable` 白名单里
- `filter` 字段必须在 `filterable` 白名单里
- `search` 只会作用于 `searchable` 白名单
- `join` 必须在 `join` 白名单里
- `join` 首阶段只支持一层关系名，不支持 `profile.company`

也就是说，这个组件不会让客户端随意拼接任意字段查询，而是让你在服务端声明资源允许暴露的查询能力。

### 在 `@Crud()` 中声明查询能力

```typescript
@Crud<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
  query: {
    defaultLimit: 20,
    maxLimit: 100,
    sortable: ['id', 'createdAt'],
    filterable: ['status'],
    searchable: ['name', 'email'],
    join: ['profile'],
  },
})
```

这样配置后，查询行为就会按这个白名单执行。

## 返回结构

默认列表接口会返回统一的分页结构，而不是直接返回数组。

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

这能让前端和不同资源接口之间保持一致的分页消费方式。

其他默认返回规则：

- `detail` 返回单个资源对象
- `create` 返回创建后的资源对象
- `update` 返回更新后的资源对象
- `delete` 默认返回 `204 No Content`

## DTO、Validation 与 Swagger

CRUD 路由会尽量复用现有 Midway 组件，而不是另起一套协议。

### DTO 绑定

你可以在 `@Crud()` 中声明：

- `dto.create`
- `dto.update`
- `dto.replace`
- `dto.query`

例如：

```typescript
@Crud<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
  dto: {
    create: CreateUserDTO,
    update: UpdateUserDTO,
    query: UserQueryDTO,
  },
})
```

### Validation

如果项目里启用了 `@midwayjs/validation` 或兼容的 validation service：

- `dto.create` 会用于创建请求体校验
- `dto.update` 会用于更新请求体校验
- `dto.replace` 会用于替换请求体校验
- `dto.query` 会用于列表查询参数校验

如果没有安装 validation 组件，CRUD 本身不会强行报错，而是只跳过这一步自动校验。

### Swagger

自动生成的 CRUD 路由会复用现有 Web 元数据链，所以 Swagger 组件可以识别到这些路由。

也就是说：

- 默认路由会出现在 Swagger 文档里
- 基础的 path / query / body / response 元数据会被自动补齐

这意味着你不需要为每一个简单资源接口手动补一遍同样的 swagger 装饰器。

## 软删除

默认删除行为是**硬删除**。

如果你希望某个资源使用软删除，需要显式开启：

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
- `list` / `detail` 默认排除已软删的数据
- 如果底层实体或仓储不支持软删除，会直接报错

### 为什么不是默认软删除

因为软删除不是所有资源都适合：

- 会影响唯一键约束
- 会影响查询逻辑
- 会影响索引设计
- 会影响后台数据管理

所以这里采用的是“显式开启”的策略，而不是默认偷偷帮你切换成软删。

## 一个更完整的类式示例

下面给一个稍完整一点的例子，把前面的内容串起来。

```typescript
import { Controller, Inject, Provide } from '@midwayjs/core';
import { Crud } from '@midwayjs/crud';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { TypeOrmCrudService } from '@midwayjs/crud/typeorm';
import { Repository } from 'typeorm';

@Provide()
export class UserCrudService extends TypeOrmCrudService<UserEntity> {
  @InjectEntityModel(UserEntity)
  repo: Repository<UserEntity>;
}

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
  delete: {
    mode: 'soft',
  },
})
export class UserController {
  @Inject()
  crudService: UserCrudService;
}
```

这段代码的效果是：

- 生成一个 `/users` 资源接口
- 自动获得标准 CRUD 路由
- 自动使用统一查询协议
- 自动按 DTO 做校验（如果启用了 validation）
- 自动被 swagger 扫描
- 删除逻辑使用软删除

## 二级导出

组件提供这些稳定入口：

- `@midwayjs/crud`
- `@midwayjs/crud/typeorm`
- `@midwayjs/crud/mikro`
- `@midwayjs/crud/sequelize`
- `@midwayjs/crud/mongoose`
- `@midwayjs/crud/functional`

建议这样理解：

- 主入口：核心类型 + `@Crud()`
- 数据库二级入口：各自的 CRUD service 适配
- `functional`：函数式路由适配

## 最后的建议

如果你是第一次接触这个组件，建议按这个顺序使用：

1. 先学 `service-only`，把它当一个标准 CRUD service
2. 再用 `@Crud()` 快速展开简单资源接口
3. 最后再用函数式模式或高级查询配置

这样更容易理解它的边界，也更不容易把复杂业务错误地塞进自动 CRUD 层。
