import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
  ObjectBeforeCreatedOptions,
  ObjectBeforeDestroyOptions,
  ObjectCreatedOptions,
  ObjectInitOptions,
  FunctionalConfigurationOptions,
} from '../interface';
import { CONFIGURATION_OBJECT_KEY } from '../decorator';
import { MetadataManager } from '../decorator/metadataManager';

export class FunctionalConfiguration implements ILifeCycle {
  constructor(protected options: FunctionalConfigurationOptions) {}

  async onConfigLoad(
    container: IMidwayContainer,
    mainApp: IMidwayApplication
  ): Promise<any> {
    return this.options?.onConfigLoad?.(container, mainApp);
  }

  async onReady(container: IMidwayContainer, mainApp: IMidwayApplication) {
    return this.options?.onReady?.(container, mainApp);
  }

  async onServerReady(
    container: IMidwayContainer,
    mainApp: IMidwayApplication
  ) {
    return this.options?.onServerReady?.(container, mainApp);
  }

  async onHealthCheck(container: IMidwayContainer) {
    return this.options?.onHealthCheck?.(container);
  }

  async onStop(container: IMidwayContainer, mainApp: IMidwayApplication) {
    return this.options?.onStop?.(container, mainApp);
  }

  // object lifecycle
  onBeforeObjectCreated(Clzz: any, options: ObjectBeforeCreatedOptions): void {
    return this.options?.onBeforeObjectCreated?.(Clzz, options);
  }

  onObjectCreated<T>(ins: T, options: ObjectCreatedOptions<T>): void {
    return this.options?.onObjectCreated?.(ins, options);
  }

  onObjectInit<T>(ins: T, options: ObjectInitOptions): void {
    return this.options?.onObjectInit?.(ins, options);
  }

  onBeforeObjectDestroy<T>(ins: T, options: ObjectBeforeDestroyOptions): void {
    return this.options?.onBeforeObjectDestroy?.(ins, options);
  }
}

export const defineConfiguration = (
  options: FunctionalConfigurationOptions
) => {
  const configuration = new FunctionalConfiguration(options);
  MetadataManager.ensureTargetType(configuration, MetadataManager.ObjectType.Object);
  MetadataManager.defineMetadata(
    CONFIGURATION_OBJECT_KEY,
    options,
    configuration
  );
  return configuration;
};
