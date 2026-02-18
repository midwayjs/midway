import {
  ApiBridgeOperation,
  ApiModulesMap,
  ClientFromApiModules,
  CreateClientOptions,
  createClient as createBridgeClient,
  ApiClientDefinition,
  createApiClientDefinition,
  createApiClient,
  createApiBridge,
  resolveApiBridgeOptions,
} from '@midwayjs/web-bridge';

import type { ReactApiBridgeOptions } from './interface';
export type { ReactApiBridgeOptions } from './interface';

export function resolveReactApiBridgeOptions(
  options: ReactApiBridgeOptions = {}
): Required<Pick<ReactApiBridgeOptions, 'transport'>> &
  Pick<ReactApiBridgeOptions, 'adapter'> {
  return resolveApiBridgeOptions(options);
}

export function createReactApiBridge(options: ReactApiBridgeOptions = {}) {
  const bridge = createApiBridge(options);
  return {
    transport: bridge.transport,
    async invoke<TInput = unknown, TOutput = unknown>(
      operation: ApiBridgeOperation,
      input: TInput
    ): Promise<TOutput> {
      return bridge.invoke<TInput, TOutput>(operation, input);
    },
  };
}

export function createReactApiClient<TInput = unknown, TOutput = unknown>(
  definition: ApiClientDefinition,
  options: ReactApiBridgeOptions = {}
) {
  return createApiClient<TInput, TOutput>(definition, options);
}

export function createReactApiClientFromOperations<
  TInput = unknown,
  TOutput = unknown
>(
  operations: ApiBridgeOperation[],
  options: ReactApiBridgeOptions = {}
) {
  return createReactApiClient<TInput, TOutput>(
    createApiClientDefinition(operations),
    options
  );
}

export interface ReactCreateClientOptions extends CreateClientOptions {}

export function createClient<TModules extends ApiModulesMap>(
  modules: TModules,
  options: ReactCreateClientOptions = {}
): ClientFromApiModules<TModules> {
  return createBridgeClient(modules, options);
}
