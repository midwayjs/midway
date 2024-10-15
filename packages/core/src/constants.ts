/**
 * 静态参数
 *
 */
export const KEYS = {
  REF_ELEMENT: 'ref',
  REF_CUSTOM: 'ref_custom',
};

export const FUNCTION_INJECT_KEY = 'midway:function_inject_key';
export const MIDWAY_LOGGER_WRITEABLE_DIR = 'MIDWAY_LOGGER_WRITEABLE_DIR';
export const REQUEST_CTX_KEY = 'ctx';
export const REQUEST_OBJ_CTX_KEY = '_req_ctx';
export const CONTAINER_OBJ_SCOPE = '_obj_scope';
export const HTTP_SERVER_KEY = '_midway_http_server';
export const REQUEST_CTX_LOGGER_CACHE_KEY = '_midway_ctx_logger_cache';

export const ASYNC_CONTEXT_KEY = Symbol('ASYNC_CONTEXT_KEY');
export const ASYNC_CONTEXT_MANAGER_KEY = 'MIDWAY_ASYNC_CONTEXT_MANAGER_KEY';

export const DEFAULT_PATTERN = [
  '**/**.ts',
  '**/**.js',
  '**/**.mts',
  '**/**.mjs',
  '**/**.cts',
  '**/**.cjs',
];

export const IGNORE_PATTERN = ['**/**.d.ts', '**/**.d.mts', '**/**.d.cts'];

export const SINGLETON_CONTAINER_CTX = { _MAIN_CTX_: true };
