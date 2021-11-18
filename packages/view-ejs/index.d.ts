export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    ejs?: {
      /**
       * the root directory of ejs files
       */
      root?: string;
      /**
       * compiled functions are cached, only work using `ctx.render`
       */
      cache?: boolean;
      /**
       * output generated function body
       */
      debug?: boolean;
      /**
       * when false no debug instrumentation is compiled
       */
      compileDebug?: boolean;
      /**
       * character to use with angle brackets for open/close
       */
      delimiter?: string;
      /**
       * when set to true, generated function is in strict mode
       */
      strict?: boolean;
    };
  }
}
