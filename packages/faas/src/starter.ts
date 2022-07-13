import { ServerlessStarterOptions } from './interface';
import {
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

  public async initFramework(applicationAdapter: Record<string, any>) {
    this.options.performance?.mark('starterRuntimeStartTime');

    // init midway
    const applicationContext = (this.applicationContext =
      await initializeGlobalApplicationContext(
        Object.assign(this.options, {
          globalConfig: {
            faas: {
              applicationAdapter,
            },
          },
        })
      ));

    const midwayFrameworkService = applicationContext.get(
      MidwayFrameworkService
    );
    this.framework = midwayFrameworkService.getMainFramework();
    this.options.performance?.mark('frameworkStartTime');
  }

  abstract onStart(): any;
  abstract onInit(...args: unknown[]);
  abstract onRequest(...args: unknown[]);
  abstract onClose();
}
