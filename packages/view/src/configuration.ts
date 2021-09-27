import { App, Configuration } from '@midwayjs/decorator';
import { completeAssign } from '@midwayjs/mw-util';
import { join } from 'path';
import { ViewManager } from './viewManager';

@Configuration({
  namespace: 'view',
  importConfigs: [join(__dirname, 'config')],
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
