import {Controller, Get, Inject, Param, Provide} from '@midwayjs/core';
import {IConsulBalancer} from "../../../../../src";

@Provide()
@Controller('/test')
export class TestController {
  @Inject('consul:balancerService')
  balancerService: IConsulBalancer;

  // @ts-ignore
  @Get('/balancer/lookup/:serviceName')
  async lookupConsulService(@Param('serviceName') serviceName: string) {
    const balancer = this.balancerService.getServiceBalancer();
    return await balancer.select(serviceName);
  }
}
