import { App, Configuration, Inject } from '@midwayjs/decorator';
import { createMockApp } from '@midwayjs/mw-util';
import * as View from '@midwayjs/view';
import { join } from 'path';

@Configuration({
  namespace: 'view-ejs',
  importConfigs: [join(__dirname, 'config')],
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
