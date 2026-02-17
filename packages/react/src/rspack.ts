import { resolve } from 'node:path';
import { toWebSafeApiContractCode } from './vite';

export interface ApiRspackLoaderOptions {
  root?: string;
  apiDir: string;
}

interface RspackLoaderContext {
  resourcePath?: string;
  getOptions?: () => Partial<ApiRspackLoaderOptions>;
}

function normalizeOptions(
  raw?: Partial<ApiRspackLoaderOptions>
): ApiRspackLoaderOptions {
  if (!raw?.apiDir || typeof raw.apiDir !== 'string') {
    throw new Error(
      '[midway:react] apiRspackLoader requires "apiDir" option, e.g. apiRspackLoader({ root: process.cwd(), apiDir: "src/server/api" })'
    );
  }
  return {
    root: raw.root || process.cwd(),
    apiDir: raw.apiDir,
  };
}

function inApiDir(filePath: string, options: ApiRspackLoaderOptions) {
  const apiRoot = resolve(options.root!, options.apiDir);
  return filePath.startsWith(apiRoot);
}

function shouldTransform(source: string) {
  return source.includes('defineApi');
}

export function apiRspackLoader(
  this: RspackLoaderContext,
  source: string
) {
  const options = normalizeOptions(this.getOptions?.() as Partial<ApiRspackLoaderOptions>);
  const filePath = this.resourcePath || '';
  if (!filePath || !inApiDir(filePath, options) || !shouldTransform(source)) {
    return source;
  }
  return toWebSafeApiContractCode(source);
}

export function createApiRspackRule(options: ApiRspackLoaderOptions) {
  const normalized = normalizeOptions(options);
  const apiRoot = resolve(normalized.root!, normalized.apiDir);
  return {
    enforce: 'pre' as const,
    test: /\.[cm]?[jt]sx?$/,
    include: [apiRoot],
    use: [
      {
        loader: '@midwayjs/react/rspack',
        options: normalized,
      },
    ],
  };
}

export default apiRspackLoader;
