# Apollo GraphQL

GraphQL is useful when clients need to query only the fields they need, aggregate multiple backend data sources, or expose APIs through a unified query language. Midway provides Apollo Server based GraphQL HTTP endpoints through `@midwayjs/apollo`, while keeping resolvers integrated with Midway dependency injection and request context.

Related information:

| Description            |      |
| ---------------------- | ---- |
| Available for standard projects | ✅    |
| Available for Serverless        | ❌    |
| Available for integrated apps   | ✅    |
| Contains independent main framework | ❌    |
| Contains independent logs       | ❌    |

## Install dependencies

The Apollo component includes the Apollo Server and GraphQL runtime dependencies.

```bash
$ npm i @midwayjs/apollo@4 --save
```

If you use Koa or Express, install the matching web framework component:

```bash
$ npm i @midwayjs/koa@4 --save
# or
$ npm i @midwayjs/express@4 --save
```

Or add the dependencies to `package.json` and reinstall.

```json
{
  "dependencies": {
    "@midwayjs/apollo": "^4.0.0",
    "@midwayjs/koa": "^4.0.0"
  }
}
```

## Enable component

Import Apollo and one web framework component in `src/configuration.ts`.

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

## Minimal Example

Configure Apollo in `src/config/config.default.ts`.

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

Send a query to `/graphql`:

```graphql
query {
  hello
}
```

Response:

```json
{
  "data": {
    "hello": "hello midway"
  }
}
```

## Use Midway Context

The third resolver argument is the active Midway request context itself. You do not need to unwrap `context.ctx`. Use `context.requestContext` directly for request-scoped dependencies.

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

In Koa, `context` is the Midway-augmented Koa ctx. In Express, it is the Midway-augmented Express request/context. Midway attaches `requestContext`, `logger`, `getLogger()`, `setAttr()`, `getAttr()`, and `getApp()`.

## Resolver Classes

`@midwayjs/apollo` re-exports GraphQL resolver decorators, so you can import them directly from the Apollo component.

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

Available parameter decorators:

| Decorator    | Description                         |
| ------------ | ----------------------------------- |
| `@Parent()`  | Injects the parent resolver value   |
| `@Args()`    | Injects GraphQL arguments           |
| `@Context()` | Injects the Midway request context  |
| `@Info()`    | Injects GraphQL resolve info        |

Without a field name, the full object is injected. With a field name, only that field is injected, for example `@Args('id')`.

## Subscriptions

The component supports GraphQL Subscription through the `graphql-ws` protocol. It is disabled by default and can be enabled in config.

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

Resolver methods must return an `AsyncIterable`.

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

When enabled, the WebSocket endpoint defaults to the same path as the HTTP GraphQL endpoint, for example `ws://127.0.0.1:7001/graphql`. You can also configure a dedicated subscription path.

```typescript
export const apollo = {
  path: '/graphql',
  subscriptions: {
    path: '/graphql',
    connectionInitWaitTimeout: 3000,
  },
};
```

## Use Schema Files

You can configure `typePaths` to load `.graphql` files instead of writing all schema definitions inline in `typeDefs`.

```typescript
export const apollo = {
  path: '/graphql',
  typePaths: ['./schema.graphql', './graphql/**/*.graphql'],
};
```

Relative paths in `typePaths` are resolved from the application `baseDir`. Both exact file paths and glob patterns are supported. You can also use `typeDefs` and `typePaths` together; the component merges them during startup.

## Apollo Options

Apollo Server specific options live under `apollo.apollo` so they do not mix with shared GraphQL fields.

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

GraphiQL is enabled by default in development. Visiting `/graphql` in a browser opens the GraphiQL page. It is disabled by default in production.

```typescript
export const apollo = {
  graphiql: true,
};
```

You can disable it explicitly:

```typescript
export const apollo = {
  graphiql: false,
};
```

## HTTP Behavior

By default, only `GET` and `POST` requests are handled. Other methods sent to the GraphQL path return `405 Method Not Allowed`.

```typescript
export const apollo = {
  methods: ['POST'],
};
```

## Extend Context

Use `contextFactory` to add fields for each GraphQL request.

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

Then read it in resolvers:

```typescript
const userId = context.currentUserId;
```

Built-in fields such as `requestContext`, `logger`, and `getApp` are reserved and should not be overwritten.
