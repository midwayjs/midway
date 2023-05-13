import {
  Configuration,
  Inject,
  Config,
  MidwayApplicationManager,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import { CsrfMiddleware } from './middleware/csrf.middleware';
import { SecurityOptions } from './interface';
import { XFrameMiddleware } from './middleware/xframe.middleware';
import { HSTSMiddleware } from './middleware/hsts.middleware';
import { NoOpenMiddleware } from './middleware/noopen.middleware';
import { NoSniffMiddleware } from '.';
import { XSSProtectionMiddleware } from './middleware/xssProtection.middleware';
import { CSPMiddleware } from './middleware/csp.middleware';
import { SecurityHelper } from './middleware/helper';
@Configuration({
  namespace: 'security',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class SecurityConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  @Config('security')
  security: SecurityOptions;

  async onReady() {
    this.applicationManager
      .getApplications(['koa', 'faas', 'express', 'egg'])
      .forEach(app => {
        app.useMiddleware(SecurityHelper);
        if (this.security.csrf?.enable) {
          app.useMiddleware(CsrfMiddleware);
        }
        if (this.security.csp?.enable) {
          app.useMiddleware(CSPMiddleware);
        }
        if (this.security.xframe?.enable) {
          app.useMiddleware(XFrameMiddleware);
        }
        if (this.security.hsts?.enable) {
          app.useMiddleware(HSTSMiddleware);
        }
        if (this.security.noopen?.enable) {
          app.useMiddleware(NoOpenMiddleware);
        }
        if (this.security.nosniff?.enable) {
          app.useMiddleware(NoSniffMiddleware);
        }
        if (this.security.xssProtection?.enable) {
          app.useMiddleware(XSSProtectionMiddleware);
        }
      });
  }
}
