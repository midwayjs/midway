import { ServerlessStarterOptions } from './interface';
import {
  IMidwayBootstrapOptions,
  initializeGlobalApplicationContext,
  MidwayFrameworkService,
} from '@midwayjs/core';
import { MidwayFaaSFramework } from './framework';
import { join } from 'path';

function isTypeScriptEnvironment() {
  const TS_MODE_PROCESS_FLAG: string = process.env.MIDWAY_TS_MODE;
  if ('false' === TS_MODE_PROCESS_FLAG) {
    return false;
  }
  // eslint-disable-next-line node/no-deprecated-api
  return TS_MODE_PROCESS_FLAG === 'true' || !!require.extensions['.ts'];
}

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

  protected getBaseDir() {
    if (this.options.baseDir) {
      return this.options.baseDir;
    }
    if (isTypeScriptEnvironment()) {
      return join(this.options.appDir, 'src');
    } else {
      return join(this.options.appDir, 'dist');
    }
  }

  public start(options?: ServerlessStarterOptions) {
    if (!this.startedExports) {
      this.options = Object.assign(this.options, options);
      if (this.options.appDir && !this.options.baseDir) {
        this.options.baseDir = this.getBaseDir();
      }
      this.startedExports = this.onStart();
    }
    if (this.startedExports) {
      this.startedExports['getStarter'] = () => {
        return this;
      };
      return this.startedExports;
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
