import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { Server } from '@grpc/grpc-js';

export type IMidwayGRPCContext = IMidwayContext & {
  startTime: number;
}
export type IMidwayGRPCApplication = IMidwayApplication & Server;

export interface IMidwayGRPConfigurationOptions {
  /**
   * application gRPC port
   */
  port?: number;
  /**
   * proto path
   */
  protoPath?: string;
}
