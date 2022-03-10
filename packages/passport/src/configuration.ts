import { Inject, Configuration } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import { getPassport } from './util';
import { MidwayApplicationManager, MidwayConfigService } from '@midwayjs/core';

@Configuration({
  namespace: 'passport',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class PassportConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  @Inject()
  configService: MidwayConfigService;

  async onReady() {
    const passportConfig = this.configService.getConfiguration('passport');
    const passport = getPassport();
    this.applicationManager
      .getApplications(['express', 'koa', 'egg', 'faas'])
      .forEach(app => {
        app.useMiddleware(passport.initialize());
        if (passportConfig.session) {
          app.useMiddleware(passport.session());
        }
      });
  }
}
