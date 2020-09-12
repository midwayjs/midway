import {
  BaseFramework, generateProvideId, getClassMetadata, getProviderId,
  IMidwayBootstrapOptions, listModule,
  MidwayFrameworkType,
  MidwayProcessTypeEnum,
  PRIVATE_META_DATA_KEY,
} from '@midwayjs/core';

import { IMidwaySocketIOApplication, IMidwaySocketIOConfigurationOptions } from './interface';
import * as SocketIO from 'socket.io';
import { ControllerOption, WS_CONTROLLER_KEY } from "@midwayjs/decorator";

export class MidwaySocketIOFramework extends BaseFramework<IMidwaySocketIOConfigurationOptions> {
  protected app: IMidwaySocketIOApplication;

  public configure(
    options: IMidwaySocketIOConfigurationOptions
  ): MidwaySocketIOFramework {
    this.configurationOptions = options;
    return this;
  }

  protected async afterDirectoryLoad(options: Partial<IMidwayBootstrapOptions>) {
    if (this.configurationOptions.webServer) {
      this.app = SocketIO(this.configurationOptions.webServer, this.configurationOptions) as unknown as IMidwaySocketIOApplication;
    } else {
      this.app = SocketIO(this.configurationOptions) as unknown as IMidwaySocketIOApplication;
    }

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
      // if set httpServer will be listen in web framework
      if (!this.configurationOptions.webServer) {
        new Promise((resolve) => {
          this.app.listen(this.configurationOptions.port, this.configurationOptions);
        });
      }
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
    const controllerModules = listModule(WS_CONTROLLER_KEY);
    for (const module of controllerModules) {
      let providerId = getProviderId(module);
      const meta = getClassMetadata(PRIVATE_META_DATA_KEY, module);
      if (providerId && meta) {
        providerId = generateProvideId(providerId, meta.namespace);
      }
      if (providerId) {
        await this.addNamespace(module, providerId);
      }
    }
  }

  private async addNamespace(target: any, controllerId: string) {
    const controllerOption: ControllerOption = getClassMetadata(
      WS_CONTROLLER_KEY,
      target
    );

    console.log(controllerOption);
  }
}
