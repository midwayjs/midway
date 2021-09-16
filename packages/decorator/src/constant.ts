// got all value with no property name
export const ALL = 'common:all_value_key';

// common
export const SCHEDULE_KEY = 'common:schedule';
export const CONFIGURATION_KEY = 'common:configuration';
export const RULES_KEY = 'common:rules';
export const ASPECT_KEY = 'common:aspect';

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

// task
export const MODULE_TASK_KEY = 'task:task';
export const MODULE_TASK_METADATA = 'task:task:options';
export const MODULE_TASK_TASK_LOCAL_KEY = 'task:task:task_local';
export const MODULE_TASK_TASK_LOCAL_OPTIONS = 'task:task:task_local:options';
export const MODULE_TASK_QUEUE_KEY = 'task:task:queue';
export const MODULE_TASK_QUEUE_OPTIONS = 'task:task:queue:options';

// ws
export const WS_CONTROLLER_KEY = 'ws:controller';
export const WS_EVENT_KEY = 'ws:event';

// RPC
export const HSF_KEY = 'rpc:hsf';
export const RPC_GRPC_KEY = 'rpc:grpc';
export const RPC_DUBBO_KEY = 'rpc:dubbo';

// microservice
export const MS_CONSUMER_KEY = 'ms:consumer';
export const MS_PRODUCER_KEY = 'ms:producer';
export const MS_PROVIDER_KEY = 'ms:provider';

// rpc method
export const MS_GRPC_METHOD_KEY = 'ms:grpc:method';
export const MS_DUBBO_METHOD_KEY = 'ms:dubbo:method';
export const MS_HSF_METHOD_KEY = 'ms:hsf:method';

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
// The name inject custom decorator with resolver
export const INJECT_CUSTOM_TAG = 'inject_custom_tag';
//
// // used to store constructor arguments tags
// export const TAGGED = 'injection:tagged';
//
// // used to store class properties tags
// export const TAGGED_PROP = 'injection:tagged_props';

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
