import { Provide, Inject, Config } from '@midwayjs/decorator';
import { JSONPOptions } from './interface';
@Provide()
export class JSONPService {
  @Inject()
  ctx;

  @Config('jsonp')
  jsonpConfig;

  jsonp(body: any, config?: JSONPOptions) {
    this.ctx.type = 'js';
    // https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/X-Content-Type-Options
    this.ctx.set('x-content-type-options', 'nosniff');

    const { callback, limit } = Object.assign({}, this.jsonpConfig, config);

    // Only allow "[","]","a-zA-Z0123456789_", "$" and "." characters.
    let cb = (this.ctx.query[callback] || 'callback').replace(
      /[^[\]\w$.]+/g,
      ''
    );

    if (cb.length > limit) {
      cb = cb.substring(0, limit);
    }

    const str = JSON.stringify(body === undefined ? null : body);
    // protect from jsonp xss
    return `/**/ typeof ${cb} === 'function' && ${cb}(${str});`;
  }
}
