import { IConfigurationOptions, IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { Server, ServerCredentials, Metadata, ServerUnaryCall, ClientWritableStream, ClientDuplexStream, ClientReadableStream, ClientUnaryCall } from '@grpc/grpc-js';

export interface Context extends ServerUnaryCall<any, any>, IMidwayContext {
  metadata: Metadata;
  method: string;
}
export type IMidwayGRPCApplication = IMidwayApplication<Context> & Server;

export type Application = IMidwayGRPCApplication;

export interface IGRPCServiceOptions {
  /**
   * proto path
   */
  protoPath?: string;

  /**
   * protobuf package name
   */
  package?: string;
}

export interface IGRPCClientServiceOptions extends IGRPCServiceOptions {
  /**
   * application gRPC connection string
   */
  url: string;
  /**
   * proto file loader options. Optional
   */
  loaderOptions?: object;

  /**
   * Server credentials. Optional.
   */
  credentials?: ServerCredentials;
}

export interface IMidwayGRPFrameworkOptions extends IConfigurationOptions {
  /**
   * gRPC Server connection url, like 'localhost:6565'
   */
  url?: string;
  services: IGRPCServiceOptions[];
  /**
   * proto file loader options. Optional
   */
  loaderOptions?: object;
  /**
   * Server credentials. Optional.
   */
  credentials?: ServerCredentials;
}

export interface DefaultConfig extends IConfigurationOptions {
  services: IGRPCClientServiceOptions[];
}

export interface IClientUnaryService<reqType, resType> {
  sendMessage(reqData: reqType, handler?: (call: ClientUnaryCall) => void): Promise<resType>;
  sendMessageWithCallback(content: reqType, callback): ClientUnaryCall;
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

export interface IClientOptions {
  metadata?: Metadata;
  timeout?: number;
  timeoutMessage?: number;
  messageKey?: string;
}
