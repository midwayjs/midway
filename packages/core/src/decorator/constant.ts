// got all value with no property name
export const ALL_VALUE_KEY = 'common:all_value_key';
// common
export const SCHEDULE_KEY = 'common:schedule';
export const CONFIGURATION_KEY = 'common:configuration';
export const CONFIGURATION_OBJECT_KEY = 'common:configuration_object';
export const FRAMEWORK_KEY = 'common:framework';
export const ASPECT_KEY = 'common:aspect';
export const CATCH_KEY = 'common:catch';
export const MATCH_KEY = 'common:match';
export const GUARD_KEY = 'common:guard';
export const MOCK_KEY = 'common:mock';
export const FACTORY_SERVICE_CLIENT_KEY = 'common:service_factory:client';
export const PRELOAD_MODULE_KEY = 'common:preload_module';
export const OBJECT_DEFINITION_KEY = 'common:object_definition';
// for @Provide
export const PROVIDE_KEY = 'common:provide';
// for Scope and @Singleton
export const SCOPE_KEY = 'common:scope';
// used to store property inject for @Inject
export const PROPERTY_INJECT_KEY = 'common:property_inject';
// The name inject constructor with resolver @Inject
export const CONSTRUCTOR_INJECT_KEY = 'common:constructor_inject';
// The name inject custom property decorator with resolver
export const CUSTOM_PROPERTY_INJECT_KEY = 'common:custom_property_inject';
// The name inject custom method decorator with resolver
export const CUSTOM_METHOD_INJECT_KEY = 'common:custom_method_inject';
// The name inject custom param decorator with resolver
export const CUSTOM_PARAM_INJECT_KEY = 'common:custom_param_inject';

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
export const APPLICATION_KEY = 'common:application';
export const MAIN_APPLICATION_KEY = 'common:main_application';
export const APPLICATION_CONTEXT_KEY = 'common:application_context';

////////////////////////////////////////// inject keys
// constructor key
export const CLASS_KEY_CONSTRUCTOR = 'midway:class_key_constructor';

export const MAIN_MODULE_KEY = '__main__';
