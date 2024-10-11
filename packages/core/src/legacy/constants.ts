import {
  ALL_VALUE_KEY,
  CUSTOM_METHOD_INJECT_KEY,
  CUSTOM_PARAM_INJECT_KEY,
  CUSTOM_PROPERTY_INJECT_KEY,
  OBJECT_DEFINITION_KEY,
  PROPERTY_INJECT_KEY,
  PROVIDE_KEY,
} from '../decorator';

/**
 * @deprecated Use OBJECT_DEFINITION_KEY instead
 */
export const OBJ_DEF_CLS = OBJECT_DEFINITION_KEY;
/**
 * @deprecated Use PROPERTY_INJECT_KEY instead
 */
export const INJECT_TAG = PROPERTY_INJECT_KEY;
/**
 * @deprecated Use ALL_VALUE_KEY instead
 */
export const ALL = ALL_VALUE_KEY;
/**
 * @deprecated Use CUSTOM_PROPERTY_INJECT_KEY instead
 */
export const INJECT_CUSTOM_PROPERTY = CUSTOM_PROPERTY_INJECT_KEY;
/**
 * @deprecated Use CUSTOM_METHOD_INJECT_KEY instead
 */
export const INJECT_CUSTOM_METHOD = CUSTOM_METHOD_INJECT_KEY;
/**
 * @deprecated Use CUSTOM_PARAM_INJECT_KEY instead
 */
export const INJECT_CUSTOM_PARAM = CUSTOM_PARAM_INJECT_KEY;
/**
 * @deprecated Use PROVIDE_KEY instead
 */
export const TAGGED_CLS = PROVIDE_KEY;
