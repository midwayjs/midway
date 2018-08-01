import {provide, inject} from 'injection';
import { BaseService } from './service';


@provide()
export class HelloService {
  xxx: Array<string> = ['a', 'b'];

  name: string;

  @inject('baseService')
  service: BaseService;

  async say() {
    if (!this.service) {
      throw new Error('inject baseService fail!');
    }
    return `${this.xxx.join(',')}`;
  }
}