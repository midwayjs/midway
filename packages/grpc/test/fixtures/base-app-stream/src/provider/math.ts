import { MSProviderType, Provider, Provide } from '@midwayjs/decorator';
import { math } from '../interface';

/**
 */
@Provide()
@Provider(MSProviderType.GRPC, { package: 'math' })
export class Math implements math.Math {

  async div(data: math.DivArgs, metadata?): Promise<math.DivReply> {
    return {
      quotient: 1,
      remainder: 2,
    }
  }

  async divMany(data: math.DivArgs, metadata?): Promise<math.DivReply> {
    return Promise.resolve(undefined);
  }

  async fib(data: math.FibArgs, metadata?): Promise<math.Num> {
    return Promise.resolve(undefined);
  }

  async sum(data: math.Num, metadata?): Promise<math.Num> {
    return Promise.resolve(undefined);
  }

}
