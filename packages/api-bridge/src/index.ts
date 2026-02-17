export type ApiBridgeTransportName = 'http' | (string & {});

export interface ApiBridgeOperation {
  operationId: string;
  method: string;
  path: string;
  fullPath: string;
}

export interface ApiBridgeTransportRequest<TInput = unknown> {
  operation: ApiBridgeOperation;
  input: TInput;
}

export type ApiBridgeTransportAdapter = <
  TInput = unknown,
  TOutput = unknown
>(
  request: ApiBridgeTransportRequest<TInput>
) => Promise<TOutput>;

export interface ApiBridgeOptions {
  transport?: ApiBridgeTransportName;
  adapter?: ApiBridgeTransportAdapter;
}

export interface ApiBridgeBasePathOptions {
  browser?: string;
  server?: string;
  default?: string;
}

export type ApiBridgeBasePath =
  | string
  | ApiBridgeBasePathOptions
  | (() => string | undefined);

export interface CreateClientOptions extends ApiBridgeOptions {
  basePath?: ApiBridgeBasePath;
}

export interface ApiClientDefinition {
  operations: Record<string, ApiBridgeOperation>;
}

export interface ApiRouteManifestLike {
  operationId: string;
  method: string;
  path: string;
  fullPath: string;
}

export interface ApiModuleMetaLike {
  prefix?: string;
  ignoreGlobalPrefix?: boolean;
  version?: string | string[];
  versionType?: 'URI' | 'HEADER' | 'MEDIA_TYPE' | 'CUSTOM';
  versionPrefix?: string;
}

export interface ApiRouteLike {
  method: string;
  path: string | RegExp;
  options?: {
    routerName?: string;
    ignoreGlobalPrefix?: boolean;
  };
}

export interface ApiModuleLike {
  __midwayApiMeta?: ApiModuleMetaLike;
  [routeName: string]: ApiRouteLike | ApiModuleMetaLike | undefined;
}

export type ApiModulesMap = Record<string, ApiModuleLike>;

interface HttpClientInputShape {
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
}

type ApiModuleRouteKeys<TModule> = Exclude<keyof TModule, '__midwayApiMeta'>;

export type ClientFromApiModules<TModules extends ApiModulesMap> = {
  [TNamespace in keyof TModules]: {
    [TRoute in ApiModuleRouteKeys<TModules[TNamespace]>]: (
      input: unknown
    ) => Promise<unknown>;
  };
};

export interface ApiClient<TInput = unknown, TOutput = unknown> {
  transport: ApiBridgeTransportName;
  call(operationId: string, input: TInput): Promise<TOutput>;
  has(operationId: string): boolean;
  operationIds(): string[];
}

export function createApiClientDefinition(
  operations: ApiBridgeOperation[]
): ApiClientDefinition {
  const map: Record<string, ApiBridgeOperation> = {};
  for (const operation of operations || []) {
    if (!operation?.operationId) {
      throw new Error('API operation is missing required "operationId"');
    }
    if (map[operation.operationId]) {
      throw new Error(
        `Duplicate API operationId "${operation.operationId}" in client definition`
      );
    }
    map[operation.operationId] = operation;
  }
  return {
    operations: map,
  };
}

export function createOperationsFromManifest(
  manifest: ApiRouteManifestLike[]
): ApiBridgeOperation[] {
  return (manifest || []).map(item => ({
    operationId: item.operationId,
    method: item.method,
    path: item.path,
    fullPath: item.fullPath,
  }));
}

export function resolveApiBridgeOptions(
  options: ApiBridgeOptions = {}
): Required<Pick<ApiBridgeOptions, 'transport'>> &
  Pick<ApiBridgeOptions, 'adapter'> {
  return {
    transport: options.transport || 'http',
    adapter: options.adapter,
  };
}

function resolveDefaultAdapter(
  transport: ApiBridgeTransportName
): ApiBridgeTransportAdapter | undefined {
  if (transport !== 'http') {
    return undefined;
  }
  const maybeFetch = (globalThis as any)?.fetch;
  if (typeof maybeFetch !== 'function') {
    return undefined;
  }
  return createDefaultHttpAdapter(maybeFetch.bind(globalThis));
}

