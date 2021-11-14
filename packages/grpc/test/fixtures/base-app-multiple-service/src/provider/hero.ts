import { GrpcMethod, MSProviderType, Provider, Provide, Inject, Init } from '@midwayjs/decorator';
import { helloworld, hero } from '../interface';
import { Clients } from '../../../../../src';

@Provide()
@Provider(MSProviderType.GRPC, { package: 'hero' })
export class HeroService implements hero.HeroService {

  @Inject()
  grpcClients: Clients;

  greeterService: helloworld.GreeterClient;

  @Init()
  async init() {
    this.greeterService = this.grpcClients.getService<helloworld.GreeterClient>('helloworld.Greeter');
  }

  @GrpcMethod()
  async findOne(data) {
    const result = await this.greeterService.sayHello().sendMessage({
      name: 'harry'
    });
    return {
      id: 1,
      name: 'bbbb-' + result.message,
    };
  }
}
