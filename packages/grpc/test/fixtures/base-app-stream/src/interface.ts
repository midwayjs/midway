import {
  IClientDuplexStreamService,
  IClientReadableStreamService,
  IClientUnaryService,
  IClientWritableStreamService
} from '../../../../src';

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

  /**
   * server interface
   */
  export interface Math {
    div(data: math.DivArgs): Promise<DivReply>;
    divMany(data: any): void;
    // 服务端推，客户端读
    fib(fibArgs: math.FibArgs): Promise<void>
    // 客户端端推，服务端读
    sum(num: Num): Promise<void>;
  }

  /**
   * client interface
   */
  export interface MathClient {
    div(): IClientUnaryService<DivArgs, DivReply>;
    divMany(): Promise<IClientDuplexStreamService<DivReply, DivArgs>>;
    // 服务端推，客户端读
    fib(): IClientReadableStreamService<FibArgs, Num>;
    // 客户端端推，服务端读
    sum(): IClientWritableStreamService<any, Num>;
  }
}
