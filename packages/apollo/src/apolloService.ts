import { IMidwayContext, Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { ApolloConfigurationOptions } from './interface';
import { MidwayGraphQLContext } from '@midwayjs/graphql';
import { run as glob } from '@midwayjs/glob';
import { isAbsolute, join, relative } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from 'graphql';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';

interface ApolloServerLike {
  start(): Promise<void>;
  stop(): Promise<void>;
  executeOperation(request: any, options?: any): Promise<any>;
}

interface SubscriptionServerLike {
  dispose(): void | Promise<void>;
}

async function readRequestBody(req: any): Promise<any> {
  if (req.body) {
    return req.body;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (!chunks.length) {
    return {};
  }
  const raw = Buffer.concat(chunks).toString();
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error('Invalid JSON request body');
    (error as any).status = 400;
    throw error;
  }
}

function assignContextExtensions(
  ctx: MidwayGraphQLContext,
  config: ApolloConfigurationOptions
) {
  ctx.graphql = {
    ...(ctx.graphql || {}),
    ...(config.graphql || {}),
  };
  return Promise.resolve(config.contextFactory?.(ctx)).then(extensions => {
    if (extensions && typeof extensions === 'object') {
      for (const key of Object.keys(extensions)) {
        if (
          [
            'requestContext',
            'logger',
            'getLogger',
            'setAttr',
            'getAttr',
            'getApp',
          ].includes(key)
        ) {
          continue;
        }
        ctx[key] = extensions[key];
      }
    }
    return ctx;
  });
}

function getRequestPayload(ctx: any, isExpress: boolean) {
  if (ctx.method === 'GET') {
    const query = ctx.query;
    return {
      query: query?.query,
      variables:
        typeof query?.variables === 'string'
          ? JSON.parse(query.variables)
          : query?.variables,
      operationName: query?.operationName,
    };
  }
  if (!isExpress && ctx.request?.body) {
    return ctx.request.body;
  }
  return readRequestBody(isExpress ? ctx : ctx.req);
}

function getHeaderValue(ctx: any, name: string, isExpress: boolean) {
  if (isExpress) {
    return ctx.headers?.[name.toLowerCase()];
  }
  return ctx.get?.(name) || ctx.headers?.[name.toLowerCase()];
}

function setResponseStatus(ctx: any, res: any, isExpress: boolean, status) {
  if (!status) {
    return;
  }
  if (isExpress) {
    res.status(status);
  } else {
    ctx.status = status;
  }
}

function setResponseHeader(
  ctx: any,
  res: any,
  isExpress: boolean,
  name: string,
  value: string
) {
  if (isExpress) {
    res.set(name, value);
  } else {
    ctx.set(name, value);
  }
}

function writeResponse(
  ctx: any,
  res: any,
  isExpress: boolean,
  payload: any,
  status?: number,
  headers?: Headers
) {
  setResponseStatus(ctx, res, isExpress, status);
  headers?.forEach((value, name) => {
    setResponseHeader(ctx, res, isExpress, name, value);
  });
  if (isExpress) {
    res.type('application/json');
    res.send(JSON.stringify(payload));
  } else {
    ctx.type = 'application/json';
    ctx.body = payload;
  }
}

function writeTextResponse(
  ctx: any,
  res: any,
  isExpress: boolean,
  body: string,
  contentType: string,
  status = 200
) {
  setResponseStatus(ctx, res, isExpress, status);
  if (isExpress) {
    res.type(contentType);
    res.send(body);
  } else {
    ctx.type = contentType;
    ctx.body = body;
  }
}

function writeErrorResponse(ctx: any, res: any, isExpress: boolean, err: any) {
  writeResponse(
    ctx,
    res,
    isExpress,
    {
      errors: [
        {
          message: err?.message || 'GraphQL request failed',
        },
      ],
    },
    err?.status || 500
  );
}

function normalizeTypeDefs(typeDefs: unknown) {
  if (!typeDefs) {
    return [];
  }
  return Array.isArray(typeDefs) ? typeDefs : [typeDefs];
}

function resolveSchemaFilePath(baseDir: string, filePath: string) {
  return isAbsolute(filePath) ? filePath : join(baseDir, filePath);
}

function normalizeSchemaPattern(pattern: string) {
  return pattern.replace(/\\/g, '/').replace(/^\.\//, '');
}

function createSchemaPatternRegExp(pattern: string) {
  const normalized = normalizeSchemaPattern(pattern);
  let source = '^';
  for (let index = 0; index < normalized.length; index++) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (char === '*' && next === '*') {
      index++;
      if (normalized[index + 1] === '/') {
        index++;
        source += '(?:.*\\/)?';
      } else {
        source += '.*';
      }
    } else if (char === '*') {
      source += '[^/]*';
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += char.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
    }
  }
  return new RegExp(`${source}$`);
}

function loadTypeDefs(config: ApolloConfigurationOptions, baseDir: string) {
  const typeDefs = normalizeTypeDefs(config.typeDefs);
  const typePaths = config.typePaths || [];

  for (const pattern of typePaths) {
    const schemaFile = resolveSchemaFilePath(baseDir, pattern);
    if (existsSync(schemaFile) && statSync(schemaFile).isFile()) {
      typeDefs.push(readFileSync(schemaFile, 'utf8'));
      continue;
    }

    const patternRegExp = createSchemaPatternRegExp(pattern);
    const files = glob(['**/*.graphql'], {
      cwd: baseDir,
      ignore: ['**/node_modules/**'],
    }).filter(file =>
      patternRegExp.test(relative(baseDir, file).replace(/\\/g, '/'))
    );
    for (const file of files) {
      typeDefs.push(readFileSync(resolveSchemaFilePath(baseDir, file), 'utf8'));
    }
  }

  return typeDefs.length <= 1 ? typeDefs[0] : typeDefs;
}

function getSubscriptionPath(config: ApolloConfigurationOptions) {
  if (config.subscriptions && typeof config.subscriptions === 'object') {
    return config.subscriptions.path || config.path || '/graphql';
  }
  return config.path || '/graphql';
}

function isGraphiQLEnabled(config: ApolloConfigurationOptions) {
  if (config.graphiql === undefined) {
    return process.env.NODE_ENV !== 'production';
  }
  return !!config.graphiql;
}

function renderGraphiQL(config: ApolloConfigurationOptions) {
  const options =
    typeof config.graphiql === 'object' && config.graphiql
      ? config.graphiql
      : {};
  const endpoint = options.endpoint || config.path || '/graphql';
  const title = options.title || 'Midway Apollo GraphiQL';
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/graphiql@5.2.2/graphiql.css" />
    <style>
      html, body, #graphiql { height: 100%; margin: 0; }
    </style>
  </head>
  <body>
    <div id="graphiql">Loading...</div>
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@19.2.6",
          "react-dom": "https://esm.sh/react-dom@19.2.6",
          "react-dom/client": "https://esm.sh/react-dom@19.2.6/client",
          "react/jsx-runtime": "https://esm.sh/react@19.2.6/jsx-runtime"
        }
      }
    </script>
    <script type="module">
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { GraphiQL } from 'https://esm.sh/graphiql@5.2.2?external=react,react-dom';
      const fetcher = async graphQLParams => {
        const response = await fetch(${JSON.stringify(endpoint)}, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(graphQLParams),
        });
        return await response.json();
      };
      createRoot(document.getElementById('graphiql')).render(
        React.createElement(GraphiQL, { fetcher })
      );
    </script>
  </body>
