import { Metadata, ServerDuplexStream, ServerReadableStream, ServerWritableStream } from '@grpc/grpc-js';

export namespace math {
  export interface DivArgs {
    dividend?: number;
    divisor?: number;
  }
  export interface DivReply {
    quotient?: number;
    remainder?: number;
  }
  export interface FibArgs {
    limit?: number;
  }
  export interface Num {
    num?: number;
  }
  export interface FibReply {
    count?: number;
  }
  export interface Math {
    div(data: DivArgs, metadata?: Metadata): Promise<DivReply>;
    divMany(requestStream: ServerDuplexStream<DivArgs, DivReply>, metadata?: Metadata): ServerDuplexStream<DivArgs, DivReply>;
    fib(requestStream: ServerReadableStream<FibArgs, any>, metadata?: Metadata): void;
    sum(metadata?: Metadata): ServerWritableStream<Num, any>;
  }
}
