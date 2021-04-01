import { Get, Inject, Provide, Controller } from '@midwayjs/decorator';
import * as PromClient from 'prom-client';

@Provide()
@Controller('/')
export class MetricsControlelr {
  @Inject()
  ctx;

  @Get('/metrics')
  async metrics() {
    const Register = PromClient.register;
    this.ctx.set('Content-Type', Register.contentType);
    const res = await Register.metrics();
    return res;
  }
}
