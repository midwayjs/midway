import { CrudOptions } from './interface';

function stripUndefined<T extends Record<string, any>>(value: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(value) as Array<keyof T>) {
    if (value[key] !== undefined) {
      result[key] = value[key];
    }
  }
  return result;
}

function mergeSection<T extends Record<string, any>>(
  base?: T,
  override?: T
): T | undefined {
  if (override == null) {
    return base;
  }
  if (base == null) {
    return override;
  }
  return {
    ...base,
    ...stripUndefined(override),
  };
}

/**
 * Merges service-level CRUD options with per-call controller options.
 * The service value is the base. Controller fields replace it only when set,
 * so an omitted `delete` does not fall back to hard delete.
 */
export function mergeCrudOptions(
  base?: CrudOptions,
  override?: CrudOptions
): CrudOptions | undefined {
  if (!base) {
    return override;
  }
  if (!override) {
    return base;
  }
  return {
    ...base,
    ...stripUndefined(override),
    dto: mergeSection(base.dto, override.dto),
    routes: mergeSection(base.routes, override.routes),
    query: mergeSection(base.query, override.query),
    serialize: mergeSection(base.serialize, override.serialize),
    delete: mergeSection(base.delete, override.delete),
  };
}
