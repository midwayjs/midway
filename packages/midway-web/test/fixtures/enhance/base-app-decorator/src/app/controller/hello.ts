import {provide, inject} from 'injection';
import { Controller, controller, get } from '../../../../../../../src';
import { BaseService } from '../../lib/service';
import { HelloService } from '../../lib/HelloService';

@provide()
@controller('/hello')
export class HelloController extends Controller {
  name: Array<string> = ['a', 'b'];

  xxx: string = 'hjjj';

  aaaa;

  @inject()
  helloService: HelloService;

  @inject('baseService')
  service: BaseService;

  @get('/say')
  async say() {
    console.log('----', this.name, this.xxx, this.aaaa);
    const arr = [];
    if (this.service) {
      arr.push('service');
    }
    if (this.helloService) {
      arr.push('hello');
      arr.push(await this.helloService.say());
    }
    // service,hello,a,b
    this.ctx.body = arr.join(',');
  }
}
