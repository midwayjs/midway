# Apollo GraphQL

GraphQL 适合需要让前端按需查询字段、聚合多个后端数据源，或者希望用统一查询语言暴露 API 的应用。Midway 通过 `@midwayjs/apollo` 提供基于 Apollo Server 的 GraphQL HTTP 端点，并让 Resolver 直接使用 Midway 的依赖注入和请求上下文。

相关信息：

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ❌    |
| 包含独立日志      | ❌    |

## 安装依赖

Apollo 组件已经内置 Apollo Server、GraphQL、WebSocket 订阅等运行时依赖，不需要额外安装 `@apollo/server` 或 `graphql`。

```bash
$ npm i @midwayjs/apollo@4 --save
```

如果使用 Koa 或 Express，还需要安装对应 Web 框架组件：

```bash
$ npm i @midwayjs/koa@4 --save
# 或者
$ npm i @midwayjs/express@4 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/apollo": "^4.0.0",
    "@midwayjs/koa": "^4.0.0"
  }
}
```

## 开启组件

在 `src/configuration.ts` 中导入 Apollo 组件和一个 Web 框架组件。

```typescript
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as apollo from '@midwayjs/apollo';

@Configuration({
  imports: [
    koa,
    apollo,
  ],
})
export class MainConfiguration {}
```

组件默认会把 GraphQL 端点挂载到 `/graphql`，默认支持 `GET` 和 `POST` 请求。

## 最小示例

在 `src/config/config.default.ts` 中配置 GraphQL Schema 和 Resolver。

```typescript
export const apollo = {
  path: '/graphql',
  typeDefs: `
    type Query {
      hello: String!
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'hello midway',
    },
  },
};
```

启动应用后，请求 `/graphql`。

```bash
$ curl -X POST http://127.0.0.1:7001/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"{ hello }"}'
```

返回：

```json
{
  "data": {
    "hello": "hello midway"
  }
}
```

开发环境下，也可以直接在浏览器访问 `/graphql` 打开 GraphiQL 调试页面。

## 使用 Schema 文件

当 Schema 较多时，推荐把 SDL 放到 `.graphql` 文件中，再通过 `typePaths` 加载。

```graphql
# src/graphql/schema.graphql
type Query {
  user(id: ID!): User
}

type Mutation {
  updateUserName(id: ID!, name: String!): User
}

type User {
  id: ID!
  name: String!
}
```

配置文件中使用 `typePaths`。

```typescript
export const apollo = {
  path: '/graphql',
  typePaths: ['./graphql/**/*.graphql'],
};
```

`typePaths` 中的相对路径会从应用的 `baseDir` 开始解析，既支持精确文件路径，也支持 glob 表达式。你也可以同时配置 `typeDefs` 和 `typePaths`，组件会在启动时合并。

## Resolver Map

你可以直接在配置里写 Apollo Resolver Map。

```typescript
import { UserService } from '../service/user';

export const apollo = {
  typeDefs: `
    type Query {
      userName(id: ID!): String
    }

    type Mutation {
      updateUserName(id: ID!, name: String!): String
    }
  `,
  resolvers: {
    Query: {
      userName: async (_parent, args, context) => {
        const userService = await context.requestContext.getAsync(UserService);
        const user = await userService.findById(args.id);
        return user?.name;
      },
    },
    Mutation: {
      updateUserName: async (_parent, args, context) => {
        const userService = await context.requestContext.getAsync(UserService);
        const user = await userService.updateName(args.id, args.name);
        return user.name;
      },
    },
  },
};
```

Resolver 的第三个参数就是当前 Midway 请求上下文，不需要再从 `context.ctx` 解包。Koa 场景下，`context` 是 Midway 增强后的 Koa ctx；Express 场景下，`context` 是 Midway 增强后的 Express request/context。

Midway 会在上下文上挂载 `requestContext`、`logger`、`getLogger()`、`setAttr()`、`getAttr()` 和 `getApp()`。

## Resolver 类

也可以使用 Resolver 类来获得更自然的依赖注入体验。相关装饰器可以直接从 `@midwayjs/apollo` 中引入。

```typescript
import { Inject } from '@midwayjs/core';
import { Args, Context, Mutation, Query, Resolver } from '@midwayjs/apollo';
import { UserService } from '../service/user';

@Resolver()
export class UserResolver {
  @Inject()
  userService: UserService;

  @Query('userName')
  async userName(@Args('id') id: string, @Context() context) {
    context.logger.info('query user %s', id);
    const user = await this.userService.findById(id);
    return user?.name;
  }

  @Mutation('updateUserName')
  async updateUserName(@Args('id') id: string, @Args('name') name: string) {
    const user = await this.userService.updateName(id, name);
    return user.name;
  }
}
```

Resolver 类会由 Midway 容器托管，支持 `@Inject()` 和请求级依赖。组件会自动发现使用 `@Resolver()` 标记的类，也可以通过 `resolverClasses` 显式传入。

```typescript
import { UserResolver } from '../resolver/user';

