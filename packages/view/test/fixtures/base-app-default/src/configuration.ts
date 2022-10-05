import { Configuration, Inject, Provide } from '@midwayjs/core';
import * as view from '../../../../src';
import * as koa from '@midwayjs/koa';
import { join } from 'path'

@Provide()
export class EjsView {
  async render(name: string,
         locals?: Record<string, any>,
         options?: any) {
    return name;
  }
  async renderString(tpl: string,
               locals?: Record<string, any>,
               options?: any) { return tpl; }
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
  }
}
