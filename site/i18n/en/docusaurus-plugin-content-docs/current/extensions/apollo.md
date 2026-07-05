# Apollo GraphQL

GraphQL is useful when clients need to query only the fields they need, aggregate multiple backend data sources, or expose APIs through a unified query language. Midway provides Apollo Server based GraphQL HTTP endpoints through `@midwayjs/apollo`, while keeping resolvers integrated with Midway dependency injection and request context.

Related information:

| Description                         |      |
| ----------------------------------- | ---- |
| Available for standard projects     | ✅    |
| Available for Serverless            | ❌    |
| Available for integrated apps       | ✅    |
| Contains independent main framework | ❌    |
| Contains independent logs           | ❌    |

## Install Dependencies

The Apollo component includes Apollo Server, GraphQL, and WebSocket subscription runtime dependencies. You do not need to install `@apollo/server` or `graphql` separately.

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

## Enable Component

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

The component mounts the GraphQL endpoint at `/graphql` by default and accepts `GET` and `POST` requests by default.

## Minimal Example

Configure GraphQL schema and resolvers in `src/config/config.default.ts`.

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

After the application starts, request `/graphql`.

```bash
$ curl -X POST http://127.0.0.1:7001/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"{ hello }"}'
```

Response:

```json
{
  "data": {
    "hello": "hello midway"
  }
}
```

In development, you can also open `/graphql` in a browser to use GraphiQL.

## Use Schema Files

When the schema grows, place SDL in `.graphql` files and load them with `typePaths`.

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

Use `typePaths` in config.

```typescript
export const apollo = {
  path: '/graphql',
  typePaths: ['./graphql/**/*.graphql'],
};
```

Relative paths in `typePaths` are resolved from the application `baseDir`. Both exact file paths and glob patterns are supported. You can also use `typeDefs` and `typePaths` together; the component merges them during startup.

## Resolver Map

You can write an Apollo resolver map directly in config.

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

The third resolver argument is the active Midway request context itself. You do not need to unwrap `context.ctx`. In Koa, `context` is the Midway-augmented Koa ctx. In Express, it is the Midway-augmented Express request/context.

Midway attaches `requestContext`, `logger`, `getLogger()`, `setAttr()`, `getAttr()`, and `getApp()` to the context.

## Resolver Classes

You can also use resolver classes for a more natural dependency injection experience. Import GraphQL decorators directly from `@midwayjs/apollo`.

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

Resolver classes are managed by the Midway container and support `@Inject()` and request-scoped dependencies. The component automatically discovers classes marked with `@Resolver()`. You can also pass them explicitly through `resolverClasses`.

```typescript
import { UserResolver } from '../resolver/user';

export const apollo = {
  typePaths: ['./graphql/**/*.graphql'],
  resolverClasses: [UserResolver],
};
```

Available resolver decorators:

| Decorator         | Description                        |
| ----------------- | ---------------------------------- |
| `@Resolver()`     | Marks a resolver class             |
| `@Query()`        | Marks a Query field                |
| `@Mutation()`     | Marks a Mutation field             |
| `@Subscription()` | Marks a Subscription field         |

Available parameter decorators:

| Decorator    | Description                       |
| ------------ | --------------------------------- |
| `@Parent()`  | Injects the parent resolver value |
| `@Args()`    | Injects GraphQL arguments         |
| `@Context()` | Injects the Midway request context |
| `@Info()`    | Injects GraphQL resolve info      |

Without a field name, the full object is injected. With a field name, only that field is injected, for example `@Args('id')`.

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

Built-in fields such as `requestContext`, `logger`, `getLogger`, `setAttr`, `getAttr`, and `getApp` are reserved and should not be overwritten.

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

You can also customize the page title and request endpoint.

```typescript
export const apollo = {
  graphiql: {
    title: 'My GraphQL Console',
    endpoint: '/graphql',
  },
};
```

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

Clients need to connect with the `graphql-ws` protocol.

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

## HTTP Behavior

By default, only `GET` and `POST` requests are handled. Other methods sent to the GraphQL path return `405 Method Not Allowed`.

```typescript
export const apollo = {
  methods: ['POST'],
};
```

If you change the GraphQL path, both HTTP and subscriptions use the new path by default.

```typescript
export const apollo = {
  path: '/api/graphql',
};
```

## Apollo Server Options

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

Common options:

| Option            | Description                                  |
| ----------------- | -------------------------------------------- |
| `path`            | GraphQL HTTP path, defaults to `/graphql`    |
| `methods`         | Allowed HTTP methods, defaults to `['GET', 'POST']` |
| `typeDefs`        | Inline GraphQL SDL                           |
| `typePaths`       | `.graphql` file paths or glob patterns       |
| `resolvers`       | Apollo resolver map                          |
| `resolverClasses` | Midway resolver class list                   |
| `contextFactory`  | Extends GraphQL context for each request     |
| `graphiql`        | GraphiQL switch or options                   |
| `subscriptions`   | GraphQL WebSocket subscription switch or options |
| `apollo`          | Options passed to Apollo Server              |

## Production Recommendations

In production, explicitly disable GraphiQL and decide whether to enable introspection based on your security requirements.

```typescript
export const apollo = {
  graphiql: false,
  apollo: {
    introspection: false,
  },
};
```

For file uploads, prefer returning upload credentials from GraphQL and uploading directly from the client to OSS, S3, or another object storage service. GraphQL multipart upload is not enabled by default in this component.