export const apollo = {
  typePaths: ['./graphql/**/*.graphql'],
  resolverClasses: [UserResolver],
};
```

可用的 Resolver 装饰器包括：

| 装饰器            | 说明                     |
| ----------------- | ------------------------ |
| `@Resolver()`     | 标记一个 Resolver 类     |
| `@Query()`        | 标记 Query 字段          |
| `@Mutation()`     | 标记 Mutation 字段       |
| `@Subscription()` | 标记 Subscription 字段   |

可用的参数装饰器包括：

| 装饰器       | 说明                     |
| ------------ | ------------------------ |
| `@Parent()`  | 获取父级 Resolver 返回值 |
| `@Args()`    | 获取 GraphQL 参数        |
| `@Context()` | 获取 Midway 请求上下文   |
| `@Info()`    | 获取 GraphQL resolve info |

不传参数时会注入完整对象，传入字段名时只注入对应字段，例如 `@Args('id')`。

## 扩展 Context

可以通过 `contextFactory` 给每次 GraphQL 请求补充字段。

```typescript
export const apollo = {
  typeDefs,
  resolvers,
  contextFactory: async context => {
    return {
      currentUserId: context.headers['x-user-id'],
    };
  },
};
```

随后在 Resolver 中读取：

```typescript
const userId = context.currentUserId;
```

内置字段如 `requestContext`、`logger`、`getLogger`、`setAttr`、`getAttr` 和 `getApp` 会被保留，不建议覆盖。

## GraphiQL

开发环境默认开启 GraphiQL。浏览器访问 `/graphql` 时会显示 GraphiQL 页面，生产环境默认关闭。

```typescript
export const apollo = {
  graphiql: true,
};
```

可以显式关闭：

```typescript
export const apollo = {
  graphiql: false,
};
```

也可以定制页面标题和请求地址：

```typescript
export const apollo = {
  graphiql: {
    title: 'My GraphQL Console',
    endpoint: '/graphql',
  },
};
```

## 订阅

组件支持 `graphql-ws` 协议的 GraphQL Subscription。默认关闭，需要在配置中开启。

```typescript
export const apollo = {
  path: '/graphql',
  subscriptions: true,
  typeDefs: `
    type Query {
      hello: String!
    }

    type Subscription {
      counter: Int!
    }
  `,
};
```

Resolver 方法需要返回 `AsyncIterable`。

```typescript
import { Resolver, Subscription } from '@midwayjs/apollo';

@Resolver()
export class CounterResolver {
  @Subscription('counter')
  async *counter() {
    yield {
      counter: 1,
    };
  }
}
```

开启后，WebSocket 地址默认和 HTTP GraphQL 地址一致，例如 `ws://127.0.0.1:7001/graphql`。也可以单独指定订阅路径。

```typescript
export const apollo = {
  path: '/graphql',
  subscriptions: {
    path: '/graphql',
    connectionInitWaitTimeout: 3000,
  },
};
```

客户端需要使用 `graphql-ws` 协议连接。

```typescript
import { createClient } from 'graphql-ws';

const client = createClient({
  url: 'ws://127.0.0.1:7001/graphql',
});

client.subscribe(
  {
    query: 'subscription { counter }',
  },
  {
    next: data => {
      console.log(data);
    },
    error: err => {
      console.error(err);
    },
    complete: () => {},
  }
);
```

## HTTP 行为

默认只处理 `GET` 和 `POST` 请求。其他方法请求 GraphQL 路径会返回 `405 Method Not Allowed`。

```typescript
export const apollo = {
  methods: ['POST'],
};
```

如果修改了 GraphQL 路径，HTTP 和订阅默认都会使用新的路径。

```typescript
export const apollo = {
  path: '/api/graphql',
};
```

## Apollo Server 配置

Apollo Server 专属配置放在 `apollo.apollo` 下，避免和通用 GraphQL 字段混在一起。

```typescript
export const apollo = {
  typeDefs,
  resolvers,
  apollo: {
    introspection: true,
    plugins: [],
  },
};
```

常见配置如下：

| 配置项           | 说明                                      |
| ---------------- | ----------------------------------------- |
| `path`           | GraphQL HTTP 路径，默认为 `/graphql`      |
| `methods`        | 允许的 HTTP 方法，默认为 `['GET', 'POST']` |
| `typeDefs`       | 内联 GraphQL SDL                          |
| `typePaths`      | `.graphql` 文件路径或 glob 表达式         |
| `resolvers`      | Apollo Resolver Map                       |
| `resolverClasses` | Midway Resolver 类列表                   |
| `contextFactory` | 扩展每次请求的 GraphQL context            |
| `graphiql`       | GraphiQL 开关或配置                       |
| `subscriptions`  | GraphQL WebSocket 订阅开关或配置          |
| `apollo`         | 透传给 Apollo Server 的配置               |

## 生产建议

生产环境建议显式关闭 GraphiQL，并根据安全要求决定是否开启 introspection。

```typescript
export const apollo = {
  graphiql: false,
  apollo: {
    introspection: false,
  },
};
```

如果需要文件上传，推荐先通过 GraphQL 获取上传凭证，再由客户端直接上传到 OSS、S3 等对象存储。GraphQL multipart upload 不作为组件默认能力开启。
