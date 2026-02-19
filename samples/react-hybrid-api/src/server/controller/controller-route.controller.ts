import { Controller, Get } from '@midwayjs/core';

@Controller('/controller-route')
export class ControllerRouteController {
  @Get('/hello', {
    routerName: 'controllerRouteHello',
  })
  hello() {
    return {
      message: 'hello from controller route',
    };
  }
}
