import * as passport from 'passport';
import { Context, IWebMiddleware, Middleware } from '@midwayjs/express';

interface Class<T = any> {
  new (...args: any[]): T;
}

type ExternalOverride = {
  verify(...args: any[]): Promise<Record<string, any>>;
};

/**
 * Express
 * passport strategy 适配器
 *
 * @param Strategy passport策略
 * @param name
 * @param rest Strategy 其余参数
 * @returns {Strategy}
 */
export function ExpressPassportStrategyAdapter<T extends Class<any> = any>(
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

      // 优先使用同步参数
      super(...(syncArgs.length > 0 ? syncArgs : asyncArgs), cb);

      if (name) {
        passport.use(name, this as any);
      } else {
        passport.use(this as any);
      }
    }

    /**
     *
     * @protected
     * @param args
     */
    protected abstract verify(...args: any[]): Record<string, any>;
  }
  return TmpStrategy;
}

export interface ExpressPassportMiddleware {
  setOptions?(ctx?: Context): Promise<null | Record<string, any>>;
}

/**
 *
 * Express Passport 中间件
 *
 */
export abstract class ExpressPassportMiddleware implements IWebMiddleware {
  /**
   *
   * @param args  verify() 中返回的参数 @see {ExpressPassportStrategyAdapter}
   */
  protected abstract auth(
    ctx: Context,
    ...args: any[]
  ): Promise<Record<any, any>>;

  /**
   * 鉴权名
   */
  protected abstract strategy: string;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  protected abstract setOptions(
    ctx?: Context
  ): Promise<null | Record<string, any>>;

  resolve(): Middleware {
    return async (req, res, next) => {
      ['strategy', 'auth'].forEach(n => {
        if (!this[n]) {
          throw new Error(`[PassportMiddleware]: missing ${n} property`);
        }
      });

      const options = (
        this.setOptions ? await this.setOptions(req as any) : null
      ) as any;

      passport.authenticate(this.strategy, options, async (...d) => {
        const user = await this.auth(req as any, ...d);
        req.user = user;
        next();
      })(req, res);
    };
  }
}
