/**
 * 基于 koa-router 实现 Midway 的路由扩展
 */

const KoaRouter = require('egg-core/lib/utils/router');

/**
 * 路由类
 */
export class Router extends KoaRouter {
  constructor(opts, app) {
    super(opts, app);
  }

}
