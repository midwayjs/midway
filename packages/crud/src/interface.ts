export type CrudRouteName =
  | 'list'
  | 'detail'
  | 'create'
  | 'update'
  | 'replace'
  | 'delete'
  | 'createMany'
  | 'deleteMany';

export type CrudFilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'like';

export interface CrudSort {
  field: string;
  order: 'ASC' | 'DESC';
}

export interface CrudFilter {
  field: string;
  operator: CrudFilterOperator;
  value: unknown;
}

export interface CrudQuery {
  page: number;
  limit: number;
  sort: CrudSort[];
  filters: CrudFilter[];
  search?: string;
  joins?: string[];
  fields?: string[];
}

export interface CrudPageMeta {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CrudPageResult<T> {
  data: T[];
  meta: CrudPageMeta;
}

export type CrudIdValue = string | number;

export interface CrudContext {
  ctx?: any;
  operator?: string;
  [key: string]: any;
}

export interface CrudRouteOverride {
  enabled?: boolean;
}

export interface CrudOptions {
  model: new (...args: any[]) => any;
  service?: new (...args: any[]) => CrudServiceAdapter<any>;
  id?: string;
  dto?: {
    create?: new (...args: any[]) => any;
    update?: new (...args: any[]) => any;
    replace?: new (...args: any[]) => any;
    query?: new (...args: any[]) => any;
  };
  routes?: {
    only?: CrudRouteName[];
    exclude?: CrudRouteName[];
    overrides?: Partial<Record<CrudRouteName, CrudRouteOverride>>;
  };
  query?: {
    maxLimit?: number;
    defaultLimit?: number;
    sortable?: string[];
    filterable?: string[];
    searchable?: string[];
    join?: string[];
    defaultSort?: CrudSort[];
  };
  serialize?: {
    get?: new (...args: any[]) => any;
    list?: new (...args: any[]) => any;
    create?: new (...args: any[]) => any;
    update?: new (...args: any[]) => any;
  };
  delete?: {
    mode?: 'hard' | 'soft';
  };
}

export interface CrudService<T> {
  list(query: CrudQuery, ctx?: CrudContext): Promise<CrudPageResult<T>>;
  findOne(id: CrudIdValue, ctx?: CrudContext): Promise<T | null>;
  create(data: unknown, ctx?: CrudContext): Promise<T>;
  update(id: CrudIdValue, data: unknown, ctx?: CrudContext): Promise<T>;
  replace?(id: CrudIdValue, data: unknown, ctx?: CrudContext): Promise<T>;
  delete(id: CrudIdValue, ctx?: CrudContext): Promise<void>;
}

export interface CrudServiceAdapter<T> extends CrudService<T> {}

export interface CrudRouteDefinition {
  name: CrudRouteName;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
}

export interface CrudValidationMeta {
  bodyDto?: new (...args: any[]) => any;
  queryDto?: new (...args: any[]) => any;
}

export interface CrudSwaggerMeta {
  summary: string;
  hasBody: boolean;
}

export interface FunctionalRouteDefinition {
  method: string;
  path: string;
  handler: (...args: any[]) => any;
}

export interface FunctionalRouteBuilder {
  method: string;
  path: string;
  handle(fn: (...args: any[]) => any): FunctionalRouteDefinition;
}

export interface FunctionalApiBuilder {
  get(path?: string): FunctionalRouteBuilder;
  post(path?: string): FunctionalRouteBuilder;
  patch(path?: string): FunctionalRouteBuilder;
  put(path?: string): FunctionalRouteBuilder;
  delete(path?: string): FunctionalRouteBuilder;
}

export type FunctionalCrudRouteFactory<T = any> = (
  api: FunctionalApiBuilder
) => Record<string, FunctionalRouteBuilder | FunctionalRouteDefinition> & {
  __entityType__?: T;
};

export type FunctionalCrudOptions = CrudOptions;
