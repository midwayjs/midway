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
  ) => (req: any, res: any, next?: () => void) => any;
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
  const getRequestHandler = options.getRequestHandler || getDefaultRequestHandler;
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

  return {
    name: 'midway-dev-runtime',
    async configureServer(server: any) {
      const ensureApp = async () => {
        if (!appPromise) {
          appPromise = createApp({
            appDir,
            baseDir,
          });
        }
        return appPromise;
      };

      server.httpServer?.once('close', async () => {
        await reloadApp();
      });

      server.watcher.on('all', async (eventName: string, file: string) => {
        if (eventName !== 'add' && eventName !== 'change' && eventName !== 'unlink') {
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
