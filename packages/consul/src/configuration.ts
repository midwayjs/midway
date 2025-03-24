import {
  Configuration,
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import { ConsulServiceFactory } from './manager';

@Configuration({
  namespace: 'consul',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class ConsulConfiguration implements ILifeCycle {
  async onReady(
    container: IMidwayContainer,
    app?: IMidwayApplication
  ): Promise<void> {
    await container.getAsync(ConsulServiceFactory);
  }
}
