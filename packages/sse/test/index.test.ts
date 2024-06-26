import { createLightApp, close } from '@midwayjs/mock';
import * as koa from '@midwayjs/koa';
import { Controller, Get } from '@midwayjs/core';
import * as sse from '../src';
import * as EventSource from 'eventsource';

describe('/test/index.test.ts', () => {
  it('should test push server send event', async () => {
    @Controller()
    class APIController {
      @Get('/sse', { middleware: [sse.ServerSentEventMiddleware]})
      async sse(ctx) {
        ctx.res.writeHead(200, {'Content-Type': 'text/event-stream'})
        ctx.res.write('\uFEFF')
        ctx.res.write('data: foo\n\n')
        ctx.res.write('data: end\n\n')
        ctx.res.end()
      }
    }

    const port = 7001;

    const app = await createLightApp({
      imports: [
        koa,
        sse,
      ],
      globalConfig: {
        keys: '123',
        koa: {
          port,
        }
      },
      preloadModules: [
        APIController
      ]
    });

    await new Promise<void>(resolve => {
      const eventSource = new EventSource('http://localhost:' + port + '/sse')
      eventSource.onmessage = ({ data }) => {
        console.log('New message', data);
        if (data === 'end') {
          eventSource.close();
          resolve();
        }
      };
    })

    await close(app);
  });
});
