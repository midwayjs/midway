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
import { XSSProtectionMiddleware } from './middleware/xssProtection.middleware';
import { CSPMiddleware } from './middleware/csp.middleware';
import { SecurityHelper } from './middleware/helper';
import { ReferrerPolicyMiddleware } from './middleware/refererPolicy.middleware';
import { MethodNotAllowedMiddleware } from './middleware/methodNotAllowed.middleware'
import { NoSniffMiddleware } from './middleware/nosniff.middleware';

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
        app.useMiddleware(CsrfMiddleware);
        app.useMiddleware(CSPMiddleware);
        app.useMiddleware(XFrameMiddleware);
        app.useMiddleware(HSTSMiddleware);
        app.useMiddleware(NoOpenMiddleware);
        app.useMiddleware(NoSniffMiddleware);
        app.useMiddleware(XSSProtectionMiddleware);
        app.useMiddleware(ReferrerPolicyMiddleware);
        app.useMiddleware(MethodNotAllowedMiddleware);
      });
  }
}
