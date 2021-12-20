import { Catch, Configuration, Inject } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';

@Catch()
export class CatchAll {
  catch(err, ctx) {
    return err.message;
  }
}

@Configuration({
  imports: [
    koa,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        keys: '12345',
        i18n: {
          defaultLocale: 'en_US'
        },
      }
    }
  ]
})
export class AutoConfiguration {
  @Inject()
  framework: koa.Framework;

  async onReady() {
    this.framework.useFilter(CatchAll);
  }
}
