import { IMiddleware, Middleware } from '@midwayjs/core';

@Middleware()
export class ServerSentEventMiddleware implements IMiddleware<any, any> {
  resolve() {
    return async (ctx, next) => {
      // if (ctx.path === '/sse') {
      //   ctx.set({
      //     'Content-Type': 'text/event-stream',
      //     'Cache-Control': 'no-cache',
      //     Connection: 'keep-alive',
      //   });
      //   ctx.body = 'data: hello\n\n';
      //   return;
      // }

      ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      ctx.sse = {
        send: (data: any) => {
          ctx.body = `data: ${JSON.stringify(data)}\n\n`;
        },
        close: () => {
          ctx.body = 'data: end\n\n';
        },
      };

      return await next();
    };
  }

  static getName() {
    return 'sse';
  }
}
