import {
  Application,
  IMidwayKoaConfigurationOptions,
  IMidwayKoaContext,
} from './dist';
import { BodyParserOptions } from './src/interface';
import { CookieSetOptions } from '@midwayjs/cookies';
import * as Cookies from 'cookies';

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
      text?: (err: Error, ctx: IMidwayKoaContext) => void;
      json?: (err: Error, ctx: IMidwayKoaContext) => void;
      html?: (err: Error, ctx: IMidwayKoaContext) => void;
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
