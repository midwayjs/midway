import { App, Config, Configuration } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import { getPassport } from './util';

@Configuration({
  namespace: 'passport',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class PassportConfiguration {
  @App()
  app;

  @Config('passport')
  passportConfig;

  async onReady() {
    const passport = getPassport();
    this.app.useMiddleware(passport.initialize());
    if (this.passportConfig.session) {
      this.app.useMiddleware(passport.session());
    }
  }
}
