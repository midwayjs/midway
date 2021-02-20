import { GrpcMethod, GrpcStreamTypeEnum, Inject, MSProviderType, Provide, Provider } from '@midwayjs/decorator';
import { IMidwayGRPCContext } from '../../../../../src';
import { math } from '../interface';
import { Metadata } from '@grpc/grpc-js';

/**
 */
@Provide()
@Provider(MSProviderType.GRPC, { package: 'math' })
export class Math implements math.Math {

  @Inject()
  ctx: IMidwayGRPCContext;

  sumDataList = [];

  @GrpcMethod()
  async div(data: math.DivArgs): Promise<math.DivReply> {
    return {
      quotient: 1,
      remainder: 2,
    }
  }

  @GrpcMethod({type: GrpcStreamTypeEnum.DUPLEX, onEnd: 'duplexEnd' })
  async divMany(message)  {
    this.ctx.write({
      id: message.id,
      num: 1
    });
  }

  async duplexEnd() {

  }

  @GrpcMethod({type: GrpcStreamTypeEnum.WRITEABLE })
  async fib(fibArgs: math.FibArgs) {
    this.ctx.write({
      num: 1 + fibArgs.limit
    });
    this.ctx.write({
      num: 2 + fibArgs.limit
    });
    this.ctx.write({
      num: 3 + fibArgs.limit
    });

    const meta = new Metadata();
    this.ctx.metadata.add('xxx', 'bbb');

    this.ctx.sendMetadata(meta);
    this.ctx.end();
  }

  @GrpcMethod({type: GrpcStreamTypeEnum.READABLE, onEnd: 'sumEnd' })
  async sum(data: math.Num) {
    this.sumDataList.push(data);
  }

  async sumEnd(): Promise<math.Num> {
    const total = this.sumDataList.reduce((pre, cur) => {
      return {
        num: pre.num + cur.num,
      }
    })
    return total;
  }

}
