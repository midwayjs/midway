import { IMidwayApplication, IMidwayContainer } from '../interface';
import { InjectionConfigurationOptions } from '@midwayjs/decorator';

export class FunctionalConfiguration {
  private readyHandler;
  private stopHandler;
  private configLoadHandler;
  private serverReadyHandler;
  private options: InjectionConfigurationOptions;

  constructor(options: InjectionConfigurationOptions) {
    this.options = options;
    this.readyHandler = () => {};
    this.stopHandler = () => {};
    this.configLoadHandler = () => {};
    this.serverReadyHandler = () => {};
  }

  onConfigLoad(
    configLoadHandler:
      | ((container: IMidwayContainer, app: IMidwayApplication) => any)
      | IMidwayContainer,
    app?: IMidwayApplication
  ) {
    if (typeof configLoadHandler === 'function') {
      this.configLoadHandler = configLoadHandler;
    } else {
      return this.configLoadHandler(configLoadHandler, app);
    }
    return this;
  }

  onReady(
    readyHandler:
      | ((container: IMidwayContainer, app: IMidwayApplication) => void)
      | IMidwayContainer,
    app?: IMidwayApplication
  ) {
    if (typeof readyHandler === 'function') {
      this.readyHandler = readyHandler;
    } else {
      return this.readyHandler(readyHandler, app);
    }
    return this;
  }

  onServerReady(
    serverReadyHandler:
      | ((container: IMidwayContainer, app: IMidwayApplication) => void)
      | IMidwayContainer,
    app?: IMidwayApplication
  ) {
    if (typeof serverReadyHandler === 'function') {
      this.serverReadyHandler = serverReadyHandler;
    } else {
      return this.serverReadyHandler(serverReadyHandler, app);
    }
    return this;
  }

  onStop(
    stopHandler:
      | ((container: IMidwayContainer, app: IMidwayApplication) => void)
      | IMidwayContainer,
    app?: IMidwayApplication
  ) {
    if (typeof stopHandler === 'function') {
      this.stopHandler = stopHandler;
    } else {
      return this.stopHandler(stopHandler, app);
    }
    return this;
  }

  getConfigurationOptions() {
    return this.options;
  }
}

export const createConfiguration = (options: InjectionConfigurationOptions) => {
  return new FunctionalConfiguration(options);
};
