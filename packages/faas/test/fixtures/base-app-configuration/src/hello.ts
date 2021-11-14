import { Inject, Provide, Config, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { UserManager } from './lib/userManager';
import assert = require('assert');

@Provide()
export class HelloService {
  @Inject()
  ctx; // context

  @Config('case')
  allConfig;

  @Inject()
  userManager: UserManager;

  @Inject('@midway-plugin-mod:articleManager')
  articleManager: any;

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
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
