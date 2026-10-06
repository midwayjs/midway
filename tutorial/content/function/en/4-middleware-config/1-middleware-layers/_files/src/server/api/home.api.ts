import { defineApi } from '@midwayjs/core/functional';
import { loggerMiddleware } from '../middleware/logger.middleware';

export const homeApi = defineApi(
  '/',
  api => ({
    home: api.get('/').handle(async () => ({
      message: 'Visit /middleware-demo — check the terminal for request logs',
    })),

    middlewareDemo: api.get('/middleware-demo').handle(async () => ({
      success: true,
      lesson: 'middleware-layers',
      timestamp: Date.now(),
    })),
  }),
  {
    middleware: [loggerMiddleware],
  }
);
