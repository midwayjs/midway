import {
  App,
  Inject,
  Provide,
  ServerlessTrigger,
  ServerlessTriggerType,
} from '@midwayjs/decorator';
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
}
