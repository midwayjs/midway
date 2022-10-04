import { Controller, Get } from '@midwayjs/core';

@Controller('/consul')
export class ConsulController {
  @Get('/health/self/check')
  async healthCheck(): Promise<any> {
    return {
      status: 'success',
    };
  }
}
