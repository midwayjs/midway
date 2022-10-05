import { ViewManager } from './viewManager';
import { Provide, Inject, Config, Utils } from '@midwayjs/core';
import * as assert from 'assert';
import { normalize, extname } from 'path';
import { IViewEngine, RenderOptions } from './interface';

/**
 * View instance for each request.
 *
 * It will find the view engine, and render it.
 * The view engine should be registered in {@link ViewManager}.
 */
@Provide()
export class ContextView implements IViewEngine {
  @Inject()
  viewManager: ViewManager;

  @Config('view')
  viewConfig;

  @Inject()
  ctx;

  async render(
    name: string,
    locals?: Record<string, any>,
    options?: RenderOptions
  ): Promise<string> {
    // retrieve fullpath matching name from `config.root`
    const filename = await this.viewManager.resolve(name);
    options = options ?? {};
    options.name = name;
    options.root = filename.replace(normalize(name), '').replace(/[/\\]$/, '');
    options.locals = locals;

    // get the name of view engine,
    // if viewEngine is specified in options, don't match extension
    let viewEngineName = options.viewEngine;
    if (!viewEngineName) {
      const ext = extname(filename);
      viewEngineName = this.viewManager.findEngine(ext);
    }
    // use the default view engine that is configured if no matching above
    if (!viewEngineName) {
      viewEngineName = this.viewConfig.defaultViewEngine;
    }
    assert(viewEngineName, `Can't find viewEngine for ${filename}`);

    // get view engine and render
    const view = await this.getViewEngine(viewEngineName);
    return await view.render(filename, this.setLocals(locals), options);
  }

  async renderString(
    tpl: string,
    locals?: Record<string, any>,
    options?: RenderOptions
  ): Promise<string> {
    options = options ?? {};
    const viewEngineName =
      options.viewEngine ?? this.viewConfig.defaultViewEngine;
    assert(viewEngineName, "Can't find viewEngine");

    // get view engine and render
    const view = await this.getViewEngine(viewEngineName);
    return await view.renderString(tpl, this.setLocals(locals), options);
  }

  private async getViewEngine(name) {
    // get view engine
    const ViewEngine = this.viewManager.get(name);
    assert(ViewEngine, `Can't find ViewEngine "${name}"`);

    // use view engine to render
    const engine = await this.ctx.requestContext.getAsync(ViewEngine);
    // wrap render and renderString to support both async function and generator function
    if (engine.render) {
      engine.render = Utils.toAsyncFunction(engine.render);
    }
    if (engine.renderString) {
      engine.renderString = Utils.toAsyncFunction(engine.renderString);
    }
    return engine;
  }

  private setLocals(locals) {
    return Object.assign(
      {},
      this.viewManager.getLocals(),
      {
        ctx: this.ctx,
        request: this.ctx.request,
      },
      this.ctx.locals,
      locals
    );
  }
}
