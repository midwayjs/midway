import { Configuration, Inject } from '@midwayjs/decorator';
import * as view from '../../../../src';
import { join } from 'path'

@Configuration({
  imports: [view],
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {

  @Inject()
  viewManager: view.ViewManager;

  async onReady(){
    this.viewManager.use('ejs', class EjsView {
      render() { return Promise.resolve('ejs'); }
      renderString() { return Promise.resolve('ejs'); }
    });
    this.viewManager.use('nunjucks', class EjsView {
      render() { return Promise.resolve('nunjucks'); }
      renderString() { return Promise.resolve('nunjucks'); }
    });
  }
}
