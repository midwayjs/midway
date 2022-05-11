import { CookieOptions } from 'express';
import {
  Options,
  OptionsJson,
  OptionsText,
  OptionsUrlencoded,
} from 'body-parser';
import { IMidwayExpressConfigurationOptions } from './dist';
import '@midwayjs/express-session';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    express?: IMidwayExpressConfigurationOptions;
    cookieParser?: {
      secret?: string | string[];
      options?: CookieOptions;
    };
    bodyParser?: {
      enable?: boolean;
      json?: OptionsJson & {
        enable?: boolean;
      };
      raw?: Options & {
        enable?: boolean;
      };
      text?: OptionsText & {
        enable?: boolean;
      };
      urlencoded?: OptionsUrlencoded & {
        enable?: boolean;
      };
    };
  }
}
