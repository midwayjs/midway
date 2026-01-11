import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
} from '@midwayjs/core';
import { Command } from 'commander';

export { IMidwayContext } from '@midwayjs/core';

export interface ICommanderConfigurationOptions extends IConfigurationOptions {
  // global config
  errorHandler?: (err: Error) => void;
}

export interface IMidwayCommanderContext extends IMidwayContext {
  command?: Command;
  args?: string[];
  options?: Record<string, any>;
  commandName?: string;
}

export type IMidwayCommanderApplication =
  IMidwayApplication<IMidwayCommanderContext>;

export type Application = IMidwayCommanderApplication;
export type Context = IMidwayCommanderContext;

export interface CommandRunner {
  run(
    passedParams: string[],
    options?: Record<string, any>
  ): unknown | Promise<unknown>;
}
