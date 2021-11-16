import { App, Configuration, Inject } from '@midwayjs/decorator';
import * as View from '@midwayjs/view';
import { NunjucksView } from './view';
import { NunjucksEnvironment } from './engine';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';

@Configuration({
  namespace: 'view-nunjucks',
  importConfigs: [{
    default: DefaultConfig,
    local: LocalConfig,
  }],
  imports: [View],
})
export class ViewNunjucksConfiguration {
  @App()
  app;

  @Inject()
  viewManager: View.ViewManager;

  async onReady(container) {
    this.app.nunjucks = await container.getAsync(NunjucksEnvironment);
    this.viewManager.use('nunjucks', NunjucksView);
  }
}
