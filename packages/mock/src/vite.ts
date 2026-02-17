import { close as closeMidwayApp, createApp } from './creator';

export interface DevPluginOptions {
  appDir: string;
  baseDir?: string;
  basePath?: string;
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
  const appDir = options.appDir;
  const baseDir = options.baseDir;
  const basePath = options.basePath || '/api';
  const getRequestHandler = options.getRequestHandler || getDefaultRequestHandler;
  let appPromise: Promise<any> | null = null;

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
        if (appPromise) {
          const app = await appPromise;
          await closeMidwayApp(app);
        }
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
