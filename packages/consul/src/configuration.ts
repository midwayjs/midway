import {
  Config,
  Configuration,
  MidwayFrameworkType,
} from '@midwayjs/decorator';
import { join } from 'path';
import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
} from '@midwayjs/core';
import {
  IConsulProviderInfoOptions,
  IConsulRegisterInfoOptions,
} from './interface';
import { ConsulProvider } from './lib/provider';

@Configuration({
  namespace: 'consul',
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration implements ILifeCycle {
  /**
   * 有关 consul server 的配置
   */
  @Config('consul.provider')
  consulProviderConfig: IConsulProviderInfoOptions;

  /**
   * 有关 service registry 注册的信息
   */
  @Config('consul.service')
  consulRegisterConfig: IConsulRegisterInfoOptions;

  get consulProvider(): ConsulProvider {
    const symbol = Symbol('consulProvider');
    this[symbol] =
      this[symbol] || new ConsulProvider(this.consulProviderConfig);
    return this[symbol];
  }

  /**
   * 注册自己的条件
   * 由于环境的复杂性(多网卡、自动端口冲突) address 和 port 必须提供
   */
  get shouldBeRegisterMe(): boolean {
    const { address, port } = this.consulRegisterConfig;
    return this.consulProviderConfig.register && address.length > 0 && port > 0;
  }

  /**
   * 注册 consul 服务
   * @param container 容器 IoC
   * @param app 应用 App
   */
  async registerConsul(
    container: IMidwayContainer,
    app: IMidwayApplication
  ): Promise<void> {
    const config = this.consulRegisterConfig;
    const { address, port } = this.consulRegisterConfig;

    if (this.shouldBeRegisterMe) {
      config.name = config.name || app.getProjectName();
      config.id = config.id || `${config.name}:${address}:${port}`;

      config.check =
        config.check ||
        (config.check === false
          ? void 0
          : app.getFrameworkType() === MidwayFrameworkType.WEB
          ? {
              http: `http://${address}:${port}/consul/health/self/check`,
              interval: '3s',
            }
          : {
              tcp: `${address}:${port}`,
              interval: '3s',
            });

      Object.assign(this.consulRegisterConfig, config);

      // 把原始的 consul 对象注入到容器
      container.registerObject(
        'consul:consul',
        this.consulProvider.getConsul()
      );
      await this.consulProvider.registerService(this.consulRegisterConfig);
    }
  }

  async onReady(
    container: IMidwayContainer,
    app?: IMidwayApplication
  ): Promise<void> {
    await this.registerConsul(container, app);
  }

  async onStop(
    container: IMidwayContainer,
    app?: IMidwayApplication
  ): Promise<void> {
    if (
      this.consulProviderConfig.register &&
      this.consulProviderConfig.deregister
    ) {
      const { id } = this.consulRegisterConfig;
      await this.consulProvider.deregisterService({ id });
    }
  }
}
