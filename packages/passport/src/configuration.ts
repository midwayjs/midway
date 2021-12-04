import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
} from '@midwayjs/core';
import {
  Configuration,
} from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import { PassportService } from './service/passport';

@Configuration({
  namespace: 'passport',
  importConfigs: [
    {
      default: DefaultConfig
    },
  ],
})
export class PassportConfiguration implements ILifeCycle {
  async onReady(container: IMidwayContainer, app: IMidwayApplication) {
    await container.getAsync(PassportService);
  }
}
