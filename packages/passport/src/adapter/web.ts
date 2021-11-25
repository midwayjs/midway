import type { Context, IMidwayKoaNext, IWebMiddleware } from '@midwayjs/koa';
import * as koaPassport from 'koa-passport';
import { defaultOptions } from '../options';

interface Class<T = any> {
  new (...args: any[]): T;
}

type ExternalOverride = {
  verify(...args: any[]): Promise<any>;
};

/**
 * Koa
 * passport strategy 适配器
 *
 * @param Strategy passport策略
 * @param name
 * @param syncArgs rest Strategy 其余参数
 * @returns {Strategy}
 */
export function WebPassportStrategyAdapter<T extends Class<any> = any>(
  Strategy: T,
  name?: string,
  ...syncArgs: any[]
): { new (...args): InstanceType<T> & ExternalOverride } {
  /**
   * @abstract
   * @private
   */
  abstract class TmpStrategy extends Strategy {
    constructor(...asyncArgs: any[]) {
      const cb = async (...params: any[]) => {
        const done = params[params.length - 1];
        try {
          const result = await this.verify(...params);
          if (Array.isArray(result)) {
            done(null, ...result);
          } else {
            done(null, result);
          }
        } catch (err) {
          done(err, null);
        }
      };

      super(...(syncArgs.length > 0 ? syncArgs : asyncArgs), cb);

      if (name) {
        koaPassport.use(name, this as any);
      } else {
        koaPassport.use(this as any);
      }
    }
    protected abstract verify(...args: any[]): any;
  }
  return TmpStrategy;
}

export interface WebPassportMiddleware {
  setOptions?(ctx?: Context): Promise<null | Record<string, any>>;
}

/**
 *
 * Egg, Koa Passport 中间件
 *
 */
export abstract class WebPassportMiddleware implements IWebMiddleware {
  /**
   *
   * @param ctx
   * @param args  verify() 中返回的参数 @see {WebPassportStrategyAdapter}
   */
  public abstract auth(ctx: Context, ...args: any[]): any;

  /**
   * 鉴权名
   */
  public abstract strategy: string;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  protected abstract setOptions(
    ctx?: Context
  ): Promise<null | Record<string, any>>;

  resolve() {
    return async (ctx: Context, next: IMidwayKoaNext) => {
      ['strategy', 'auth'].forEach(n => {
        if (!this[n]) {
          throw new Error(`[PassportMiddleware]: missing ${n} property`);
        }
      });

      const options = {
        ...defaultOptions,
        ...(this.setOptions ? await this.setOptions(ctx) : null),
      };

      await new Promise(resolve => {
        koaPassport.authenticate(this.strategy, options, async (...d) => {
          const user = await this.auth(ctx, ...d);
          ctx.req[options.presetProperty] = user;
          resolve(null);
        })(ctx, null);
      });

      await next();
    };
  }
}
