export const DECORATORS_PREFIX = 'swagger';

export const DECORATORS_CLASS_METADATA = 'swagger:class_metadata';
export const DECORATORS_METHOD_METADATA = 'swagger:method_metadata';

export const DECORATORS = {
  API_OPERATION: `${DECORATORS_PREFIX}/apiOperation`,
  API_RESPONSE: `${DECORATORS_PREFIX}/apiResponse`,
  API_TAGS: `${DECORATORS_PREFIX}/apiUseTags`,
  API_PARAMETERS: `${DECORATORS_PREFIX}/apiParameters`,
  API_HEADERS: `${DECORATORS_PREFIX}/apiHeaders`,
  API_MODEL_PROPERTIES: `${DECORATORS_PREFIX}/apiModelProperties`,
  API_EXTRA_MODEL: `${DECORATORS_PREFIX}/apiExtraModel`,
  API_MODEL_PROPERTIES_ARRAY: `${DECORATORS_PREFIX}/apiModelPropertiesArray`,
  API_SECURITY: `${DECORATORS_PREFIX}/apiSecurity`,
  API_EXCLUDE_SECURITY: `${DECORATORS_PREFIX}/apiExcludeSecurity`,
  API_EXCLUDE_ENDPOINT: `${DECORATORS_PREFIX}/apiExcludeEndpoint`,
  API_EXCLUDE_CONTROLLER: `${DECORATORS_PREFIX}/apiExcludeController`,
  API_EXTENSION: `${DECORATORS_PREFIX}/apiExtension`,
};
