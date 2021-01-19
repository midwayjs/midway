import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { Server, ServerCredentials } from '@grpc/grpc-js';

export type IMidwayGRPCContext = IMidwayContext & {
  startTime: number;
}
export type IMidwayGRPCApplication = IMidwayApplication & Server;

export type Application = IMidwayGRPCApplication;

export type Context = IMidwayGRPCContext;

export interface IGRPCServiceOptions {
  /**
   * application gRPC connection string
   */
  url?: string;
  /**
   * proto path
   */
  protoPath?: string;

  /**
   * protobuf package name
   */
  package?: string;

  loaderOptions?: object;

  credentials?: ServerCredentials;
}

export interface IMidwayGRPFrameworkOptions extends IConfigurationOptions {
  /**
   * gRPC Server connection url, default is localhost:6565
   */
  url?: string;
  services: Pick<IGRPCServiceOptions, 'protoPath' | 'package'>[];
  loaderOptions?: object;
}

export interface DefaultConfig extends IConfigurationOptions {
  services: IGRPCServiceOptions[];
}
