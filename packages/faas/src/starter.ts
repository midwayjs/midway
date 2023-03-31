import { ServerlessStarterOptions } from './interface';
import {
  IMidwayBootstrapOptions,
  initializeGlobalApplicationContext,
  MidwayFrameworkService,
} from '@midwayjs/core';
import { MidwayFaaSFramework } from './framework';

export abstract class AbstractBootstrapStarter {
  protected applicationContext;
  protected framework: MidwayFaaSFramework;
  constructor(protected options: ServerlessStarterOptions = {}) {}

  private isStarted = false;

  public getApplicationContext() {
    return this.applicationContext;
  }

  public async close() {
    await this.onClose();
  }

  public start(options?: ServerlessStarterOptions) {
    if (!this.isStarted) {
      this.options = Object.assign(this.options, options);
      this.onStart();
      this.isStarted = true;
    }
  }

  public async initFramework(bootstrapOptions: IMidwayBootstrapOptions = {}) {
    // init midway
    this.applicationContext = await initializeGlobalApplicationContext(
      bootstrapOptions
    );

    const midwayFrameworkService = this.applicationContext.get(
      MidwayFrameworkService
    );
    this.framework = midwayFrameworkService.getMainFramework();
  }

  protected createDefaultMockHttpEvent() {}

  protected createDefaultMockEvent() {}

  protected createDefaultMockContext() {}

  abstract onStart(): unknown;
  abstract onInit(...args: unknown[]);
  abstract onRequest(...args: unknown[]);
  abstract onClose();
}
