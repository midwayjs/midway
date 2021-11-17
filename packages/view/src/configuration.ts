import { App, Configuration } from '@midwayjs/decorator';
import { completeAssign } from '@midwayjs/mw-util';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';
import { ViewManager } from './viewManager';

@Configuration({
  namespace: 'view',
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
    },
  ],
})
export class ViewConfiguration {
  @App()
  app;

  async onReady(container) {
    if (!this.app.config) {
      this.app.config = this.app.getConfig();
    }
    completeAssign(this.app.context, require('egg-view/app/extend/context'));
    (this.app as any).view = await container.getAsync(ViewManager);
    if (!(this.app as any).toAsyncFunction) {
      (this.app as any).toAsyncFunction = method => {
        return method;
      };
    }
  }
}
