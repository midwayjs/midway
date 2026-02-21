import { Provide } from '@midwayjs/core';

@Provide('greetingService')
export class GreetingService {
  format(source: 'decorator' | 'functional') {
    return `hello from ${source}`;
  }
}
