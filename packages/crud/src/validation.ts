import { CrudOptions, CrudRouteName, CrudValidationMeta } from './interface';

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
    await validationService.validate(meta.queryDto, payload?.query ?? {});
  }

  if (meta.bodyDto) {
    await validationService.validate(meta.bodyDto, payload?.body);
  }

  return meta;
}
