export interface RenderOptions {
  name?: string;
  root?: string;
  locals?: Record<string, any>;
  viewEngine?: string;
}

export interface IViewEngine {
  /**
   * Render a file by view engine, then set to body
   * @param {String} name - the file path based on root
   * @param {Object} [locals] - data used by template
   * @param {Object} [options] - view options, you can use `options.viewEngine` to specify view engine
   * @return {Promise<String>} result - return a promise with a render result
   */
  render(name: string, locals?: Record<string, any>, options?: RenderOptions): Promise<string>;

  /**
   * Render a template string by view engine
   * @param {String} tpl - template string
   * @param {Object} [locals] - data used by template
   * @param {Object} [options] - view options, you can use `options.viewEngine` to specify view engine
   * @return {Promise<String>} result - return a promise with a render result
   */
  renderString(
    tpl: string,
    locals?: Record<string, any>,
    options?: RenderOptions
  ): Promise<string>;
}
