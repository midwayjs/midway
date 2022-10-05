import {
  Config,
  Inject,
  Middleware,
  Types,
  Logger,
  FileUtils,
  MidwayMiddlewareService,
} from '@midwayjs/core';
import * as assert from 'assert';
import * as staticCache from 'koa-static-cache';
import * as LRU from 'ylru';
import * as range from 'koa-range';
import { DirectoryNotFoundError } from '../error';

@Middleware()
export class StaticMiddleware {
  @Config('staticFile')
  private staticFileConfig;

  @Inject()
  middlewareService: MidwayMiddlewareService<any, any>;

  @Logger('coreLogger')
  logger;

  async resolve(app) {
    const dirs = Object.values(this.staticFileConfig.dirs);
    if (this.staticFileConfig.dir) {
      dirs.push(this.staticFileConfig.dir);
    }
    const prefixs = [];

    function rangeMiddleware(ctx, next) {
      // if match static file, and use range middleware.
      const isMatch = prefixs.some(p => ctx.path.startsWith(p));
      if (isMatch) {
        return range(ctx, next);
      }
      return next();
    }

    const middlewares = [rangeMiddleware];

    for (const dirObj of dirs) {
      assert(
        Types.isObject(dirObj) || Types.isString(dirObj),
        '`config.static.dir` must be `string | Array<string|object>`.'
      );

      const newOptions = Object.assign({}, this.staticFileConfig, dirObj);

      if (newOptions.dynamic && !newOptions.files) {
        newOptions.files = new LRU(newOptions.maxFiles);
      }

      if (newOptions.prefix) {
        prefixs.push(newOptions.prefix);
      }

      // ensure directory exists
      if (!(await FileUtils.exists(newOptions.dir))) {
        throw new DirectoryNotFoundError(newOptions.dir);
      }

      this.logger.info(
        '[midway:static] starting static serve %s -> %s',
        newOptions.prefix,
        newOptions.dir
      );

      middlewares.push(staticCache(newOptions));
    }

    return await this.middlewareService.compose(middlewares, app, 'staticFile');
  }

  static getName() {
    return 'staticFile';
  }
}
