import {provide, inject} from 'injection';
import {controller, get} from '../../../../../../../src';
import { BaseService } from '../../lib/service';
import { HelloService } from '../../lib/HelloService';

@provide()
@controller('/hello')
export class HelloController {
  name: Array<string> = ['a', 'b'];

  xxx: string = 'hjjj';

  aaaa;

  @inject()
  helloService: HelloService;

  @inject('baseService')
  service: BaseService;

  @get('/say')
  async say(ctx) {
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
    ctx.body = arr.join(',');
  }
}