import { defineApi } from '@midwayjs/core/functional';
import { loggerMiddleware } from '../middleware/logger.middleware';

export const homeApi = defineApi('/', api => ({
  home: api.get('/').handle(async () => ({
    message: 'Visit /middleware-demo — only that route has the logger middleware',
  })),

  middlewareDemo: api
    .get('/middleware-demo')
    .meta({ middleware: [loggerMiddleware] })
    .handle(async () => ({
      success: true,
      lesson: 'middleware-layers',
      timestamp: Date.now(),
    })),
}));
