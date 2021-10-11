const staticCache = require('koa-static-cache');
const { join } = require('path');
const { readFileSync, existsSync, unlinkSync } = require('fs');
const rewrite = require('./rewrite');
const request = require('request');
const KOA = require('koa');
const os = require('os');

const socketPath = join(os.tmpdir(), `server-${Date.now()}.sock`);

module.exports = engine => {
  engine.addRuntimeExtension({
    async beforeRuntimeStart(runtime) {
      const baseDir = runtime.getPropertyParser().getEntryDir();
      const runtimeConfig = runtime.getRuntimeConfig();
      let deployConfig = {};
      if (
        runtimeConfig['deployType'] &&
        runtimeConfig['deployType']['config']
      ) {
        deployConfig = runtimeConfig['deployType']['config'];
      }

      if (!deployConfig.rootDir) {
        deployConfig.rootDir = 'build';
      }

      const staticConfig = {
        dynamic: true,
        index: 'index.html',
        preload: false,
        buffer: true,
        maxFiles: 1000,
      };
      staticConfig.dir = join(baseDir, deployConfig.rootDir);
      if (deployConfig.prefix && !/^\//.test(deployConfig.prefix)) {
        deployConfig.prefix = '/' + deployConfig.prefix;
      }
      staticConfig.prefix = deployConfig.prefix || '/';
      console.log(staticConfig.prefix)

      const app = new KOA();
      // handleRequest = koaApp.callback();
      if (existsSync(socketPath)) {
        unlinkSync(socketPath);
      }

      let notFoundPageCache;

      if (deployConfig['rewrite']) {
        for (const pattern of Object.keys(deployConfig['rewrite'])) {
          app.use(rewrite(pattern, deployConfig['rewrite'][pattern]));
        }
      }

      app.use(async (ctx, next) => {
        let orig = ctx.path;
        const last = orig.split('/').pop();
        if (last.indexOf('.') === -1) {
          orig += '/';
        }
        if (/\/$/.test(orig)) {
          ctx.path = orig + 'index.html';
        }
        ctx.path = ctx.path.replace('//', '/');
        await next();
        if (!ctx.response._explicitStatus) {
          ctx.status = 404;
          if (deployConfig['notFoundUrl']) {
            if (notFoundPageCache) {
              ctx.body = notFoundPageCache;
            } else {
              const fullPath = join(
                staticConfig.dir,
                deployConfig['notFoundUrl']
              );
              if (existsSync(fullPath)) {
                ctx.body = notFoundPageCache = readFileSync(fullPath);
                ctx.type = 'text/html';
              }
            }
          }
        }
      });
      app.use(staticCache(staticConfig));
      app.listen(socketPath);
    },
    async defaultInvokeHandler(context) {
      return new Promise((resolve, reject) => {
        delete context.headers['content-length'];
        const requestOption = {
          uri: `http://unix:${socketPath}:${context.path}`,
          qs: context.query,
          method: context.method,
          headers: context.headers,
          followRedirect: false,
          encoding: null,
        };
        request(requestOption, (error, response, body) => {
          if (error) {
            context.status = 500;
            console.error('[static-layer]' + error);
            resolve('Internal Server Error');
          } else {
            context.res = response;
            context.status = response.statusCode;
            resolve(body);
          }
        });
      });
    },
  });
};
