import {
  Configuration,
  IMidwayContainer,
  Inject,
  MidwayConfigService,
} from '@midwayjs/core';
import { ETCDServiceFactory } from './manager';
import * as defaultConfig from './config.default';
import { EtcdServiceDiscovery } from './extension/serviceDiscovery';
import { EtcdServiceDiscoveryOptions } from './interface';

@Configuration({
  namespace: 'etcd',
  importConfigs: [
    {
      default: defaultConfig,
    },
  ],
})
export class ETCDConfiguration {
  @Inject()
  private configService: MidwayConfigService;

  private isSelfRegister = false;
  async onReady(container) {
    await container.getAsync(ETCDServiceFactory);
  }

  async onServerReady(container) {
    const config = this.configService.getConfiguration(
      'etcd.serviceDiscovery'
    ) as EtcdServiceDiscoveryOptions;
    if (config.selfRegister) {
      const etcdServiceDiscovery = await container.getAsync(
        EtcdServiceDiscovery
      );
      await etcdServiceDiscovery.register();
    }
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    if (this.isSelfRegister) {
      const serviceDiscovery = await container.getAsync(EtcdServiceDiscovery);
      await serviceDiscovery.deregister();
    }

    const factory = await container.getAsync(ETCDServiceFactory);
    await factory.stop();
  }
}
