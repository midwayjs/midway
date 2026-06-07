import { close, createApp, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { Readable } from 'stream';
import { HelloService as KoaHelloService } from './fixtures/base-app-koa/src/service/hello';
import { HelloService as ExpressHelloService } from './fixtures/base-app-express/src/service/hello';
import * as apollo from '../src';
import { ApolloService } from '../src';
import { ApolloConfiguration } from '../src/configuration';
import { HelloResolver } from './fixtures/base-app-koa/src/resolver/hello.resolver';
import { createClient } from 'graphql-ws';
import WebSocket = require('ws');

describe('/test/index.test.ts', () => {
  it('should re-export GraphQL decorators from Apollo component', () => {
    expect(apollo.Resolver).toBeDefined();
    expect(apollo.Query).toBeDefined();
  });

  describe('apollo component with koa', () => {
    let app;

    beforeAll(async () => {
      app = await createApp({
        baseDir: join(__dirname, 'fixtures/base-app-koa/src'),
        preloadModules: [KoaHelloService, HelloResolver],
      });
    });

    afterAll(async () => {
      await close(app);
    });

    it('should execute query with Midway request context', async () => {
      const result = await createHttpRequest(app)
        .post('/graphql')
        .send({ query: '{ hello }' });

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        data: {
          hello: 'hello midway',
        },
      });
    });

    it('should render GraphiQL for browser GET requests', async () => {
      const result = await createHttpRequest(app)
        .get('/graphql')
        .set('accept', 'text/html');

      expect(result.status).toBe(200);
      expect(result.type).toBe('text/html');
      expect(result.text).toContain('Midway Apollo GraphiQL');
    });

    it('should return method not allowed for unsupported methods', async () => {
      const result = await createHttpRequest(app).put('/graphql').send({
        query: '{ hello }',
      });

      expect(result.status).toBe(405);
      expect(result.text).toBe('Method Not Allowed');
      expect(result.headers.allow).toBe('GET, POST');
    });

    it('should expose framework request APIs on context', async () => {
      const result = await createHttpRequest(app)
        .post('/graphql')
        .set('x-apollo-test', 'koa-header')
        .send({ query: '{ header }' });

      expect(result.status).toBe(200);
      expect(result.body.data.header).toBe('koa-header');
    });

    it('should execute Midway resolver class methods', async () => {
      const result = await createHttpRequest(app)
        .post('/graphql')
        .send({ query: '{ decoratedHello }' });

      expect(result.status).toBe(200);
      expect(result.body.data.decoratedHello).toBe('hello midway');
    });

    it('should load schema files and inject resolver parameters', async () => {
      const result = await createHttpRequest(app)
        .post('/graphql')
        .set('x-apollo-test', 'koa-header')
        .send({
          query:
            'query Echo($message: String!) { decoratedEcho(message: $message) schemaLoaded }',
          variables: {
            message: 'hello',
          },
        });

      expect(result.status).toBe(200);
      expect(result.body.data.decoratedEcho).toBe('hello:koa-header');
      expect(result.body.data.schemaLoaded).toBe('schema file');
    });

    it('should execute GraphQL subscriptions over websocket', async () => {
      const server = app.getFramework().getServer();
      if (!server.listening) {
        await new Promise<void>(resolve => {
          server.listen(0, '127.0.0.1', () => resolve());
        });
      }
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      const client = createClient({
        url: `ws://127.0.0.1:${port}/graphql`,
        webSocketImpl: WebSocket,
        retryAttempts: 0,
      });

      try {
        const iterator = client.iterate({
          query: 'subscription { counter }',
        });
        const result = await iterator.next();
        expect(result.value).toEqual({
          data: {
            counter: 1,
          },
        });
      } finally {
        client.dispose();
      }
    });
  });

  describe('apollo component with express', () => {
    let app;

    beforeAll(async () => {
      app = await createApp({
        baseDir: join(__dirname, 'fixtures/base-app-express/src'),
        preloadModules: [ExpressHelloService],
      });
    });

    afterAll(async () => {
      await close(app);
    });

    it('should execute query with Midway request context', async () => {
      const result = await createHttpRequest(app)
        .post('/graphql')
        .send({ query: '{ hello }' });

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        data: {
          hello: 'hello midway',
        },
      });
    });

    it('should expose framework request APIs on context', async () => {
      const result = await createHttpRequest(app)
        .post('/graphql')
        .set('x-apollo-test', 'express-header')
        .send({ query: '{ header }' });

      expect(result.status).toBe(200);
      expect(result.body.data.header).toBe('express-header');
    });
  });

  describe('ApolloService branch behavior', () => {
    function createServerMock(result?: any) {
      return {
        executeOperation: jest.fn(async () => {
          return (
            result || {
              body: {
                kind: 'single',
                singleResult: {
                  data: {
                    ok: true,
                  },
                },
              },
              http: {
                status: 202,
                headers: new Headers({
                  'x-apollo-test': 'yes',
                }),
              },
            }
          );
        }),
        start: jest.fn(),
        stop: jest.fn(),
      };
    }

    function createExpressResponse() {
      return {
        status: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        type: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
    }

    it('should pass through non-graphql paths', async () => {
      const service = new ApolloService();
      const next = jest.fn();
      const middleware = service.createMiddleware(
        createServerMock() as any,
        {
          path: '/graphql',
        },
        false
      );

      await middleware(
        {
          path: '/health',
          method: 'GET',
        } as any,
        next
      );

      expect(next).toHaveBeenCalled();
    });

    it('should execute GET requests with JSON variables and response headers', async () => {
      const service = new ApolloService();
      const server = createServerMock();
      const middleware = service.createMiddleware(
        server as any,
        {
          path: '/graphql',
          graphiql: false,
        },
        false
      );
      const ctx: any = {
        path: '/graphql',
        method: 'GET',
        query: {
          query: '{ ok }',
          variables: '{"id":"1"}',
          operationName: 'Ok',
        },
        headers: {},
        set: jest.fn(),
      };

      await middleware(ctx, jest.fn());

      expect(server.executeOperation).toHaveBeenCalledWith(
        {
          query: '{ ok }',
          variables: {
            id: '1',
          },
          operationName: 'Ok',
        },
        {
          contextValue: expect.objectContaining({
            graphql: {},
          }),
        }
      );
      expect(ctx.status).toBe(202);
      expect(ctx.set).toHaveBeenCalledWith('x-apollo-test', 'yes');
      expect(ctx.body.data.ok).toBe(true);
    });

    it('should parse express request bodies and attach context extensions', async () => {
      const service = new ApolloService();
      const server = createServerMock({
        body: {
          data: {
            ok: true,
          },
        },
      });
      const middleware = service.createMiddleware(
        server as any,
        {
          path: '/graphql',
          graphql: {
            source: 'test',
          },
          contextFactory: () => ({
            currentUser: 'harry',
            logger: 'reserved',
          }),
        },
        true
      );
      const req = Readable.from([
        JSON.stringify({
          query: '{ ok }',
        }),
      ]) as any;
      req.path = '/graphql';
      req.url = '/graphql';
      req.method = 'POST';
      req.headers = {};
      const res = createExpressResponse();

      await middleware(req, res, jest.fn());

      expect(server.executeOperation).toHaveBeenCalledWith(
        {
          query: '{ ok }',
          variables: undefined,
          operationName: undefined,
        },
        {
          contextValue: expect.objectContaining({
            currentUser: 'harry',
            graphql: {
              source: 'test',
            },
          }),
        }
      );
      expect(req.logger).toBeUndefined();
      expect(res.type).toHaveBeenCalledWith('application/json');
      expect(res.send).toHaveBeenCalledWith(
        JSON.stringify({
          data: {
            ok: true,
          },
        })
      );
    });

    it('should use existing request bodies and handle empty streams', async () => {
      const service = new ApolloService();
      const server = createServerMock();
      const middleware = service.createMiddleware(
        server as any,
        {
          path: '/graphql',
        },
        true
      );
      const reqWithBody: any = {
        path: '/graphql',
        url: '/graphql',
        method: 'POST',
        headers: {},
        body: {
          query: '{ fromBody }',
        },
      };
      const reqWithEmptyStream = Readable.from([]) as any;
      reqWithEmptyStream.path = '/graphql';
      reqWithEmptyStream.url = '/graphql';
      reqWithEmptyStream.method = 'POST';
      reqWithEmptyStream.headers = {};

      await middleware(reqWithBody, createExpressResponse(), jest.fn());
      await middleware(reqWithEmptyStream, createExpressResponse(), jest.fn());

      expect(server.executeOperation).toHaveBeenNthCalledWith(
        1,
        {
          query: '{ fromBody }',
          variables: undefined,
          operationName: undefined,
        },
        expect.anything()
      );
      expect(server.executeOperation).toHaveBeenNthCalledWith(
        2,
        {
          query: undefined,
          variables: undefined,
          operationName: undefined,
        },
        expect.anything()
      );
    });

    it('should handle empty raw request bodies', async () => {
      const service = new ApolloService();
      const server = createServerMock();
      const middleware = service.createMiddleware(
        server as any,
        {
          path: '/graphql',
        },
        true
      );
      const req = Readable.from(['']) as any;
      req.path = '/graphql';
      req.url = '/graphql';
      req.method = 'POST';
      req.headers = {};

      await middleware(req, createExpressResponse(), jest.fn());

      expect(server.executeOperation).toHaveBeenCalledWith(
        {
          query: undefined,
          variables: undefined,
          operationName: undefined,
        },
        expect.anything()
      );
    });

    it('should return request errors for invalid JSON request bodies', async () => {
      const service = new ApolloService();
      const middleware = service.createMiddleware(
        createServerMock() as any,
        {
          path: '/graphql',
        },
        true
      );
      const req = Readable.from(['{']) as any;
      req.path = '/graphql';
      req.url = '/graphql';
      req.method = 'POST';
      req.headers = {};
      const res = createExpressResponse();

      await middleware(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        JSON.stringify({
          errors: [
            {
              message: 'Invalid JSON request body',
            },
          ],
        })
      );
    });

    it('should render custom GraphiQL only when enabled', async () => {
      const service = new ApolloService();
      const middleware = service.createMiddleware(
        createServerMock() as any,
        {
          path: '/custom',
          graphiql: {
            title: 'Custom GraphiQL',
            endpoint: '/custom',
          },
        },
        true
      );
      const req = {
        path: '/custom',
        url: '/custom',
        method: 'GET',
        headers: {
          accept: 'text/html',
        },
      };
      const res = createExpressResponse();

      await middleware(req, res, jest.fn());

      expect(res.type).toHaveBeenCalledWith('text/html');
      expect(res.send.mock.calls[0][0]).toContain('Custom GraphiQL');
      expect(res.send.mock.calls[0][0]).toContain('/custom');
    });

    it('should disable default GraphiQL in production', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        const service = new ApolloService();
        const server = createServerMock();
        const middleware = service.createMiddleware(
          server as any,
          {
            path: '/graphql',
          },
          true
        );
        const req = {
          path: '/graphql',
          url: '/graphql',
          method: 'GET',
          query: {},
          headers: {
            accept: 'text/html',
          },
        };

        await middleware(req, createExpressResponse(), jest.fn());

        expect(server.executeOperation).toHaveBeenCalled();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it('should build schemas from exact files and glob patterns', () => {
      const service = new ApolloService();
      const baseDir = mkdtempSync(join(tmpdir(), 'midway-apollo-'));
      try {
        writeFileSync(
          join(baseDir, 'schema.graphql'),
          'type Query { exact: String globbed: String }'
        );
        writeFileSync(
          join(baseDir, 'extra1.graphql'),
          'extend type Query { extra: String }'
        );

        const schema = service.createSchema(
          {
            typePaths: [
              './schema.graphql',
              'no-match**.graphql',
              'extra?.graphql',
            ],
          },
          {
            Query: {
              exact: () => 'exact',
              globbed: () => 'globbed',
              extra: () => 'extra',
            },
          },
          baseDir
        );

        expect(schema.getQueryType().getFields().exact).toBeDefined();
        expect(schema.getQueryType().getFields().extra).toBeDefined();
      } finally {
        rmSync(baseDir, {
          recursive: true,
          force: true,
        });
      }
    });

    it('should skip disabled subscriptions and apps without http servers', () => {
      const service = new ApolloService();
      const schema = service.createSchema(
        {
          typeDefs: 'type Query { ok: Boolean }',
        },
        {
          Query: {
            ok: () => true,
          },
        },
        process.cwd()
      );

      expect(
        service.createSubscriptionServer(schema, { subscriptions: false }, {})
      ).toBeUndefined();
      expect(
        service.createSubscriptionServer(
          schema,
          {
            path: '/fallback',
            subscriptions: {},
          },
          {
            getFramework: () => ({}),
          }
        )
      ).toBeUndefined();
    });

    it('should return when no web applications are registered', async () => {
      const configuration = new ApolloConfiguration();
      configuration.configService = {
        getConfiguration: jest.fn(() => ({})),
      } as any;
      configuration.applicationManager = {
        getApplications: jest.fn(() => []),
      } as any;
      configuration.graphqlService = {
        buildResolvers: jest.fn(),
      } as any;
      configuration.apolloService = new ApolloService();

      await configuration.onReady({} as any);

      expect(configuration.graphqlService.buildResolvers).not.toHaveBeenCalled();
    });

    it('should stop servers', async () => {
      const service = new ApolloService();
      const server = {
        stop: jest.fn(),
      };
      const subscriptionServer = {
        dispose: jest.fn(),
      };

      await service.stop(server as any);
      await service.stopSubscriptionServer(subscriptionServer);

      expect(server.stop).toHaveBeenCalled();
      expect(subscriptionServer.dispose).toHaveBeenCalled();
    });
  });
});
