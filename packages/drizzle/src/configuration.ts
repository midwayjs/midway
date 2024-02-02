import {
  Config,
  Configuration,
  Inject,
  IMidwayContainer,
  MidwayDecoratorService,
} from '@midwayjs/core';
import { DrizzleDataSourceManager } from './dataSourceManager';

@Configuration({
  namespace: 'drizzle',
  importConfigs: [
    {
      default: {
        drizzle: {},
      },
    },
  ],
})
export class DrizzleConfiguration {
  @Config('drizzle')
  drizzleConfig;

  @Inject()
  decoratorService: MidwayDecoratorService;

  dataSourceManager: DrizzleDataSourceManager;

  async onReady(container: IMidwayContainer) {
    this.dataSourceManager = await container.getAsync(DrizzleDataSourceManager);
  }

  async onStop() {
    if (this.dataSourceManager) {
      await this.dataSourceManager.stop();
    }
  }
}
