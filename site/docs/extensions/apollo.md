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

Apollo 组件已经内置 Apollo Server 和 GraphQL 运行时依赖。

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

## 最小示例

在 `src/config/config.default.ts` 中配置 Apollo。

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

启动后，请求 `/graphql`：

```graphql
query {
  hello
}
```

返回：

```json
{
  "data": {
    "hello": "hello midway"
  }
}
```

## 使用 Midway 上下文

Resolver 的第三个参数就是当前 Midway 请求上下文，不需要再从 `context.ctx` 解包。你可以直接通过 `context.requestContext` 获取请求级依赖。

```typescript
import { UserService } from '../service/user';

export const apollo = {
  typeDefs: `
    type Query {
      userName(id: ID!): String
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
  },
};
```

Koa 场景下，`context` 是 Midway 增强后的 Koa ctx；Express 场景下，`context` 是 Midway 增强后的 Express request/context。Midway 会在上面挂载 `requestContext`、`logger`、`getLogger()`、`setAttr()`、`getAttr()` 和 `getApp()`。

## Resolver 类

`@midwayjs/apollo` 重新导出了 GraphQL Resolver 装饰器，可以直接从 Apollo 组件中引入。

```typescript
import { Inject } from '@midwayjs/core';
import { Args, Context, Query, Resolver } from '@midwayjs/apollo';
import { UserService } from '../service/user';

@Resolver()
export class UserResolver {
  @Inject()
  userService: UserService;

  @Query('userName')
  async userName(@Args('id') id: string, @Context() context) {
    const user = await this.userService.findById(id);
    context.logger.info('query user %s', id);
    return user?.name;
  }
}
```

可用的参数装饰器包括：

| 装饰器       | 说明                    |
| ------------ | ----------------------- |
| `@Parent()`  | 获取父级 resolver 返回值 |
| `@Args()`    | 获取 GraphQL 参数       |
| `@Context()` | 获取 Midway 请求上下文  |
| `@Info()`    | 获取 GraphQL resolve info |

不传参数时会注入完整对象，传入字段名时只注入对应字段，例如 `@Args('id')`。

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

## 使用 Schema 文件

除了直接配置 `typeDefs`，也可以通过 `typePaths` 加载 `.graphql` 文件。

```typescript
export const apollo = {
  path: '/graphql',
  typePaths: ['./schema.graphql', './graphql/**/*.graphql'],
};
```

`typePaths` 中的相对路径会从应用的 `baseDir` 开始解析，既支持精确文件路径，也支持 glob 表达式。你也可以同时配置 `typeDefs` 和 `typePaths`，组件会在启动时合并。

## Apollo 配置

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

## HTTP 行为

默认只处理 `GET` 和 `POST` 请求。其他方法请求 GraphQL 路径会返回 `405 Method Not Allowed`。

```typescript
export const apollo = {
  methods: ['POST'],
};
```

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

内置字段如 `requestContext`、`logger`、`getApp` 会被保留，不建议覆盖。
