// got all value with no property name
export const ALL = 'common:all_value_key';

// common
export const CONFIGURATION_KEY = 'common:configuration';
export const FRAMEWORK_KEY = 'common:framework';
export const ASPECT_KEY = 'common:aspect';
export const CATCH_KEY = 'common:catch';
export const MATCH_KEY = 'common:match';

// faas
export const FUNC_KEY = 'faas:func';
export const SERVERLESS_FUNC_KEY = 'faas:serverless:function';

// web
export const CONTROLLER_KEY = 'web:controller';
export const WEB_ROUTER_KEY = 'web:router';
export const WEB_ROUTER_PARAM_KEY = 'web:router_param';
export const WEB_RESPONSE_KEY = 'web:response';
export const WEB_RESPONSE_HTTP_CODE = 'web:response_http_code';
export const WEB_RESPONSE_REDIRECT = 'web:response_redirect';
export const WEB_RESPONSE_HEADER = 'web:response_header';
export const WEB_RESPONSE_CONTENT_TYPE = 'web:response_content_type';
export const WEB_RESPONSE_RENDER = 'web:response_render';

// framework
export const CONFIG_KEY = 'config';
export const PLUGIN_KEY = 'plugin';
export const LOGGER_KEY = 'logger';
export const APPLICATION_KEY = '__midway_framework_app__';
export const APPLICATION_CONTEXT_KEY = '__midway_application_context__';

////////////////////////////////////////// inject keys
// constructor key
export const CLASS_KEY_CONSTRUCTOR = 'midway:class_key_constructor';

// Used for named bindings
export const NAMED_TAG = 'named';

// The name of the target at design time
export const INJECT_TAG = 'inject';
// The name inject custom property decorator with resolver
export const INJECT_CUSTOM_PROPERTY = 'inject_custom_property';
// The name inject custom param decorator with resolver
export const INJECT_CUSTOM_METHOD = 'inject_custom_method';
// The name inject custom param decorator with resolver
export const INJECT_CUSTOM_PARAM = 'inject_custom_param';

// used to store class to be injected
export const TAGGED_CLS = 'injection:tagged_class';

// used to store function to be injected
export const TAGGED_FUN = 'injection:tagged_function';

export const OBJ_DEF_CLS = 'injection:object_definition_class';

// pipeline
export const PIPELINE_IDENTIFIER = '__pipeline_identifier__';
// lifecycle interface
export const LIFECYCLE_IDENTIFIER_PREFIX = '__lifecycle__';

export const MAIN_MODULE_KEY = '__main__';
export const PRIVATE_META_DATA_KEY = '__midway_private_meta_data__';
