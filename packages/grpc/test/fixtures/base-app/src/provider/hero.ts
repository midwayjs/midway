import { GrpcMethod, MSProviderType, Provider, Provide, Inject, Init } from '@midwayjs/decorator';
import { helloworld, hero } from '../interface';
import { Clients } from '../../../../../src';

@Provide()
@Provider(MSProviderType.GRPC)
export class HeroService implements hero.HeroService {

  @Inject('grpc:clients')
  grpcClients: Clients;

  greeterService: helloworld.Greeter;

  @Init()
  async init() {
    this.greeterService = this.grpcClients.getService<helloworld.Greeter>('Greeter');
  }

  @GrpcMethod()
  async findOne(data, metadata) {
    // const result = await this.greeterService.sayHello({
    //   name: 'harry'
    // });
    return {
      id: 1,
      name: 'bbbb',
    };
  }
}
