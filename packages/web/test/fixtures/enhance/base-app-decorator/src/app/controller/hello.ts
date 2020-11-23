import { Provide, Inject, Controller, Get } from '@midwayjs/decorator';
import { BaseService } from '../../lib/service';
import { HelloService } from '../../lib/HelloService';

@Provide()
@Controller('/hello')
export class HelloController {
  name: string[] = ['a', 'b'];

  xxx = 'hjjj';

  aaaa;

  @Inject()
  helloService: HelloService;

  @Inject('baseService')
  service: BaseService;

  @Get('/say')
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

  @Get('/stage')
  async doStage(ctx) {
    ctx.body = await this.service.doStages();
  }
}