</html>`;
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class ApolloService {
  /**
   * Builds the executable GraphQL schema shared by HTTP and subscriptions.
   */
  createSchema(
    config: ApolloConfigurationOptions,
    resolvers: Record<string, any>,
    baseDir: string
  ) {
    return makeExecutableSchema({
      typeDefs: loadTypeDefs(config, baseDir) as any,
      resolvers,
      resolverValidationOptions: config.resolverValidationOptions,
      inheritResolversFromInterfaces: config.inheritResolversFromInterfaces,
    });
  }

  /**
   * Creates and starts an Apollo Server instance.
   */
  async createServer(
    config: ApolloConfigurationOptions,
    schema: GraphQLSchema
  ) {
    const { ApolloServer } = await import('@apollo/server');
    const server = new ApolloServer({
      schema,
      ...(config.apollo || {}),
    }) as ApolloServerLike;
    await server.start();
    return server;
  }

  /**
   * Creates a GraphQL over WebSocket subscription server.
   */
  createSubscriptionServer(
    schema: GraphQLSchema,
    config: ApolloConfigurationOptions,
    app: any
  ): SubscriptionServerLike | undefined {
    if (!config.subscriptions) {
      return;
    }
    const framework = app.getFramework?.();
    const httpServer = framework?.getServer?.();
    if (!httpServer) {
      return;
    }
    const path = getSubscriptionPath(config);
    const subscriptionOptions =
      typeof config.subscriptions === 'object' ? config.subscriptions : {};
    const wsServer = new WebSocketServer({
      server: httpServer,
      path,
    });
    return useServer(
      {
        schema,
        connectionInitWaitTimeout:
          subscriptionOptions.connectionInitWaitTimeout,
        context: async wsContext => {
          const context = app.createAnonymousContext({
            graphql: {
              connectionParams: wsContext.connectionParams,
              protocol: 'graphql-ws',
            },
          });
          return await assignContextExtensions(context, config);
        },
      },
      wsServer
    );
  }

  /**
   * Creates Midway middleware that executes GraphQL operations through Apollo.
   */
  createMiddleware(
    server: ApolloServerLike,
    config: ApolloConfigurationOptions,
    isExpress: boolean
  ) {
    const path = config.path || '/graphql';
    const methods = (config.methods || ['GET', 'POST']).map(method =>
      method.toUpperCase()
    );

    return async (ctx: IMidwayContext & any, resOrNext?: any, next?: any) => {
      const res = isExpress ? resOrNext : undefined;
      const done = isExpress ? next : resOrNext;
      const requestPath = isExpress ? ctx.path || ctx.url : ctx.path;
      const requestMethod = String(ctx.method || '').toUpperCase();

      if (requestPath !== path) {
        return await done();
      }
      if (!methods.includes(requestMethod)) {
        writeTextResponse(
          ctx,
          res,
          isExpress,
          'Method Not Allowed',
          'text/plain',
          405
        );
        setResponseHeader(ctx, res, isExpress, 'Allow', methods.join(', '));
        return;
      }

      const accept = getHeaderValue(ctx, 'accept', isExpress) || '';
      const shouldRenderGraphiQL =
        requestMethod === 'GET' &&
        isGraphiQLEnabled(config) &&
        accept.includes('text/html') &&
        !ctx.query?.query;
      if (shouldRenderGraphiQL) {
        writeTextResponse(
          ctx,
          res,
          isExpress,
          renderGraphiQL(config),
          'text/html'
        );
        return;
      }

      try {
        const contextValue = await assignContextExtensions(
          ctx as MidwayGraphQLContext,
          config
        );
        const payload = await getRequestPayload(ctx, isExpress);
        const result = await server.executeOperation(
          {
            query: payload.query,
            variables: payload.variables,
            operationName: payload.operationName,
          },
          {
            contextValue,
          }
        );
        const body =
          result.body?.kind === 'single'
            ? result.body.singleResult
            : result.body || result;

        writeResponse(
          ctx,
          res,
          isExpress,
          body,
          result.http?.status,
          result.http?.headers
        );
      } catch (err) {
        writeErrorResponse(ctx, res, isExpress, err);
      }
    };
  }

  /**
   * Stops an Apollo Server instance.
   */
  async stop(server: ApolloServerLike) {
    await server.stop();
  }

  /**
   * Stops a subscription server.
   */
  async stopSubscriptionServer(server: SubscriptionServerLike) {
    await Promise.resolve(server.dispose());
  }
}
