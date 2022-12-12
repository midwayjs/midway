/**
 * 静态参数
 *
 */
export const KEYS = {
  OBJECTS_ELEMENT: 'objects',
  OBJECT_ELEMENT: 'object',
  IMPORT_ELEMENT: 'import',
  PROPERTY_ELEMENT: 'property',
  LIST_ELEMENT: 'list',
  MAP_ELEMENT: 'map',
  ENTRY_ELEMENT: 'entry',
  VALUE_ELEMENT: 'value',
  PROPS_ELEMENT: 'props',
  PROP_ELEMENT: 'prop',
  SET_ELEMENT: 'set',
  CONSTRUCTOR_ARG_ELEMENT: 'constructor-arg',
  REF_ELEMENT: 'ref',
  JSON_ELEMENT: 'json',
  CONFIGURATION_ELEMENT: 'configuration',

  ID_ATTRIBUTE: 'id',
  PATH_ATTRIBUTE: 'path',
  DIRECT_ATTRIBUTE: 'direct',
  AUTOWIRE_ATTRIBUTE: 'autowire',
  ASYNC_ATTRIBUTE: 'async',
  NAME_ATTRIBUTE: 'name',
  REF_ATTRIBUTE: 'ref',
  KEY_ATTRIBUTE: 'key',
  VALUE_ATTRIBUTE: 'value',
  TYPE_ATTRIBUTE: 'type',
  EXTERNAL_ATTRIBUTE: 'external',
  OBJECT_ATTRIBUTE: 'object',
  RESOURCE_ATTRIBUTE: 'resource',
  SCOPE_ATTRIBUTE: 'scope',

  ASPECT_ELEMENT: 'aspect',
  AROUND_ELEMENT: 'around',
  EXPRESSION_ATTRIBUTE: 'expression',
  EXECUTE_ATTRIBUTE: 'execute',
};

export const FUNCTION_INJECT_KEY = 'midway:function_inject_key';
export const MIDWAY_LOGGER_WRITEABLE_DIR = 'MIDWAY_LOGGER_WRITEABLE_DIR';
export const REQUEST_CTX_KEY = 'ctx';
export const REQUEST_OBJ_CTX_KEY = '_req_ctx';
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
