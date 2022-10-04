import { Inject, Provide } from '@midwayjs/core';
import { IViewEngine, RenderOptions } from '@midwayjs/view';
import { NunjucksEnvironment } from './engine';

@Provide()
export class NunjucksView implements IViewEngine {
  @Inject()
  nunjucks: NunjucksEnvironment;

  async render(
    name: string,
    locals?: Record<string, any>,
    options?: RenderOptions
  ): Promise<string> {
    // locals.helper = this.viewHelper;
    return new Promise((resolve, reject) => {
      this.nunjucks.render(name, locals, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  async renderString(
    tpl: string,
    locals?: Record<string, any>,
    options?: RenderOptions
  ): Promise<string> {
    // locals.helper = this.viewHelper;
    return new Promise((resolve, reject) => {
      this.nunjucks.renderString(tpl, locals, options, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}
