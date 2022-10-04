import {
  Config,
  Configuration,
  Inject,
  Logger,
  MidwayApplicationManager,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import { SessionMiddleware } from './middleware/session';

@Configuration({
  namespace: 'session',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class SessionConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  @Logger('coreLogger')
  logger;

  @Config('session')
  sessionConfig;

  async onReady() {
    if (this.sessionConfig.enable) {
      this.applicationManager.getApplications(['koa', 'faas']).forEach(app => {
        if ((app as any).on) {
          // listen on session's events
          (app as any).on('session:missed', ({ ctx, key }) => {
            this.logger.warn('[session][missed] key(%s)', key);
          });
          (app as any).on('session:expired', ({ ctx, key, value }) => {
            this.logger.warn(
              '[session][expired] key(%s) value(%j)',
              key,
              this.sessionConfig.logValue ? value : ''
            );
          });
          (app as any).on('session:invalid', ({ ctx, key, value }) => {
            this.logger.warn(
              '[session][invalid] key(%s) value(%j)',
              key,
              this.sessionConfig.logValue ? value : ''
            );
          });
        }

        app.useMiddleware(SessionMiddleware);
      });
    }
  }
}