function buildRequestPath(
  pathTemplate: string,
  params?: Record<string, unknown>,
  query?: Record<string, unknown>
): string {
  let path = pathTemplate;
  for (const [key, value] of Object.entries(params || {})) {
    const token = `:${key}`;
    if (path.includes(token)) {
      path = path.replace(token, encodeURIComponent(String(value)));
    }
  }

  const queryEntries = Object.entries(query || {}).filter(([, value]) => {
    return value !== undefined && value !== null;
  });
  if (!queryEntries.length) {
    return path;
  }
  const qs = new URLSearchParams();
  for (const [key, value] of queryEntries) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) {
          continue;
        }
        qs.append(key, String(item));
      }
      continue;
    }
    qs.set(key, String(value));
  }
  return `${path}${path.includes('?') ? '&' : '?'}${qs.toString()}`;
}

function createDefaultHttpAdapter(fetchImpl: typeof fetch): ApiBridgeTransportAdapter {
  return async <TInput = unknown, TOutput = unknown>({
    operation,
    input,
  }: ApiBridgeTransportRequest<TInput>): Promise<TOutput> => {
    const normalizedMethod = String(operation.method || 'get').toUpperCase();
    const payload = (input || {}) as HttpClientInputShape;
    const requestUrl = buildRequestPath(
      operation.fullPath,
      payload.params,
      payload.query
    );
    const requestHeaders: Record<string, string> = {
      ...(payload.headers || {}),
    };

    let body: any;
    if (normalizedMethod !== 'GET' && normalizedMethod !== 'HEAD') {
      if (payload.body !== undefined) {
        const bodyValue = payload.body as any;
        const constructorName = bodyValue?.constructor?.name;
        const isNativeBodyLike =
          constructorName === 'URLSearchParams' ||
          constructorName === 'FormData' ||
          constructorName === 'Blob' ||
          constructorName === 'ArrayBuffer';
        if (
          typeof bodyValue === 'string' ||
          isNativeBodyLike
        ) {
          body = bodyValue;
        } else {
          body = JSON.stringify(payload.body);
          if (
            !Object.keys(requestHeaders).some(
              key => key.toLowerCase() === 'content-type'
            )
          ) {
            requestHeaders['content-type'] = 'application/json';
          }
        }
      }
    }

    const response = await fetchImpl(requestUrl, {
      method: normalizedMethod,
      headers: requestHeaders,
      body,
    });

    const contentType = response.headers?.get?.('content-type') || '';
    const responseData = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!(response as any).ok) {
      const message =
        typeof responseData === 'string'
          ? responseData
          : JSON.stringify(responseData);
      throw new Error(
        `API request failed: ${normalizedMethod} ${requestUrl} (${(response as any).status}) ${message}`
      );
    }

    return responseData as TOutput;
  };
}

export function createApiBridge(options: ApiBridgeOptions = {}) {
  const resolved = resolveApiBridgeOptions(options);
  const adapter = resolved.adapter || resolveDefaultAdapter(resolved.transport);
  return {
    transport: resolved.transport,
    async invoke<TInput = unknown, TOutput = unknown>(
      operation: ApiBridgeOperation,
      input: TInput
    ): Promise<TOutput> {
      if (!adapter) {
        throw new Error(
          `API bridge adapter is required for transport "${resolved.transport}" (or provide global fetch for http)`
        );
      }
      return adapter<TInput, TOutput>({
        operation,
        input,
      });
    },
  };
}

export function createApiClient<TInput = unknown, TOutput = unknown>(
  definition: ApiClientDefinition,
  options: ApiBridgeOptions = {}
): ApiClient<TInput, TOutput> {
  const bridge = createApiBridge(options);
  const operations = definition?.operations || {};
  return {
    transport: bridge.transport,
    async call(operationId: string, input: TInput): Promise<TOutput> {
      const operation = operations[operationId];
      if (!operation) {
        throw new Error(`Unknown API operation "${operationId}"`);
      }
      return bridge.invoke<TInput, TOutput>(operation, input);
    },
    has(operationId: string): boolean {
      return !!operations[operationId];
    },
    operationIds(): string[] {
      return Object.keys(operations);
    },
  };
}

