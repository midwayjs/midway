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

  private startedExports: Record<string, any>;

  public getApplicationContext() {
    return this.applicationContext;
  }

  public async close() {
    await this.onClose();
  }

  public start(options?: ServerlessStarterOptions) {
    if (!this.startedExports) {
      this.options = Object.assign(this.options, options);
      this.startedExports = this.onStart();
    }
    return this.startedExports;
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
