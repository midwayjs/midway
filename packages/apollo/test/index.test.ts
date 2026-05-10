import { close, createApp, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';
import { HelloService as KoaHelloService } from './fixtures/base-app-koa/src/service/hello';
import { HelloService as ExpressHelloService } from './fixtures/base-app-express/src/service/hello';
import * as apollo from '../src';
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
});
