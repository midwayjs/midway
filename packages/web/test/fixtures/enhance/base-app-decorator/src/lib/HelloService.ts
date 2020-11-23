import {Provide, Inject} from '@midwayjs/decorator';
import { BaseService } from './service';

@Provide()
export class HelloService {
  xxx: string[] = ['a', 'b'];

  name: string;

  @Inject('baseService')
  service: BaseService;

  async say() {
    if (!this.service) {
      throw new Error('Inject baseService fail!');
    }
    return `${this.xxx.join(',')}`;
  }
}
