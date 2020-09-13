import {
  inject,
  provide,
  func,
  config,
  FunctionHandler,
} from '../../../../src';
import { UserManager } from './lib/userManager';
import assert = require('assert');

@provide()
@func('index.handler')
export class HelloService implements FunctionHandler {
  @inject()
  ctx; // context

  @config('case')
  allConfig;

  @inject()
  userManager: UserManager;

  @inject('@midway-plugin-mod:articleManager')
  articleManager: any;

  async handler(event) {
    assert.equal(
      await this.userManager.getUser(),
      'harry',
      'userManager.getUser should be ok'
    );

    return (
      this.allConfig +
      event.text +
      ((await this.articleManager.getOne()) + this.ctx.env)
    );
  }
}
