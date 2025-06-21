import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
  NextFunction as BaseNextFunction,
} from '@midwayjs/core';
import { Implementation } from '@modelcontextprotocol/sdk/types.js';
import { ServerOptions} from '@modelcontextprotocol/sdk/server/index.js';

export interface IMidwayMCPConfigurationOptions extends IConfigurationOptions {
  serverInfo: Implementation;
  serverOptions: ServerOptions;
  transportType: 'stdio' | 'sse';
}

export interface IMidwayMCPContext extends IMidwayContext {}

export type IMidwayMCPApplication = IMidwayApplication<IMidwayMCPContext>;

export type Application = IMidwayMCPApplication;
export interface Context extends IMidwayMCPContext {}
export type NextFunction = BaseNextFunction;

export interface IMcpResource {
  handle(ctx: IMidwayMCPContext): Promise<any>;
}

export interface IMcpTool {
  execute(ctx: IMidwayMCPContext): Promise<any>;
}

export interface IMcpPrompt {
  generate(ctx: IMidwayMCPContext): Promise<any>;
} 