export interface StaticFileOption {
  /**
   * url prefix
   */
  prefix?: string;
  /**
   *  the directory you wish to serve
   */
  dir?: string;
  /**
   * dynamic load file which not cached on initialization.
   */
  dynamic?: boolean;
  /**
   * caches the assets on initialization or not, default to true. always work together with options.dynamic.
   */
  preload?: boolean;
  /**
   * store the files in memory instead of streaming from the filesystem on each request.
   */
  buffer?: boolean;
  /**
   * cache control max age for the files, 0 by default.
   */
  maxFiles?: number;
  /**
   * optional cache control header. Overrides options.maxAge.
   */
  cacheControl?: string;
  /**
   * when request's accept-encoding include gzip, files will compressed by gzip.
   */
  gzip?: boolean;
  /**
   * object map of aliases
   */
  alias?: {
    [aliasName: string]: string;
  },
  /**
   * filter files at init dir, for example - skip non build (source) files. If array set - allow only listed files
   */
  filter?: Function | string[];
}


export interface StaticFileOptions extends Omit<StaticFileOption, 'prefix' | 'dir'> {
  dirs?: {
    [pathName: string]: StaticFileOption;
  },
}
