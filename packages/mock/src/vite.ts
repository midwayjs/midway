import { close as closeMidwayApp, createApp } from './creator';
import { resolve } from 'node:path';
import { MidwayWebRouterService } from '@midwayjs/core';

const DEFAULT_ROUTE_MANIFEST_VIRTUAL_ID = 'virtual:midway-route-manifest';

interface RouteManifestLike {
  source: string;
  operationId: string;
  controllerId?: string;
  controllerPrefix: string;
  method: string;
  path: string;
  fullPath: string;
  routerName?: string;
}

export interface DevPluginOptions {
  appDir: string;
  baseDir?: string;
  basePath?: string;
  watch?: {
    include?: RegExp[];
    exclude?: RegExp[];
  };
  getRequestHandler?: (
    app: any
  ) => (req: any, res: any, next?: () => void) => any;
  routeManifest?:
    | boolean
    | {
        virtualId?: string;
        filter?: (route: RouteManifestLike) => boolean;
      };
}

function startsWithBasePath(url: string, basePath: string) {
  if (basePath === '/') {
    return true;
  }
  return url === basePath || url.startsWith(`${basePath}/`);
}

function getDefaultRequestHandler(app: any) {
  if (app && typeof app.callback === 'function') {
    return app.callback();
  }
  if (typeof app === 'function') {
    return app;
  }
  if (app && typeof app.getFramework === 'function') {
    const framework = app.getFramework();
    if (framework) {
      const frameworkApp =
        typeof framework.getApplication === 'function'
          ? framework.getApplication()
          : undefined;
      if (frameworkApp && typeof frameworkApp.callback === 'function') {
        return frameworkApp.callback();
      }
      if (typeof framework.callback2 === 'function') {
        return framework.callback2();
      }
    }
  }
  throw new Error(
    '[midway:mock] can not resolve request handler, please provide getRequestHandler in devPlugin options'
  );
}

export function devPlugin(options: DevPluginOptions) {
  if (!options?.appDir) {
    throw new Error(
      '[midway:mock] devPlugin requires "appDir", e.g. devPlugin({ appDir: process.cwd() })'
    );
  }

  const appDir = options.appDir;
  const baseDir = options.baseDir
    ? resolve(appDir, options.baseDir)
    : resolve(appDir, 'src');
  const resolvedBaseDir = baseDir;
  const basePath = options.basePath || '/api';
  const watchInclude = options.watch?.include || [/\.(ts|tsx|js|mjs|cjs)$/];
  const watchExclude = options.watch?.exclude || [/\.d\.ts$/];
  const getRequestHandler =
    options.getRequestHandler || getDefaultRequestHandler;
  const routeManifestOptions =
    options.routeManifest && typeof options.routeManifest === 'object'
      ? options.routeManifest
      : undefined;
  const routeManifestEnabled = options.routeManifest !== false;
  const routeManifestVirtualId =
    routeManifestOptions?.virtualId || DEFAULT_ROUTE_MANIFEST_VIRTUAL_ID;
  const routeManifestResolvedId = `\0${routeManifestVirtualId}`;
  const routeManifestFilter = routeManifestOptions?.filter;
  let appPromise: Promise<any> | null = null;
  const hmrImportQueryEnvKey = 'MIDWAY_HMR_IMPORT_QUERY';
  let routeManifestPromise: Promise<RouteManifestLike[]> | null = null;
  let reloadingAppPromise: Promise<void> | null = null;
  let viteServer: any;

  const invalidateRouteManifestModule = () => {
    if (!routeManifestEnabled || !viteServer) {
      return;
    }
    const mod = viteServer.moduleGraph?.getModuleById(routeManifestResolvedId);
    if (mod) {
      viteServer.moduleGraph.invalidateModule(mod);
      viteServer.ws?.send({
        type: 'full-reload',
      });
    }
  };

  const shouldReloadFile = (file: string) => {
    if (!file.startsWith(resolvedBaseDir)) {
      return false;
    }
    if (watchExclude.some(reg => reg.test(file))) {
      return false;
    }
    return watchInclude.some(reg => reg.test(file));
  };

  const reloadApp = async () => {
    if (reloadingAppPromise) {
      return reloadingAppPromise;
    }
    reloadingAppPromise = (async () => {
      const oldAppPromise = appPromise;
      appPromise = null;
      routeManifestPromise = null;
      if (oldAppPromise) {
        const oldApp = await oldAppPromise;
        await closeMidwayApp(oldApp);
      }
      invalidateRouteManifestModule();
    })().finally(() => {
      reloadingAppPromise = null;
    });
    return reloadingAppPromise;
  };

  const ensureApp = async () => {
    if (!appPromise) {
      const previousQuery = process.env[hmrImportQueryEnvKey];
      process.env[hmrImportQueryEnvKey] = '1';
      appPromise = createApp({
        appDir,
        baseDir,
      }).finally(() => {
        if (previousQuery === undefined) {
          delete process.env[hmrImportQueryEnvKey];
        } else {
          process.env[hmrImportQueryEnvKey] = previousQuery;
        }
      });
    }
    return appPromise;
  };

  const ensureRouteManifest = async () => {
    if (!routeManifestEnabled) {
      return [] as RouteManifestLike[];
    }
    if (!routeManifestPromise) {
      routeManifestPromise = (async () => {
        const app = await ensureApp();
        const appContext = app.getApplicationContext?.();
        if (!appContext) {
          throw new Error(
            '[midway:mock] can not resolve applicationContext for route manifest generation'
          );
        }
        const webRouterService = await appContext.getAsync(
          MidwayWebRouterService
        );
        let manifest = await webRouterService.getRouteManifest();
        if (typeof routeManifestFilter === 'function') {
          manifest = manifest.filter(routeManifestFilter);
        }
        return manifest;
      })();
    }
    return routeManifestPromise;
  };

  return {
    name: 'midway-dev-runtime',
    apply: 'serve',
    resolveId(source: string) {
      if (!routeManifestEnabled) {
        return null;
      }
      if (source === routeManifestVirtualId) {
        return routeManifestResolvedId;
      }
      return null;
    },
    async load(id: string) {
      if (!routeManifestEnabled || id !== routeManifestResolvedId) {
        return null;
      }
      const manifest = await ensureRouteManifest();
      return `export default ${JSON.stringify(manifest)};`;
    },
    async configureServer(server: any) {
      viteServer = server;

      server.httpServer?.once('close', async () => {
        await reloadApp();
      });

      server.watcher.on('all', async (eventName: string, file: string) => {
        if (
          eventName !== 'add' &&
          eventName !== 'change' &&
          eventName !== 'unlink'
        ) {
          return;
        }
        if (!shouldReloadFile(file)) {
          return;
        }
        server.config.logger.info(
          `[midway:mock] detected server ${eventName}, reload midway app: ${file}`
        );
        await reloadApp();
      });

      server.middlewares.use(async (req: any, res: any, next: () => void) => {
        const originalUrl = req.url || '';
        const pathname = originalUrl.split('?')[0];
        if (!startsWithBasePath(pathname, basePath)) {
          next();
          return;
        }
        const app = await ensureApp();
        const handler = getRequestHandler(app);
        return handler(req, res, next);
      });
    },
  };
}
