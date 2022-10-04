import * as DefaultConfig from './config/config.default';
import {
  Inject,
  Configuration,
  IMidwayContainer,
  MidwayApplicationManager,
  MidwayConfigService,
} from '@midwayjs/core';
import { PassportAuthenticator } from './passport/authenticator';

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

  async onReady(container: IMidwayContainer) {
    await container.getAsync(PassportAuthenticator);
  }
}
