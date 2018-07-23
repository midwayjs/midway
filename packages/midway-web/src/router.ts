/**!
 * 基于 koa-router 实现 Midway 的路由扩展
 *
 * - 支持使用 HTTP verbs 定义路由(koa-router支持的都支持), 例如:
 *    - app.get('articles', '/articles', app.controllers.articles.index);
 *    - app.post('new', '/articles', 'articles.create');
 *    - app.put('update', '/articles/:id', 'articles.update');
 *    - app.delete('delete', '/articles/:id', 'articles.delete');
 * - 支持 resources 动词,为资源配置默认路由
 *    - app.resources('articles', '/articles', app.controllers.articles);
 *    - app.resources('articles', '/articles', app.controllers.articles);
 * - 可以为路由添加命名
 *   - app.get('articles', '/articles', app.controllers.articles.index);
 *   - app.get('/articles', app.controllers.articles.index);
 * - 支持设置路由中间件
 *   - app.resources('posts', '/posts', app.role.can('user'), app.controllers.posts)
 * - 支持使用方法名字符串或者function对象设置路由
 *   - app.get('articles', '/articles', app.controllers.articles.index); // 直接使用 function 对象
 *   - app.get('articles', '/articles', 'articles.index');  // 使用方法名字符串
 * - 其它
 *   - 支持app/controllers下的多级目录  // app/controllers/user/common-controller.js
 *   - 支持controller中的对象方法   // exports.user = {index: function * {}};
 *
 * Copyright(c) Alibaba Group Holding Limited.
 *
 */

'use strict';

import * as KoaRouter from 'koa-router';
const convert = require('koa-convert');
const join = require('path').join;
const utility = require('utility');
const inflection = require('inflection');
const debug = require('debug')('midway:router');

const REST_MAP = {
  index: {
    suffix: '',
    method: 'GET',
  },
  new: {
    namePrefix: 'new_',
    member: true,
    suffix: 'new',
    method: 'GET',
  },
  create: {
    suffix: '',
    method: 'POST',
  },
  show: {
    member: true,
    suffix: ':id',
    method: 'GET',
  },
  edit: {
    member: true,
    namePrefix: 'edit_',
    suffix: ':id/edit',
    method: 'GET',
  },
  update: {
    member: true,
    namePrefix: '',
    suffix: ':id',
    method: 'PUT',
  },
  destroy: {
    member: true,
    namePrefix: 'destroy_',
    suffix: ':id',
    method: 'DELETE',
  },
};

const slice = Array.prototype.slice;

/**
 * 路由类
 */
export class Router extends KoaRouter {

  app;
  controllers;
  logger;

  /**
   * @constructor
   * @param {Object} opts Router options.
   * @param {Application} app Application object.
   */
  constructor(opts, app) {
    super(opts);
    this.app = app;
    this.controllers = opts.controllers;
    this.logger = opts.logger;

    // patch app, koa-router 5.x 去除了 app patch 功能
    // const router = this;
    this.app.url = this.url.bind(this);
    // this.app.router = this;
    // [ 'all', 'redirect', 'register', 'del', 'param', 'resources' ]
    //   .concat(methods)
    //   .forEach(method => {
    //     this.app[method] = function() {
    //       router[method].apply(router, arguments);
    //       return this;
    //     };
    //   });
  }

  /**
   * 实现 RESTFul 风格的一组路由
   * @param {String} name - Router name
   * @param {String} prefix - URL 路径前缀
   * @param {Function} middleware - Controller 或 Role 或 字符串的 Controller.Action 具体看 Example
   * @example
   * ```js
   * app.resources('/posts', 'posts')
   * app.resources('posts', '/posts', 'posts')
   * app.resources('posts', '/posts', app.role.can('user'), app.controller.posts)
   * ```
   *
   * 例如:
   *
   * ```js
   * app.resources('/posts', 'posts')
   * ```
   *
   * 将会直接对应成:
   *
   * Method | Path            | Route Name     | Controller.Action
   * -------|-----------------|----------------|-----------------------------
   * GET    | /posts          | posts          | app.controller.posts.index
   * GET    | /posts/new      | new_post       | app.controller.posts.new
   * GET    | /posts/:id      | post           | app.controller.posts.show
   * GET    | /posts/:id/edit | edit_post      | app.controller.posts.edit
   * POST   | /posts          | posts          | app.controller.posts.create
   * PUT    | /posts/:id      | post           | app.controller.posts.update
   * DELETE | /posts/:id      | post           | app.controller.posts.destroy
   *
   * app.router.url 生成 URL 路径参考:
   * ```js
   * app.router.url('posts')
   * => /posts
   * app.router.url('post', { id: 1 })
   * => /posts/1
   * app.router.url('new_post')
   * => /posts/new
   * app.router.url('edit_post', { id: 1 })
   * => /posts/1/edit
   * ```
   * @return {Route} return route object.
   */
  resources(name, prefix, middleware) {
    const route = this;
    if (arguments.length === 3) {
      middleware = slice.call(arguments, 2);
    } else {
      middleware = slice.call(arguments, 1);
      prefix = name;
      name = null;
    }

    // last argument is Controller object
    const controller = middleware.pop();

    for (const key in REST_MAP) {
      let action = '';
      if (typeof controller === 'string') {
        action = `${controller}.${key}`;
      } else {
        action = controller[key];
      }
      const opts = REST_MAP[key];

      // 处理 Route name 单数复数，以及前缀的事情
      let formatedName;
      if (name !== null) {
        if (opts.member) {
          formatedName = inflection.singularize(name);
        } else {
          formatedName = inflection.pluralize(name);
        }
        if (opts.namePrefix) {
          formatedName = opts.namePrefix + formatedName;
        }
      }

      route.register.call(this, join(prefix, opts.suffix), [opts.method], middleware.concat(action), {name: formatedName});
    }

    return route;
  }

