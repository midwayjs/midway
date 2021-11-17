export default {
  nunjucks: {
    autoescape: true,
    throwOnUndefined: false,
    trimBlocks: false,
    lstripBlocks: false,
    cache: true,
  },
} as {
  nunjucks: {
    /**
     * controls if output with dangerous characters are escaped automatically.
     */
    autoescape: boolean;
    /**
     * throw errors when outputting a null/undefined value
     */
    throwOnUndefined: boolean;
    /**
     * automatically remove trailing newlines from a block/tag
     */
    trimBlocks: boolean;
    /**
     * automatically remove leading whitespace from a block/tag
     */
    lstripBlocks: boolean;
    /**
     * use a cache and recompile templates each time. false in local env.
     */
    cache: boolean;
  };
};
