import { defineApi } from '@midwayjs/core/functional';
import { loggerMiddleware } from '../middleware/logger.middleware';

export const homeApi = defineApi(
  '/',
  api => ({
    home: api.get('/').handle(async () => ({
      message: 'middleware demo, visit /api/middleware-demo',
    })),

    middlewareDemo: api
      .get('/middleware-demo')
      .meta({ middleware: [loggerMiddleware] })
      .handle(async () => ({
        success: true,
        lesson: 'middleware-basics',
        timestamp: Date.now(),
      })),
  }),
  {
    middleware: [loggerMiddleware],
  }
);
