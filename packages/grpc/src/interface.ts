import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { Server, ServerCredentials, Metadata, ServerUnaryCall, ClientWritableStream, ClientDuplexStream, ClientReadableStream /*ClientUnaryCall, ClientReadableStream, ClientWritableStream, ClientDuplexStream*/ } from '@grpc/grpc-js';

export interface IMidwayGRPCContext extends ServerUnaryCall<any, any>, IMidwayContext {
  metadata: Metadata;
  method: string;
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

export interface IClientUnaryService<reqType, resType> {
  sendMessage(reqData: reqType): Promise<resType>;
  // getCall(): ClientUnaryCall;
}

export interface IClientReadableStreamService<reqType, resType> {
  sendMessage(reqData: reqType): Promise<resType[]>;
  getCall(): ClientReadableStream<resType>;
}

export interface IClientWritableStreamService<reqType, resType> {
  sendMessage(reqData: reqType): IClientWritableStreamService<reqType, resType>;
  end(): Promise<resType>;
  getCall(): ClientWritableStream<reqType>;
}

export interface IClientDuplexStreamService<reqType, resType> {
  sendMessage(reqData: reqType): Promise<resType>;
  getCall(): ClientDuplexStream<reqType, resType>;
  end(): void;
}
