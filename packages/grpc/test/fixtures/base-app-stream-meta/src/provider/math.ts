import * as assert from 'assert';
import { GrpcMethod, GrpcStreamTypeEnum, Inject, MSProviderType, Provide, Provider } from '@midwayjs/core';
import { Context } from '../../../../../src';
import { math } from '../interface';
import { Metadata } from '@grpc/grpc-js';

/**
 */
@Provide()
@Provider(MSProviderType.GRPC, { package: 'math' })
export class Math implements math.Math {

  @Inject()
  ctx: Context;

  sumDataList = [];

  @GrpcMethod()
  async add(data: math.AddArgs): Promise<math.Num> {
    assert(this.ctx, 'should get context');
    const { metadata } = this.ctx;
    assert(metadata, 'should get metadata');

    const rpcMethodType = metadata.get('rpc.method.type');
    assert(rpcMethodType[0] === 'unary', `should get rpc.method.type, but got "${rpcMethodType[0]}"`);

    return {
      num: data.num + 2,
    }
  }

  @GrpcMethod({type: GrpcStreamTypeEnum.DUPLEX, onEnd: 'duplexEnd' })
  async addMore(message: math.AddArgs)  {
    const { metadata } = this.ctx;
    assert(metadata, 'should get metadata');

    const rpcMethodType = metadata.get('rpc.method.type');
    assert(rpcMethodType[0] === 'bidi', `should get rpc.method.type, but got "${rpcMethodType[0]}"`);

    this.ctx.write({
      id: message.id,
      num: message.num + 10,
    });
  }

  async duplexEnd() {
    console.log('got client end message');
  }

  @GrpcMethod({type: GrpcStreamTypeEnum.WRITEABLE })
  async sumMany(args: math.AddArgs) {
    const { metadata } = this.ctx;
    assert(metadata, 'should get metadata');

    const rpcMethodType = metadata.get('rpc.method.type');
    assert(rpcMethodType[0] === 'server', `should get rpc.method.type, but got "${rpcMethodType[0]}"`);

    this.ctx.write({
      num: 1 + args.num
    });
    this.ctx.write({
      num: 2 + args.num
    });
    this.ctx.write({
      num: 3 + args.num
    });

    const meta = new Metadata();
    meta.add('xxx', 'bbb');

    this.ctx.sendMetadata(meta);
    this.ctx.end();
  }

  @GrpcMethod({type: GrpcStreamTypeEnum.READABLE, onEnd: 'sumEnd' })
  async addMany(data: math.Num) {
    const { metadata } = this.ctx;
    assert(metadata, 'should get metadata');

    const rpcMethodType = metadata.get('rpc.method.type');
    assert(rpcMethodType[0] === 'client', `should get rpc.method.type, but got "${rpcMethodType[0]}"`);

    this.sumDataList.push(data);
  }

  async sumEnd(): Promise<math.Num> {
    const total = this.sumDataList.reduce((pre, cur) => {
      return {
        num: pre.num + cur.num,
      }
    });
    return total;
  }

}
