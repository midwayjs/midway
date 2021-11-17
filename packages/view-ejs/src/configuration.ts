import { App, Configuration, Inject } from '@midwayjs/decorator';
import { createMockApp } from '@midwayjs/mw-util';
import * as View from '@midwayjs/view';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';

@Configuration({
  namespace: 'view-ejs',
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
    },
  ],
  imports: [View],
})
export class ViewEJSConfiguration {
  @App()
  app;

  @Inject()
  viewManager: View.ViewManager;

  async onReady() {
    const mockApp = createMockApp(this.app);
    mockApp.view = this.viewManager;
    require('egg-view-ejs/app')(mockApp);
  }
}