function joinUrlPath(...segments: Array<string | undefined>) {
  const normalized = segments
    .filter(Boolean)
    .map(segment => String(segment).trim())
    .filter(segment => segment.length > 0);
  if (!normalized.length) {
    return '/';
  }
  const first = normalized[0];
  const rest = normalized.slice(1);
  const isAbsoluteHttpUrl = /^https?:\/\//i.test(first);
  if (isAbsoluteHttpUrl) {
    const head = first.replace(/\/+$/g, '');
    const tail = rest
      .map(segment => segment.replace(/^\/+|\/+$/g, ''))
      .filter(segment => segment.length > 0);
    return tail.length ? `${head}/${tail.join('/')}` : head;
  }
  const cleaned = normalized
    .map(segment => segment.replace(/^\/+|\/+$/g, ''))
    .filter(segment => segment.length > 0);
  return '/' + cleaned.join('/');
}

function resolveRuntimeBasePath(basePath?: ApiBridgeBasePath): string {
  if (!basePath) {
    return '';
  }
  if (typeof basePath === 'string') {
    return basePath;
  }
  if (typeof basePath === 'function') {
    return basePath() || '';
  }
  const runtimeGlobal = globalThis as any;
  const isBrowser =
    typeof runtimeGlobal.window !== 'undefined' &&
    typeof runtimeGlobal.window?.document !== 'undefined';
  if (isBrowser) {
    return basePath.browser || basePath.default || basePath.server || '';
  }
  return basePath.server || basePath.default || basePath.browser || '';
}

function isApiRouteLike(route: unknown): route is ApiRouteLike {
  return !!(
    route &&
    typeof route === 'object' &&
    typeof (route as ApiRouteLike).method === 'string' &&
    (typeof (route as ApiRouteLike).path === 'string' ||
      (route as ApiRouteLike).path instanceof RegExp)
  );
}

function resolveVersionedPrefix(moduleMeta?: ApiModuleMetaLike): string {
  const prefix = moduleMeta?.prefix || '';
  const version = moduleMeta?.version;
  if (!version) {
    return prefix;
  }
  const versionType = moduleMeta?.versionType || 'URI';
  if (versionType !== 'URI') {
    return prefix;
  }
  const normalizedVersion = Array.isArray(version) ? version[0] : version;
  const versionPrefix = moduleMeta?.versionPrefix || 'v';
  return joinUrlPath(`/${versionPrefix}${normalizedVersion}`, prefix);
}

export function createClient<TModules extends ApiModulesMap>(
  modules: TModules,
  options: CreateClientOptions = {}
): ClientFromApiModules<TModules> {
  const bridge = createApiBridge(options);
  const runtimeBasePath = resolveRuntimeBasePath(options.basePath);
  const client: Record<string, Record<string, (input: unknown) => Promise<unknown>>> = {};

  for (const namespaceKey of Object.keys(modules || {})) {
    const module = modules[namespaceKey];
    const moduleMeta = module?.__midwayApiMeta;
    const prefix = resolveVersionedPrefix(moduleMeta);
    const namespaceClient: Record<string, (input: unknown) => Promise<unknown>> = {};
    for (const routeKey of Object.keys(module || {})) {
      if (routeKey === '__midwayApiMeta') {
        continue;
      }
      const route = module[routeKey] as unknown;
      if (!isApiRouteLike(route)) {
        continue;
      }
      const routePath = route.path.toString();
      const routeIgnoreGlobalPrefix =
        route.options?.ignoreGlobalPrefix !== undefined
          ? !!route.options?.ignoreGlobalPrefix
          : !!moduleMeta?.ignoreGlobalPrefix;
      const fullPath = routeIgnoreGlobalPrefix
        ? joinUrlPath(prefix, routePath)
        : joinUrlPath(runtimeBasePath, prefix, routePath);
      const operationId = `${namespaceKey}.${route.options?.routerName || routeKey}`;
      namespaceClient[routeKey] = (input: unknown) => {
        return bridge.invoke(
          {
            operationId,
            method: route.method,
            path: routePath,
            fullPath,
          },
          input
        );
      };
    }
    client[namespaceKey] = namespaceClient;
  }

  return client as ClientFromApiModules<TModules>;
}
