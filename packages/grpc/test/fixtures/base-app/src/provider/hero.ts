import { GrpcMethod, MSProviderType, Provider, Provide, Inject } from '@midwayjs/decorator';
import { hero } from '../interface';
import { GreeterService } from '../consumer/greeter.service';

@Provide()
@Provider(MSProviderType.GRPC)
export class HeroService implements hero.HeroService {

  @Inject()
  greeterService: GreeterService;

  @GrpcMethod()
  async findOne(data, metadata) {
    const result = await this.greeterService.sayHello({
      name: 'harry'
    });
    return {
      id: 1,
      name: result.message,
    };
  }
}
