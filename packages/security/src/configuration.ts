import {
  Configuration,
  Inject,
  Config,
  MidwayApplicationManager,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import { CSRFMiddleware } from './middleware/csrf.middleware';
import { SecurityOptions } from './interface';
import { XFrameMiddleware } from './middleware/xframe';
import { HSTSMiddleware } from './middleware/hsts';
import { NoOpenMiddleware } from './middleware/noopen';
import { NoSniffMiddleware } from '.';
import { XSSProtectionMiddleware } from './middleware/xssProtection';
import { CSPMiddleware } from './middleware/csp';
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
          app.useMiddleware(CSRFMiddleware);
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
