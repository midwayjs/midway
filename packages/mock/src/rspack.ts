import { close as closeMidwayApp, createApp } from './creator';
import { resolve } from 'node:path';

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
  ) => (req: any, res: any, next?: (err?: unknown) => void) => any;
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
  const watchExclude = options.watch?.exclude || [
    /\.d\.ts$/,
    /\/\.midway-esm-fallback-[^/]+\/.+$/,
  ];
  const getRequestHandler =
    options.getRequestHandler || getDefaultRequestHandler;
  const hmrImportQueryEnvKey = 'MIDWAY_HMR_IMPORT_QUERY';

  let appPromise: Promise<any> | null = null;
  let reloadingAppPromise: Promise<void> | null = null;

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
      if (oldAppPromise) {
        const oldApp = await oldAppPromise;
        await closeMidwayApp(oldApp);
      }
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

  return {
    name: 'midway-dev-runtime-rspack',
    apply(compiler: any) {
      const logger =
        typeof compiler.getInfrastructureLogger === 'function'
          ? compiler.getInfrastructureLogger('midway:mock')
          : console;

      compiler.hooks.invalid?.tap(
        'midway-dev-runtime-rspack',
        (fileName?: string) => {
          if (!fileName || !shouldReloadFile(fileName)) {
            return;
          }
          logger.info(
            `[midway:mock] detected server change, reload midway app: ${fileName}`
          );
          void reloadApp().catch((err: Error) => {
            logger.error(
              `[midway:mock] failed to reload midway app: ${err?.message || err}`
            );
          });
        }
      );

      compiler.hooks.shutdown?.tapPromise(
        'midway-dev-runtime-rspack',
        async () => {
          await reloadApp();
        }
      );

      compiler.options.devServer = compiler.options.devServer || {};
      const previousSetupMiddlewares =
        compiler.options.devServer.setupMiddlewares;

      compiler.options.devServer.setupMiddlewares = (
        middlewares: any[],
        devServer: any
      ) => {
        const requestMiddleware = async (req: any, res: any, next: any) => {
          const originalUrl = req.url || '';
          const pathname = originalUrl.split('?')[0];
          if (!startsWithBasePath(pathname, basePath)) {
            next();
            return;
          }
          try {
            const app = await ensureApp();
            const handler = getRequestHandler(app);
            return handler(req, res, next);
          } catch (err) {
            next(err);
            return;
          }
        };

        if (Array.isArray(middlewares)) {
          middlewares.unshift(requestMiddleware);
        }

        if (typeof previousSetupMiddlewares === 'function') {
          return previousSetupMiddlewares(middlewares, devServer);
        }

        return middlewares;
      };
    },
  };
}
