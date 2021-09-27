import { App, Configuration, Inject } from '@midwayjs/decorator';
import * as View from '@midwayjs/view';
import { join } from 'path';
import { NunjucksView } from './view';
import { NunjucksEnvironment } from './engine';

@Configuration({
  namespace: 'view-nunjucks',
  importConfigs: [join(__dirname, 'config')],
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
