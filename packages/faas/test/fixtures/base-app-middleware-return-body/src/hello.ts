import {
  App,
  Inject,
  Provide,
  ServerlessTrigger,
  ServerlessTriggerType,
} from '@midwayjs/core';
import { Context } from '../../../../src';

@Provide()
export class HelloService {
  @Inject()
  ctx: Context; // context

  @App()
  app;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/'
  })
  async handler() {
    return null;
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/undefined'
  })
  async rUndefined() {
    return undefined;
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/null'
  })
  async rNull() {
    return null;
  }
}
