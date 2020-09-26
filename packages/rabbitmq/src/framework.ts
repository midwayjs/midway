import {
  BaseFramework,
  generateProvideId,
  getClassMetadata,
  getProviderId,
  IMidwayBootstrapOptions,
  listModule,
  MidwayFrameworkType,
  MidwayProcessTypeEnum,
  PRIVATE_META_DATA_KEY,
} from '@midwayjs/core';

import { MS_CONSUMER_KEY } from '@midwayjs/decorator';
import { IMidwayRabbitMQApplication, IMidwayRabbitMQConfigurationOptions } from './interface';
import { RabbitMQServer } from './mq';

export class MidwayRabbitMQFramework extends BaseFramework<
  IMidwayRabbitMQConfigurationOptions
  > {
  protected app: IMidwayRabbitMQApplication;

  public configure(
    options: IMidwayRabbitMQConfigurationOptions
  ): MidwayRabbitMQFramework {
    this.configurationOptions = options;
    return this;
  }

  protected async afterDirectoryLoad(
    options
  ) {
    this.app = new RabbitMQServer(this.configurationOptions) as unknown as IMidwayRabbitMQApplication;
    this.defineApplicationProperties(this.app);

    // init connection
    await this.app.init();
  }

  protected async afterInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    await this.loadSubscriber();
  }

  public async run(): Promise<void> {
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

  protected defineApplicationProperties(
    app: IMidwayRabbitMQApplication
  ): IMidwayRabbitMQApplication {
    return Object.assign(app, {
      getBaseDir: () => {
        return this.baseDir;
      },

      getAppDir: () => {
        return this.appDir;
      },

      getEnv: () => {
        return this.getApplicationContext()
          .getEnvironmentService()
          .getCurrentEnvironment();
      },

      getConfig: (key?: string) => {
        return this.getApplicationContext()
          .getConfigService()
          .getConfiguration(key);
      },

      getFrameworkType: () => {
        return this.getFrameworkType();
      },

      getProcessType: () => {
        return MidwayProcessTypeEnum.APPLICATION;
      },
    });
  }

  private async loadSubscriber() {
    // create room
    const subscriberModules = listModule(MS_CONSUMER_KEY);
    for (const module of subscriberModules) {
      let providerId = getProviderId(module);
      const meta = getClassMetadata(PRIVATE_META_DATA_KEY, module);
      if (providerId && meta) {
        providerId = generateProvideId(providerId, meta.namespace);
      }

      // get meta
      // this.app.ass
    }
  }

}