  /**
   * 覆盖 router.url 以实现 queryString 的参数, 之前只能生成出 /posts/:id 路由声明里面已知的参数
   * @param {String} name - Router name
   * @param {Object} params - 更多的参数，具体见 example
   * @example
   * ```js
   * router.url('edit_post', { id: 1, name: 'foo', page: 2 })
   * => /posts/1/edit?name=foo&page=2
   * router.url('posts', { name: 'foo&1', page: 2 })
   * => /posts?name=foo%261&page=2
   * ```
   * @return {String} url by path name and query params.
   */
  url(name: string, params: Object): any {
    const route = this.route(name);

    if (route) {
      const args = params;
      let url = route.path;

      const querys = [];
      if (typeof args === 'object' && args !== null) {
        const replacedParams = [];
        url = url.replace(/:([a-zA-Z_]\w*)/g, function ($0, key) {
          if (utility.has(args, key)) {
            const values = args[key];
            replacedParams.push(key);
            return utility.encodeURIComponent(Array.isArray(values) ? values[0] : values);
          }
          return $0;
        });

        for (const key in args) {
          if (replacedParams.indexOf(key) !== -1) {
            continue;
          }

          const values = args[key];
          const encodedKey = utility.encodeURIComponent(key);
          if (Array.isArray(values)) {
            for (const val of values) {
              querys.push(encodedKey + '=' + utility.encodeURIComponent(val));
            }
          } else {
            querys.push(encodedKey + '=' + utility.encodeURIComponent(values));
          }
        }
      }

      if (querys.length > 0) {
        const queryStr = querys.join('&');
        if (url.indexOf('?') === -1) {
          url = `${url}?${queryStr}`;
        } else {
          url = `${url}&${queryStr}`;
        }
      }

      return url;
    }

    return '';
  }

  pathFor(name, params) {
    return this.url(name, params);
  }

  /**
   * 覆盖原始的 register 函数，实现让最后个 action 的 function 可以是字符串，以便能实现下面的效果
   * @param {String} path Path string or regular expression.
   * @param {Array.<String>} methods Array of HTTP verbs.
   * @param {Function} middleware Multiple middleware also accepted.
   * @param {Object} opts options
   * @return {Route} route object.
   * @private
   * @example
   * before:
   *
   *    app.resources('posts', '/posts', app.controllers.posts);
   *    app.get('/', '/posts', app.controllers.home.index);
   *
   * After:
   *
   *    app.resources('posts', '/posts', 'posts');
   *    app.get('/', '/posts', 'home.index');
   *
   * 同时，两种方式也支持。
   */
  register(path, methods, middleware, opts) {
    // fix 两个参数都是字符串时的问题
    if (middleware.length === 0) {
      middleware.push(path);
      path = opts.name;
      opts.name = '';
    }

    debug(`register router path(${path}) and methods(${methods})`);

    // 多个中间件 fix
    const newMiddlewares = [];

    middleware.forEach(action => {
      if (typeof action === 'string') {
        const actions = action.split('.');
        const func = actions.pop();
        const obj = this.controllers;
        action = _getController(obj, actions, func);


        if (typeof action !== 'function') {
          // TODO: 不兼容的更新,当前版本直接抛出异常会造成现有线上应用重新部署报错,放到下一个 major 版本更新
          // let err = new Error(`${_action} 不是一个有效的路由设置,请检查后再重新尝试. `);
          // err.name = 'RouterLoadError';
          // throw err;
          return null;
        }
      }

      if (typeof action === 'function') {
        newMiddlewares.push(convert(action));
      }
    });

    if (!newMiddlewares.length) {
      return null;
    }

    return super.register.call(this, path, methods, newMiddlewares, opts);
  }
}


/**
 * 递归查找controller 方法,支持文件名和目录带.的情况
 * @param {Obj} ctrls - Controllers 对象
 * @param {Array} arr - 路由字符串数组
 * @param {String} func - Controller 方法名
 *
 * @return {Function} return controller function.
 */
function _getController(ctrls, arr, func) {
  let result = null;

  if (arr.length === 0) {
    if (func in ctrls) {
      return ctrls[func];
    }
  } else {
    const _index = arr[0];

    if (_index in ctrls) {
      const ctrls_next = ctrls[_index];
      const arr_next = arr.slice(1, arr.length);
      result = _getController(ctrls_next, arr_next, func);
    } else {
      if (arr.length > 1) {
        const ctrls_next = ctrls;
        const arr_next = arr.slice(1, arr.length);
        arr_next[0] = _index + '.' + arr_next[0];
        result = _getController(ctrls_next, arr_next, func);
      }
    }
  }
  return result;
}
