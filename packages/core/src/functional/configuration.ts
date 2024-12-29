import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
  ObjectBeforeCreatedOptions,
  ObjectBeforeDestroyOptions,
  ObjectCreatedOptions,
  ObjectInitOptions,
  FunctionalConfigurationOptions,
  LifeCycleInvokeOptions,
} from '../interface';
import { CONFIGURATION_OBJECT_KEY } from '../decorator';
import { MetadataManager } from '../decorator/metadataManager';

export class FunctionalConfiguration implements ILifeCycle {
  constructor(protected options: FunctionalConfigurationOptions) {}

  async onConfigLoad(
    container: IMidwayContainer,
    mainApp: IMidwayApplication,
    options: LifeCycleInvokeOptions
  ): Promise<any> {
    return this.options?.onConfigLoad?.(container, mainApp, options);
  }

  async onReady(
    container: IMidwayContainer,
    mainApp: IMidwayApplication,
    options: LifeCycleInvokeOptions
  ) {
    return this.options?.onReady?.(container, mainApp, options);
  }

  async onServerReady(
    container: IMidwayContainer,
    mainApp: IMidwayApplication,
    options: LifeCycleInvokeOptions
  ) {
    return this.options?.onServerReady?.(container, mainApp, options);
  }

  async onHealthCheck(
    container: IMidwayContainer,
    mainApp: IMidwayApplication,
    options: LifeCycleInvokeOptions
  ) {
    return this.options?.onHealthCheck?.(container, mainApp, options);
  }

  async onStop(
    container: IMidwayContainer,
    mainApp: IMidwayApplication,
    options: LifeCycleInvokeOptions
  ) {
    return this.options?.onStop?.(container, mainApp, options);
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
  MetadataManager.ensureTargetType(
    configuration,
    MetadataManager.ObjectType.Object
  );
  MetadataManager.defineMetadata(
    CONFIGURATION_OBJECT_KEY,
    options,
    configuration
  );
  return configuration;
};
