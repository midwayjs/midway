import {
  IConfigurationOptions,
  IMidwayApplication,
  IMidwayContext,
  NextFunction as BaseNextFunction
} from '@midwayjs/core';
import {
  Server,
  ServerCredentials,
  Metadata,
  ClientWritableStream,
  ClientDuplexStream,
  ClientReadableStream,
  ClientUnaryCall,
  ChannelOptions,
  ClientOptions,
  ServerUnaryCall,
  ServerReadableStream,
  ServerWritableStream,
  ServerDuplexStream,
} from '@grpc/grpc-js';

type GrpcHandleCall<RequestType, ResponseType> =
  Partial<ServerUnaryCall<RequestType, ResponseType> &
    ServerReadableStream<RequestType, ResponseType> &
    ServerWritableStream<RequestType, ResponseType> &
    ServerDuplexStream<RequestType, ResponseType>>;

export interface Context<RequestType = unknown, ResponseType = unknown> extends IMidwayContext<GrpcHandleCall<RequestType, ResponseType>> {
  method: string;
}

export type IMidwayGRPCApplication = IMidwayApplication<Context, Server>;

export type Application = IMidwayGRPCApplication;
export type NextFunction = BaseNextFunction;

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
  /**
   * Client options. Optional.
   */
  clientOptions?: ClientOptions;
}

export interface IMidwayGRPFrameworkOptions extends IConfigurationOptions {
  /**
   * gRPC Server connection url, like 'localhost:6565'
   */
  url?: string;
  services?: IGRPCServiceOptions[];
  /**
   * proto file loader options. Optional
   */
  loaderOptions?: object;
  /**
   * Server credentials. Optional.
   */
  credentials?: ServerCredentials;
  /**
   * grpc server options
   */
  serverOptions?: ChannelOptions;
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
