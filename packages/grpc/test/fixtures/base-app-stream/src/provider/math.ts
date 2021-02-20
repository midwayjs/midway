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
  async add(data: math.AddArgs): Promise<math.Num> {
    return {
      num: data.num + 2,
    }
  }

  @GrpcMethod({type: GrpcStreamTypeEnum.DUPLEX, onEnd: 'duplexEnd' })
  async addMore(message: math.AddArgs)  {
    this.ctx.write({
      id: message.id,
      num: message.num + 10
    });
  }

  async duplexEnd() {

  }

  @GrpcMethod({type: GrpcStreamTypeEnum.WRITEABLE })
  async sumMany(args: math.AddArgs) {
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
    this.ctx.metadata.add('xxx', 'bbb');

    this.ctx.sendMetadata(meta);
    this.ctx.end();
  }

  @GrpcMethod({type: GrpcStreamTypeEnum.READABLE, onEnd: 'sumEnd' })
  async addMany(data: math.Num) {
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
