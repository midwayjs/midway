import { Controller, Get, Inject } from '@midwayjs/core';

@Controller('/legacy')
export class LegacyController {
  @Inject('greetingService')
  greetingService: {
    format: (source: 'decorator' | 'functional') => string;
  };

  @Get('/hello')
  hello() {
    return {
      source: 'decorator',
      message: this.greetingService.format('decorator'),
    };
  }
}
