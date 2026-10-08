import { CrudOptions, CrudRouteName, CrudValidationMeta } from './interface';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Drops validator defaults for keys the caller did not send.
 * Values for provided keys are kept, including coerced types.
 */
export function omitUnprovidedDefaults(
  original: unknown,
  validated: unknown
): unknown {
  if (!isPlainObject(validated)) {
    return validated;
  }
  if (!isPlainObject(original)) {
    return {};
  }
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(original)) {
    if (Object.prototype.hasOwnProperty.call(validated, key)) {
      result[key] = omitUnprovidedDefaults(original[key], validated[key]);
    }
  }
  return result;
}

/**
 * Resolves DTO bindings for generated CRUD routes.
 */
export function resolveCrudValidationMeta(
  route: CrudRouteName,
  options: CrudOptions
): CrudValidationMeta {
  switch (route) {
    case 'list':
      return { queryDto: options.dto?.query };
    case 'create':
      return { bodyDto: options.dto?.create };
    case 'update':
      return { bodyDto: options.dto?.update };
    case 'replace':
      return { bodyDto: options.dto?.replace };
    default:
      return {};
  }
}

/**
 * Tries to validate through an installed validation component.
 */
export async function applyCrudValidation(
  route: CrudRouteName,
  options: CrudOptions,
  payload?: {
    body?: unknown;
    query?: unknown;
    ctx?: any;
  }
): Promise<CrudValidationMeta> {
  const meta = resolveCrudValidationMeta(route, options);
  const requestContext = payload?.ctx?.requestContext;

  if (!requestContext || typeof requestContext.getAsync !== 'function') {
    return meta;
  }

  let validationService;
  try {
    validationService = await requestContext.getAsync('validationService');
  } catch {
    validationService = null;
  }

  if (!validationService || typeof validationService.validate !== 'function') {
    return meta;
  }

  if (meta.queryDto) {
    const result = await validationService.validate(
      meta.queryDto,
      payload?.query ?? {}
    );
    if (payload && result && 'value' in result) {
      payload.query = result.value;
    }
  }

  if (meta.bodyDto) {
    const originalBody = payload?.body;
    const result = await validationService.validate(meta.bodyDto, originalBody);
    if (payload && result && 'value' in result) {
      // PATCH bodies are partial. Defaults for keys absent from the request
      // would be written through repository merge and reset stored columns.
      payload.body =
        route === 'update'
          ? omitUnprovidedDefaults(originalBody, result.value)
          : result.value;
    }
  }

  return meta;
}
