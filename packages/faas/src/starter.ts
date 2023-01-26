import { ServerlessStarterOptions } from './interface';
import {
  IMidwayBootstrapOptions,
  initializeGlobalApplicationContext,
  MidwayFrameworkService,
} from '@midwayjs/core';

export abstract class AbstractBootstrapStarter {
  protected applicationContext;
  protected framework;
  constructor(protected options: ServerlessStarterOptions = {}) {}

  public getApplicationContext() {
    return this.applicationContext;
  }

  public async close() {
    await this.onClose();
  }

  public start(options?: ServerlessStarterOptions) {
    this.options = Object.assign(this.options, options);
    return this.onStart();
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

  abstract onStart(): any;
  abstract onInit(...args: unknown[]);
  abstract onRequest(...args: unknown[]);
  abstract onClose();
}
