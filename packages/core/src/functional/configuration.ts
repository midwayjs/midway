import { ILifeCycle, IMidwayContainer } from '../interface';
import { Configuration, InjectionConfigurationOptions } from '@midwayjs/decorator';

export class FunctionalConfiguration implements ILifeCycle {

  private static readHandler;
  private static stopHandler;

  static onReady(readyHandler: (container: IMidwayContainer) => void) {
    this.readHandler = readyHandler;
    return this;
  }

  static onStop(stopHandler: (container: IMidwayContainer) => void) {
    this.stopHandler = stopHandler;
    return this;
  }

  onReady(container?: IMidwayContainer): Promise<void> {
    return FunctionalConfiguration.readHandler.call(this, container);
  }

  onStop(container?: IMidwayContainer): Promise<void> {
    return FunctionalConfiguration.stopHandler.call(this, container);
  }
}

export const createConfiguration = (options: InjectionConfigurationOptions) => {
  Configuration(options)(FunctionalConfiguration);
  return FunctionalConfiguration;
}
