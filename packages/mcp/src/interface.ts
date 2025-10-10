import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
  NextFunction as BaseNextFunction,
} from '@midwayjs/core';
import { Implementation, CallToolResult, GetPromptResult, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerOptions } from '@modelcontextprotocol/sdk/server/index.js';

export interface IMidwayMCPConfigurationOptions extends IConfigurationOptions {
  serverInfo: Implementation;
  serverOptions: ServerOptions;
  /**
   * Transport type for MCP communication
   * - 'stdio': Standard input/output transport for CLI applications
   * - 'stream-http': HTTP-based transport with streaming support and backward compatibility with SSE
   * - 'sse': Legacy SSE transport (deprecated, use 'stream-http' instead which provides backward compatibility)
   */
  transportType: 'stdio' | 'sse' | 'stream-http';
  /**
   * Endpoint paths for different transport types
   */
  endpoints?: {
    /** StreamHTTP endpoint path (default: '/mcp') */
    streamHttp?: string;
    /** SSE endpoint path for backward compatibility (default: '/sse') */
    sse?: string;
    /** Messages endpoint path for backward compatibility (default: '/messages') */
    messages?: string;
  };
}

export interface IMidwayMCPContext extends IMidwayContext {}

export type IMidwayMCPApplication = IMidwayApplication<IMidwayMCPContext>;

export type Application = IMidwayMCPApplication;
export interface Context extends IMidwayMCPContext {}
export type NextFunction = BaseNextFunction;

export interface IMcpResource {
  handle(...args: any[]): Promise<ReadResourceResult>;
}

export interface IMcpTool {
  execute(...args: any[]): Promise<CallToolResult>;
}

export interface IMcpPrompt {
  generate(...args: any[]): Promise<GetPromptResult>;
}