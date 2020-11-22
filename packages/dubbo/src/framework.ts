import {
  BaseFramework,
  getProviderId,
  IMidwayBootstrapOptions,
  listModule,
  listPropertyDataFromClass,
  MidwayFrameworkType,
  MidwayRequestContainer,
} from '@midwayjs/core';

import {
  IMidwayRabbitMQApplication,
  IMidwayRabbitMQConfigurationOptions,
} from './interface';

export class MidwayDubboFramework extends BaseFramework<
  IMidwayRabbitMQApplication,
  IMidwayRabbitMQConfigurationOptions
> {
  public app: IMidwayRabbitMQApplication;
  public consumerList = [];

  public configure(
    options: IMidwayRabbitMQConfigurationOptions
  ): MidwayDubboFramework {
    this.configurationOptions = options;
    return this;
  }

  async applicationInitialize(options) {
    this.app = (new RabbitMQServer(
      this.configurationOptions
    ) as unknown) as IMidwayRabbitMQApplication;
    // init connection
    await this.app.init();
  }

  protected async afterContainerReady(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    await this.loadSubscriber();
  }

  public async run(): Promise<void> {
    await Promise.all(this.consumerList);
  }

  protected async beforeStop(): Promise<void> {
    await this.app.close();
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WS_IO;
  }

  public getApplication(): IMidwayRabbitMQApplication {
    return this.app;
  }

}
