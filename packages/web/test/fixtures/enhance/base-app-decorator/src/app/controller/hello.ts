import { provide, inject, controller, get } from '../../../../../../../src';
import { BaseService } from '../../lib/service';
import { HelloService } from '../../lib/HelloService';

@provide()
@controller('/hello')
export class HelloController {
  name: string[] = ['a', 'b'];

  xxx = 'hjjj';

  aaaa;

  @inject()
  helloService: HelloService;

  @inject('baseService')
  service: BaseService;

  @get('/say')
  async say(ctx) {
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

  @get('/stage')
  async doStage(ctx) {
    ctx.body = await this.service.doStages();
  }
}
