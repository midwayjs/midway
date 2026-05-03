# CRUD

This document explains how to use `@midwayjs/crud` in Midway.

`@midwayjs/crud` is not just a decorator that generates routes. At its core, it provides a **resource-oriented CRUD foundation**:

- A reusable CRUD service abstraction
- A unified protocol for pagination, sorting, filtering, and search
- Optional REST route generation
- Integration with the existing validation, swagger, and web routing pipeline

If you frequently repeat the same work in different modules:

- `findAndCount`
- `save`
- `update`
- `delete`
- manually parsing `page`, `limit`, and `sort`
- writing nearly identical controllers for each resource

this component is designed to centralize that repeated code.

Related information:

| Description |      |
| ----------------- | ---- |
| Can be used for standard projects | ✅ |
| Can be used for Serverless | ❌ |
| Can be used for integration | ✅ |
| Contains independent main framework | ❌ |
| Contains independent logs | ❌ |

## What this component does

In one sentence:

**It gives you a reusable CRUD service first, then optionally exposes that service as HTTP routes.**

That means it supports two main usage styles:

1. Use it only as a data-access capability  
   Best when your business logic is complex and you do not want the component to generate routes.

2. Use it as a route shortcut layer  
   Best when you have many resource-style APIs and want fast, consistent REST endpoints.

So the problem it solves is “repetitive resource API code”, but it does **not replace your business service layer**.

Complex workflows should still live in your own services, for example:

- placing an order that checks inventory, coupons, and payment state
- creating a user and synchronizing multiple systems
- deleting a resource only after permission and state-machine checks

Those belong in your application services. CRUD is the reusable resource foundation underneath.

## Core concepts

Before you start, understand these three layers.

### 1. `CrudService<T>`

This is the central abstraction. It defines a stable resource API:

```ts
list(query)
findOne(id)
create(data)
update(id, data)
delete(id)
```

You can think of it as a standardized resource service interface.

### 2. Database adapter layer

Midway CRUD currently provides four official adapter base classes:

- `TypeOrmCrudService<T>`
- `MikroCrudService<T>`
- `SequelizeCrudService<T>`
- `MongooseCrudService<T>`

They all implement the same CRUD contract, but each one speaks to a different data-access layer.

### 3. HTTP exposure layer

This part is optional.

If you want fast route generation, use:

- class-based: `@Crud()`
- functional: `defineCrudRoutes()`

Both of them expose the same `CrudService` through HTTP. They do not create a second implementation path.

## When to use it

Good fit:

- You have many resource-style endpoints with similar shapes
- Your list APIs need consistent pagination, sorting, and filtering
- You want to reduce repeated repository / model calls
- You want API behavior to stay consistent across modules

Not a good fit:

- Your main use case is complex workflows rather than resource management
- One endpoint spans multiple aggregates, multiple transactions, or multiple external systems
- You need completely free-form query semantics and do not want a shared protocol

If a module is primarily about business flow instead of resource management, a regular Controller + Service is often the better choice.

## Install

First install the CRUD component itself:

```bash
$ npm i @midwayjs/crud@4 --save
```

Then install the data component that matches your stack.

```bash
# TypeORM
$ npm i @midwayjs/typeorm@4 typeorm --save

# MikroORM
$ npm i @midwayjs/mikro@4 @mikro-orm/core@^6 --save

# Sequelize
$ npm i @midwayjs/sequelize@4 sequelize sequelize-typescript --save

# Mongoose
$ npm i @midwayjs/mongoose@4 mongoose --save
```

Or add them to `package.json` and reinstall:

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

## Enable the component

Import it in `src/configuration.ts`.

Here is a `koa + typeorm + crud` example:

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

If you use a different data component, just replace `typeorm` with the matching one.

## Getting started: service-only first

For beginners, the easiest way to understand this component is to start with it as a reusable data service, not as route generation.

This is also the recommended learning path.

### Why start with service-only

Because it makes the key ideas obvious:

- what the component actually provides
- where business logic should live
- that the route layer is only an optional wrapper

If you start only with `@Crud()`, it is easy to assume this is just a route generator.

### Minimal TypeORM example

Define a resource service:

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

Then compose it inside your business service:

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

At this point:

- you already have a stable CRUD capability
- **no HTTP route is generated automatically**
- your business still stays in your own `UserService`

This is the best fit for complex business scenarios.

## Other database adapters

If your project is not using TypeORM, you can still use the same CRUD shape with the other official adapters.

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

All of these adapters expose the same public CRUD shape. The main difference is how the underlying repository/model is injected.

## Quickly generate class-based REST APIs

Once you already have a `CrudService`, you can expose it as standard REST endpoints with `@Crud()`.

### Minimal class-based example

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

By default, it generates:

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

### Why do I still need `@Inject() crudService`

Because `@Crud()` only declares that this controller is a CRUD resource. The actual behavior still comes from your bound `crudService`.

That means:

- `@Crud()` defines the default route surface
- `crudService` performs the actual CRUD operations

This is one of the most important design rules in this component.

### Where business logic should live

Do not try to put complex business logic into `@Crud()`.

Recommended split:

