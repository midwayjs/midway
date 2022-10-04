import { Configuration, Inject } from '@midwayjs/core';
import * as View from '@midwayjs/view';
import { NunjucksView } from './view';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';

@Configuration({
  namespace: 'view-nunjucks',
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
    },
  ],
  imports: [View],
})
export class ViewNunjucksConfiguration {
  @Inject()
  viewManager: View.ViewManager;

  async onReady() {
    this.viewManager.use('nunjucks', NunjucksView);
  }
}
