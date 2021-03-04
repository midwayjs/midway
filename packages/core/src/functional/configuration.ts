import { IMidwayApplication, IMidwayContainer } from '../interface';
import { InjectionConfigurationOptions } from '@midwayjs/decorator';

export class FunctionalConfiguration {
  private readHandler;
  private stopHandler;
  private options: InjectionConfigurationOptions;

  constructor(options: InjectionConfigurationOptions) {
    this.options = options;
  }

  onReady(
    readyHandler:
      | ((container: IMidwayContainer, app: IMidwayApplication) => void)
      | IMidwayContainer,
    app?: IMidwayApplication
  ) {
    if (typeof readyHandler === 'function') {
      this.readHandler = readyHandler;
    } else {
      this.readHandler(readyHandler, app);
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
