import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer, safeRequire,
} from '@midwayjs/core';
import {
  App,
  Configuration,
} from '@midwayjs/decorator';
import { MidwayPassportService } from './passport';

@Configuration({
  namespace: 'passport',
})
export class PassportConfiguration implements ILifeCycle {

  @App()
  app;

  // private async handleBootStrategy(app: IMidwayApplication) {
  //   const ctx = app.getApplicationContext();
  //   const config = ctx.getConfigService();
  //
  //   const bootStrategies = listModule(BOOTSTRATEGY_KEY);
  //
  //   for await (const Strategy of bootStrategies) {
  //     const id = getProviderId(Strategy);
  //     const data = getClassMetadata(BOOTSTRATEGY_KEY, Strategy);
  //
  //     let p;
  //
  //     if (data && typeof data.useParams === 'function') {
  //       p = await data.useParams(config as any);
  //     }
  //
  //     /**
  //      * get中的 getManagedResolverFactory.create会创建实例
  //      * 注意midway @see {managedResolverFactory.ts} 中 create函数的args会判定是否是Array
  //      */
  //     p ? await ctx.getAsync(id, [p]) : await ctx.getAsync(id);
  //   }
  // }

  async onReady(container: IMidwayContainer, app: IMidwayApplication) {
    // await this.handleBootStrategy(app);
    const expressMode = process.env['MIDWAY_PASSPORT_MODE'] === 'express' ?? safeRequire('@midwayjs/express');
    const passport = await container.getAsync(MidwayPassportService as any, [expressMode]) as MidwayPassportService;
    this.app.use(passport.initialize())
    this.app.use(passport.session())
  }
}
