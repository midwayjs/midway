declare module 'virtual:tutorial-catalog' {
  export const catalog: import('./types').CatalogEntry[];
  /** 落地页展示的高亮代码片段（HTML）。 */
  export const samples: Record<import('./types').Track, string>;
  export const loaders: Record<
    string,
    () => Promise<{ default: import('./types').Variant }>
  >;
}
