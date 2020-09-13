import { Provide } from '@midwayjs/decorator';

@Provide()
export class InjectInstance {
  handler() {
    return 'Hello InjectInstance';
  }
}
