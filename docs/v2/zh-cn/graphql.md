---
title: GraphQL
---

## 概述

[Apollo-Server-Midway](https://github.com/linbudu599/apollo-server-midway) 基于 [Apollo Server V3](https://www.apollographql.com/docs/apollo-server) 构建，它使得你可以在 Midway && Midway Serverless 应用 中使用 Apollo-Server 作为 GraphQL 请求处理层，因此，你现在可以使用 MidwayJS 构建 GraphQL API 甚至是 GraphQL FaaS 应用了。

- 在 Midway Serverless 中，Apollo-Server-Midway 通过将 Apollo-Server 作为一个 GraphQL 专有的响应处理器来工作，同时内置了 [TypeGraphQL](https://typegraphql.com/) 支持来配合 MidwayJS 的装饰器体系（TypeGraphQL 使用 TypeScript 的 Class 以及装饰器声明 GraphQL Schema 以及 GraphQL Resolvers 等一系列能力）。
- 在 Midway Node 应用中，它主要通过将 Apollo-Server 作为一个仅针对 GraphQL API 路径（如`/graphql`）的中间件进行工作，所以你可以同时构建 RESTFul API 与 GraphQL API，不同的基座框架需要使用不同的中间件，在不同的框架下也对应了不同版本的 Apollo-Server 集成（如 Apollo-Server-Koa、Apollo-Server-Express）。
- 这两部分都对 TypeGraphQL 做了内置支持，但你同样可以仅使用 Apollo-Server 的能力，如从外部传入 GraphQL Schema，以及使用 Apollo Server 内置的能力来实现 GraphQL Resolver。在这种情况下，TypeGraphQL 的选项将被忽略。
- 在 Node 应用中，实际上更推荐使用自定义的 GraphQL 中间件，而不是使用框架内置。
  - 对于框架内置的版本，你无法直观的控制被包含在 GraphQL Context 中的数据，而是只能在 config 下单独定义一些不具有外部依赖的数据，对于依赖应用上下文、请求上下文或者其他注入进来的数据则束手无策。
  - 使用自定义的 GraphQL 中间件，你可以进行更加灵活的逻辑定制，包括但不限于 Apollo Server Plugin、GraphQL Context 以及 TypeGraphQL AuthChecker 等等。
  - Apollo-Server-Midway 的重心在于提供 Midway Serverless 下低成本接入 GraphQL 的能力，对于 Node 应用的支持只是附带，同时，由于 Node 应用中可能存在各种可能的定制需求，在框架层定制同样不现实。
  - 参考下方 定制 GraphQL 中间件 一节了解更多。

## Serverless 应用

大致的使用流程如下：

```typescript
import {
  Provide,
  Inject,
  ServerlessTrigger,
  ServerlessFunction,
  ServerlessTriggerType,
  App,
} from '@midwayjs/decorator';
import { Context, IMidwayFaaSApplication } from '@midwayjs/faas';
import { createApolloServerHandler } from 'apollo-server-midway';
import { SampleResolver } from '../resolvers/sample.resolver';
import { DogResolver } from '../resolvers/dog.resolver';
import path from 'path';

const apolloHandlerFuncName = 'apollo-handler';

const APOLLO_SERVER_MIDWAY_PATH = '/apollo';

@Provide()
export class HelloHTTPService {
  @Inject()
  ctx: Context;

  @App()
  app: IMidwayFaaSApplication;

  @ServerlessFunction({
    functionName: apolloHandlerFuncName,
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: APOLLO_SERVER_MIDWAY_PATH,
    method: 'get',
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: APOLLO_SERVER_MIDWAY_PATH,
    method: 'post',
  })
  async apolloHandler() {
    return await createApolloServerHandler({
      path: '/',
      app: this.app,
      context: this.ctx,
      schema: {
        resolvers: [SampleResolver, DogResolver],
      },
    });
  }
}
```

我们分几个部分讲解：

- 首先，推荐在函数上同时指定 GET 与 POST 方法触发器，并配置相同的路径。这一行为是为了允许你通过 GET 方法在本地开发中访问 [GraphQL Playground](https://github.com/graphql/graphql-playground)（一个 GraphQL IDE）（在生产环境下将被禁用，可以通过 `prodPlayground` 选项来在生产环境下启用，但不推荐这么做），并使用 POST 方法作为 API 的真正承接。
- 函数路径（`ServerlessTrigger`中的`path`）与 GraphQL API 路径（`createApolloServerHandler`选项中的`path`）是并存的，在上面的例子中，可以通过 `/apollo-handler/` 访问 GraphQL API，即 函数名（函数路径）/。如果配置 GraphQL Path 为 `/graphql`，则访问地址为 `/apollo-handler/graphql`。
- 关于可用选项参考最后的部分，注意，如果 `options.apollo.schema` 被指定，那么 `options.schema` 将被忽略。
  - options.apollo：Apollo Server 的初始化参数
  - options.schema：TypeGraphQL buildSchemaSync 参数

## Node 应用

Node 应用需要使用框架对应的中间件，整体代码会被以 Midway Component 的形式加载，如在 Koa 应用中，需要这么做：

```typescript
// config.default.ts
import { SampleResolver } from '../resolvers/sample.resolver';
import { CreateGraphQLMiddlewareOption } from 'apollo-server-midway';

export const graphql: CreateGraphQLMiddlewareOption = {
  schema: {
    resolvers: [SampleResolver],
  },
};

// configuration.ts
import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwayKoaApplication } from '@midwayjs/koa';
import * as GraphQL from 'apollo-server-midway';

@Configuration({
  imports: [GraphQL],
  importConfigs: ['./config'],
})
export class ContainerConfiguration implements ILifeCycle {
  @App()
  app: IMidwayKoaApplication;

  async onReady(): Promise<void> {
    this.app.use(
      // Express 下的命名空间：graphql:GraphQLExpressMiddleware
      await this.app.generateMiddleware('graphql:GraphQLKoaMiddleware')
    );
  }
}
```

在 Express 应用中， 将其换成 `graphql:GraphQLExpressMiddleware` 即可。

> 目前仅有 Koa / Express 支持。

上面展示了通过 `config.default.ts` 注入配置的能力，你也可以通过 `@Config` 的方式将配置注入到 `ContainerConfiguration` 类中进行配置。
​

​

## 定制 GraphQL 中间件

定制 GraphQL 中间件的成本实际上非常低的，不到 100 行代码即可实现：

> 示例参考 [koa-app-sample](https://github.com/LinbuduLab/apollo-server-midway/blob/main/packages/koa-app-sample/src/middlewares/extend.ts)​

以下示例以 Koa 为例
​

首先定义中间件

```typescript
import { Provide, Config, App } from '@midwayjs/decorator';
import { IWebMiddleware, IMidwayKoaApplication, IMidwayKoaContext, IMidwayKoaNext } from '@midwayjs/koa';

import { ApolloServer, ServerRegistration } from 'apollo-server-koa';
import { buildSchemaSync } from 'type-graphql';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';

import { SampleResolver } from '../resolvers/sample.resolver';

@Provide('extend:GraphQLKoaMiddleware')
export class GraphQLMiddleware implements IWebMiddleware {
  @Config('apollo')
  config: ServerRegistration;

  @App()
  app: IMidwayKoaApplication;

  resolve() {
    return async (_ctx: IMidwayKoaContext, next: IMidwayKoaNext) => {
      const container = this.app.getApplicationContext();

      const schema = buildSchemaSync({
        resolvers: [SampleResolver],
        // 直接传入 container，意味着使用应用上下文作为容器
        // container,
        // 从 Apollo Context 中获取 container ，意味着使用请求上下文作为容器
        container: ({ context }: ResolverData<{ container: IMidwayContainer }>) => context.container,
        emitSchemaFile: 'schema.graphql',
      });

      const server = new ApolloServer({
        schema,
        // 这里的 ctx 实际上是被 Midway 处理过的，所以你可以拿到 requestContext
        context: ({ ctx }: { ctx: IMidwayKoaContext }) => {
          return {
            // 返回请求上下文容器供 TypeGraphQL 使用
            container: ctx.requestContext,
            // 返回请求上下文供 Resolver 中使用
            reqCtx: ctx,
          };
        },
        plugins: [
          ['production'].includes(process.env.NODE_ENV) || process.env.DISABLE_PLAYGROUND
            ? ApolloServerPluginLandingPageDisabled()
            : ApolloServerPluginLandingPageGraphQLPlayground({
                settings: {
                  // playground settings
                },
              }),
        ],
      });
      await server.start();

      server.applyMiddleware({
        app: this.app,
        ...this.config,
      });

      await next();
    };
  }
}
```

可以看到这里的逻辑其实是很简单的，与框架内置不同的是定制了 GraphQL Context，包含应用上下文与请求上下文。**另外，需要注意的是，这里的 **`**Context**`** 需要使用函数，来确保每次请求来时能保持更新，尤其是当你需要使用请求上下文信息如 cookie、headers 等时。**
在 Resolver 中你就可以拿到关联请求上下文的信息了：

```typescript
import { IMidwayContainer } from '@midwayjs/core';
import { Provide, Inject, App } from '@midwayjs/decorator';
import { IMidwayKoaContext } from '@midwayjs/koa';
import { Resolver, Query, Ctx } from 'type-graphql';

import { SampleType } from '../graphql/sample.type';

interface IContext {
  container: IMidwayContainer;
  reqCtx: IMidwayKoaContext;
}

@Provide()
@Resolver((type) => SampleType)
export class SampleResolver {
  @Query((type) => SampleType)
  QueryApplicationContext(@Ctx() ctx: IContext): SampleType {
    console.log(ctx.reqCtx.header['authorization']);
    return {
      SampleField: 'SampleField',
      Child: {
        ChildField: 'ChildField',
      },
    };
  }
}
```

加载方式仍然保持一致：

```typescript
import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { IMidwayKoaApplication } from '@midwayjs/koa';

@Configuration({
  importConfigs: ['./config'],
})
export class ContainerConfiguration implements ILifeCycle {
  @App()
  app: IMidwayKoaApplication;

  async onReady(container: IMidwayContainer): Promise<void> {
    this.app.use(
      // Use extend middleware
      await this.app.generateMiddleware('extend:GraphQLKoaMiddleware')
    );
  }

  async onStop(): Promise<void> {}
}
```

## 注意事项

​

- TypeGraphQL 支持使用外部 IoC 容器，因此你可以在 Resolver Class 中自然的使用 Midway 的依赖注入体系，但请确保使 `Resolver` 类中使用了 `Provide` 装饰器。在 Serverless 中， 容器来自于请求上下文，即`context.requestContext`，而在 Node 应用中，容器来自于应用上下文，即 `app.getApplicationContext`。
- 你也可以使用 `resolvers: [path.resolve(this.app.getBaseDir(), "resolvers/*")]` 的形式一次性加载所有指定目录下的 resolver，但注意的是，请关闭 `tsconfig.json` 中的 `declaration` `inlineSourceMap` `sourceMap` 选项，避免 `.d.ts` 与 `.js.map` 文件以及 `inlineSourceMap` 被错误的进行读取而导致报错。
  - 对于集团内部用户，由于 FaaS 默认的构建器强制要求 sourceMap 启用，你可以直接导入 Resolver 类或使用 `resolvers/${ process.env.NODE_ENV === 'development' ? '*.ts' : '*.js' }` 加载。

​

## 自动生成 TypeGraphQL 类型定义

对于从 RESTFul API 迁移，或已有确定的接口文件格式，你可以使用 [json-type-graphql](https://github.com/LinbuduLab/json-to-type-graphql) 这个库（与 Apollo-Server-Midway 是同一个作者）来进行一些自动化的代码生成，最简单的使用如图所示：
​

```typescript
import transformer from 'json-type-graphql';
import path from 'path';

(async () => {
  await transformer({
    reader: {
      url: 'http://127.0.0.1:7001/',
    },
    writter: {
      outputPath: path.join(__dirname, './generated.ts'),
    },
  });
})();
```

​

以上代码会生成这样一个文件：

```typescript
import { ObjectType, Field, Int, ID } from 'type-graphql';

@ObjectType()
export class Root {
  @Field()
  success!: boolean;

  @Field()
  message!: string;
}
```

​

目前，json-to-type-graphql 提供了以下能力：
​

- 使用对象、JSON 文件或者是 URL 作为数据源
- 支持自定义的预处理器（pre-processer）、后处理器（post-processer）来 hook 进入执行逻辑内部
- 支持嵌套的对象，以及数组入口的 JSON（如 `[{},{}]`）
- 支持对具有父子关系的 Class 进行排序，如`P-C1-C11-C12-C2-C21-C3-C31`.
- 支持 Class 名的前缀与后缀配置，支持 TypeGraphQL `@Field()` 装饰器的 ReturnType

​

​

如果你在使用 Prisma 作为 ORM，你也可以使用 [typegraphql-prisma](https://github.com/MichalLytek/typegraphql-prisma) 这个库（来自于 TypeGraphQL 作者）来从 Prisma Schema 生成 TypeGraphQL Class、Resolver。

## 配置

### Serverless

- `context`： 必传，使用 FaaS Context 即可。
- `path`：GraphQL API 路径，默认为`/graphql`。
- `app`：FaaS 应用实例。
- `prodPlayground`：即便在生产环境也开启 GraphQL Playground，同时会开启 `introspection` 选项。
- `appendFaaSContext`：将 FaaS 上下文也注入到 GraphQL Context 中，可通过 TypeGraphQL `@Ctx` 装饰器获取。
- `builtInPlugins`：见 内置插件定义。
- `apollo`：支持的 Apollo Server 选项，参考类型定义。
- `schema`：支持的 TypeGraphQL buildSchemaSync 选项，参考类型定义。
- `disableHealthCheck`：禁用 Apollo Server 内置的 Health Check。
- `onHealthCheck`：自定义 Apollo Server 内置的 Health Check 行为。
- `disableHealthResolver`：禁用内置 的 Health Check Resolver。

### Node

- `path`：GraphQL API 路径，默认为`/graphql`。
- `prodPlayground`：即便在生产环境也开启 GraphQL Playground，同时会开启 `introspection` 选项。
- `appendApplicationContext`：将应用上下文也注入到 GraphQL Context 中，可通过 TypeGraphQL `@Ctx` 装饰器获取。
- `builtInPlugins`：见 内置的插件选项。
- `apollo`：支持的 Apollo Server 选项。
- `schema`：支持的 TypeGraphQL buildSchemaSync 选项。
- `disableHealthCheck`：禁用 Apollo Server 内置的 Health Check。
- `onHealthCheck`：自定义 Apollo Server 内置的 Health Check 行为，Koa 与 Express 下的具体入参不同。
- `cors`：在 Koa 下等同于 `@koa/cors` 配置，在 Express 下等同于 `cors` 配置。
- `bodyParserConfig`：在 Koa 下等同于 `koa-bodyparser` 配置，在 Express 下等同于 `body-parser` 配置。

### 内置插件

- `resolveTime` 将请求消耗的时间在 GraphQL Extensions 中返回
  - `enabled`：是否启用
- `queryComplexity` 检查 GraphQL Query 的复杂度
  - `enable`：是否启用
  - `maxComlexity`：最大复杂度
  - `throwOnMaximum`：在超出最大复杂度时，是否抛出错误
- `contextExtension`：将 Midway Container 的信息以及应用上下文信息在 GraphQL Extensions 中返回，用于 DEBUG
  - `enabled`：是否启用
- `printSchema`：将 API 使用的 GraphQL Schema 在 GraphQL Extensions 中返回
  - `enable`：是否启用
  - `sort`：是否进行词法排序（`lexicographicSortSchema`）

​

### 配置类型定义

```typescript
export type UsableApolloOption = Pick<
  ApolloServerConfig,
  | 'persistedQueries'
  | 'plugins'
  | 'context'
  | 'formatError'
  | 'formatResponse'
  | 'rootValue'
  | 'dataSources'
  | 'introspection'
  | 'mocks'
  | 'mockEntireSchema'
  | 'schema'
>;

export type UsableBuildSchemaOption = Pick<
  BuildSchemaOptions,
  'authChecker' | 'authMode' | 'dateScalarMode' | 'globalMiddlewares' | 'nullableByDefault' | 'skipCheck' | 'resolvers'
>;

export type BuiltInPluginConfiguration = {
  /**
   * Enable Apollo-Resolve-Time plugin to report GraphQL resolving time as GraphQL Extension.
   */
  resolveTime?: {
    enable?: boolean;
  };
  /**
   * Enable Apollo-Query-Complexity plugin to report GraphQL query complexity as GraphQL Extension,
   * and reject request when query complexity is greater than configurated.
   */
  queryComplexity?: {
    enable?: boolean;
    maxComlexity?: number;
    throwOnMaximum?: boolean;
  };
  /**
   * Enable plugin to send back `MidwayJS Container` information、Application Context as GraphQL Extension.
   */
  contextExtension?: {
    enable?: boolean;
  };
  /**
   * Enable plugin to send back generated `GraphQL Schema` as GraphQL Extension.
   */
  printSchema?: {
    enable?: boolean;
    sort?: boolean;
  };
};

export type CreateGraphQLMiddlewareOption = {
  /**
   * GraphQL API path
   */
  path?: string;
  /**
   * Enable GraphQL Playground even in production.
   * Requires `apollo.introspection` to be true for working correctly.
   */
  prodPlaygound?: boolean;
  /**
   * Add `Application Context` to GraphQL Context which you can get in GraphQL Resolvers.
   */
  appendApplicationContext?: boolean;
  /**
   * Built-In plugin options.
   */
  builtInPlugins?: BuiltInPluginConfiguration;
  /**
   * Supported ApolloServer options.
   */
  apollo?: UsableApolloOption;
  /**
   * Supported TyepeGraphQL buildSchemaSync options.
   */
  schema?: UsableBuildSchemaOption & Pick<BuildSchemaOptions, 'emitSchemaFile' | 'container'>;
  /**
   * Disable Apollo-Server health check.
   */
  disableHealthCheck?: boolean;
};

export interface CreateKoaGraphQLMiddlewareOption extends CreateGraphQLMiddlewareOption {
  /**
   * CORS options, equal to @koa/cors options.
   */
  cors?: CORSOptions | boolean;
  /**
   * Customize health check handler.
   */
  onHealthCheck?: KoaServerRegistration['onHealthCheck'];
  /**
   * BodyParser options, equal to koa-bodyparser options.
   */
  bodyParserConfig?: BodyParserOptions | boolean;
}

export interface CreateExpressGraphQLMiddlewareOption extends CreateGraphQLMiddlewareOption {
  /**
   * CORS options, equal to cors options.
   */
  cors?: corsMiddleware.CorsOptions | corsMiddleware.CorsOptionsDelegate | boolean;
  /**
   * Customize health check handler.
   */
  onHealthCheck?: ExpressServerRegistration['onHealthCheck'];
  /**
   * BodyParser options, equal to bodyparser options.
   */
  bodyParserConfig?: OptionsJson | boolean;
}

export type CreateApolloHandlerOption = {
  /**
   * Required. FaaS Context.
   */
  context: Context;
  /**
   * GraphQL API path
   */
  path?: string;
  /**
   * FaaS Application.
   */
  app?: IMidwayFaaSApplication;
  /**
   * Enable GraphQL Playground even in production.
   * Requires `apollo.introspection` to be true for working correctly.
   */
  prodPlaygound?: boolean;
  /**
   * Add `FaaS Context` to GraphQL Context which you can get in GraphQL Resolvers.
   */
  appendFaaSContext?: boolean;
  /**
   * Built-In plugin options.
   */
  builtInPlugins?: BuiltInPluginConfiguration;
  /**
   * Supported ApolloServer options.
   */
  apollo?: UsableApolloOption;
  /**
   * Supported TyepeGraphQL buildSchemaSync options.
   */
  schema?: UsableBuildSchemaOption;
  /**
   * Disable Apollo-Server health check.
   */
  disableHealthCheck?: boolean;
  /**
   * Disable Built-In health check resolver.
   */
  disableHealthResolver?: boolean;
  /**
   * Customize health check handler.
   */
  onHealthCheck?: (req: MidwayReq) => Promise<unknown>;
};
```
