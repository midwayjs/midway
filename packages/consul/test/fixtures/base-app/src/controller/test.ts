import {Controller, Get, Inject, Param, Provide} from "@midwayjs/decorator";
import {IConsulBalancer} from "../../../../../src";

@Provide()
@Controller('/test')
export class TestController {
  @Inject('consul:balancerService')
  balancerService: IConsulBalancer;

  // @ts-ignore
  @Get('/balancer/lookup/:serviceName')
  async lookupConsulService(@Param() serviceName: string) {
    const balancer = this.balancerService.getBalancer();
    return await balancer.select(serviceName);
    // return await balancer.select(serviceName, false);
  }
}
