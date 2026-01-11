import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
} from '@midwayjs/core';

export interface OneShotConfigOptions extends IConfigurationOptions {
  // global config
}

/**
 * One-shot execution context.
 */
export interface IMidwayOneShotContext extends IMidwayContext {
  payload?: unknown;
}

export type IMidwayOneShotApplication = IMidwayApplication<IMidwayOneShotContext>;

export type Application = IMidwayOneShotApplication;
export type Context = IMidwayOneShotContext;

/**
 * One-shot runner contract.
 */
export interface OneShotRunner<T = unknown, R = unknown> {
  run(payload?: T, ctx?: IMidwayOneShotContext): R | Promise<R>;
}
