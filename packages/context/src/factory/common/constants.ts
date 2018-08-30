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
  CONSTRUCTORARG_ELEMENT: 'constructor-arg',
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
  EXECUTE_ATTRIBUTE: 'execute'
};
/*
  https://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
  ELEMENT_NODE                   = 1;
  ATTRIBUTE_NODE                 = 2;
  TEXT_NODE                      = 3;
  CDATA_SECTION_NODE             = 4;
  ENTITY_REFERENCE_NODE          = 5;
  ENTITY_NODE                    = 6;
  PROCESSING_INSTRUCTION_NODE    = 7;
  COMMENT_NODE                   = 8;
  DOCUMENT_NODE                  = 9;
  DOCUMENT_TYPE_NODE             = 10;
  DOCUMENT_FRAGMENT_NODE         = 11;
  NOTATION_NODE                  = 12;
 */
export const NODE_TYPE = {
  ELEMENT: 1,
  ATTRIBUTE: 2,
  TEXT: 3,
  CDATA: 4
};

export const VALUE_TYPE = {
  STRING: 'string',
  DATE: 'date',
  NUMBER: 'number',
  INTEGER: 'int',
  TEMPLATE: 'template',
  MANAGED: 'managed',
  OBJECT: 'object', // 仅仅在解析时使用
};
