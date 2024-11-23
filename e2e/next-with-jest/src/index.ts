import { defineConfiguration, useMainApp } from '@midwayjs/core/functional';
import * as Next from '@midwayjs/nextjs';
import { CustomModuleDetector, Provide } from '@midwayjs/core';
import * as Koa from '@midwayjs/koa';

@Provide()
class Test {
  async hello() {
    return 'hello';
  }
}

export default defineConfiguration({
  importConfigs: {
    koa: {
      keys: ['test'],
    },
    next: {
      dev: false,
    },
  },
  imports: [Koa, Next],
  detector: new CustomModuleDetector({
    modules: [
      Test,
    ]
  }),
  onReady: async (container) => {
    const app = useMainApp();
    app.useMiddleware(async (ctx, next) => {
      console.log('middleware');
      await next();
      console.log('middleware end');
    });
    console.log(app.getConfig('next.dev'));
  },
});
