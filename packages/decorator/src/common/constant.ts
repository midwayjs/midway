// common
export const PRIORITY_KEY = 'common:priority';
export const SCHEDULE_KEY = 'common:schedule';
export const CONFIGURATION_KEY = 'common:configuration';

// faas
export const FUNC_KEY = 'faas:func';
export const HANDLER_KEY = 'faas:handler';

// web
export const CONTROLLER_KEY = 'web:controller';
export const WEB_ROUTER_KEY = 'web:router';
export const WEB_ROUTER_PARAM_KEY = 'web:router_param';
export const WEB_RESPONSE_KEY = 'web:response';
export const WEB_RESPONSE_HTTP_CODE = 'web:response_http_code';
export const WEB_RESPONSE_REDIRECT = 'web:response_redirect';
export const WEB_RESPONSE_HEADER = 'web:response_header';

// RPC
export const HSF_KEY = 'rpc:hsf';

// framework
export const CONFIG_KEY = 'config';
export const PLUGIN_KEY = 'plugin';
export const LOGGER_KEY = 'logger';
export const APPLICATION_KEY = '__midway_framework_app__';

////////////////////////////////////////// inject keys
// constructor key
export const CLASS_KEY_CONSTRUCTOR = 'midway:class_key_constructor';

// Used for named bindings
export const NAMED_TAG = 'named';

// The name of the target at design time
export const INJECT_TAG = 'inject';

// used to store constructor arguments tags
export const TAGGED = 'injection:tagged';

// used to store class properties tags
export const TAGGED_PROP = 'injection:tagged_props';

// used to store class to be injected
export const TAGGED_CLS = 'injection:tagged_class';

// used to store function to be injected
export const TAGGED_FUN = 'injection:tagged_function';

export const OBJ_DEF_CLS = 'injection:object_definition_class';

// pipeline
export const PIPELINE_IDENTIFIER = '__pipeline_identifier__';
// lifecycle interface
export const LIFECYCLE_IDENTIFIER_PREFIX = '__lifecycle__';
