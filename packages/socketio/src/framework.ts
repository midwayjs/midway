import {
  BaseFramework,
  IMidwayBootstrapOptions,
  MidwayFrameworkType,
  MidwayProcessTypeEnum,
  MidwayRequestContainer,
} from '@midwayjs/core';

import { IMidwaySocketIOApplication, IMidwaySocketIOConfigurationOptions } from './interface';
import * as SocketIO from 'socket.io';

export class MidwaySocketIOFramework extends BaseFramework<IMidwaySocketIOConfigurationOptions> {
  protected app: IMidwaySocketIOApplication;

  public configure(
    options: IMidwaySocketIOConfigurationOptions
  ): MidwaySocketIOFramework {
    this.configurationOptions = options;
    return this;
  }

  protected async afterDirectoryLoad(options: Partial<IMidwayBootstrapOptions>) {
    this.app = SocketIO() as unknown as IMidwaySocketIOApplication;
    this.defineApplicationProperties(this.app);
    // this.app.use((req: IMidwayExpressRequest, res, next) => {
    //   req.requestContext = new MidwayRequestContainer(req, this.getApplicationContext());
    //   req.requestContext.registerObject('req', req);
    //   req.requestContext.registerObject('res', res);
    //   req.requestContext.ready();
    //   next();
    // });
  }

  protected async afterInitialize(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    await this.loadMidwayController();
  }

  public async run(): Promise<void> {
    if (this.configurationOptions.port) {
      new Promise((resolve) => {
        this.app.listen(this.configurationOptions.port, () => {
          resolve();
        });
      });
    }
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WS;
  }

  public getApplication(): IMidwaySocketIOApplication {
    return this.app;
  }

  protected defineApplicationProperties(app: IMidwaySocketIOApplication): IMidwaySocketIOApplication {
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

  private async loadMidwayController() {
    // create room
    // on connection
  }
}
