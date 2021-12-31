import { Provider, Inject, Config } from '@midwayjs/decorator';
@Provider()
export class JSONPService {
  
  @Inject()
  ctx;

  @Config('jsonp')
  jsonpConfig;

  jsonp(body: any) {
    this.ctx.type = 'js';
    // https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/X-Content-Type-Options
    this.ctx.set('x-content-type-options', 'nosniff');
    // Only allow "[","]","a-zA-Z0123456789_", "$" and "." characters.
    const { callback, limit } = this.jsonpConfig;
    let cb = (this.ctx.query[callback] || 'callback').replace(/[^\[\]\w\$\.]+/g, '');

    if (cb.length > limit) {
      cb = cb.substring(0, limit);
    }

    const str = JSON.stringify(body === undefined ? null : body)
    // protect from jsonp xss
    return `/**/ typeof ${cb} === 'function' && ${cb}(${str});`;
  }
}
