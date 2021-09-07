import { IMidwayApplication, IMidwayContainer } from '../interface';
import { InjectionConfigurationOptions } from '@midwayjs/decorator';

export class FunctionalConfiguration {
  private readyHandler;
  private stopHandler;
  private configLoadHandler;
  private options: InjectionConfigurationOptions;

  constructor(options: InjectionConfigurationOptions) {
    this.options = options;
    this.readyHandler = () => {};
    this.stopHandler = () => {};
    this.configLoadHandler = () => {};
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
      this.configLoadHandler(configLoadHandler, app);
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
      this.readyHandler(readyHandler, app);
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
      this.stopHandler(stopHandler, app);
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
