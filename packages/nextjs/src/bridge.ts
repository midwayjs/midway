import {
  ApiBridgeOperation,
  ApiModulesMap,
  ClientFromApiModules,
  CreateClientOptions,
  createClient as createBridgeClient,
  ApiClientDefinition,
  ApiBridgeOptions,
  createApiClientDefinition,
  createApiClient,
  resolveApiBridgeOptions,
} from '@midwayjs/web-bridge';

export type NextjsApiBridgeOptions = ApiBridgeOptions;

export function resolveNextjsApiBridgeOptions(
  options: NextjsApiBridgeOptions = {}
): Required<Pick<NextjsApiBridgeOptions, 'transport'>> &
  Pick<NextjsApiBridgeOptions, 'adapter'> {
  return resolveApiBridgeOptions(options);
}

export function createNextjsApiClient<TInput = unknown, TOutput = unknown>(
  definition: ApiClientDefinition,
  options: NextjsApiBridgeOptions = {}
) {
  return createApiClient<TInput, TOutput>(definition, options);
}

export function createNextjsApiClientFromOperations<
  TInput = unknown,
  TOutput = unknown
>(operations: ApiBridgeOperation[], options: NextjsApiBridgeOptions = {}) {
  return createNextjsApiClient<TInput, TOutput>(
    createApiClientDefinition(operations),
    options
  );
}

export type NextjsCreateClientOptions = CreateClientOptions;

export function createClient<TModules extends ApiModulesMap>(
  modules: TModules,
  options: NextjsCreateClientOptions = {}
): ClientFromApiModules<TModules> {
  return createBridgeClient(modules, options);
}
