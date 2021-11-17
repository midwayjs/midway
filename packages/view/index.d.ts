export * from './dist/index';

interface RenderOptions {
  name?: string;
  root?: string;
  locals?: Record<string, any>;
  viewEngine?: string;
}

declare module '@midwayjs/core/dist/interface' {
  interface Context {
    /**
     * Render a file by view engine, then set to body
     * @param {String} name - the file path based on root
     * @param {Object} [locals] - data used by template
     * @param {Object} [options] - view options, you can use `options.viewEngine` to specify view engine
     * @return {Promise<String>} result - return a promise with a render result
     */
    render(name: string, locals?: any, options?: RenderOptions): Promise<null>;

    /**
     * Render a file by view engine and return it
     * @param {String} name - the file path based on root
     * @param {Object} [locals] - data used by template
     * @param {Object} [options] - view options, you can use `options.viewEngine` to specify view engine
     * @return {Promise<String>} result - return a promise with a render result
     */
    renderView(
      name: string,
      locals?: any,
      options?: RenderOptions
    ): Promise<string>;

    /**
     * Render a template string by view engine
     * @param {String} tpl - template string
     * @param {Object} [locals] - data used by template
     * @param {Object} [options] - view options, you can use `options.viewEngine` to specify view engine
     * @return {Promise<String>} result - return a promise with a render result
     */
    renderString(
      name: string,
      locals?: any,
      options?: RenderOptions
    ): Promise<string>;
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
