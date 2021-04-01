import { Get, Inject, Provide, Controller } from '@midwayjs/decorator';
import * as PromClient from 'prom-client';

@Provide()
@Controller('/metrics')
export class PrometheusControlelr {
  @Inject()
  ctx;

  @Get('/')
  async metrics() {
    const Register = PromClient.register;
    this.ctx.set('Content-Type', Register.contentType);
    return Register.metrics();
  }
}
