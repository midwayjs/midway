import {
  Application,
  IMidwayKoaConfigurationOptions,
  Context as KoaContext,
  BodyParserOptions,
} from './dist';
import { CookieSetOptions, Cookies } from '@midwayjs/cookies';
import '@midwayjs/session';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    keys?: string | string[];
    koa?: IMidwayKoaConfigurationOptions;
    cookies?: CookieSetOptions;
    /**
     * onerror middleware options
     */
    onerror?: {
      text?: (err: Error, ctx: KoaContext) => void;
      json?: (err: Error, ctx: KoaContext) => void;
      html?: (err: Error, ctx: KoaContext) => void;
      redirect?: string;
      accepts?: (...args) => any;
    };
    bodyParser?: BodyParserOptions;
    siteFile?: {
      enable?: boolean;
      favicon?: undefined | string | Buffer;
    };
  }
}

declare module 'koa' {
  interface Request {
    body?: any;
    rawBody: string;
  }
  interface Context {
    cookies: Cookies;
    app: Application;
  }
}
