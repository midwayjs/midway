import { Controller, Get } from '@midwayjs/core';

@Controller('/', { ignoreGlobalPrefix: true })
export class ConsulController {
  @Get('/health')
  async healthCheck() {
    return 'success';
  }
}
