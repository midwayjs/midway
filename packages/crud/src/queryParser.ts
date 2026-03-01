import {
  CRUD_ALLOWED_FILTER_OPERATORS,
  CRUD_DEFAULT_LIMIT,
  CRUD_MAX_LIMIT,
} from './constants';
import { CrudQueryError } from './error';
import {
  CrudFilter,
  CrudFilterOperator,
  CrudIdValue,
  CrudOptions,
  CrudQuery,
  CrudSort,
} from './interface';

function first(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return first(value[0]);
  }
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value);
}

function many(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap(item => many(item));
  }
  return [String(value)];
}

function parsePositiveInt(name: string, value: unknown, fallback: number): number {
  const raw = first(value);
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new CrudQueryError(`Invalid "${name}" value`);
  }
  return parsed;
}

function parseSort(input: string): CrudSort {
  const [field, order] = input.split(':');
  if (!field || !order) {
    throw new CrudQueryError('Invalid "sort" format');
  }
  const normalizedOrder = order.toUpperCase();
  if (normalizedOrder !== 'ASC' && normalizedOrder !== 'DESC') {
    throw new CrudQueryError('Invalid "sort" direction');
  }
  return {
    field,
    order: normalizedOrder as 'ASC' | 'DESC',
  };
}

function parseFilter(input: string): CrudFilter {
  const parts = input.split('||');
  if (parts.length !== 3) {
    throw new CrudQueryError('Invalid "filter" format');
  }
  const [field, operator, value] = parts;
  if (!field || !operator) {
    throw new CrudQueryError('Invalid "filter" format');
  }
  if (!CRUD_ALLOWED_FILTER_OPERATORS.includes(operator as CrudFilterOperator)) {
    throw new CrudQueryError(`Unsupported filter operator "${operator}"`);
  }
  if (operator === 'in' && !value) {
    throw new CrudQueryError('Invalid "in" filter value');
  }
  return {
    field,
    operator: operator as CrudFilterOperator,
    value,
  };
}

function assertAllowedField(
  value: string,
  allowed: string[] | undefined,
  label: string
) {
  if (!allowed || !allowed.length) {
    throw new CrudQueryError(`"${label}" is not enabled for this resource`);
  }
  if (!allowed.includes(value)) {
    throw new CrudQueryError(`"${value}" is not allowed in ${label}`);
  }
}

/**
 * Ensures join targets match the resource allow-list.
 */
export function assertAllowedJoin(value: string, options: CrudOptions): void {
  if (value.includes('.')) {
    throw new CrudQueryError('Nested joins are not supported');
  }
  assertAllowedField(value, options.query?.join, 'join');
}

/**
 * Parses route ids using the configured id field semantics.
 */
export function parseCrudId(input: unknown, _options: CrudOptions): CrudIdValue {
  const raw = first(input);
  if (!raw) {
    throw new CrudQueryError('Missing resource id');
  }
  const numeric = Number(raw);
  if (!Number.isNaN(numeric) && String(numeric) === raw) {
    return numeric;
  }
  return raw;
}

/**
 * Parses inbound query strings into a stable CRUD query object.
 */
export function parseCrudQuery(
  input: Record<string, unknown>,
  options: CrudOptions
): CrudQuery {
  const defaultLimit = options.query?.defaultLimit ?? CRUD_DEFAULT_LIMIT;
  const maxLimit = options.query?.maxLimit ?? CRUD_MAX_LIMIT;
  const page = parsePositiveInt('page', input.page, 1);
  const parsedLimit = parsePositiveInt('limit', input.limit, defaultLimit);
  const limit = Math.min(parsedLimit, maxLimit);

  const sort = many(input.sort).map(parseSort);
  for (const item of sort) {
    assertAllowedField(item.field, options.query?.sortable, 'sort');
  }

  const filters = many(input.filter).map(parseFilter);
  for (const item of filters) {
    assertAllowedField(item.field, options.query?.filterable, 'filter');
  }

  const search = first(input.search);
  if (search !== undefined) {
    if (!search.trim()) {
      throw new CrudQueryError('Invalid "search" value');
    }
    if (!options.query?.searchable?.length) {
      throw new CrudQueryError('"search" is not enabled for this resource');
    }
  }

  const joins = many(input.join);
  joins.forEach(join => assertAllowedJoin(join, options));

  const fields = first(input.fields)
    ?.split(',')
    .map(field => field.trim())
    .filter(Boolean);

  return {
    page,
    limit,
    sort,
    filters,
    search,
    joins,
    fields,
  };
}
