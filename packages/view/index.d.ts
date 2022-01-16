import { IViewEngine } from './dist';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Context extends IViewEngine {
    //...
  }

  interface MidwayConfig {
    view?: {
      /**
       * give a path to find the file, you can specify multiple path with `,` delimiter
       */
      root?: string;
      /**
       * whether cache the file's path
       */
      cache?: boolean;
      /**
       * defaultExtension can be added automatically when there is no extension  when call `ctx.render`
       */
      defaultExtension?: string;
      /**
       * set the default view engine if you don't want specify the viewEngine every request.
       */
      defaultViewEngine?: string;
      /**
       * map the file extension to view engine, such as `{ '.ejs': 'ejs' }`
       */
      mapping?: Record<string, string>;
    };
  }
}
