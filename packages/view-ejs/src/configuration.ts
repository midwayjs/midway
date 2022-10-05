import { Configuration, Inject } from '@midwayjs/core';
import * as View from '@midwayjs/view';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';
import { EjsView } from './view';

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
  @Inject()
  viewManager: View.ViewManager;

  async onReady() {
    this.viewManager.use('ejs', EjsView);
  }
}
