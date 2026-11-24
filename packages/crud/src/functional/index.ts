import {
  FunctionalCrudOptions,
  FunctionalCrudRouteFactory,
} from '../interface';
import { buildFunctionalCrudRoutes } from './routeBuilder';

/**
 * Functional CRUD route entrypoint for defineApi() composition.
 */
export function defineCrudRoutes<T = any>(
  options: FunctionalCrudOptions
): FunctionalCrudRouteFactory<T> {
  return buildFunctionalCrudRoutes<T>(options);
}

export * from './routeBuilder';
