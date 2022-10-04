import * as ejs from 'ejs';
import { IViewEngine, RenderOptions, ViewManager } from '@midwayjs/view';
import { Config, Inject, Provide } from '@midwayjs/core';

@Provide()
export class EjsView implements IViewEngine {
  @Config('ejs')
  ejsConfig;

  @Inject()
  viewManager: ViewManager;

  private async renderFile(filename, locals, config): Promise<string> {
    return new Promise((resolve, reject) => {
      ejs.renderFile(filename, locals, config, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async render(
    name: string,
    locals?: Record<string, any>,
    options?: RenderOptions
  ): Promise<string> {
    const config = Object.assign({}, this.ejsConfig, options, { name });
    const html = await this.renderFile(name, locals, config);
    if (!config.layout) {
      return html;
    }

    locals.body = html;
    const layout = await this.viewManager.resolve(config.layout);
    return this.renderFile(layout, locals, config);
  }

  async renderString(
    tpl: string,
    locals?: Record<string, any>,
    options?: RenderOptions
  ): Promise<string> {
    // should disable cache when no filename
    const config = Object.assign({}, this.ejsConfig, options, {
      cache: null,
    });
    try {
      return Promise.resolve(ejs.render(tpl, locals, config));
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
