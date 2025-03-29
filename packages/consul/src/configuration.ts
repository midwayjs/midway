import {
  Configuration,
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
} from '@midwayjs/core';
import { ConsulServiceFactory } from './manager';

@Configuration({
  namespace: 'consul',
  importConfigs: [
    {
      default: {},
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

  async onStop(container: IMidwayContainer): Promise<void> {
    const factory = await container.getAsync(ConsulServiceFactory);
    await factory.stop();
  }
}
