import { Provide, Trace, sleep } from '../../../../src';

@Provide()
export class UserService {
  @Trace('user.invoke')
  async invoke() {
    await sleep();
    return {
      ok: true,
    };
  }

  @Trace('user.invoke_error')
  async invokeError() {
    await sleep();
    throw new Error('custom error');
  }
}
