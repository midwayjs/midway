import {
  Context,
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
} from '@midwayjs/core';
import {
  Configuration,
  getClassMetadata,
  getProviderId,
  Inject,
  listModule,
} from '@midwayjs/decorator';
import { BOOTSTRATEGY_KEY } from './contants';

@Configuration({
  namespace: 'passport',
})
export class PassportConfiguration implements ILifeCycle {
  @Inject()
  ctx: Context;

  private async handleBootStrategy(app: IMidwayApplication) {
    const ctx = app.getApplicationContext();
    const config = ctx.getConfigService();

    const bootStrategies = listModule(BOOTSTRATEGY_KEY);

    for await (const Strategy of bootStrategies) {
      const id = getProviderId(Strategy);
      const data = getClassMetadata(BOOTSTRATEGY_KEY, Strategy);

      let p;

      if (data && typeof data.useParams === 'function') {
        p = await data.useParams(config as any);
      }

      /**
       * get中的 getManagedResolverFactory.create会创建实例
       * 注意midway @see {managedResolverFactory.ts} 中 create函数的args会判定是否是Array
       */
      p ? await ctx.getAsync(id, [p]) : await ctx.getAsync(id);
    }
  }

  async onReady(_container: IMidwayContainer, app: IMidwayApplication) {
    await this.handleBootStrategy(app);

    // Reflect.getMetadata('frontier');

    if (Array.isArray((app as any).middleware)) {
      // 初始化 Connect-based 应用
      (app as any).middleware.push(require('koa-passport').initialize());
    }
  }
}
