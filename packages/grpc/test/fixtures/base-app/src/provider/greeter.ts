// import {
//   sendUnaryData,
//   ServerUnaryCall,
// } from '@grpc/grpc-js';

import { MSProviderType, Provider, Provide, GrpcMethod } from '@midwayjs/decorator';

/**
 * package helloworld
 * service Greeter
 */
@Provide()
@Provider(MSProviderType.GRPC)
export class Greeter {

  @GrpcMethod()
  /**
   * Implements the SayHello RPC method.
   */
  public sayHello(call: /*ServerUnaryCall<HelloRequest, HelloResponse>*/ any, callback: /*sendUnaryData<HelloResponse>*/ any): void {
    callback(null, { message: 'Hello ' + call.request.name });
  }
}
