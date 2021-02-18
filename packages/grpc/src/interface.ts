import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { Server, ServerCredentials, Metadata, ServerUnaryCall } from '@grpc/grpc-js';

export interface IMidwayGRPCContext extends IMidwayContext {
  metadata: Metadata;
  method: string;
  sendMetadata(metadata: Metadata): void;
  call: ServerUnaryCall<any, any>;
}
export type IMidwayGRPCApplication = IMidwayApplication<IMidwayGRPCContext> & Server;

export type Application = IMidwayGRPCApplication;

export interface Context extends IMidwayGRPCContext {}

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
