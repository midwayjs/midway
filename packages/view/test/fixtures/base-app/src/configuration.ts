import { Configuration, Inject, Provide } from '@midwayjs/core';
import * as view from '../../../../src';
import * as koa from '@midwayjs/koa';
import { join } from 'path'

@Provide()
export class EjsView {
  render() { return Promise.resolve('ejs'); }
  renderString() { return Promise.resolve('ejs'); }
}
@Provide()
export class NunjucksView {
  render() { return Promise.resolve('nunjucks'); }
  renderString() { return Promise.resolve('nunjucks'); }
}

@Configuration({
  imports: [koa, view],
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {

  @Inject()
  viewManager: view.ViewManager;

  async onReady(){
    this.viewManager.use('ejs', EjsView);
    this.viewManager.use('nunjucks', NunjucksView);
  }
}
