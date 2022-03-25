import { IViewEngine } from './dist';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    view?: {
      /**
       * give a path to find the file, it will be override rootDir.default
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
      /**
       * give multi-path for root, it can be overwrite or add in different component
       */
      rootDir?: Record<string, string>;
    };
  }
}

declare module '@midwayjs/koa/dist/interface' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Context extends IViewEngine {
    //...
  }
}

declare module '@midwayjs/web/dist/interface' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Context extends IViewEngine {
    //...
  }
}

declare module '@midwayjs/faas/dist/interface' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Context extends IViewEngine {
    //...
  }
}
