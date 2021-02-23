import {
  IClientDuplexStreamService,
  IClientReadableStreamService,
  IClientUnaryService,
  IClientWritableStreamService
} from '../../../../src';

export namespace math {
  export interface AddArgs {
    id?: number;
    num?: number;
  }
  export interface Num {
    id?: number;
    num?: number;
  }

  /**
   * server interface
   */
  export interface Math {
    add(data: AddArgs): Promise<Num>;
    addMore(data: AddArgs): Promise<void>;
    // 服务端推，客户端读
    sumMany(fibArgs: AddArgs): Promise<void>
    // 客户端端推，服务端读
    addMany(num: AddArgs): Promise<void>;
  }

  /**
   * client interface
   */
  export interface MathClient {
    add(): IClientUnaryService<AddArgs, Num>;
    addMore(): IClientDuplexStreamService<AddArgs, Num>;
    // 服务端推，客户端读
    sumMany(): IClientReadableStreamService<AddArgs, Num>;
    // 客户端端推，服务端读
    addMany(): IClientWritableStreamService<AddArgs, Num>;
  }
}
