import { RouteManifestItem } from '../service/webRouterService';

export type RouteManifestAdapter<
  TOutput = unknown,
  TOptions = Record<string, unknown>
> = (manifest: RouteManifestItem[], options?: TOptions) => TOutput;

export function adaptRouteManifest<TOutput, TOptions = Record<string, unknown>>(
  manifest: RouteManifestItem[],
  adapter: RouteManifestAdapter<TOutput, TOptions>,
  options?: TOptions
): TOutput {
  return adapter(manifest, options);
}