- resource-level default behavior: put it in `UserCrudService`
- complex orchestration: put it in your own `UserService` / domain service
- non-standard actions: write them as normal routes

For example:

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
    // custom transaction, multiple services, extra business rules
  }

  async resetPassword() {
    // non-standard resource action
  }
}
```

If you implement a method with the same name, your custom method overrides the generated default behavior.

### Restrict default routes

If you do not want to expose the full default route set, use `routes.only` or `routes.exclude`.

```typescript
@Crud<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
  routes: {
    only: ['list', 'detail', 'create'],
  },
})
```

This is useful for “read-only” resources or back-office modules that intentionally expose only part of the CRUD surface.

## Functional routing mode

If your project uses functional APIs instead of class-based controllers, use `defineCrudRoutes()` from `@midwayjs/crud/functional`.

### Minimal example

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

### Combine CRUD with custom actions

The most useful pattern in functional mode is merging generated CRUD routes and custom actions in the same `defineApi()` block:

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

This keeps standard resource actions and business-specific actions together in the same resource route group.

## Query protocol

The list endpoint uses a shared query protocol. This is one of the most important capabilities in the component.

### Supported query parameters

- `page=<number>`
- `limit=<number>`
- `sort=<field>:<ASC|DESC>` (repeatable)
- `filter=<field>||<operator>||<value>` (repeatable)
- `search=<keyword>`
- `join=<relation>` (repeatable)
- `fields=<field1,field2,...>`

Example:

```text
GET /users?page=1&limit=20&sort=createdAt:DESC&filter=status||eq||active&search=harry&join=profile
```

### Supported filter operators

The first phase supports:

- `eq`
- `ne`
- `gt`
- `gte`
- `lt`
- `lte`
- `in`
- `like`

### Query constraints

These constraints are intentional. They exist to keep resource APIs predictable and safe:

- `sort` fields must be in the `sortable` whitelist
- `filter` fields must be in the `filterable` whitelist
- `search` only applies to the `searchable` whitelist
- `join` must be in the `join` whitelist
- `join` only supports one relation level in the first phase, so `profile.company` is rejected

In other words, the client cannot freely build arbitrary database queries. You explicitly declare what each resource is allowed to expose.

### Declare query capability in `@Crud()`

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

Once declared, query behavior follows that whitelist.

## Response shape

The list API returns a stable pagination object instead of a raw array.

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

This gives frontend code a consistent shape across different resources.

Other default response rules:

- `detail` returns a single resource
- `create` returns the created resource
- `update` returns the updated resource
- `delete` returns `204 No Content` by default

## DTO, validation, and swagger

CRUD routes try to reuse existing Midway components instead of inventing a separate metadata system.

### DTO binding

You can declare:

- `dto.create`
- `dto.update`
- `dto.replace`
- `dto.query`

For example:

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

If your project has `@midwayjs/validation` (or a compatible validation service) enabled:

- `dto.create` validates create request bodies
- `dto.update` validates update request bodies
- `dto.replace` validates replace request bodies
- `dto.query` validates list query parameters

If validation is not installed, CRUD does not hard fail. It just skips automatic validation.

### Swagger

Generated CRUD routes are attached to the normal Midway web metadata pipeline, so the Swagger component can discover them.

That means:

- generated CRUD routes show up in Swagger
- basic path / query / body / response metadata is added automatically

So for straightforward resource endpoints, you do not need to manually repeat the same swagger decorators for every route.

## Soft delete

The default delete behavior is **hard delete**.

If a resource should use soft delete, enable it explicitly:

```typescript
@Crud<UserEntity>({
  model: UserEntity,
  service: UserCrudService,
  delete: {
    mode: 'soft',
  },
})
```

When enabled:

- `DELETE /:id` uses soft delete
- `list` / `detail` exclude soft-deleted data by default
- if the adapter or entity does not support soft delete, CRUD throws an explicit error

### Why soft delete is not the default

Because soft delete is not universally correct:

- it changes unique-key behavior
- it changes query logic
- it changes indexing concerns
- it changes back-office data handling

So the component uses an explicit opt-in strategy instead of silently switching behavior.

## A more complete class-based example

Here is a more complete example that ties the main pieces together.

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

This gives you:

- a `/users` resource
- standard CRUD routes
- the shared query protocol
- automatic DTO validation (if validation is enabled)
- automatic Swagger discovery
- soft delete behavior

## Subpath exports

The component provides these stable entrypoints:

- `@midwayjs/crud`
- `@midwayjs/crud/typeorm`
- `@midwayjs/crud/mikro`
- `@midwayjs/crud/sequelize`
- `@midwayjs/crud/mongoose`
- `@midwayjs/crud/functional`

Recommended mental model:

- main entry: core types + `@Crud()`
- database subpaths: adapter-specific CRUD services
- `functional`: functional routing adapter

## Final recommendation

If you are using this component for the first time, the best learning order is:

1. Start with service-only mode and treat it as a standard CRUD service
2. Then use `@Crud()` to expose simple resource APIs
3. Finally move to functional mode or richer query configuration

That order makes the boundaries clearer and helps avoid pushing complex business workflows into the generated CRUD layer.
