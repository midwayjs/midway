import { createLightApp, close } from '@midwayjs/mock';
import * as koa from '@midwayjs/koa';
import { Controller, Get, sleep } from '@midwayjs/core';
import * as sse from '../src';
import * as EventSource from 'eventsource';
import { ServerSendEventStream } from '../src';

describe('/test/index.test.ts', () => {
  it('should test push server send event', async () => {
    @Controller()
    class APIController {
      @Get('/sse')
      async sse(ctx) {
        const stream =  new ServerSendEventStream(ctx);
        Promise.resolve().then(async () => {
          stream.send({
            data: 'abc',
          });
          await sleep();
          stream.send({
            data: 'bcd'
          });
          await sleep();
          stream.send({
            data: 'bcd'.repeat(1000)
          });
          stream.send({
            data: {
              a: 1
            },
          });
          stream.sendEnd('cc');
        });
        return stream;
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
      };

      eventSource.onerror = function(e) {
        console.log('error', e);
      }

      eventSource.addEventListener('close', function(e) {
        expect(e.data).toEqual('cc');
        eventSource.close();
        resolve();
      });
    })

    await close(app);
  });
});
