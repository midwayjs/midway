export default {
  /**
   * nunjucks config
   * @member Config#nunjucks
   * @property {Boolean} [autoescape=true] - controls if output with dangerous characters are escaped automatically.
   * @property {Boolean} [throwOnUndefined=false] - throw errors when outputting a null/undefined value
   * @property {Boolean} [trimBlocks=false] - automatically remove trailing newlines from a block/tag
   * @property {Boolean} [lstripBlocks=false] - automatically remove leading whitespace from a block/tag
   * @property {Boolean} [cache=true] - use a cache and recompile templates each time. false in local env.
   */
  nunjucks: {
    autoescape: true,
    throwOnUndefined: false,
    trimBlocks: false,
    lstripBlocks: false,
    cache: true,
  },
};
