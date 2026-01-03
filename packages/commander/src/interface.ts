import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';

export { IMidwayContext } from '@midwayjs/core';

export interface ICommanderConfigurationOptions extends IConfigurationOptions {
  // global config
}

export type IMidwayCommanderApplication = IMidwayApplication<IMidwayContext>;

export type Application = IMidwayCommanderApplication;
export type Context = IMidwayContext;

export interface CommandRunner {
  run(passedParams: string[], options?: Record<string, any>): Promise<void>;
}
