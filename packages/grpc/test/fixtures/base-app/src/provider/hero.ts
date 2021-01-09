import { GrpcMethod, MSProviderType, Provider, Provide } from '@midwayjs/decorator';
import { hero } from '../interface';

@Provide()
@Provider(MSProviderType.GRPC)
export class HeroService implements hero.HeroService{
  @GrpcMethod()
  async findOne(data, metadata) {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
