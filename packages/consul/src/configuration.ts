import {
  Configuration,
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
  Inject,
  LifeCycleInvokeOptions,
  MidwayConfigService,
} from '@midwayjs/core';
import { ConsulServiceFactory } from './manager';
import { ConsulServiceDiscovery } from './extension/serviceDiscovery';

@Configuration({
  namespace: 'consul',
  importConfigs: [
    {
      default: {
        consul: {
          serviceDiscovery: {
            selfRegister: false,
            loadBalancer: 'roundRobin',
            healthCheckType: 'self',
          },
        },
      },
    },
  ],
})
export class ConsulConfiguration implements ILifeCycle {
  @Inject()
  private configService: MidwayConfigService;

  private isSelfRegister = false;

  async onReady(
    container: IMidwayContainer,
    app?: IMidwayApplication
  ): Promise<void> {
    await container.getAsync(ConsulServiceFactory);
  }

  async onServerReady(
    container: IMidwayContainer,
    mainApp: IMidwayApplication,
    options: LifeCycleInvokeOptions
  ): Promise<void> {
    const config = this.configService.getConfiguration(
      'consul.serviceDiscovery'
    );
    if (config.selfRegister) {
      const serviceDiscovery = await container.getAsync(ConsulServiceDiscovery);
      await serviceDiscovery.register();
      this.isSelfRegister = true;
    }
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    if (this.isSelfRegister) {
      const serviceDiscovery = await container.getAsync(ConsulServiceDiscovery);
      await serviceDiscovery.deregister();
    }

    const factory = await container.getAsync(ConsulServiceFactory);
    await factory.stop();
  }
}
